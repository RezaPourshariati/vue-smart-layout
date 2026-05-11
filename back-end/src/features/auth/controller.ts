import type { Response } from 'express'
import type { AuthRequest, GooglePayload } from '../../types/auth.js'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import Cryptr from 'cryptr'
import asyncHandler from 'express-async-handler'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import {
  mergeTrustedDevice,
  trustedDeviceFromRequest,
  userHasTrustedDevice,
} from '../../common/device/trustedDevice.js'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../common/errors/app-error.js'
import sendEmail from '../../common/utils/sendEmail.js'
import Token from '../../models/token.model.js'
import User from '../../models/user.model.js'
import { clearAuthCookies, setAuthCookies } from '../../services/auth-cookie.service.js'
import {
  createFreshSessionTokens,
  rotateExistingSession,
} from '../../services/auth-session.service.js'
import {
  findValidLoginCodeRecord,
  findValidResetRecord,
  findValidVerificationRecord,
  replaceWithLoginCodeRecord,
  replaceWithResetRecord,
  replaceWithVerificationRecord,
} from '../../services/auth-token-records.service.js'
import { getSessionExpiryCode } from '../../services/session-policy.service.js'
import { generateToken, hashToken } from '../../services/token.service.js'

function getCryptr(): Cryptr {
  const key = process.env.CRYPTR_KEY
  if (!key)
    throw new Error('CRYPTR_KEY is not defined')
  return new Cryptr(key)
}

export const registerUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string, email: string, password: string }
  if (!name || !email || !password)
    throw new BadRequestError('Please fill in all required fields.')
  if (password.length < 8)
    throw new BadRequestError('Password must be at least 8 characters!')

  const userExists = await User.findOne({ email })
  if (userExists)
    throw new BadRequestError('This email already in use')

  const device = trustedDeviceFromRequest(req)
  const user = await User.create({ name, email, password, userAgent: [device] })
  const { accessToken, refreshToken } = await createFreshSessionTokens(user._id)
  setAuthCookies(res, accessToken, refreshToken)
  res.status(201).json(user)
})

export const loginUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string, password: string }
  if (!email || !password)
    throw new BadRequestError('Please fill in all required fields.')

  const user = await User.findOne({ email })
  if (!user)
    throw new NotFoundError('User not found, Please signup')

  const passwordIsCorrect = await bcrypt.compare(password, user.password)
  if (!passwordIsCorrect)
    throw new UnauthorizedError('Invalid email or password')

  const currentDevice = trustedDeviceFromRequest(req)
  const allowedDevice = userHasTrustedDevice(user.userAgent, currentDevice)
  if (!allowedDevice) {
    const cryptr = getCryptr()
    const loginCode = Math.floor(100000 + Math.random() * 900000)
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString())
    await replaceWithLoginCodeRecord(user._id, encryptedLoginCode)
    throw new BadRequestError('New browser or device detected.')
  }

  const { accessToken, refreshToken } = await createFreshSessionTokens(user._id)
  setAuthCookies(res, accessToken, refreshToken)

  res.status(200).json(user)
})

export const logoutUser = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  const refreshTokenCookie = _req.cookies?.refreshToken as string | undefined

  if (refreshTokenCookie && refreshSecret) {
    try {
      const verified = jwt.verify(refreshTokenCookie, refreshSecret) as { refreshToken: string, userId: string }
      await Token.findOneAndDelete({
        userId: verified.userId,
        refreshToken: verified.refreshToken,
      })
    }
    catch {
      // Best-effort cleanup: always clear cookies even if token is invalid/expired.
    }
  }

  clearAuthCookies(res)
  res.status(200).json({ message: 'Logout successful' })
})

export const refreshSession = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const refreshTokenCookie = req.cookies?.refreshToken as string | undefined
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  if (!refreshTokenCookie || !refreshSecret)
    throw new UnauthorizedError('Not authorized, please login')

  let verified: { refreshToken: string, userId: string }
  try {
    verified = jwt.verify(refreshTokenCookie, refreshSecret) as { refreshToken: string, userId: string }
  }
  catch {
    throw new UnauthorizedError('Not authorized, please login')
  }

  const userToken = await Token.findOne({
    userId: verified.userId,
    refreshToken: verified.refreshToken,
    expiresAt: { $gt: Date.now() },
  })
  if (!userToken)
    throw new UnauthorizedError('Not authorized, please login')
  const sessionExpiryCode = getSessionExpiryCode(userToken)
  if (sessionExpiryCode) {
    await userToken.deleteOne()
    throw new UnauthorizedError('Session expired, please login again', sessionExpiryCode)
  }

  const user = await User.findById(verified.userId)
  if (!user)
    throw new UnauthorizedError('Not authorized, please login')
  if (user.role === 'suspended')
    throw new ForbiddenError('User suspended, please contact support')

  const { refreshToken: nextRefreshToken, sid } = await rotateExistingSession(userToken, user._id)
  const accessToken = generateToken(user._id, sid)

  setAuthCookies(res, accessToken, nextRefreshToken)
  res.status(200).json({ message: 'Session refreshed' })
})

export const loginStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const accessToken = req.cookies.accessToken as string | undefined
  if (!accessToken) {
    res.json(false)
    return
  }
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.json(false)
    return
  }
  const verified = jwt.verify(accessToken, secret) as { id?: string, sid?: string }
  if (!verified?.id || !verified?.sid) {
    res.json(false)
    return
  }

  const activeSession = await Token.findOne({
    _id: verified.sid,
    userId: verified.id,
  })
  if (!activeSession) {
    res.json(false)
    return
  }

  const sessionExpiryCode = getSessionExpiryCode(activeSession)
  if (sessionExpiryCode) {
    await activeSession.deleteOne()
    throw new UnauthorizedError('Session expired, please login again', sessionExpiryCode)
  }

  res.json(true)
})

export const sendVerificationEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new NotFoundError('User not found!')
  if (user.isVerified)
    throw new BadRequestError('User already verified')

  const verificationToken = crypto.randomBytes(32).toString('hex') + user._id
  console.log(verificationToken)
  const hashedToken = hashToken(verificationToken)
  console.log('--->', hashedToken)
  await replaceWithVerificationRecord(user._id, hashedToken)

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`
  await sendEmail(
    'Verify Your Account - AdaptiveAuth',
    user.email,
    process.env.EMAIL_USER || '',
    'noreply@adaptive-auth.local',
    'verifyEmail',
    user.name,
    verificationUrl,
  )
  res.status(200).json({ message: 'Verification Email Sent' })
})

export const verifyUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const verificationToken = String(req.params.verificationToken || '')
  const hashedToken = hashToken(verificationToken)
  const userToken = await findValidVerificationRecord(hashedToken)
  if (!userToken)
    throw new BadRequestError('Invalid or Expired Token')
  const user = await User.findById(userToken.userId)
  if (!user)
    throw new NotFoundError('User not found')
  user.isVerified = true
  await user.save()
  res.status(200).json({ message: 'Account verification was successful' })
})

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body as { email: string }
  const user = await User.findOne({ email })
  if (!user)
    throw new NotFoundError('There is no user with this email')

  const resetToken = crypto.randomBytes(32).toString('hex') + user._id
  const hashedToken = hashToken(resetToken)
  await replaceWithResetRecord(user._id, hashedToken)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
  await sendEmail(
    'Password Reset Request - AdaptiveAuth',
    user.email,
    process.env.EMAIL_USER || '',
    'noreply@adaptive-auth.local',
    'forgotPassword',
    user.name,
    resetUrl,
  )
  res.status(200).json({ message: 'Password Reset Email Sent' })
})

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const resetToken = String(req.params.resetToken || '')
  const { password } = req.body as { password: string }
  const hashedToken = hashToken(resetToken)
  const userToken = await findValidResetRecord(hashedToken)
  if (!userToken)
    throw new BadRequestError('Invalid or Expired Token')
  const user = await User.findById(userToken.userId)
  if (!user)
    throw new NotFoundError('User not found')
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Password reset was successful, Please login' })
})

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { oldPassword, password } = req.body as { oldPassword: string, password: string }
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new NotFoundError('User not found')
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)
  if (!passwordIsCorrect)
    throw new UnauthorizedError('Old password is incorrect')
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Password changed successfully, please login again.' })
})

export const sendLoginCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const email = String(req.params.email || '')
  const user = await User.findOne({ email })
  if (!user)
    throw new NotFoundError('User not found')
  const userToken = await findValidLoginCodeRecord(user._id)
  if (!userToken)
    throw new UnauthorizedError('Invalid or Expired Token, please login again')
  const decryptedLoginCode = getCryptr().decrypt(userToken.loginToken)

  if (process.env.NODE_ENV === 'development')
    console.log(`[adaptive-auth] Login code for ${email}: ${decryptedLoginCode}`)

  await sendEmail(
    'Login Access Code - AdaptiveAuth',
    email,
    process.env.EMAIL_USER || '',
    'noreply@adaptive-auth.local',
    'loginCode',
    user.name,
    decryptedLoginCode,
  )
  res.status(200).json({ message: `Access code sent to ${email}` })
})

export const loginWithCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const email = String(req.params.email || '')
  const { loginCode } = req.body as { loginCode: string }
  const user = await User.findOne({ email })
  if (!user)
    throw new NotFoundError('User not found')
  const userToken = await findValidLoginCodeRecord(user._id)
  if (!userToken)
    throw new UnauthorizedError('Invalid or Expired Token, please login again')
  const decryptedLoginCode = getCryptr().decrypt(userToken.loginToken)
  if (loginCode !== decryptedLoginCode)
    throw new UnauthorizedError('Incorrect login code, please try again')
  user.set('userAgent', mergeTrustedDevice(user.userAgent, trustedDeviceFromRequest(req)))
  await user.save()
  const { accessToken, refreshToken } = await createFreshSessionTokens(user._id)
  setAuthCookies(res, accessToken, refreshToken)
  res.status(201).json(user)
})

export const loginWithGoogle = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userToken } = req.body as { userToken: string }
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId)
    throw new Error('GOOGLE_CLIENT_ID is not defined')
  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({ idToken: userToken, audience: clientId })
  const payload = ticket.getPayload() as GooglePayload
  const { name, email, picture, sub } = payload
  const password = Date.now() + sub
  const initialDevice = trustedDeviceFromRequest(req)
  let user = await User.findOne({ email })
  if (!user)
    user = await User.create({ name, email, password, photo: picture, isVerified: true, userAgent: [initialDevice] })
  const { accessToken, refreshToken } = await createFreshSessionTokens(user._id)
  setAuthCookies(res, accessToken, refreshToken)
  res.status(201).json(user)
})

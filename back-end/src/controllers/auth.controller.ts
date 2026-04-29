import type { Response } from 'express'
import type { AuthRequest, AutomatedEmailData, GooglePayload } from '../types/auth.js'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import Cryptr from 'cryptr'
import asyncHandler from 'express-async-handler'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { UAParser } from 'ua-parser-js'
import Token from '../models/token.model.js'
import User from '../models/user.model.js'
import { generateRefreshToken, generateToken, hashToken } from '../services/token.service.js'
import sendEmail from '../utils/sendEmail.js'

function getCryptr(): Cryptr {
  const key = process.env.CRYPTR_KEY
  if (!key)
    throw new Error('CRYPTR_KEY is not defined')
  return new Cryptr(key)
}

function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  res.cookie('accessToken', accessToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60 * 4,
  })
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: new Date(Date.now() + 1000 * 86400 * 2),
    })
  }
}

export const registerUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string, email: string, password: string }
  if (!name || !email || !password)
    throw new Error('Please fill in all required fields.')
  if (password.length < 8)
    throw new Error('Password must be at least 8 characters!')

  const userExists = await User.findOne({ email })
  if (userExists)
    throw new Error('This email already in use')

  const ua = new UAParser(req.headers['user-agent']).getResult()
  const userAgent = [ua.ua || 'unknown']
  const user = await User.create({ name, email, password, userAgent })

  const token = generateToken(user._id)
  setAuthCookies(res, token)
  res.status(201).json(user)
})

export const loginUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string, password: string }
  if (!email || !password)
    throw new Error('Please fill in all required fields.')

  const user = await User.findOne({ email })
  if (!user)
    throw new Error('User not found, Please signup')

  const passwordIsCorrect = await bcrypt.compare(password, user.password)
  if (!passwordIsCorrect)
    throw new Error('Invalid email or password')

  const ua = new UAParser(req.headers['user-agent']).getResult()
  const thisUserAgent = ua.ua || 'unknown'
  const allowedAgent = user.userAgent.includes(thisUserAgent)
  if (!allowedAgent) {
    const cryptr = getCryptr()
    const loginCode = Math.floor(100000 + Math.random() * 900000)
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString())

    const userToken = await Token.findOne({ userId: user._id })
    if (userToken)
      await userToken.deleteOne()
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
    }).save()
    res.status(400)
    throw new Error('New browser or device detected.')
  }

  const newRefreshToken = crypto.randomBytes(32).toString('hex') + user._id
  const accessToken = generateToken(user._id)
  const refreshToken = generateRefreshToken({ refreshToken: newRefreshToken, userId: user._id })
  setAuthCookies(res, accessToken, refreshToken)

  const userToken = await Token.findOne({ userId: user._id })
  if (userToken)
    await userToken.deleteOne()
  await new Token({
    userId: user._id,
    refreshToken: newRefreshToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 86400 * 2,
  }).save()

  res.status(200).json(user)
})

export const logoutUser = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  res.cookie('accessToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true })
  res.cookie('refreshToken', '', { path: '/', httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true })
  res.status(200).json({ message: 'Logout successful' })
})

export const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id).select('-password')
  if (!user)
    throw new Error('User not found')
  res.status(200).json(user)
})

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new Error('User not found')
  user.name = req.body.name || user.name
  user.phone = req.body.phone || user.phone
  user.bio = req.body.bio || user.bio
  user.photo = req.body.photo || user.photo
  await user.save()
  res.status(200).json(user)
})

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id)
  if (!user)
    throw new Error('User not found')
  await user.deleteOne()
  res.status(200).json({ message: 'User deleted successfully' })
})

export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().sort('-createdAt').select('-password')
  res.status(200).json(users)
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
  const verified = jwt.verify(accessToken, secret)
  res.json(Boolean(verified))
})

export const upgradeUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, role } = req.body as { id: string, role: 'subscriber' | 'author' | 'admin' | 'suspended' }
  const user = await User.findById(id)
  if (!user)
    throw new Error('User not found!')
  user.role = role
  await user.save()
  res.status(200).json({ message: `User role updated to ${role}` })
})

export const sendAutomatedEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { subject, send_to, reply_to, template, url } = req.body as AutomatedEmailData
  if (!subject || !send_to || !reply_to || !template)
    throw new Error('Missing email parameter')
  const user = await User.findOne({ email: send_to })
  if (!user)
    throw new Error('User not found')
  const sent_from = process.env.EMAIL_USER || ''
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${url || ''}`
  await sendEmail(subject, send_to, sent_from, reply_to, template, user.name, link)
  res.status(200).json({ message: 'Email Sent' })
})

export const sendVerificationEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new Error('User not found!')
  if (user.isVerified)
    throw new Error('User already verified')

  const token = await Token.findOne({ userId: user._id })
  if (token)
    await token.deleteOne()
  const verificationToken = crypto.randomBytes(32).toString('hex') + user._id
  const hashedToken = hashToken(verificationToken)
  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }).save()

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`
  await sendEmail(
    'Verify Your Account - Smart Layout',
    user.email,
    process.env.EMAIL_USER || '',
    'noreply@smart-layout.local',
    'verifyEmail',
    user.name,
    verificationUrl,
  )
  res.status(200).json({ message: 'Verification Email Sent' })
})

export const verifyUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const verificationToken = String(req.params.verificationToken || '')
  const hashedToken = hashToken(verificationToken)
  const userToken = await Token.findOne({ verificationToken: hashedToken, expiresAt: { $gt: Date.now() } })
  if (!userToken)
    throw new Error('Invalid or Expired Token')
  const user = await User.findById(userToken.userId)
  if (!user)
    throw new Error('User not found')
  user.isVerified = true
  await user.save()
  res.status(200).json({ message: 'Account verification was successful' })
})

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body as { email: string }
  const user = await User.findOne({ email })
  if (!user)
    throw new Error('There is no user with this email')

  const token = await Token.findOne({ userId: user._id })
  if (token)
    await token.deleteOne()
  const resetToken = crypto.randomBytes(32).toString('hex') + user._id
  const hashedToken = hashToken(resetToken)
  await new Token({
    userId: user._id,
    resetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }).save()
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetPassword/${resetToken}`
  await sendEmail(
    'Password Reset Request - Smart Layout',
    user.email,
    process.env.EMAIL_USER || '',
    'noreply@smart-layout.local',
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
  const userToken = await Token.findOne({ resetToken: hashedToken, expiresAt: { $gt: Date.now() } })
  if (!userToken)
    throw new Error('Invalid or Expired Token')
  const user = await User.findById(userToken.userId)
  if (!user)
    throw new Error('User not found')
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Password reset was successful, Please login' })
})

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { oldPassword, password } = req.body as { oldPassword: string, password: string }
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new Error('User not found')
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)
  if (!passwordIsCorrect)
    throw new Error('Old password is incorrect')
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Password changed successfully, please login again.' })
})

export const sendLoginCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const email = String(req.params.email || '')
  const user = await User.findOne({ email })
  if (!user)
    throw new Error('User not found')
  const userToken = await Token.findOne({ userId: user._id, expiresAt: { $gt: Date.now() } })
  if (!userToken)
    throw new Error('Invalid or Expired Token, please login again')
  const decryptedLoginCode = getCryptr().decrypt(userToken.loginToken)
  await sendEmail(
    'Login Access Code - Smart Layout',
    email,
    process.env.EMAIL_USER || '',
    'noreply@smart-layout.local',
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
    throw new Error('User not found')
  const userToken = await Token.findOne({ userId: user._id, expiresAt: { $gt: Date.now() } })
  if (!userToken)
    throw new Error('Invalid or Expired Token, please login again')
  const decryptedLoginCode = getCryptr().decrypt(userToken.loginToken)
  if (loginCode !== decryptedLoginCode)
    throw new Error('Incorrect login code, please try again')
  const thisUserAgent = new UAParser(req.headers['user-agent']).getResult().ua || 'unknown'
  user.userAgent.push(thisUserAgent)
  await user.save()
  const token = generateToken(user._id)
  setAuthCookies(res, token)
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
  const userAgent = [new UAParser(req.headers['user-agent']).getResult().ua || 'unknown']
  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({ name, email, password, photo: picture, isVerified: true, userAgent })
  }
  const accessToken = generateToken(user._id)
  setAuthCookies(res, accessToken)
  res.status(201).json(user)
})

// Compatibility aliases for existing frontend service
export const login = loginUser
export const logout = logoutUser
export const status = loginStatus
export const me = getUser

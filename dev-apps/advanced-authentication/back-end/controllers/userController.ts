import type { Response } from 'express'
import type { AuthRequest, AutomatedEmailData, GooglePayload, JWTPayload } from '@/types'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import Cryptr from 'cryptr'
import asyncHandler from 'express-async-handler'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { UAParser } from 'ua-parser-js'
import { generateRefreshToken, generateToken, hashToken } from '@/utils'
import Token from '../models/tokenModel.js'
import User from '../models/userModel.js'
import sendEmail from '../utils/sendEmail.js'

// Initialize Cryptr
function getCryptr(): Cryptr {
  const key = process.env.CRYPTR_KEY
  if (!key) {
    throw new Error('CRYPTR_KEY is not defined')
  }
  return new Cryptr(key)
}

// ------------ Register User
const registerUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string, email: string, password: string }

  // validation
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please fill in all required fields.')
  }
  if (password.length < 8) {
    res.status(400)
    throw new Error('Password must be at least 8 characters!')
  }

  // Check if user exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('This email already in use')
  }

  // Get UserAgent
  const ua = new UAParser(req.headers['user-agent']).getResult()
  const userAgent = [ua.ua]

  // Create new user
  const user = await User.create({ name, email, password, userAgent })

  // Generate Token
  const token = generateToken(user._id)

  // Send HTTP-only Cookie
  res.cookie('accessToken', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  })

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(201).json({ _id, name, email, phone, bio, photo, role, isVerified, token })
  }
  else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// ------------ Login User
const loginUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string, password: string }

  // Validation
  if (!email || !password) {
    res.status(400)
    throw new Error('Please fill in all required fields.')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(404)
    throw new Error('User not found, Please signup')
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password)
  if (!passwordIsCorrect) {
    res.status(400)
    throw new Error('Invalid email or password')
  }

  // ---> Trigger 2-Factor unknown UserAgent
  const ua = new UAParser(req.headers['user-agent']).getResult()
  const thisUserAgent = ua.ua
  console.log(thisUserAgent)
  const allowedAgent = user.userAgent.includes(thisUserAgent)

  if (!allowedAgent) {
    const cryptr = getCryptr()
    // Generate 6 digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000)
    console.log(loginCode)

    // Encrypt login code before saving to DB
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString())

    // Delete Token if it exists in DB
    const userToken = await Token.findOne({ userId: user._id })
    if (userToken)
      await userToken.deleteOne()

    // Save Token to DB
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000), // 60-Min(1-hour)
    }).save()

    res.status(400)
    throw new Error('New browser or device detected.')
  }

  const newRefreshToken = crypto.randomBytes(32).toString('hex') + user._id

  // Generate Token
  const accessToken = generateToken(user._id)
  const refreshToken = generateRefreshToken({ refreshToken: newRefreshToken, userId: user._id })

  if (user && passwordIsCorrect) {
    // Send HTTP-only Cookie
    res.cookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 4, // 4 hour
    })
    res.cookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400 * 2), // 2 Days
      sameSite: 'none',
      secure: true,
    })

    const userToken = await Token.findOne({ userId: user._id })
    if (userToken)
      await userToken.deleteOne()

    // Save Refresh Token to DB
    await new Token({
      userId: user._id,
      refreshToken: newRefreshToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 86400 * 2, // 2 Days
    }).save()

    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(200).json({ _id, name, email, phone, bio, photo, role, isVerified, accessToken })
  }
  else {
    res.status(500)
    throw new Error('Something went wrong, please try again!')
  }
})

// ------------ Logout User
const logoutUser = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  res.cookie('accessToken', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  })
  res.cookie('refreshToken', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  })

  res.status(200).json({ message: 'Logout successful' })
})

// ------------ Get User
const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(200).json({ _id, name, email, phone, bio, photo, role, isVerified })
  }
  else {
    res.status(404)
    throw new Error('User not found')
  }
})

// ------------ Update User
const updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)

  if (user) {
    const { name, email, phone, bio, photo } = user
    user.email = email
    user.name = req.body.name || name
    user.phone = req.body.phone || phone
    user.bio = req.body.bio || bio
    user.photo = req.body.photo || photo
    const updatedUser = await user.save()

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    })
  }
  else {
    res.status(404)
    throw new Error('User not found')
  }
})

// ------------ Delete User
const deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await user.deleteOne()
  res.status(200).json({ message: 'User deleted successfully' })
})

// ------------ Get All Users
const getUsers = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().sort('-createdAt').select('-password')
  if (!users) {
    res.status(500)
    throw new Error('Something went wrong')
  }
  res.status(200).json(users)
})

// ------------ Get Login Status
const loginStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const accessToken = req.cookies.accessToken as string | undefined
  if (!accessToken) {
    res.json(false)
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    res.json(false)
    return
  }

  // Verify token
  const verified = jwt.verify(accessToken, jwtSecret) as JWTPayload
  if (verified) {
    res.json(true)
  }
  else {
    res.json(false)
  }
})

// ------------ Upgrade User Role
const upgradeUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, role } = req.body as { id: string, role: string }
  const user = await User.findById(id)
  if (!user) {
    res.status(404)
    throw new Error('User not found!')
  }
  user.role = role as 'subscriber' | 'author' | 'admin' | 'suspended'
  await user.save()

  res.status(200).json({ message: `User role updated to ${role}` })
})

// ------------ Send Automated Emails
const sendAutomatedEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { subject, send_to, reply_to, template, url } = req.body as AutomatedEmailData

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500)
    throw new Error('Missing email parameter')
  }

  // Get user
  const user = await User.findOne({ email: send_to })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  const sent_from = process.env.EMAIL_USER || ''
  const name = user.name
  const link = `${process.env.FRONTEND_URL}${url}`

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link)
    res.status(200).json({ message: 'Email Sent' })
  }
  catch (error) {
    res.status(500)
    throw new Error('Email not sent, please try again')
  }
})

// ------------ Send Verification Email
const sendVerificationEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found!')
  }

  if (user.isVerified) {
    res.status(400)
    throw new Error('User already verified')
  }

  // Delete Token if it exists in DB
  const token = await Token.findOne({ userId: user._id })
  if (token)
    await token.deleteOne()

  // Create Verification Token and Save to DB
  const verificationToken = crypto.randomBytes(32).toString('hex') + user._id
  console.log(verificationToken)

  // Hash Token and Save to DB
  const hashedToken = hashToken(verificationToken)

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // 60-Min(1-hour)
  }).save()

  // Construct Verification URL ---> Sending for User
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`

  // Send Verification Email
  const subject = 'Verify Your Account - AUTH:REZA'
  const send_to = user.email
  const sent_from = process.env.EMAIL_USER || ''
  const reply_to = 'noreply@rezapshr.com'
  const template = 'verifyEmail'
  const name = user.name
  const link = verificationUrl

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link)
    res.status(200).json({ message: 'Verification Email Sent' })
  }
  catch (error) {
    res.status(500)
    throw new Error('Email not sent, please try again')
  }
})

// ------------ Verify User
const verifyUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { verificationToken } = req.params

  if (!verificationToken) {
    res.status(400)
    throw new Error('Verification token is required')
  }

  const hashedToken = hashToken(verificationToken)

  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  })

  if (!userToken) {
    res.status(404)
    throw new Error('Invalid or Expired Token')
  }

  // Find User
  const user = await User.findOne({ _id: userToken.userId })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user.isVerified) {
    res.status(400)
    throw new Error('User is already verified')
  }

  // Now Verify User
  user.isVerified = true
  await user.save()

  res.status(200).json({ message: 'Account verification was successful' })
})

// ------------ Forgot Password
const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body as { email: string }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('There is no user with this email')
  }

  // Delete Token if it exists in DB
  const token = await Token.findOne({ userId: user._id })
  if (token)
    await token.deleteOne()

  // Create Verification Token and Save to DB
  const resetToken = crypto.randomBytes(32).toString('hex') + user._id
  console.log(resetToken)

  // Hash Token and Save to DB
  const hashedToken = hashToken(resetToken)

  await new Token({
    userId: user._id,
    resetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // 60-Min(1-hour)
  }).save()

  // Construct Reset URL ---> Sending for User
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`

  // Send Verification Email
  const subject = 'Password Reset Request - AUTH:REZA'
  const send_to = user.email
  const sent_from = process.env.EMAIL_USER || ''
  const reply_to = 'rezanoreply@rezapshr.com'
  const template = 'forgotPassword'
  const name = user.name
  const link = resetUrl

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link)
    res.status(200).json({ message: 'Password Reset Email Sent' })
  }
  catch (error) {
    res.status(500)
    throw new Error('Email not sent, please try again')
  }
})

// ------------ Reset Password
const resetPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { resetToken } = req.params
  const { password } = req.body as { password: string }

  if (!resetToken) {
    res.status(400)
    throw new Error('Reset token is required')
  }

  const hashedToken = hashToken(resetToken)

  const userToken = await Token.findOne({
    resetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  })

  if (!userToken) {
    res.status(404)
    throw new Error('Invalid or Expired Token')
  }

  // Find User
  const user = await User.findOne({ _id: userToken.userId })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Now Reset Password
  user.password = password
  await user.save()

  res.status(200).json({ message: 'Password reset was successful, Please login' })
})

// ------------ Change Password
const changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { oldPassword, password } = req.body as { oldPassword: string, password: string }
  const user = await User.findById(req.user?._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!oldPassword || !password) {
    res.status(400)
    throw new Error('Please enter old and new password')
  }

  // Check if old password is correct
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

  // Save New Password
  if (user && passwordIsCorrect) {
    user.password = password
    await user.save()
    res.status(200).json({ message: 'Password changed successfully, please login again.' })
  }
  else {
    res.status(400)
    throw new Error('Old password is incorrect')
  }
})

// ------------ Send Login Code
const sendLoginCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.params

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Find Login Code in DB
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  })

  if (!userToken) {
    res.status(404)
    throw new Error('Invalid or Expired Token, please login again')
  }

  const cryptr = getCryptr()
  const loginCode = userToken.loginToken
  const decryptedLoginCode = cryptr.decrypt(loginCode)

  // Send Login Code
  const subject = 'Login Access Code - AUTH:REZA'
  const send_to = email
  const sent_from = process.env.EMAIL_USER || ''
  const reply_to = 'rezanoreply@rezapshr.com'
  const template = 'loginCode'
  const name = user.name
  const link = decryptedLoginCode

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link)
    res.status(200).json({ message: `Access code sent to ${email}` })
  }
  catch (error) {
    res.status(500)
    throw new Error('Email not sent, please try again')
  }
})

// ------------ Login With Code
const loginWithCode = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.params
  const { loginCode } = req.body as { loginCode: string }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Find User Login Token
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  })

  if (!userToken) {
    res.status(404)
    throw new Error('Invalid or Expired Token, please login again')
  }

  const cryptr = getCryptr()
  const decryptedLoginCode = cryptr.decrypt(userToken.loginToken)

  if (loginCode !== decryptedLoginCode) {
    res.status(400)
    throw new Error('Incorrect login code, please try again')
  }
  else {
    // Register User-Agent
    const ua = new UAParser(req.headers['user-agent']).getResult()
    const thisUserAgent = ua.ua
    user.userAgent.push(thisUserAgent)
    await user.save()

    // Generate Token
    const token = generateToken(user._id)

    // Send HTTP-only Cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    })

    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(201).json({ _id, name, email, phone, bio, photo, role, isVerified, token })
  }
})

// ------------ Login With Google
const loginWithGoogle = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userToken } = req.body as { userToken: string }
  console.log(userToken)

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    res.status(500)
    throw new Error('GOOGLE_CLIENT_ID is not defined')
  }

  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({
    idToken: userToken,
    audience: clientId,
  })

  const payload = ticket.getPayload() as GooglePayload
  const { name, email, picture, sub } = payload
  const password = Date.now() + sub

  // Get UserAgent
  const ua = new UAParser(req.headers['user-agent']).getResult()
  const userAgent = [ua.ua]

  // Check if user exists
  const existingUser = await User.findOne({ email })

  if (!existingUser) {
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      photo: picture,
      isVerified: true,
      userAgent,
    })

    if (newUser) {
      // Generate Token
      const accessToken = generateToken(newUser._id)

      // Send HTTP-only cookie
      res.cookie('accessToken', accessToken, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: 'none',
        secure: true,
      })

      const { _id, name, email, phone, bio, photo, role, isVerified } = newUser

      res.status(201).json({
        _id,
        name,
        email,
        phone,
        bio,
        photo,
        role,
        isVerified,
        token: accessToken,
      })
      return
    }
  }

  // User exists, login
  if (existingUser) {
    const accessToken = generateToken(existingUser._id)

    // Send HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    })

    const { _id, name, email, phone, bio, photo, role, isVerified } = existingUser

    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token: accessToken,
    })
  }
})

export {
  changePassword,
  deleteUser,
  forgotPassword,
  getUser,
  getUsers,
  loginStatus,
  loginUser,
  loginWithCode,
  loginWithGoogle,
  logoutUser,
  registerUser,
  resetPassword,
  sendAutomatedEmail,
  sendLoginCode,
  sendVerificationEmail,
  updateUser,
  upgradeUser,
  verifyUser,
}

import type { Response } from 'express'
import type { AuthRequest, AutomatedEmailData } from '../../types/auth.js'
import asyncHandler from 'express-async-handler'
import { BadRequestError, NotFoundError } from '../../common/errors/app-error.js'
import { emitAuthEvent } from '../../common/observability/auth-events.js'
import sendEmail from '../../common/utils/sendEmail.js'
import { config } from '../../config/env.js'
import User from '../../models/user.model.js'
import { revokeAllUserSessions } from '../../services/auth-session.service.js'

export const getUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id).select('-password')
  if (!user)
    throw new NotFoundError('User not found')
  res.status(200).json(user)
})

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id)
  if (!user)
    throw new NotFoundError('User not found')
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
    throw new NotFoundError('User not found')
  await user.deleteOne()
  res.status(200).json({ message: 'User deleted successfully' })
})

export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().sort('-createdAt').select('-password')
  res.status(200).json(users)
})

export const upgradeUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, role } = req.body as { id: string, role: 'subscriber' | 'author' | 'admin' | 'suspended' }
  const user = await User.findById(id)
  if (!user)
    throw new NotFoundError('User not found!')
  const previousRole = user.role
  user.role = role
  await user.save()

  if (role === 'suspended' && previousRole !== 'suspended') {
    const sessionsRevoked = await revokeAllUserSessions(user._id)
    emitAuthEvent(req, 'auth.sessions_revoked', {
      targetUserId: String(user._id),
      reason: 'role_suspended',
      sessionsRevoked,
    })
  }

  res.status(200).json({ message: `User role updated to ${role}` })
})

export const sendAutomatedEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { subject, send_to, reply_to, template, url } = req.body as AutomatedEmailData
  if (!subject || !send_to || !reply_to || !template)
    throw new BadRequestError('Missing email parameter')
  const user = await User.findOne({ email: send_to })
  if (!user)
    throw new NotFoundError('User not found')
  const sent_from = config.email.user
  const link = `${config.frontendUrl}${url || ''}`
  await sendEmail(subject, send_to, sent_from, reply_to, template, user.name, link)
  res.status(200).json({ message: 'Email Sent' })
})

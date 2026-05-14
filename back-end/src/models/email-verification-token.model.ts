import type { IEmailVerificationToken } from '../types/auth.js'
import mongoose, { Schema } from 'mongoose'

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { collection: 'email_verification_tokens' },
)

const EmailVerificationToken = mongoose.model<IEmailVerificationToken>(
  'EmailVerificationToken',
  emailVerificationTokenSchema,
)
export default EmailVerificationToken

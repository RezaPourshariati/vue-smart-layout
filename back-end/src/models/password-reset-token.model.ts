import type { IPasswordResetToken } from '../types/auth.js'
import mongoose, { Schema } from 'mongoose'

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
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
  { collection: 'password_reset_tokens' },
)

const PasswordResetToken = mongoose.model<IPasswordResetToken>(
  'PasswordResetToken',
  passwordResetTokenSchema,
)
export default PasswordResetToken

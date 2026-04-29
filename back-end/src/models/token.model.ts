import type { IToken } from '../types/auth.js'
import mongoose, { Schema } from 'mongoose'

const tokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  verificationToken: {
    type: String,
    default: '',
  },
  resetToken: {
    type: String,
    default: '',
  },
  refreshToken: {
    type: String,
    default: '',
  },
  loginToken: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

const Token = mongoose.model<IToken>('Token', tokenSchema)
export default Token

import type { ISession } from '../types/auth.js'
import mongoose, { Schema } from 'mongoose'

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
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
    sessionStartedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    lastUsedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { collection: 'sessions' },
)

const Session = mongoose.model<ISession>('Session', sessionSchema)
export default Session

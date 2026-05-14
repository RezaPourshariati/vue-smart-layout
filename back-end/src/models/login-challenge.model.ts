import type { ILoginChallenge } from '../types/auth.js'
import mongoose, { Schema } from 'mongoose'

const loginChallengeSchema = new Schema<ILoginChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    encryptedLoginCode: {
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
  },
  { collection: 'login_challenges' },
)

const LoginChallenge = mongoose.model<ILoginChallenge>('LoginChallenge', loginChallengeSchema)
export default LoginChallenge

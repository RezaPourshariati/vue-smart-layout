import type { IUser } from '@/types'
import bcrypt from 'bcryptjs'
import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please enter name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter Email'],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter Password'],
    },
    photo: {
      type: String,
      required: [true, 'Please add a photo'],
      default: 'https://i.ibb.co/4pDNDk1/avatar.png',
    },
    phone: {
      type: String,
      default: '+98',
    },
    bio: {
      type: String,
      default: 'bio',
    },
    role: {
      type: String,
      required: true,
      default: 'subscriber',
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    userAgent: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
)

// Encrypt Password Before Saving to Database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password'))
    return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

const User = mongoose.model<IUser>('User', userSchema)
export default User

import { Router } from 'express'
import { protect } from '../../common/middleware/auth.middleware.js'
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js'
import {
  changePassword,
  forgotPassword,
  loginStatus,
  loginUser,
  loginWithCode,
  loginWithGoogle,
  logoutUser,
  registerUser,
  resetPassword,
  sendLoginCode,
  sendVerificationEmail,
  verifyUser,
} from './controller.js'

const router = Router()
const authRateLimiter = createRateLimiter(10, 60 * 1000)

router.post('/register', registerUser)
router.post('/login', authRateLimiter, loginUser)
router.post('/logout', logoutUser)
router.get('/status', loginStatus)
router.post('/sendVerificationEmail', protect, sendVerificationEmail)
router.patch('/verifyUser/:verificationToken', verifyUser)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:resetToken', resetPassword)
router.patch('/changePassword', protect, changePassword)
router.post('/sendLoginCode/:email', sendLoginCode)
router.post('/loginWithCode/:email', loginWithCode)
router.post('/google/callback', loginWithGoogle)

export default router

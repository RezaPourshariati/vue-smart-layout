import { Router } from 'express'
import {
  changePassword,
  deleteUser,
  forgotPassword,
  getUser,
  getUsers,
  login,
  loginStatus,
  loginUser,
  loginWithCode,
  loginWithGoogle,
  logout,
  logoutUser,
  me,
  registerUser,
  resetPassword,
  sendAutomatedEmail,
  sendLoginCode,
  sendVerificationEmail,
  status,
  updateUser,
  upgradeUser,
  verifyUser,
} from '../controllers/auth.controller.js'
import {
  adminOnly,
  authorOnly,
  protect,
  requireAuth,
} from '../middleware/auth.middleware.js'
import { requireCsrf } from '../middleware/csrf.middleware.js'
import { createRateLimiter } from '../middleware/rate-limit.middleware.js'
import { requireRoles } from '../middleware/rbac.middleware.js'

const router = Router()
const authRateLimiter = createRateLimiter(10, 60 * 1000)

// Reference app routes (full section)
router.post('/register', registerUser)
router.post('/login', authRateLimiter, loginUser)
router.post('/logout', logoutUser)
router.get('/logout', logoutUser)
router.get('/getUser', protect, getUser)
router.patch('/updateUser', protect, updateUser)
router.delete('/:id', protect, adminOnly, deleteUser)
router.get('/getUsers', protect, authorOnly, getUsers)
router.get('/loginStatus', loginStatus)
router.post('/upgradeUser', protect, adminOnly, upgradeUser)
router.post('/sendAutomatedEmail', protect, sendAutomatedEmail)
router.post('/sendVerificationEmail', protect, sendVerificationEmail)
router.patch('/verifyUser/:verificationToken', verifyUser)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:resetToken', resetPassword)
router.patch('/changePassword', protect, changePassword)
router.post('/sendLoginCode/:email', sendLoginCode)
router.post('/loginWithCode/:email', loginWithCode)
router.post('/google/callback', loginWithGoogle)

// Compatibility routes for current frontend integration
router.post('/login-basic', authRateLimiter, login)
router.post('/logout-basic', requireCsrf, logout)
router.get('/status', status)
router.get('/me', requireAuth, me)

// Additional role-based sample endpoint
router.get('/admin/summary', requireAuth, requireRoles(['admin']), (_req, res) => {
  res.json({ message: 'Admin access granted' })
})

export default router

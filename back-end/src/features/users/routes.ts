import { Router } from 'express'
import {
  adminOnly,
  authorOnly,
  requireAuth,
} from '../../common/middleware/auth.middleware.js'
import { requireRoles } from '../../common/middleware/rbac.middleware.js'
import {
  deleteUser,
  getUser,
  getUsers,
  sendAutomatedEmail,
  updateUser,
  upgradeUser,
} from './controller.js'

const router = Router()

router.get('/me', requireAuth, getUser)
router.get('/getUser', requireAuth, getUser)
router.patch('/updateUser', requireAuth, updateUser)
router.delete('/:id', requireAuth, adminOnly, deleteUser)
router.get('/getUsers', requireAuth, authorOnly, getUsers)
router.post('/upgradeUser', requireAuth, adminOnly, upgradeUser)
router.post('/sendAutomatedEmail', requireAuth, sendAutomatedEmail)
router.get('/admin/summary', requireAuth, requireRoles(['admin']), (_req, res) => {
  res.json({ message: 'Admin access granted' })
})

export default router

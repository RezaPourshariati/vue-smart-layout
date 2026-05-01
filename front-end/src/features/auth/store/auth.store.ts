import type {
  AuthCredentials,
  AuthUser,
  ChangePasswordPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UpgradeUserPayload,
} from '@/types'
import { defineStore } from 'pinia'
import * as authService from '../api/auth.api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    users: [] as AuthUser[],
    isAuthenticated: false,
    isLoading: false,
    authChecked: false,
    pendingLoginCodeEmail: '' as string,
  }),
  getters: {
    roles: state => (state.user?.role ? [state.user.role] : []),
    hasRole: state => (role: string) => state.user?.role === role,
    isAdmin(): boolean {
      return this.hasRole('admin')
    },
  },
  actions: {
    setUser(user: AuthUser | null) {
      this.user = user
      this.isAuthenticated = Boolean(user)
    },
    clearAuth() {
      this.user = null
      this.users = []
      this.isAuthenticated = false
      this.pendingLoginCodeEmail = ''
    },
    async bootstrapAuth() {
      if (this.authChecked)
        return

      this.isLoading = true
      try {
        const isLoggedIn = await authService.getLoginStatus()
        if (isLoggedIn) {
          const user = await authService.getCurrentUser()
          this.setUser(user)
        }
        else {
          this.clearAuth()
        }
      }
      catch {
        this.clearAuth()
      }
      finally {
        this.authChecked = true
        this.isLoading = false
      }
    },
    async login(credentials: AuthCredentials) {
      this.isLoading = true
      try {
        const user = await authService.login(credentials)
        this.setUser(user)
        this.pendingLoginCodeEmail = ''
      }
      catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message.includes('New browser or device detected')) {
          this.pendingLoginCodeEmail = credentials.email
        }
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
    async register(payload: RegisterPayload) {
      this.isLoading = true
      try {
        const user = await authService.register(payload)
        this.setUser(user)
      }
      finally {
        this.isLoading = false
      }
    },
    async sendLoginCode(email: string) {
      this.isLoading = true
      try {
        await authService.sendLoginCode(email)
      }
      finally {
        this.isLoading = false
      }
    },
    async loginWithCode(email: string, loginCode: string) {
      this.isLoading = true
      try {
        const user = await authService.loginWithCode(email, loginCode)
        this.setUser(user)
        this.pendingLoginCodeEmail = ''
      }
      finally {
        this.isLoading = false
      }
    },
    async forgotPassword(email: string) {
      this.isLoading = true
      try {
        return await authService.forgotPassword(email)
      }
      finally {
        this.isLoading = false
      }
    },
    async resetPassword(resetToken: string, password: string) {
      this.isLoading = true
      try {
        return await authService.resetPassword(resetToken, password)
      }
      finally {
        this.isLoading = false
      }
    },
    async updateUser(payload: UpdateProfilePayload) {
      this.isLoading = true
      try {
        const user = await authService.updateUser(payload)
        this.setUser(user)
        return user
      }
      finally {
        this.isLoading = false
      }
    },
    async sendVerificationEmail() {
      this.isLoading = true
      try {
        return await authService.sendVerificationEmail()
      }
      finally {
        this.isLoading = false
      }
    },
    async verifyUser(verificationToken: string) {
      this.isLoading = true
      try {
        return await authService.verifyUser(verificationToken)
      }
      finally {
        this.isLoading = false
      }
    },
    async changePassword(payload: ChangePasswordPayload) {
      this.isLoading = true
      try {
        return await authService.changePassword(payload)
      }
      finally {
        this.isLoading = false
      }
    },
    async getUsers() {
      this.isLoading = true
      try {
        const users = await authService.getUsers()
        this.users = users
        return users
      }
      finally {
        this.isLoading = false
      }
    },
    async deleteUser(id: string) {
      this.isLoading = true
      try {
        const result = await authService.deleteUser(id)
        this.users = this.users.filter(user => user._id !== id)
        return result
      }
      finally {
        this.isLoading = false
      }
    },
    async upgradeUser(payload: UpgradeUserPayload) {
      this.isLoading = true
      try {
        const result = await authService.upgradeUser(payload)
        this.users = this.users.map((user) => {
          if (user._id === payload.id)
            return { ...user, role: payload.role }
          return user
        })
        if (this.user?._id === payload.id)
          this.user = { ...this.user, role: payload.role }
        return result
      }
      finally {
        this.isLoading = false
      }
    },
    async logout() {
      this.isLoading = true
      try {
        await authService.logout()
      }
      finally {
        this.clearAuth()
        this.isLoading = false
      }
    },
  },
})

import type { ReactNode } from 'react'

// User Types
export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  bio?: string
  photo?: string
  role: 'subscriber' | 'author' | 'admin' | 'suspended'
  isVerified: boolean
  userAgent?: string[]
  createdAt?: string
  updatedAt?: string
}

// Auth State Types
export interface AuthState {
  isLoggedIn: boolean
  user: User | null
  users: User[]
  twoFactor: boolean
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  message: string
  verifiedUsers: number
  suspendedUsers: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  password2: string
}

export interface PasswordChangeData {
  oldPassword: string
  password: string
  password2?: string
}

export interface ProfileData {
  name: string
  email: string
  phone: string
  bio: string
  photo: string
  role: string
  isVerified: boolean
}

export interface ProfileUpdateData {
  name: string
  phone: string
  bio: string
  photo?: string
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Email Types
export interface EmailData {
  subject: string
  send_to: string
  reply_to: string
  template: string
  url: string
}

export interface EmailState {
  sendingEmail: boolean
  emailSent: boolean
  message: string
}

// Filter State Types
export interface FilterState {
  filteredUsers: User[]
}

// Component Props Types
export interface CardProps {
  children: ReactNode
  cardClass?: string
}

export interface InfoBoxProps {
  bgColor: string
  title: string
  count: number | string
  icon: ReactNode
}

export interface SearchProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface PasswordInputProps {
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  name: string
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
}

export interface LayoutProps {
  children: ReactNode
}

export interface ChangeRoleProps {
  id: string
  email: string
}

export interface ChildrenProps {
  children: ReactNode
}

// Redux Store Types
export interface RootState {
  auth: AuthState
  email: EmailState
  filter: FilterState
}

// Upgrade User Data
export interface UpgradeUserData {
  role: string
  id: string
}

// Reset Password Data
export interface ResetPasswordData {
  userData: { password: string }
  resetToken: string
}

// Login With Code Data
export interface LoginWithCodeData {
  code: { loginCode: string }
  email: string
}

export type UserRole = 'subscriber' | 'author' | 'admin' | 'suspended'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  isVerified: boolean
  phone?: string
  bio?: string
  photo?: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  bio?: string
  photo?: string
}

export interface UpgradeUserPayload {
  id: string
  role: UserRole
}

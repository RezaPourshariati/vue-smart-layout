import type { LoginFormData, ProfileUpdateData, UpgradeUserData, User } from '@/types'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
export const API_URL = `${BACKEND_URL}/api/v1/users/`

// Validate Email
export function validateEmail(email: string): RegExpMatchArray | null {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i,
  )
}

// Register User
async function register(userData: { name: string, email: string, password: string }): Promise<User> {
  const response = await axios.post(`${API_URL}register`, userData)
  return response.data
}

// Login User
async function login(userData: LoginFormData): Promise<User> {
  const response = await axios.post(`${API_URL}login`, userData)
  return response.data
}

// Logout User
async function logout(): Promise<string> {
  const response = await axios.get(`${API_URL}logout`)
  return response.data.message
}

// Get User Profile
async function getUser(): Promise<User> {
  const response = await axios.get(`${API_URL}getUser`)
  return response.data
}

// Get User Status
async function getLoginStatus(): Promise<boolean> {
  const response = await axios.get(`${API_URL}loginStatus`)
  return response.data
}

// Update User Profile
async function updateUser(userData: ProfileUpdateData): Promise<User> {
  const response = await axios.patch(`${API_URL}updateUser`, userData)
  return response.data
}

// Send Verification Email
async function sendVerificationEmail(): Promise<string> {
  const response = await axios.post(`${API_URL}sendVerificationEmail`)
  return response.data.message
}

// Verify User
async function verifyUser(verificationToken: string): Promise<string> {
  const response = await axios.patch(`${API_URL}verifyUser/${verificationToken}`)
  return response.data.message
}

// Change Password
async function changePassword(userData: { oldPassword: string, password: string }): Promise<string> {
  const response = await axios.patch(`${API_URL}changePassword`, userData)
  return response.data.message
}

// Forgot Password
async function forgotPassword(userData: { email: string }): Promise<string> {
  const response = await axios.post(`${API_URL}forgotPassword`, userData)
  return response.data.message
}

// Reset Password
async function resetPassword(userData: { password: string }, resetToken: string): Promise<string> {
  const response = await axios.patch(`${API_URL}resetPassword/${resetToken}`, userData)
  return response.data.message
}

// Get Users
async function getUsers(): Promise<User[]> {
  const response = await axios.get(`${API_URL}getUsers`)
  return response.data
}

// Delete User
async function deleteUser(id: string): Promise<string> {
  const response = await axios.delete(API_URL + id)
  return response.data.message
}

// Upgrade User
async function upgradeUser(userData: UpgradeUserData): Promise<string> {
  const response = await axios.post(`${API_URL}upgradeUser`, userData)
  return response.data.message
}

// Send Login Code
async function sendLoginCode(email: string): Promise<string> {
  const response = await axios.post(`${API_URL}sendLoginCode/${email}`)
  return response.data.message
}

// Login With Code
async function loginWithCode(code: { loginCode: string }, email: string): Promise<User> {
  const response = await axios.post(`${API_URL}loginWithCode/${email}`, code)
  return response.data
}

// Login With Google
async function loginWithGoogle(userToken: string): Promise<User> {
  const response = await axios.post(`${API_URL}google/callback`, userToken)
  return response.data
}

const authService = {
  register,
  login,
  logout,
  getUser,
  getLoginStatus,
  updateUser,
  sendVerificationEmail,
  verifyUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  upgradeUser,
  sendLoginCode,
  loginWithCode,
  loginWithGoogle,
}

export default authService

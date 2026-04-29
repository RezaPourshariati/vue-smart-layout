import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type { AuthState, LoginFormData, LoginWithCodeData, ProfileUpdateData, ResetPasswordData, UpgradeUserData, User } from '@/types'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import authService from './authService'

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  users: [],
  twoFactor: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  verifiedUsers: 0,
  suspendedUsers: 0,
}

// Helper to extract error message
function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } }, message?: string }
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred'
  }
  if (error instanceof Error)
    return error.message
  return String(error)
}

// --------------- Register User
export const register = createAsyncThunk('auth/register', async (userData: { name: string, email: string, password: string }, thunkAPI) => {
  try {
    return await authService.register(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Login User
export const login = createAsyncThunk('auth/login', async (userData: LoginFormData, thunkAPI) => {
  try {
    return await authService.login(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Logout User
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    return await authService.logout()
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Get Login Status
export const getLoginStatus = createAsyncThunk('auth/getLoginStatus', async (_, thunkAPI) => {
  try {
    return await authService.getLoginStatus()
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Get User
export const getUser = createAsyncThunk('auth/getUser', async (_, thunkAPI) => {
  try {
    return await authService.getUser()
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Update User
export const updateUser = createAsyncThunk('auth/updateUser', async (userData: ProfileUpdateData, thunkAPI) => {
  try {
    return await authService.updateUser(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Send Verification Email
export const sendVerificationEmail = createAsyncThunk('auth/sendVerificationEmail', async (_, thunkAPI) => {
  try {
    return await authService.sendVerificationEmail()
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Verify User
export const verifyUser = createAsyncThunk('auth/verifyUser', async (verificationToken: string, thunkAPI) => {
  try {
    return await authService.verifyUser(verificationToken)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Change Password
export const changePassword = createAsyncThunk('auth/changePassword', async (userData: { oldPassword: string, password: string }, thunkAPI) => {
  try {
    return await authService.changePassword(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Forgot Password
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (userData: { email: string }, thunkAPI) => {
  try {
    return await authService.forgotPassword(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Reset Password
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ userData, resetToken }: ResetPasswordData, thunkAPI) => {
  try {
    return await authService.resetPassword(userData, resetToken)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Get Users
export const getUsers = createAsyncThunk('auth/getUsers', async (_, thunkAPI) => {
  try {
    return await authService.getUsers()
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Delete User
export const deleteUser = createAsyncThunk('auth/deleteUser', async (id: string, thunkAPI) => {
  try {
    return await authService.deleteUser(id)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Upgrade User
export const upgradeUser = createAsyncThunk('auth/upgradeUser', async (userData: UpgradeUserData, thunkAPI) => {
  try {
    return await authService.upgradeUser(userData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Send Login Code
export const sendLoginCode = createAsyncThunk('auth/sendLoginCode', async (email: string, thunkAPI) => {
  try {
    return await authService.sendLoginCode(email)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Login With Code
export const loginWithCode = createAsyncThunk('auth/loginWithCode', async ({ code, email }: LoginWithCodeData, thunkAPI) => {
  try {
    return await authService.loginWithCode(code, email)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// --------------- Login With Google
export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (userToken: string, thunkAPI) => {
  try {
    return await authService.loginWithGoogle(userToken)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    RESET(state) {
      state.twoFactor = false
      state.isError = false
      state.isSuccess = false
      state.isLoading = false
      state.message = ''
    },
    CALC_VERIFIED_USER(state) {
      let count = 0
      state.users.forEach((user) => {
        if (user.isVerified)
          count += 1
      })
      state.verifiedUsers = count
    },
    CALC_SUSPENDED_USER(state) {
      let count = 0
      state.users.forEach((user) => {
        if (user.role === 'suspended')
          count += 1
      })
      state.suspendedUsers = count
    },
  },
  extraReducers: (builder) => {
    builder
      // ------------ Register User
      .addCase(register.pending, (state) => {
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.user = action.payload
        toast.success('Registration Successful')
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
        toast.error(action.payload as string)
      })
      // ------------ Login User
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.user = action.payload
        toast.success('Login Successful')
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
        toast.error(action.payload as string)
        if ((action.payload as string).includes('New browser'))
          state.twoFactor = true
      })

      // ------------ Logout User
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = false
        state.user = null
        toast.success(action.payload)
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Get Login Status
      .addCase(getLoginStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getLoginStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = action.payload
      })
      .addCase(getLoginStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
      })

      // ------------ Get User
      .addCase(getUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.user = action.payload
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.user = action.payload
        toast.success('User Updated')
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Send Verification Email
      .addCase(sendVerificationEmail.pending, (state) => {
        state.isLoading = true
      })
      .addCase(sendVerificationEmail.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Verify User
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(changePassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(resetPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false
        state.isSuccess = true
        state.users = action.payload
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Upgrade User
      .addCase(upgradeUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(upgradeUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(upgradeUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Send Login Code
      .addCase(sendLoginCode.pending, (state) => {
        state.isLoading = true
      })
      .addCase(sendLoginCode.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(sendLoginCode.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        toast.error(action.payload as string)
      })

      // ------------ Login With Code
      .addCase(loginWithCode.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loginWithCode.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.twoFactor = false
        state.user = action.payload
        toast.success('Login Successful')
      })
      .addCase(loginWithCode.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
        toast.error(action.payload as string)
      })

      // ------------ Login With Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loginWithGoogle.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isLoggedIn = true
        state.user = action.payload
        toast.success('Login Successful')
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload as string
        state.user = null
        toast.error(action.payload as string)
      })
  },
})

export const { RESET, CALC_VERIFIED_USER, CALC_SUSPENDED_USER } = authSlice.actions
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn
export const selectUser = (state: RootState) => state.auth.user

export default authSlice.reducer

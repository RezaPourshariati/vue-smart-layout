import type { PayloadAction } from '@reduxjs/toolkit'
import type { EmailData, EmailState } from '@/types'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import emailService from './emailService'

const initialState: EmailState = {
  sendingEmail: false,
  emailSent: false,
  message: '',
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

// Send Automated Email
export const sendAutomatedEmail = createAsyncThunk('email/sendAutomatedEmail', async (emailData: EmailData, thunkAPI) => {
  try {
    return await emailService.sendAutomatedEmail(emailData)
  }
  catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    EMAIL_RESET(state) {
      state.sendingEmail = false
      state.emailSent = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder

      // ---------- Send Automated Email
      .addCase(sendAutomatedEmail.pending, (state) => {
        state.sendingEmail = true
      })
      .addCase(sendAutomatedEmail.fulfilled, (state, action: PayloadAction<string>) => {
        state.sendingEmail = false
        state.emailSent = true
        state.message = action.payload
        toast.success(action.payload)
      })
      .addCase(sendAutomatedEmail.rejected, (state, action) => {
        state.sendingEmail = false
        state.emailSent = false
        state.message = action.payload as string
        toast.error(action.payload as string)
      })
  },
})

export const { EMAIL_RESET } = emailSlice.actions
export default emailSlice.reducer

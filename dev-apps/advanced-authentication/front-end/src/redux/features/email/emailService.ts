import type { EmailData } from '@/types'
import axios from 'axios'
import { API_URL } from '../auth/authService'

// Send Automated Email
async function sendAutomatedEmail(emailData: EmailData): Promise<string> {
  const response = await axios.post(`${API_URL}sendAutomatedEmail`, emailData)
  return response.data.message
}

const emailService = {
  sendAutomatedEmail,
}

export default emailService

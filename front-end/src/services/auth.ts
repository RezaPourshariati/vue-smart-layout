import type {
  AuthCredentials,
  AuthUser,
  ChangePasswordPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UpgradeUserPayload,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/auth'

function getCookie(name: string): string | null {
  const pattern = new RegExp(`(?:^|; )${name}=([^;]*)`)
  const match = document.cookie.match(pattern)
  if (!match || match.length < 2)
    return null
  return decodeURIComponent(match[1] || '')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET'
  const csrfToken = method !== 'GET' && method !== 'HEAD' ? getCookie('csrfToken') : null

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new Error(data.message || 'Authentication request failed')

  return data as T
}

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  return await request<AuthUser>('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return await request<AuthUser>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' })
}

export async function getLoginStatus(): Promise<boolean> {
  return await request<boolean>('/status')
}

export async function getCurrentUser(): Promise<AuthUser> {
  return await request<AuthUser>('/me')
}

export async function sendLoginCode(email: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/sendLoginCode/${encodeURIComponent(email)}`, {
    method: 'POST',
  })
}

export async function loginWithCode(email: string, loginCode: string): Promise<AuthUser> {
  return await request<AuthUser>(`/loginWithCode/${encodeURIComponent(email)}`, {
    method: 'POST',
    body: JSON.stringify({ loginCode }),
  })
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return await request<{ message: string }>('/forgotPassword', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(resetToken: string, password: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/resetPassword/${encodeURIComponent(resetToken)}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  })
}

export async function updateUser(payload: UpdateProfilePayload): Promise<AuthUser> {
  return await request<AuthUser>('/updateUser', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function sendVerificationEmail(): Promise<{ message: string }> {
  return await request<{ message: string }>('/sendVerificationEmail', { method: 'POST' })
}

export async function verifyUser(verificationToken: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/verifyUser/${encodeURIComponent(verificationToken)}`, {
    method: 'PATCH',
  })
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return await request<{ message: string }>('/changePassword', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function getUsers(): Promise<AuthUser[]> {
  return await request<AuthUser[]>('/getUsers')
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function upgradeUser(payload: UpgradeUserPayload): Promise<{ message: string }> {
  return await request<{ message: string }>('/upgradeUser', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

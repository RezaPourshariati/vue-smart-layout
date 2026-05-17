export type AuthApiErrorCode
  = | 'SESSION_IDLE_EXPIRED'
    | 'SESSION_ABSOLUTE_EXPIRED'
    | 'ACCOUNT_SUSPENDED'

export class AuthApiError extends Error {
  code?: AuthApiErrorCode
}

export function isAuthApiErrorCode(code: string | undefined): code is AuthApiErrorCode {
  return code === 'SESSION_IDLE_EXPIRED'
    || code === 'SESSION_ABSOLUTE_EXPIRED'
    || code === 'ACCOUNT_SUSPENDED'
}

export function toAuthApiError(error: unknown, fallbackMessage = 'Authentication request failed'): AuthApiError {
  const message = error instanceof Error ? error.message : fallbackMessage
  const authError = new AuthApiError(message)
  const code = (error as Error & { code?: string }).code
  if (isAuthApiErrorCode(code))
    authError.code = code
  return authError
}

import type { IUser } from '../types/auth.js'
import { ForbiddenError } from '../common/errors/app-error.js'

export const ACCOUNT_SUSPENDED_CODE = 'ACCOUNT_SUSPENDED'
export const ACCOUNT_SUSPENDED_MESSAGE = 'User suspended, please contact support'

export function assertUserNotSuspended(user: Pick<IUser, 'role'>): void {
  if (user.role === 'suspended')
    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE, ACCOUNT_SUSPENDED_CODE)
}

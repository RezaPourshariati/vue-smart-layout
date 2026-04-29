import type { ChildrenProps } from '@/types'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn, selectUser } from '@/redux/features/auth/authSlice.ts'

export function ShowOnLogin({ children }: ChildrenProps) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  if (isLoggedIn)
    return <>{children}</>
  return null
}

export function ShowOnLogout({ children }: ChildrenProps) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  if (!isLoggedIn)
    return <>{children}</>
  return null
}

export function AdminAuth({ children }: ChildrenProps) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  if (isLoggedIn && (user?.role === 'admin' || user?.role === 'author'))
    return <>{children}</>
  return null
}

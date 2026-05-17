export const AUTH_SKIP_REFRESH_RETRY_PATHS = new Set([
  '/login',
  '/register',
  '/refresh',
  '/sendLoginCode',
  '/loginWithCode',
  '/forgotPassword',
  '/resetPassword',
  '/google/callback',
])

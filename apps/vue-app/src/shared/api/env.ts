export function resolveApiRoot(): string {
  const explicit = import.meta.env.VITE_API_ROOT_URL?.replace(/\/$/, '')
  if (explicit)
    return explicit
  const legacyAuth = import.meta.env.VITE_API_BASE_URL
  if (legacyAuth)
    return legacyAuth.replace(/\/api\/auth\/?$/, '')
  return 'http://localhost:4000'
}

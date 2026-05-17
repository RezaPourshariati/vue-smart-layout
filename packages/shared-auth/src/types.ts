export interface CookieAccess {
  get: (name: string) => string | null
}

export interface RefreshSessionOptions {
  authApiBase: string
  getCookie: CookieAccess['get']
  /** Web Locks API name; serialized refresh across tabs when supported. */
  lockName?: string
}

export interface HttpClientOptions {
  baseUrl: string
  getCookie: CookieAccess['get']
  refreshSession: () => Promise<unknown>
  skipRefreshRetryPaths: Set<string>
}

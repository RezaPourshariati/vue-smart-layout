import mongoose from 'mongoose'
import app from './app.js'
import { verifyEmailTransport } from './common/utils/sendEmail.js'
import {
  getRefreshLifetimeMs,
  getSessionAbsoluteTimeoutMs,
  getSessionIdleTimeoutMs,
  getSessionLastUsedTouchIntervalMs,
} from './services/session-policy.service.js'
import 'dotenv/config'

const port = Number(process.env.PORT || 4000)

function readPositiveMs(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0)
    return fallback
  return parsed
}

function warnOnSessionPolicyMisconfiguration(): void {
  const refreshLifetimeMs = getRefreshLifetimeMs()
  const idleTimeoutMs = getSessionIdleTimeoutMs()
  const absoluteTimeoutMs = getSessionAbsoluteTimeoutMs()
  const touchIntervalMs = getSessionLastUsedTouchIntervalMs()

  if (touchIntervalMs > idleTimeoutMs) {
    console.warn(
      '[adaptive-auth] SESSION_LAST_USED_TOUCH_INTERVAL_MS is greater than SESSION_IDLE_TIMEOUT_MS. '
      + 'Touch interval will be clamped to idle timeout.',
    )
  }
  if (refreshLifetimeMs < idleTimeoutMs) {
    console.warn(
      '[adaptive-auth] REFRESH_TOKEN_LIFETIME_MS is shorter than SESSION_IDLE_TIMEOUT_MS. '
      + 'Active sessions may expire before idle policy allows.',
    )
  }
  if (absoluteTimeoutMs < idleTimeoutMs) {
    console.warn(
      '[adaptive-auth] SESSION_ABSOLUTE_TIMEOUT_MS is shorter than SESSION_IDLE_TIMEOUT_MS. '
      + 'Absolute timeout will dominate idle timeout.',
    )
  }
}

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI
    // console.log(mongoUri)
    if (!mongoUri)
      throw new Error('MONGO_URI is not defined')
    await mongoose.connect(mongoUri)
    console.log('Database Connected Successfully.')

    // Trigger env parsing early and log non-fatal policy sanity warnings.
    readPositiveMs(process.env.SESSION_IDLE_TIMEOUT_MS, 1000 * 60 * 30)
    readPositiveMs(process.env.SESSION_LAST_USED_TOUCH_INTERVAL_MS, 1000 * 30)
    warnOnSessionPolicyMisconfiguration()

    if (process.env.NODE_ENV === 'development') {
      verifyEmailTransport().then((result) => {
        if (result === 'ok')
          console.log('[adaptive-auth] SMTP verify: connection OK')
      }).catch((err: unknown) => {
        console.warn('[adaptive-auth] SMTP verify failed:', err instanceof Error ? err.message : err)
      })
    }

    app.listen(port, () => {
      console.log(`Auth server running on http://localhost:${port}`)
    })
  }
  catch (error) {
    console.error((error as Error).message)
  }
}

start().then(() => console.log('Done.'))

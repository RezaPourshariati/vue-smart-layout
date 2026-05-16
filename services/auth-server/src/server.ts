import mongoose from 'mongoose'
import app from './app.js'
import { verifyEmailTransport } from './common/utils/sendEmail.js'
import { assertConfigValid, config, warnIfRateLimitNotDistributed } from './config/env.js'
import {
  getRefreshLifetimeMs,
  getSessionAbsoluteTimeoutMs,
  getSessionIdleTimeoutMs,
  getSessionLastUsedTouchIntervalMs,
} from './services/session-policy.service.js'

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
    assertConfigValid()
    warnIfRateLimitNotDistributed()
    warnOnSessionPolicyMisconfiguration()

    if (!config.mongoUri)
      throw new Error('MONGO_URI is not defined')
    await mongoose.connect(config.mongoUri)
    console.log('Database Connected Successfully.')

    if (config.isDevelopment) {
      verifyEmailTransport().then((result) => {
        if (result === 'ok')
          console.log('[adaptive-auth] SMTP verify: connection OK')
      }).catch((err: unknown) => {
        console.warn('[adaptive-auth] SMTP verify failed:', err instanceof Error ? err.message : err)
      })
    }

    app.listen(config.port, () => {
      console.log(`Auth server running on http://localhost:${config.port}`)
    })
  }
  catch (error) {
    console.error((error as Error).message)
  }
}

start().then(() => console.log('Done.'))

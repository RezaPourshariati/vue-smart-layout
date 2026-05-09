import mongoose from 'mongoose'
import app from './app.js'
import { verifyEmailTransport } from './common/utils/sendEmail.js'
import 'dotenv/config'

const port = Number(process.env.PORT || 4000)

function readPositiveMs(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0)
    return fallback
  return parsed
}

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI
    // console.log(mongoUri)
    if (!mongoUri)
      throw new Error('MONGO_URI is not defined')
    await mongoose.connect(mongoUri)
    console.log('Database Connected Successfully.')

    const configuredIdleMs = readPositiveMs(process.env.SESSION_IDLE_TIMEOUT_MS, 1000 * 60 * 30) // 30m
    const configuredTouchMs = readPositiveMs(process.env.SESSION_LAST_USED_TOUCH_INTERVAL_MS, 1000 * 30) // 30s
    if (configuredTouchMs > configuredIdleMs) {
      console.warn(
        '[smart-layout] SESSION_LAST_USED_TOUCH_INTERVAL_MS is greater than SESSION_IDLE_TIMEOUT_MS. '
        + 'Touch interval will be clamped to idle timeout.',
      )
    }

    if (process.env.NODE_ENV === 'development') {
      verifyEmailTransport().then((result) => {
        if (result === 'ok')
          console.log('[smart-layout] SMTP verify: connection OK')
      }).catch((err: unknown) => {
        console.warn('[smart-layout] SMTP verify failed:', err instanceof Error ? err.message : err)
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

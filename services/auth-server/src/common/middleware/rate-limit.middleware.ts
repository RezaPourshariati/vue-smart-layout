import type { NextFunction, Request, Response } from 'express'
import type { RateLimiterAbstract } from 'rate-limiter-flexible'
import { Redis } from 'ioredis'
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import { config } from '../../config/env.js'

const LOGIN_LIMIT = { points: 10, duration: 60 }

let loginLimiter: RateLimiterAbstract | null = null
let loginLimiterInit: Promise<RateLimiterAbstract> | null = null

async function buildLoginLimiter(): Promise<RateLimiterAbstract> {
  if (config.redisUrl) {
    const client = new Redis(config.redisUrl)
    return new RateLimiterRedis({
      storeClient: client,
      points: LOGIN_LIMIT.points,
      duration: LOGIN_LIMIT.duration,
    })
  }
  return new RateLimiterMemory({
    points: LOGIN_LIMIT.points,
    duration: LOGIN_LIMIT.duration,
  })
}

async function getLoginLimiter(): Promise<RateLimiterAbstract> {
  if (loginLimiter)
    return loginLimiter
  if (!loginLimiterInit)
    loginLimiterInit = buildLoginLimiter()
  loginLimiter = await loginLimiterInit
  return loginLimiter
}

export function createRateLimiter(limiterPromise: () => Promise<RateLimiterAbstract>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`
    void limiterPromise()
      .then(limiter => limiter.consume(key))
      .then(() => next())
      .catch(() => {
        res.status(429).json({ message: 'Too many requests, please try again later.' })
      })
  }
}

export const loginRateLimiter = createRateLimiter(getLoginLimiter)

import type { NextFunction, Request, Response } from 'express'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const existing = buckets.get(key)

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (existing.count >= maxRequests) {
      res.status(429).json({ message: 'Too many requests, please try again later.' })
      return
    }

    existing.count += 1
    next()
  }
}

import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'

/** Propagate or mint `x-correlation-id` for log correlation across services. */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = typeof req.get('x-correlation-id') === 'string'
    ? req.get('x-correlation-id')!.trim()
    : ''
  const id = incoming || randomUUID()
  req.correlationId = id
  res.setHeader('x-correlation-id', id)
  next()
}

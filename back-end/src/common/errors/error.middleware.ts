import type { NextFunction, Request, Response } from 'express'
import { config } from '../../config/env.js'
import { AppError } from './app-error.js'

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode
    = err instanceof AppError
      ? err.statusCode
      : (res.statusCode !== 200 ? res.statusCode : 500)
  const code = err instanceof AppError ? err.code : undefined

  res.status(statusCode).json({
    ...(code ? { code } : {}),
    message: err.message,
    stack: config.isDevelopment ? err.stack : null,
  })
}

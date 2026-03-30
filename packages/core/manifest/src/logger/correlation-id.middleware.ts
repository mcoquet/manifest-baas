import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { correlationStorage } from './correlation-id.storage'

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const rawHeader = req.headers['x-correlation-id']
    const correlationId =
      (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader) || randomUUID()

    res.setHeader('X-Correlation-ID', correlationId)

    correlationStorage.run({ correlationId }, () => {
      next()
    })
  }
}

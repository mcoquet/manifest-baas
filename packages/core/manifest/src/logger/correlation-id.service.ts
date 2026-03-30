import { Injectable } from '@nestjs/common'
import { correlationStorage } from './correlation-id.storage'

@Injectable()
export class CorrelationIdService {
  getCorrelationId(): string | undefined {
    return correlationStorage.getStore()?.correlationId
  }
}

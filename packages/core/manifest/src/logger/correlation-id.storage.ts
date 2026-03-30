import { AsyncLocalStorage } from 'async_hooks'

export interface CorrelationStore {
  correlationId: string
}

export const correlationStorage = new AsyncLocalStorage<CorrelationStore>()

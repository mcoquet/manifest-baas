import { ConsoleLogger, LogLevel } from '@nestjs/common'
import { correlationStorage } from './correlation-id.storage'

/**
 * Custom application logger that extends NestJS ConsoleLogger.
 * - In production: outputs structured JSON logs with correlation IDs.
 * - In non-production: uses default NestJS human-readable format.
 */
export class AppLoggerService extends ConsoleLogger {
  private static readonly isProduction =
    process.env.NODE_ENV === 'production'

  private static readonly contextPattern = /\[(.+)\]/

  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string
  ): string {
    if (!AppLoggerService.isProduction) {
      return super.formatMessage(
        logLevel,
        message,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff
      )
    }

    const correlationId = correlationStorage.getStore()?.correlationId

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      message
    }

    const contextMatch = contextMessage?.match(AppLoggerService.contextPattern)
    if (contextMatch) {
      entry.context = contextMatch[1]
    }

    if (correlationId) {
      entry.correlationId = correlationId
    }

    return JSON.stringify(entry) + '\n'
  }
}

/**
 * Returns the appropriate log levels for the current environment.
 */
export function getLogLevels(): LogLevel[] {
  switch (process.env.NODE_ENV) {
    case 'production':
      return ['log', 'warn', 'error']
    case 'test':
      return ['error', 'warn']
    default:
      return ['verbose', 'debug', 'log', 'warn', 'error']
  }
}

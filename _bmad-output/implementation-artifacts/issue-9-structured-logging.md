# Story: Implement Structured Logging (Replace console.log with NestJS Logger)

Status: ready-for-dev

## Story

As a **deployer/operator** of Manifest BaaS,
I want all application logging to use NestJS Logger with structured output, environment-aware log levels, and request correlation IDs,
so that I can effectively monitor, debug, and trace issues in production using log aggregation tools.

## Acceptance Criteria

1. **AC1: No direct console.* calls in application code**
   - Given any `.ts` file in `packages/core/manifest/src/`
   - Then it uses NestJS `Logger` (from `@nestjs/common`) instead of `console.log`, `console.error`, or `console.warn`
   - Exception: The `LoggerService.initMessage()` method may retain `console.log` for formatted startup banner output (chalk-colored box drawing)

2. **AC2: Logger instances are class-scoped**
   - Each service/class creates its own Logger instance with the class name as context
   - Example: `private readonly logger = new Logger(SchemaService.name)`

3. **AC3: Environment-aware log levels**
   - Given `NODE_ENV=development` or unset: all log levels enabled (verbose, debug, log, warn, error)
   - Given `NODE_ENV=production`: only `log`, `warn`, `error` levels enabled
   - Given `NODE_ENV=test`: only `error`, `warn` levels enabled (current behavior preserved)

4. **AC4: Structured JSON logging in production**
   - Given `NODE_ENV=production`: logs output in JSON format with fields: `timestamp`, `level`, `context`, `message`, `correlationId` (if available)
   - Given non-production: logs use NestJS default human-readable format

5. **AC5: Request correlation IDs**
   - Every HTTP request gets a unique correlation ID (UUID v4)
   - If `X-Correlation-ID` header is present, use that value instead
   - The correlation ID is available to all services handling that request
   - The correlation ID appears in all log entries for that request

6. **AC6: Existing behavior preserved**
   - Seeder output (entity names, admin credentials) still displays to user
   - Schema validation errors still display formatted output
   - Startup banner still displays with colors in dev mode

## Tasks / Subtasks

- [ ] Task 1: Create custom NestJS LoggerService with JSON support (AC: 4)
  - [ ] Extend or replace existing `LoggerService` to implement `LoggerService` interface from `@nestjs/common`
  - [ ] Add JSON formatter for production (timestamp, level, context, message, correlationId)
  - [ ] Keep default NestJS text format for non-production

- [ ] Task 2: Add correlation ID middleware (AC: 5)
  - [ ] Create `CorrelationIdMiddleware` implementing `NestMiddleware`
  - [ ] Generate UUID v4 or extract from `X-Correlation-ID` header
  - [ ] Store correlation ID using `AsyncLocalStorage` (Node.js built-in) for request-scoped access
  - [ ] Create `CorrelationIdService` to expose the current correlation ID to any injectable service
  - [ ] Register middleware globally in `AppModule`

- [ ] Task 3: Configure environment-aware log levels in main.ts (AC: 3)
  - [ ] Replace hardcoded `logger: ['error', 'warn']` with environment-based configuration
  - [ ] Use custom LoggerService as app logger via `NestFactory.create(AppModule, { bufferLogs: true })` + `app.useLogger()`

- [ ] Task 4: Replace console.* in lock-file.service.ts (AC: 1, 2)
  - [ ] Add `private readonly logger = new Logger(LockFileService.name)`
  - [ ] Replace `console.error` → `this.logger.error()`
  - [ ] Replace `console.warn` → `this.logger.warn()`

- [ ] Task 5: Replace console.* in schema.service.ts (AC: 1, 2, 6)
  - [ ] Add `private readonly logger = new Logger(SchemaService.name)`
  - [ ] Replace `console.log` validation errors → `this.logger.warn()` or `this.logger.error()`
  - [ ] Preserve formatted output for dev mode (chalk formatting in non-production)

- [ ] Task 6: Replace console.* in seeder.service.ts (AC: 1, 2, 6)
  - [ ] Add `private readonly logger = new Logger(SeederService.name)`
  - [ ] Replace `console.log` → `this.logger.log()` for seed progress
  - [ ] Ensure admin credentials still display clearly

- [ ] Task 7: Replace console.* in main.ts (AC: 1, 2)
  - [ ] Use Logger instance for CORS configuration messages
  - [ ] Replace `console.warn` and `console.log` in `getCorsOptions()`

- [ ] Task 8: Replace console.* in remaining files (AC: 1, 2)
  - [ ] `config.ts`: Replace `console.warn` for token secret key warning
  - [ ] `yaml.service.ts`: Replace `console.warn` for env var interpolation
  - [ ] `hook.service.ts`: Replace `console.error` for webhook errors
  - [ ] `seed.ts` script: Replace `console.log`/`console.error`

- [ ] Task 9: Update LoggerService startup banner (AC: 6)
  - [ ] Keep `initMessage()` using `console.log` for chalk-formatted banner (this is intentional UX, not application logging)
  - [ ] OR convert to use NestJS Logger.log() if formatting can be preserved

## Dev Notes

### Key Files to Modify

| File | Change |
|------|--------|
| `packages/core/manifest/src/logger/logger.service.ts` | Replace with proper NestJS custom logger supporting JSON output |
| `packages/core/manifest/src/logger/logger.module.ts` | Export correlation ID service, register middleware |
| `packages/core/manifest/src/main.ts` | Environment-aware log levels, use custom logger |
| `packages/core/manifest/src/manifest/services/lock-file.service.ts` | Replace 5 console.error + 1 console.warn |
| `packages/core/manifest/src/manifest/services/schema.service.ts` | Replace 13 console.log calls |
| `packages/core/manifest/src/seed/services/seeder.service.ts` | Replace 4 console.log calls |
| `packages/core/manifest/src/config/config.ts` | Replace 1 console.warn |
| `packages/core/manifest/src/manifest/services/yaml.service.ts` | Replace 1 console.warn |
| `packages/core/manifest/src/middleware/services/hook.service.ts` | Replace 1 console.error |
| `packages/core/manifest/src/seed/seed.ts` | Replace 2 console.log + 1 console.error |

### New Files to Create

| File | Purpose |
|------|---------|
| `packages/core/manifest/src/logger/correlation-id.middleware.ts` | Middleware to set correlation ID per request |
| `packages/core/manifest/src/logger/correlation-id.service.ts` | Injectable service exposing current correlation ID |

### Architecture Compliance

- **NestJS Logger pattern**: Use `new Logger(ClassName.name)` — this is the standard NestJS pattern for class-scoped loggers. Do NOT inject Logger; create it as a class property.
- **Custom Logger**: Implement `LoggerService` interface from `@nestjs/common` for the custom JSON logger. Set via `app.useLogger()` in `main.ts`.
- **AsyncLocalStorage**: Use Node.js built-in `AsyncLocalStorage` for request-scoped correlation IDs. This avoids needing `@nestjs/core` REQUEST scope which has performance issues.
- **Middleware registration**: Apply `CorrelationIdMiddleware` for all routes in `AppModule.configure()`.
- **No new dependencies**: Use only NestJS built-in Logger and Node.js `crypto.randomUUID()` / `AsyncLocalStorage`. No need for winston, pino, or other logging libraries.

### Implementation Details

**Custom Logger Service (JSON mode):**
```typescript
import { LoggerService as NestLoggerService, LogLevel } from '@nestjs/common'

export class AppLoggerService implements NestLoggerService {
  log(message: any, context?: string) { this.printMessage('log', message, context) }
  error(message: any, trace?: string, context?: string) { ... }
  warn(message: any, context?: string) { ... }
  debug(message: any, context?: string) { ... }
  verbose(message: any, context?: string) { ... }

  private printMessage(level: string, message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, context, message, correlationId }))
    } else {
      // Delegate to default NestJS ConsoleLogger
    }
  }
}
```

**Correlation ID with AsyncLocalStorage:**
```typescript
import { AsyncLocalStorage } from 'async_hooks'

export const correlationStorage = new AsyncLocalStorage<{ correlationId: string }>()

// In middleware:
const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID()
correlationStorage.run({ correlationId }, () => next())

// In logger or any service:
const store = correlationStorage.getStore()
const correlationId = store?.correlationId
```

**Log level configuration:**
```typescript
function getLogLevels(): LogLevel[] {
  switch (process.env.NODE_ENV) {
    case 'production': return ['log', 'warn', 'error']
    case 'test': return ['error', 'warn']
    default: return ['verbose', 'debug', 'log', 'warn', 'error']
  }
}
```

### What NOT to Do

- Do NOT install winston, pino, bunyan, or any external logging library — NestJS built-in Logger is sufficient
- Do NOT use `@nestjs/core` REQUEST scope for correlation IDs — use AsyncLocalStorage instead (better performance)
- Do NOT remove the chalk-formatted startup banner — it's intentional UX
- Do NOT change log content/meaning — only change the transport mechanism
- Do NOT add logging to files that don't currently have any console.* calls
- Do NOT modify test files
- Do NOT use `Logger.overrideLogger()` — use `app.useLogger()` instead

### Previous Work Context

- Issue #3 (CORS whitelist) added `console.warn` and `console.log` in `main.ts` `getCorsOptions()` — these need to be converted too
- The existing `LoggerService` is a custom class that only handles the startup banner — it should be renamed or restructured to avoid confusion with NestJS's `LoggerService` interface
- Current `logger: ['error', 'warn']` in `main.ts:57` suppresses most NestJS framework logs — this was likely set to reduce noise but needs to be environment-aware

### Testing Approach

- Verify all console.* calls are replaced (grep for `console.log`, `console.error`, `console.warn` in src/)
- Verify log output format in production mode (JSON) vs dev mode (text)
- Verify correlation ID appears in request-scoped logs
- Verify correlation ID is passed through from `X-Correlation-ID` header
- Verify startup banner still displays correctly
- Verify schema validation errors still display readable output

### References

- [NestJS Logger Documentation](https://docs.nestjs.com/techniques/logger)
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- Issue #9: https://github.com/mcoquet/manifest-baas/issues/9

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

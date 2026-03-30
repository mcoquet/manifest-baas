# Story: Configure CORS with Origin Whitelist Instead of Wildcard

Status: ready-for-dev

## Story

As a **deployer/operator** of Manifest BaaS,
I want CORS to use an origin whitelist in production while remaining permissive in development/test,
so that my production API is protected from unauthorized cross-origin requests while keeping local development frictionless.

## Acceptance Criteria

1. **AC1: Production requires explicit whitelist**
   - Given `NODE_ENV=production` and `ALLOWED_ORIGINS` is NOT set
   - Then the server starts with CORS allowing NO external origins (only same-origin)

2. **AC2: Production uses ALLOWED_ORIGINS**
   - Given `NODE_ENV=production` and `ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com`
   - Then CORS allows only those two origins with credentials support

3. **AC3: Dev/test remains permissive**
   - Given `NODE_ENV` is `development`, `test`, `contribution`, or unset
   - Then CORS allows all origins (current behavior preserved)

4. **AC4: Credentials support**
   - When CORS whitelist is active, `credentials: true` is set so cookies/auth headers work cross-origin

5. **AC5: Startup feedback**
   - In production with no `ALLOWED_ORIGINS`, log a warning that CORS is restrictive
   - In production with `ALLOWED_ORIGINS`, log the configured origins at startup

## Tasks / Subtasks

- [ ] Task 1: Add CORS configuration to config.ts (AC: 1,2,3)
  - [ ] Add `allowedOrigins` field to config return type
  - [ ] Parse `ALLOWED_ORIGINS` env var (comma-separated)
  - [ ] Return `undefined` for dev/test (signals permissive mode)
- [ ] Task 2: Update main.ts to use CORS config (AC: 1,2,3,4)
  - [ ] Replace `cors: true` with a dynamic CORS options object
  - [ ] In production: use origin whitelist with `credentials: true`
  - [ ] In dev/test: keep `cors: true` (allow all)
- [ ] Task 3: Add startup logging for CORS mode (AC: 5)
  - [ ] Log configured CORS mode during bootstrap
- [ ] Task 4: Update .env.example with ALLOWED_ORIGINS documentation

## Dev Notes

### Key Files to Modify

| File | Change |
|------|--------|
| `packages/core/manifest/src/config/config.ts` | Add `allowedOrigins` to config, parse env var |
| `packages/core/manifest/src/main.ts` | Replace `cors: true` with dynamic CORS options |

### Architecture Compliance

- **Config pattern**: Follow existing pattern in `config.ts` — env var with fallback. The config already uses `process.env.*` directly with defaults.
- **Environment detection**: Use `configService.get('nodeEnv')` which is already available in `main.ts` (line 38-39 pattern: `configService.get('NODE_ENV') === 'production'`). Note: the config maps `NODE_ENV` to `nodeEnv` field.
- **NestJS CORS**: `NestFactory.create` accepts `cors: true | CorsOptions`. Use `CorsOptions` with `origin` callback for whitelist mode.
- **Logging**: Use `console.warn` for the CORS warning consistent with existing startup warnings (see `config.ts` line 17 for precedent). Issue #9 will standardize logging later.

### Implementation Details

**CORS options structure** (NestJS uses the `cors` npm package under the hood):
```typescript
// Production with whitelist:
cors: {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

// Dev/test (permissive):
cors: true
```

**Why `!origin` check**: Server-to-server requests and same-origin requests don't send an `Origin` header. These should always be allowed.

**Env var format**: `ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com` — comma-separated, trimmed, no trailing slashes.

### What NOT to Do

- Do NOT add CORS config to `manifest.yml` — this is infrastructure config, not app schema config
- Do NOT create a separate CORS module — this is a bootstrap-level concern handled in `main.ts`
- Do NOT modify any test files — the existing tests don't cover CORS and this is a config-level change
- Do NOT use `@nestjs/config` schema validation (that's issue #11)
- Do NOT touch the `app.module.ts` file

### Previous Work Context

- Recent commit `826c006` fixed hardcoded credentials and insecure defaults — same security hardening pattern
- The config already handles production vs dev branching (see `getSynchronize()`, `getDropSchema()`, `showOpenApiDocs`)

## Dev Agent Record

### Completion Notes List

### File List

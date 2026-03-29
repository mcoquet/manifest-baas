---
title: 'Configure CORS with origin whitelist for production'
type: 'feature'
created: '2026-03-29'
status: 'draft'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** CORS is set to `cors: true` (wildcard `*`) for all environments, allowing any website to make cross-origin requests to the API — including production deployments.

**Approach:** Make CORS environment-aware: permissive (allow all origins) in dev/test, whitelist-based in production via the `ALLOWED_ORIGINS` env var. When no origins are configured in production, restrict to same-origin only.

## Boundaries & Constraints

**Always:**
- Dev, test, and contribution environments must remain fully permissive (`cors: true`)
- Production whitelist must support `credentials: true` for auth headers/cookies
- Parse `ALLOWED_ORIGINS` as comma-separated, trimmed values
- Allow requests with no `Origin` header (server-to-server, same-origin)

**Ask First:**
- Changing the default production behavior (currently: no origins allowed if env var unset)

**Never:**
- Add CORS config to `manifest.yml` — this is infrastructure config, not app schema
- Create a separate CORS module or service
- Modify `app.module.ts`
- Add schema validation for env vars (that's issue #11)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dev default | `NODE_ENV` unset or `development` | `cors: true` — all origins allowed | N/A |
| Test env | `NODE_ENV=test` | `cors: true` — all origins allowed | N/A |
| Prod with whitelist | `NODE_ENV=production`, `ALLOWED_ORIGINS=https://a.com, https://b.com` | Only those 2 origins allowed, credentials enabled | Other origins get CORS rejection |
| Prod no env var | `NODE_ENV=production`, no `ALLOWED_ORIGINS` | Same-origin only (empty whitelist) | Log warning at startup |
| No Origin header | Any env, request has no `Origin` header | Request allowed (server-to-server) | N/A |
| Prod with spaces | `ALLOWED_ORIGINS= https://a.com , https://b.com ` | Trimmed — both origins work | N/A |

</frozen-after-approval>

## Code Map

- `packages/core/manifest/src/config/config.ts` -- App config factory; add `allowedOrigins` field
- `packages/core/manifest/src/main.ts` -- Bootstrap; replace `cors: true` with dynamic CORS options

## Tasks & Acceptance

**Execution:**
- [ ] `packages/core/manifest/src/config/config.ts` -- Add `allowedOrigins` field that parses `ALLOWED_ORIGINS` env var into `string[]` (comma-split, trimmed) or `undefined` if not set
- [ ] `packages/core/manifest/src/main.ts` -- Replace `cors: true` with conditional: if production and `allowedOrigins` is set, use `{ origin: callback, credentials: true }`; if production with no origins, use `{ origin: false, credentials: true }` and log warning; otherwise keep `cors: true`

**Acceptance Criteria:**
- Given `NODE_ENV=development`, when the server starts, then CORS allows all origins (same as current behavior)
- Given `NODE_ENV=production` and `ALLOWED_ORIGINS=https://app.com`, when a request arrives from `https://app.com`, then it gets CORS headers
- Given `NODE_ENV=production` and `ALLOWED_ORIGINS=https://app.com`, when a request arrives from `https://evil.com`, then it is rejected by CORS
- Given `NODE_ENV=production` and no `ALLOWED_ORIGINS`, when the server starts, then a warning is logged and only same-origin requests are allowed

## Design Notes

NestJS `cors` option accepts `true` or a `CorsOptions` object (from the `cors` npm package). The origin callback pattern:

```typescript
origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed by CORS'))
  }
}
```

`!origin` handles server-to-server and same-origin requests that omit the header.

## Verification

**Commands:**
- `cd packages/core/manifest && npx tsc --noEmit` -- expected: no type errors

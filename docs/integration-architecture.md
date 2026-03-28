# Integration Architecture

## Overview

Manifest is a monorepo where packages integrate through npm workspace imports, build-time bundling, and runtime HTTP APIs. There are no message queues, gRPC, or event buses between packages — integration is straightforward.

## Integration Map

```
┌─────────────────────────────────────────────────────────┐
│                    Build Time                            │
│                                                         │
│  json-schema ──generates──► types/ManifestSchema.ts     │
│                                                         │
│  admin ──ng build──► manifest/dist/admin/ (bundled)     │
│                                                         │
│  types ◄──imported by── common, js-sdk, manifest        │
│  common ◄──imported by── js-sdk                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Runtime                               │
│                                                         │
│  manifest (NestJS on :1111)                             │
│    ├── Serves admin panel as static files               │
│    ├── Serves /api/* REST endpoints                     │
│    └── Serves /storage/* uploaded files                 │
│                                                         │
│  admin (bundled SPA)                                    │
│    └── Calls /api/* via HTTP (same origin)              │
│                                                         │
│  js-sdk (client library)                                │
│    └── Calls /api/* via Fetch (configurable base URL)   │
│                                                         │
│  create-manifest (CLI)                                  │
│    ├── Fetches latest npm version from registry         │
│    ├── Polls /api/health during setup                   │
│    └── No runtime dependency on other packages          │
└─────────────────────────────────────────────────────────┘
```

## Package-to-Package Integration

### types → All Packages
- **Type:** TypeScript import (build-time)
- **Mechanism:** `@repo/types` workspace alias
- **What flows:** Interfaces (`BaseEntity`, `AppManifest`, `EntityManifest`, `PropType`, `Paginator`, etc.)

### json-schema → types
- **Type:** Code generation (build-time)
- **Mechanism:** `json-schema-to-typescript` script
- **What flows:** `ManifestSchema.ts` auto-generated from JSON Schema definitions
- **Trigger:** `@repo/json-schema#build` task

### common → js-sdk
- **Type:** TypeScript import (build-time)
- **Mechanism:** `@repo/common` workspace alias
- **What flows:** `BaseSDK` class (query building), string helper functions

### admin → manifest
- **Type:** Build artifact bundling
- **Mechanism:** `ng build` output copied to `manifest/dist/admin/`
- **Script:** `build-admin-in-bundle` in admin's package.json
- **Result:** Admin SPA served as static files by NestJS

### admin ↔ manifest (Runtime)
- **Type:** HTTP REST API
- **Protocol:** JSON over HTTP
- **Endpoints used:**
  - `GET /api/manifest` — Load entity definitions for dynamic UI
  - `GET /api/manifest/app-name` — Display app name
  - `POST /api/auth/admins/login` — Admin authentication
  - `GET /api/auth/admins/me` — Current user info
  - `GET /api/collections/:entity` — List entity records
  - `POST/PUT/PATCH/DELETE /api/collections/:entity/:id` — CRUD operations
  - `GET/PUT/PATCH /api/singles/:entity` — Singleton operations
  - `POST /api/upload/image`, `POST /api/upload/file` — File uploads
  - `GET /api/db/is-db-empty` — First-setup check
- **Auth:** JWT Bearer token via `@auth0/angular-jwt` auto-injection

### js-sdk ↔ manifest (Runtime)
- **Type:** HTTP REST API
- **Protocol:** JSON over Fetch API
- **Same endpoints** as admin, but for external consumers
- **Auth:** Bearer token managed by SDK's `login()`/`logout()` methods

### create-manifest → npm registry
- **Type:** HTTP API
- **Purpose:** Fetch latest `manifest` package version during scaffolding

### create-manifest → manifest (Setup only)
- **Type:** HTTP health check
- **Endpoint:** `GET /api/health`
- **Purpose:** Wait for server startup during project scaffolding

## Build Dependency Graph (Turborepo)

```
@repo/json-schema#build
    │
    ├──► manifest#build (depends on json-schema)
    │
    └──► @mnfst/sdk#build (depends on json-schema)
```

**Build command:** `turbo run build` resolves and executes in correct order.

## Shared Dependencies

| Dependency | Used By | Purpose |
|-----------|---------|---------|
| TypeScript | All packages | Language |
| Jest | manifest, js-sdk | Testing |
| RxJS | manifest (NestJS), admin (Angular) | Reactive patterns |

## Data Flow: Entity Lifecycle

```
manifest.yml (YAML file)
    │
    ▼ parsed by ManifestService
AppManifest (runtime object)
    │
    ├──► EntityLoaderService → TypeORM EntitySchema → Database tables
    │
    ├──► OpenApiService → Swagger spec (JSON)
    │
    ├──► Admin panel → Dynamic forms, lists, navigation
    │
    └──► JS SDK → Typed CRUD operations
```

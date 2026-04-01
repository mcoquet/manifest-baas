# Story: Code Cleanup - Misnamed File, Duplicate Mappings, Fragile CLI, Duplicate Interceptors

Status: ready-for-dev

## Story

As a **developer maintaining Manifest BaaS**,
I want **the codebase cleaned up to fix naming artifacts, reduce duplication, and replace fragile detection logic**,
so that **the code is more maintainable and less prone to subtle bugs**.

## Acceptance Criteria

1. The file `postgres-prop-type-column-types copy.ts` is renamed to `postgres-prop-type-column-types.ts` and all imports updated
2. The three database column type mapping files are unified into a single file with per-database overrides, reducing duplication
3. The fragile `process.argv[1].includes('seed')` CLI detection is replaced with an environment variable check
4. The duplicate event detection and entity loading logic in `HookInterceptor` and `MiddlewareInterceptor` is extracted into a shared base interceptor
5. All existing tests pass (`npm run test`)
6. No functional behavior changes - purely refactoring

## Tasks / Subtasks

- [ ] Task 1: Rename "copy" file and update imports (AC: #1)
  - [ ] Rename `postgres-prop-type-column-types copy.ts` to `postgres-prop-type-column-types.ts`
  - [ ] Update import in `column.service.ts` (line 5)
  - [ ] Update import in `entity-loader.service.ts` (line 20)

- [ ] Task 2: Unify column type mappings (AC: #2)
  - [ ] Create `prop-type-column-types.ts` with base mapping and per-DB overrides
  - [ ] Export `sqlitePropTypeColumnTypes`, `mysqlPropTypeColumnTypes`, `postgresPropTypeColumnTypes` from unified file
  - [ ] Update all imports to use new unified file
  - [ ] Remove old individual files (sqlite, mysql, postgres)

- [ ] Task 3: Fix fragile CLI detection (AC: #3)
  - [ ] In `app.module.ts`, replace `process.argv[1].includes('seed')` with `process.env.MANIFEST_SEED === 'true'` or similar
  - [ ] Update seed script/command to set the environment variable

- [ ] Task 4: Extract shared base interceptor (AC: #4)
  - [ ] Create `base-crud.interceptor.ts` with common event detection and entity loading logic
  - [ ] Refactor `HookInterceptor` to extend base interceptor
  - [ ] Refactor `MiddlewareInterceptor` to extend base interceptor

- [ ] Task 5: Verify all tests pass (AC: #5, #6)

## Dev Notes

### File Locations

- Column types dir: `packages/core/manifest/src/entity/columns/`
- App module: `packages/core/manifest/src/app.module.ts`
- Hook interceptor: `packages/core/manifest/src/hook/hook.interceptor.ts`
- Middleware interceptor: `packages/core/manifest/src/middleware/middleware.interceptor.ts`
- Column service: `packages/core/manifest/src/entity/services/column.service.ts`
- Entity loader service: `packages/core/manifest/src/entity/services/entity-loader.service.ts`

### Column Type Differences Across DBs

| PropType | Postgres | MySQL | SQLite |
|----------|----------|-------|--------|
| Number | numeric | decimal | decimal |
| Money | numeric | decimal | decimal |
| Timestamp | timestamp | datetime | datetime |
| Boolean | boolean | tinyint | boolean |
| Choice | text | varchar | simple-enum |
| Location | jsonb | json | json |
| Image | jsonb | json | json |

All other PropTypes map identically across databases.

### Interceptor Commonality

Lines 1-50 of both interceptors are ~95% identical:
- Same NestInterceptor implementation
- Same `getRelatedCrudEvent()` calls for before/after
- Same `getEntityManifest()` entity loading
- Differ only in execution strategy (parallel forkJoin vs sequential for...of) and payload handling

### Seed Detection

Current: `process.argv[1].includes('seed')` in `app.module.ts:131`
Used only to skip `loggerService.initMessage()` during seed/test.
Need to find where the seed command is invoked to add env var.

### References

- [Source: packages/core/manifest/src/app.module.ts#init]
- [Source: packages/core/manifest/src/entity/columns/]
- [Source: packages/core/manifest/src/hook/hook.interceptor.ts]
- [Source: packages/core/manifest/src/middleware/middleware.interceptor.ts]
- [Source: GitHub Issue #13]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

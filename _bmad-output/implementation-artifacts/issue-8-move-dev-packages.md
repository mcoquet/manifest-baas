# Story: Move Dev-Only Packages Out of Production Dependencies

Status: ready-for-dev

## Story

As a **user installing manifest**,
I want **only production-necessary packages in dependencies**,
so that **install size is reduced (~7MB+), attack surface is smaller, and the dependency tree is clean**.

## Acceptance Criteria

1. `@faker-js/faker` is moved from `dependencies` to `devDependencies` and loaded via dynamic `import()` in the seeder service so seeding still works at runtime
2. `mock-fs` is removed from `dependencies` (it is unused anywhere in the codebase)
3. `nodemon` is moved from `dependencies` to `devDependencies`
4. `livereload` is moved from `dependencies` to `devDependencies`
5. `connect-livereload` is moved from `dependencies` to `devDependencies`
6. `fs` npm package (v0.0.1-security) is removed from `devDependencies` entirely (Node built-in)
7. `path` npm package (v0.12.7) is removed from `devDependencies` entirely (Node built-in)
8. `npm run build` succeeds without errors
9. `npm run test` passes (unit + e2e where possible)
10. Dev scripts (`npm run dev`, `npm run start:dev`) still work with packages in devDependencies
11. Seeding (`npm run seed`) still works — faker loaded dynamically only when needed

## Tasks / Subtasks

- [ ] Task 1: Remove unused packages (AC: #2, #6, #7)
  - [ ] Remove `mock-fs` from `dependencies`
  - [ ] Remove `fs` from `devDependencies`
  - [ ] Remove `path` from `devDependencies`

- [ ] Task 2: Move dev-only CLI tools to devDependencies (AC: #3)
  - [ ] Move `nodemon` from `dependencies` to `devDependencies`

- [ ] Task 3: Move livereload packages to devDependencies (AC: #4, #5)
  - [ ] Move `livereload` from `dependencies` to `devDependencies`
  - [ ] Move `connect-livereload` from `dependencies` to `devDependencies`
  - [ ] Convert static imports in `main.ts` to dynamic `import()` behind the `!isProduction && !isTest` guard

- [ ] Task 4: Handle @faker-js/faker (AC: #1, #11)
  - [ ] Move `@faker-js/faker` from `dependencies` to `devDependencies`
  - [ ] Convert static import in `seed/services/seeder.service.ts` to dynamic `import()` so seeding works when faker is installed
  - [ ] Handle the case where faker is not installed (clear error message)

- [ ] Task 5: Validate (AC: #8, #9, #10)
  - [ ] Run `npm run build` and verify success
  - [ ] Run tests and verify pass
  - [ ] Verify dev scripts work

## Dev Notes

### Package Analysis

| Package | Current Location | Action | Reason |
|---------|-----------------|--------|--------|
| `@faker-js/faker` (~5MB) | dependencies | Move to devDeps + dynamic import | Only used by seeder service |
| `mock-fs` (~200KB) | dependencies | Remove entirely | Not imported anywhere in codebase |
| `nodemon` (~1MB) | dependencies | Move to devDeps | CLI dev tool, used in `start:dev`/`dev` scripts only |
| `livereload` (~500KB) | dependencies | Move to devDeps + dynamic import | Gated behind `!isProduction && !isTest` in main.ts |
| `connect-livereload` | dependencies | Move to devDeps + dynamic import | Same guard as livereload |
| `fs` (npm) | devDependencies | Remove | Node built-in, npm package is security placeholder |
| `path` (npm) | devDependencies | Remove | Node built-in, npm package unnecessary |

### Key Files to Modify

1. **`packages/core/manifest/package.json`** — Move/remove packages
2. **`packages/core/manifest/src/main.ts`** (lines ~79-97) — Dynamic import for livereload
3. **`packages/core/manifest/src/seed/services/seeder.service.ts`** — Dynamic import for faker

### Critical Implementation Details

**livereload in main.ts (lines 79-97):**
```typescript
// Current static imports at top:
import connectLiveReload from 'connect-livereload'
import * as livereload from 'livereload'

// Current conditional usage:
if (!isProduction && !isTest) {
  const liveReloadServer = livereload.createServer()
  // ...
  app.use(connectLiveReload())
}
```
Must convert to dynamic imports inside the if-block.

**faker in seeder.service.ts:**
```typescript
// Current static import:
import { faker } from '@faker-js/faker'
```
Used extensively throughout the file for generating seed data. Convert to dynamic import at the top of the seed method or constructor.

### Architecture Compliance

- NestJS project using TypeScript
- `tsconfig.json` has `"module": "commonjs"` — dynamic `import()` will return a Promise, must use `await`
- Seeder service methods that use faker will need to be async (or faker loaded once at service initialization)
- The livereload block in main.ts is already in an async bootstrap function, so `await import()` works naturally

### Testing Considerations

- Unit tests may import faker directly — those can keep static imports since tests run in dev context
- Verify `npm run seed` works with dynamic import
- Verify `npm run dev` works with livereload dynamic import
- Build should succeed since moved packages are not needed in production bundle

### References

- [Source: packages/core/manifest/package.json] — dependency listings
- [Source: packages/core/manifest/src/main.ts#L79-97] — livereload conditional usage
- [Source: packages/core/manifest/src/seed/services/seeder.service.ts] — faker usage
- [GitHub Issue #8](https://github.com/mcoquet/manifest-baas/issues/8) — original issue

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

Story created from GitHub Issue #8 analysis with full codebase investigation.
Ultimate context engine analysis completed — comprehensive developer guide created.

### File List

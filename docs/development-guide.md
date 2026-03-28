# Development Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** 10.7.0 (specified as packageManager)
- **Git**

For E2E testing with PostgreSQL/MySQL:
- **Docker** (Testcontainers used for database containers)

## Installation

```bash
# Clone the repository
git clone https://github.com/mnfst/manifest.git
cd manifest

# Install all dependencies (root + workspaces)
npm install
npm install --workspaces
```

## Development

```bash
# Start all packages in dev mode (Turborepo)
npm run dev

# Or start individual packages:
cd packages/core/manifest && npm run dev   # Backend on :1111 (with nodemon)
cd packages/core/admin && npm run start    # Admin panel on :4200
```

**Development URLs:**
- Backend API: http://localhost:1111/api (via manifest dev)
- Admin panel: http://localhost:4200 (via Angular CLI) or http://localhost:1111 (bundled)
- API docs: http://localhost:1111/api (when OPEN_API_DOCS=true)

**Default admin credentials:** admin@manifest.build / admin (after seeding)

## Build

```bash
# Build all packages (respects Turborepo dependency graph)
npm run build

# Build order (automatic via turbo.json):
# 1. @repo/json-schema (generates types)
# 2. manifest (NestJS + bundles admin panel)
# 3. @mnfst/sdk (JS SDK)
```

## Testing

```bash
# Run all tests
npm run test

# Run with CI mode (coverage reporting)
npm run test:ci

# Individual package tests:
cd packages/core/manifest
npm run test:unit              # Unit tests
npm run test:unit:ci           # Unit tests with coverage
npm run test:e2e               # E2E: SQLite + Postgres
npm run test:e2e:sqlite        # E2E: SQLite only
npm run test:e2e:postgres      # E2E: PostgreSQL (requires Docker)
npm run test:e2e:mysql         # E2E: MySQL (requires Docker)
npm run test:e2e:ci            # E2E: All 3 databases

cd packages/js-sdk
npm run test                   # Jest tests
```

**Test Framework:** Jest with ts-jest
**E2E:** Supertest + Testcontainers (PostgreSQL, MySQL containers)
**Coverage:** Output to `coverage/`, reported to Codecov

## Linting

```bash
# Lint all packages
npm run lint

# Pre-commit hook (Husky) runs lint automatically on staged files
```

**Configuration:** ESLint flat config (`eslint.config.mjs`)
- TypeScript-ESLint rules
- Unused vars disallowed (underscore prefix allowed)
- `any` type allowed in test files

## Seeding

```bash
# Seed the database with dummy data (Faker)
npm run seed
```

Seeds test entities with realistic data using @faker-js/faker.

## Environment Setup

The backend reads environment variables. For local development:

```bash
# packages/core/manifest/.env
NODE_ENV=development
PORT=1111
TOKEN_SECRET_KEY=any-dev-secret
DB_CONNECTION=sqlite
```

For contribution mode:
```bash
# Uses .env.contribution
NODE_ENV=contribution
```

See [Architecture — Manifest Backend](./architecture-manifest.md) for full environment variable reference.

## Monorepo Structure

**Turborepo** orchestrates builds with dependency awareness:

```
json-schema ──► types (auto-generated)
     │
     ▼
  manifest ──► builds admin into dist/admin/
     │
     ▼
   js-sdk
```

**npm workspaces** resolve `@repo/*` package imports across packages.

## Contribution Workflow

1. Create a GitHub issue describing the change
2. Create a branch from the issue
3. Make changes with tests
4. Run `npx changeset` to document the change
5. Open a PR to `master`
6. Await review — PRs require:
   - Clear description and correct labels
   - Changeset created
   - Self-review completed
   - Tests written
   - One feature per PR

**Commit Convention:** Conventional Commits
**Quality Tools:** CodeFactor, Codecov, ESLint, Prettier

## Publishing

Automated via GitHub Actions on push to `master`:

```bash
npm run publish-packages
# Equivalent to: turbo build lint test → changeset version → changeset publish
```

Uses `@changesets/cli` for semantic versioning and npm publishing.

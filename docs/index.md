# Project Documentation Index

## Project Overview

- **Type:** Monorepo with 7 packages
- **Primary Language:** TypeScript
- **Architecture:** YAML-driven BaaS (Backend-as-a-Service)
- **Runtime:** Node.js >= 18
- **Build System:** Turborepo + npm workspaces

## Quick Reference

### manifest (Core Backend)
- **Type:** Backend (NestJS)
- **Tech Stack:** NestJS 10, TypeORM, SQLite/Postgres/MySQL, JWT
- **Root:** `packages/core/manifest/`
- **Entry Point:** `src/main.ts`

### admin (Admin Panel)
- **Type:** Web App (Angular 17)
- **Tech Stack:** Angular 17, Bulma CSS, ngx-quill, RxJS
- **Root:** `packages/core/admin/`
- **Entry Point:** `src/main.ts`

### js-sdk (JavaScript SDK)
- **Type:** Library
- **Tech Stack:** TypeScript, Fetch API
- **Root:** `packages/js-sdk/`
- **Entry Point:** `src/index.ts`

### create-manifest (CLI)
- **Type:** CLI Tool
- **Tech Stack:** Oclif, Axios
- **Root:** `packages/create-manifest/`
- **Entry Point:** `bin/run.js`

### common, json-schema, types (Shared Libraries)
- **Type:** Library
- **Root:** `packages/core/common/`, `packages/core/json-schema/`, `packages/core/types/`

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)
- [Development Guide](./development-guide.md)

### Architecture (per part)
- [Architecture — Manifest Backend](./architecture-manifest.md)
- [Architecture — Admin Panel](./architecture-admin.md)
- [Architecture — JavaScript SDK](./architecture-js-sdk.md)
- [Architecture — Create Manifest CLI](./architecture-create-manifest.md)
- [Architecture — Shared Libraries](./architecture-libraries.md)

### API & Data
- [API Contracts — Manifest Backend](./api-contracts-manifest.md)
- [Data Models — Manifest Backend](./data-models-manifest.md)

### Component Inventory
- [Component Inventory — Admin Panel](./component-inventory-admin.md)

## Existing Documentation

- [README.md](../README.md) — Project overview and quick start
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contribution guidelines and workflow
- [security.md](../security.md) — Security documentation
- [packages/core/manifest/README.md](../packages/core/manifest/README.md) — Backend readme
- [packages/core/admin/README.md](../packages/core/admin/README.md) — Admin panel readme
- [packages/js-sdk/README.md](../packages/js-sdk/README.md) — JS SDK readme
- [packages/create-manifest/README.md](../packages/create-manifest/README.md) — CLI tool readme

## Getting Started

```bash
# For development on the monorepo:
npm install && npm install --workspaces
npm run dev

# For creating a new Manifest project:
npx create-manifest@latest my-backend
```

- Backend API: http://localhost:1111/api
- Admin panel: http://localhost:1111 (bundled) or http://localhost:4200 (Angular CLI)
- Default admin: admin@manifest.build / admin

# Project Overview

## Manifest — 1-File Backend to Ship Fast

**Manifest** is an open-source Backend-as-a-Service (BaaS) platform that generates a complete backend from a single YAML file. It provides REST APIs, authentication, file storage, an admin panel, and a JavaScript SDK — all configured declaratively.

**Status:** Beta — suitable for prototypes, MVPs, and small projects.

**Homepage:** https://manifest.build
**License:** MIT
**Maintainer:** Manifest team (funded by INRIA)

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | NestJS 10 | Core API server |
| **ORM** | TypeORM 0.3 | Database abstraction |
| **Databases** | SQLite, PostgreSQL, MySQL | Multi-DB support |
| **Admin Panel** | Angular 17 + Bulma CSS | Auto-generated admin UI |
| **JavaScript SDK** | TypeScript (ESM) | Client library for API consumption |
| **CLI** | Oclif | Project scaffolding (`create-manifest`) |
| **Build System** | Turborepo + npm workspaces | Monorepo orchestration |
| **Testing** | Jest + Supertest + Testcontainers | Unit, E2E (3 DB engines) |
| **CI/CD** | GitHub Actions | Build, test, publish to npm |
| **Versioning** | Changesets | Semantic versioning & changelogs |
| **Auth** | JWT + bcrypt | Token-based authentication |
| **Storage** | Local filesystem + AWS S3 | File & image uploads with resizing |
| **API Docs** | Swagger/OpenAPI | Auto-generated from manifest |

## Architecture Classification

- **Repository Type:** Monorepo
- **Architecture Pattern:** YAML-driven dynamic backend with auto-generated CRUD APIs
- **Primary Language:** TypeScript
- **Runtime:** Node.js (>=18)

## Repository Structure

| Package | Type | Description |
|---------|------|-------------|
| `packages/core/manifest` | Backend | NestJS core — reads YAML, generates entities, serves API |
| `packages/core/admin` | Web App | Angular admin panel — bundled into backend dist |
| `packages/js-sdk` | Library | JavaScript SDK for consuming Manifest APIs |
| `packages/create-manifest` | CLI | Project scaffolding tool (`npx create-manifest`) |
| `packages/core/common` | Library | Shared utilities: BaseSDK, string helpers |
| `packages/core/json-schema` | Library | JSON Schema definitions for manifest YAML validation |
| `packages/core/types` | Library | TypeScript type definitions shared across all packages |

## How It Works

1. Developer writes a `manifest.yml` defining entities, properties, relationships, and access policies
2. `manifest` backend reads the YAML and dynamically creates TypeORM entity schemas
3. REST API endpoints are auto-generated for all entities (CRUD + auth + file upload)
4. Admin panel UI renders forms and lists based on manifest metadata
5. JS SDK provides typed client methods for frontend/external consumption
6. OpenAPI spec is auto-generated for API documentation

## Key Features

- **Dynamic CRUD APIs** — No controller code needed; entities defined in YAML
- **Multi-database** — SQLite (dev default), PostgreSQL, MySQL
- **Authentication** — JWT-based with configurable policies per entity
- **Access Control** — Public, admin-only, restricted (owner), or forbidden per CRUD operation
- **File/Image Upload** — Local or S3 storage with automatic image resizing
- **Custom Endpoints** — Define custom API routes with handler functions
- **Lifecycle Hooks** — Before/after webhooks on CRUD operations
- **Custom Middleware** — Request/response interceptors
- **Admin Panel** — Auto-generated Angular UI with 16 input types
- **Data Seeding** — Faker-based dummy data generation
- **OpenAPI Docs** — Auto-generated Swagger spec
- **Rate Limiting** — Configurable throttling per manifest settings

## Quick Start

```bash
npx create-manifest@latest my-backend
cd my-backend
npm run start
```

- Admin panel: http://localhost:1111
- API: http://localhost:1111/api
- Default admin: admin@manifest.build / admin

# Source Tree Analysis

## Repository Structure

**Type:** Monorepo (Turborepo + npm workspaces)
**Package Manager:** npm 10.7.0

```
manifest-baas/
├── .github/                    # GitHub configuration
│   ├── workflows/
│   │   ├── ci-cd.yml           # CI/CD pipeline (test, build, coverage)
│   │   ├── publish.yml         # npm package publishing via Changesets
│   │   └── stale.yml           # Auto-close inactive issues
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   ├── DISCUSSION_TEMPLATE/    # Discussion templates
│   ├── pull_request_template.md
│   └── FUNDING.yml             # Open Collective + GitHub Sponsors
│
├── packages/
│   ├── core/
│   │   ├── manifest/           # [BACKEND] NestJS core backend (main product)
│   │   │   ├── src/
│   │   │   │   ├── main.ts                 # Entry: Bootstrap NestJS app on port 1111
│   │   │   │   ├── app.module.ts           # Root module: DB, throttling, all features
│   │   │   │   ├── manifest/               # YAML manifest parsing & schema generation
│   │   │   │   │   ├── manifest.module.ts
│   │   │   │   │   ├── manifest.service.ts # Loads & validates manifest.yml
│   │   │   │   │   ├── yaml.service.ts     # YAML file reading
│   │   │   │   │   ├── entity-manifest.service.ts
│   │   │   │   │   ├── property-manifest.service.ts
│   │   │   │   │   └── relationship-manifest.service.ts
│   │   │   │   ├── entity/                 # Dynamic entity/TypeORM schema creation
│   │   │   │   │   ├── entity.module.ts
│   │   │   │   │   ├── entity-loader.service.ts  # Manifest → TypeORM EntitySchema
│   │   │   │   │   ├── entity.service.ts
│   │   │   │   │   └── relationship.service.ts
│   │   │   │   ├── auth/                   # JWT authentication & authorization
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.service.ts     # JWT creation, password hashing
│   │   │   │   │   ├── auth.controller.ts  # Login, signup, me endpoints
│   │   │   │   │   ├── is-admin.guard.ts
│   │   │   │   │   └── is-db-empty.guard.ts
│   │   │   │   ├── crud/                   # Auto-generated CRUD operations
│   │   │   │   │   ├── crud.module.ts
│   │   │   │   │   ├── crud.service.ts     # Repository operations
│   │   │   │   │   ├── collection.controller.ts  # List, get, create, update, delete
│   │   │   │   │   ├── single.controller.ts      # Singleton entity CRUD
│   │   │   │   │   ├── pagination.service.ts
│   │   │   │   │   └── database.controller.ts
│   │   │   │   ├── policy/                 # Access control (public/admin/restricted)
│   │   │   │   │   ├── policy.module.ts
│   │   │   │   │   ├── policy.guard.ts     # Main authorization guard
│   │   │   │   │   └── policy.service.ts
│   │   │   │   ├── upload/                 # File & image upload handling
│   │   │   │   │   ├── upload.module.ts
│   │   │   │   │   ├── upload.service.ts
│   │   │   │   │   └── upload.controller.ts
│   │   │   │   ├── storage/                # S3 + local file storage
│   │   │   │   ├── endpoint/               # Custom user-defined API endpoints
│   │   │   │   ├── handler/                # Custom handler execution (BackendSDK)
│   │   │   │   ├── hook/                   # Before/after lifecycle hooks
│   │   │   │   ├── middleware/             # Custom middleware execution
│   │   │   │   ├── event/                  # Event bus
│   │   │   │   ├── seed/                   # Faker-based test data seeding
│   │   │   │   ├── open-api/               # OpenAPI/Swagger spec generation
│   │   │   │   ├── validation/             # DTO validation
│   │   │   │   ├── health/                 # Health check endpoint
│   │   │   │   ├── logger/                 # Global logger
│   │   │   │   └── config/                 # Environment-based configuration
│   │   │   ├── e2e/                        # End-to-end tests
│   │   │   │   ├── manifest/mock-manifest.yml  # Test manifest with 20+ entities
│   │   │   │   ├── tests/                  # Test specs (auth, CRUD, upload, etc.)
│   │   │   │   └── jest-e2e.*.json         # DB-specific test configs
│   │   │   ├── scripts/watch/              # Dev watch configurations
│   │   │   └── package.json
│   │   │
│   │   ├── admin/              # [WEB] Angular 17 admin panel
│   │   │   ├── src/
│   │   │   │   ├── main.ts                 # Entry: Angular bootstrap
│   │   │   │   ├── app/
│   │   │   │   │   ├── app.module.ts       # Root module with JWT, routing
│   │   │   │   │   ├── app-routing.module.ts  # Route definitions
│   │   │   │   │   ├── app.component.ts    # Root component, version check
│   │   │   │   │   └── modules/
│   │   │   │   │       ├── auth/           # Login, signup, guards
│   │   │   │   │       ├── crud/           # List, detail, create/edit views
│   │   │   │   │       ├── shared/         # Services, pipes, inputs, yields
│   │   │   │   │       │   ├── services/   # ManifestService, CrudService, etc.
│   │   │   │   │       │   ├── inputs/     # 16 input components (text, image, etc.)
│   │   │   │   │       │   └── yields/     # 15 display components
│   │   │   │   │       └── layout/         # Sidebar, flash messages, footer
│   │   │   │   └── styles.scss             # Bulma CSS + custom styles
│   │   │   ├── angular.json
│   │   │   └── package.json
│   │   │
│   │   ├── common/             # [LIBRARY] Shared utilities & BaseSDK
│   │   │   └── src/
│   │   │       ├── helpers/    # String transforms (camelize, kebabize, etc.)
│   │   │       └── BaseSDK.ts  # Query building base class
│   │   │
│   │   ├── json-schema/        # [LIBRARY] YAML validation schemas
│   │   │   ├── src/schema/     # JSON Schema definitions (23 schemas)
│   │   │   └── scripts/        # generate-types.ts → produces TypeScript types
│   │   │
│   │   └── types/              # [LIBRARY] TypeScript type definitions
│   │       └── src/
│   │           ├── crud/       # BaseEntity, PropType, Paginator, AccessPolicy
│   │           ├── manifests/  # AppManifest, EntityManifest, PropertyManifest
│   │           ├── queries/    # WhereOperator, query building types
│   │           ├── hooks/      # HookManifest, WebhookPayload
│   │           ├── endpoints/  # EndpointManifest
│   │           ├── middlewares/ # MiddlewareManifest
│   │           └── common/     # AppEnvironment, HttpMethod
│   │
│   ├── create-manifest/        # [CLI] Project scaffolding tool
│   │   ├── bin/run.js          # Entry: CLI binary
│   │   ├── src/commands/       # Oclif command definitions
│   │   ├── assets/
│   │   │   ├── standalone/     # Template: manifest.yml, package.json, README
│   │   │   └── monorepo/       # Template: multi-package setup (hidden)
│   │   └── package.json
│   │
│   └── js-sdk/                 # [LIBRARY] JavaScript SDK for Manifest API
│       ├── src/
│       │   ├── index.ts        # Entry: exports Manifest class
│       │   └── Manifest.ts     # SDK class extending BaseSDK
│       ├── tests/              # Jest test specs
│       ├── sandbox/            # Local dev testing sandbox
│       └── package.json
│
├── examples/
│   └── main-demo/              # Example project (Pokemon/Trainer entities)
│       ├── manifest.yml        # Demo manifest definition
│       └── .env                # Demo environment config
│
├── scripts/
│   └── update-example-package.js  # Post-publish: updates example deps
│
├── turbo.json                  # Turborepo task configuration
├── package.json                # Root workspace config
├── eslint.config.mjs           # ESLint flat config
├── codecov.yml                 # Coverage thresholds
├── publiccode.yml              # Public code metadata (INRIA)
├── tsconfig.json               # Root TypeScript path mappings
├── CONTRIBUTING.md             # Contribution guidelines
├── CODE_OF_CONDUCT.md
├── LICENSE                     # MIT
├── security.md
└── README.md                   # Project overview & quick start
```

## Critical Folders by Part

### manifest (Backend)
| Directory | Purpose |
|-----------|---------|
| `src/manifest/` | YAML manifest loading, parsing, and entity schema generation |
| `src/entity/` | Dynamic TypeORM entity creation from manifest definitions |
| `src/auth/` | JWT authentication, signup, guards |
| `src/crud/` | Auto-generated CRUD controllers and services |
| `src/policy/` | Access control enforcement (public/admin/restricted/forbidden) |
| `src/endpoint/` | Custom user-defined API endpoint routing |
| `src/handler/` | Custom business logic handler execution |
| `src/hook/` | Lifecycle hooks (before/after CRUD operations) |
| `src/open-api/` | Dynamic OpenAPI/Swagger spec generation |

### admin (Web)
| Directory | Purpose |
|-----------|---------|
| `src/app/modules/auth/` | Login, signup, authentication guards |
| `src/app/modules/crud/` | Dynamic CRUD views (list, detail, create/edit) |
| `src/app/modules/shared/inputs/` | 16 specialized input components per property type |
| `src/app/modules/shared/yields/` | 15 read-only display components |
| `src/app/modules/shared/services/` | ManifestService, CrudService, FlashMessageService |
| `src/app/modules/layout/` | Navigation sidebar, flash messages, footer |

### js-sdk
| Directory | Purpose |
|-----------|---------|
| `src/` | Manifest SDK class with CRUD, auth, and file upload methods |

### create-manifest (CLI)
| Directory | Purpose |
|-----------|---------|
| `src/commands/` | CLI command definitions (single create command) |
| `assets/standalone/` | Project template files (manifest.yml, package.json) |
| `assets/monorepo/` | Multi-package template (hidden feature) |

## Integration Points

```
create-manifest CLI
    │ scaffolds new projects using →
    ▼
manifest (Backend)  ◄── reads manifest.yml
    │                    generates TypeORM entities
    │ serves API on :1111
    │ bundles admin panel
    ▼
admin (Angular)     ◄── built into manifest/dist/admin/
    │ calls /api/* endpoints
    │ renders UI from manifest metadata
    │
js-sdk              ◄── client library for external consumers
    │ extends BaseSDK from common
    │ calls /api/* endpoints
    │
common              ◄── shared by js-sdk, potentially other SDKs
    │ provides BaseSDK, string helpers
    │
json-schema         ── generates → types (ManifestSchema.ts)
    │ validates manifest.yml in IDEs
    │
types               ◄── consumed by all packages via @repo/types
```

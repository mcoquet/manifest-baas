# Architecture — Manifest Core Backend

## Executive Summary

The Manifest backend is a NestJS application that dynamically generates a complete REST API from a single YAML configuration file. Instead of writing controllers, models, and routes manually, developers declare entities in `manifest.yml` and the framework generates TypeORM schemas, CRUD endpoints, authentication, access control, and OpenAPI documentation at runtime.

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | NestJS | 10.4.8 | Core backend framework |
| ORM | TypeORM | 0.3.20 | Database abstraction, dynamic schema creation |
| Database | sqlite3 | 5.1.7 | Default development database |
| Database | pg | 8.13.3 | PostgreSQL driver |
| Database | mysql2 | 3.12.0 | MySQL driver |
| Auth | jsonwebtoken | 9.0.2 | JWT token creation/validation |
| Auth | bcryptjs | 3.0.2 | Password hashing (10 rounds) |
| Validation | class-validator | 0.14.1 | DTO validation decorators |
| File Processing | sharp | 0.33.5 | Image resizing |
| Cloud Storage | @aws-sdk/client-s3 | 3.744.0 | S3 file storage |
| API Docs | @nestjs/swagger | 7.3.1 | OpenAPI/Swagger generation |
| Rate Limiting | @nestjs/throttler | 6.4.0 | Request throttling |
| YAML | js-yaml | 4.1.0 | Manifest file parsing |
| Seeding | @faker-js/faker | 8.4.1 | Test data generation |
| Testing | Jest + Supertest | 29.7.0 | Unit & E2E testing |

## Architecture Pattern

**Pattern:** Modular NestJS with dynamic schema generation
**Style:** YAML-driven declarative backend — no static entity files

### Module Hierarchy

```
AppModule (Root)
├── ConfigModule (global)          — Environment-based configuration
├── TypeOrmModule (async factory)  — Dynamic DB connection from manifest
├── ThrottlerModule (global)       — Rate limiting from manifest settings
│
├── ManifestModule                 — YAML loading & entity schema generation
│   ├── ManifestService            — Loads, validates, transforms manifest.yml
│   ├── YamlService                — YAML file I/O
│   ├── EntityManifestService      — Entity definition processing
│   ├── PropertyManifestService    — Property type mapping
│   └── RelationshipManifestService — Relationship resolution
│
├── EntityModule                   — TypeORM integration
│   ├── EntityLoaderService        — Converts manifest → TypeORM EntitySchema
│   ├── EntityService              — Repository access layer
│   └── RelationshipService        — Relationship column generation
│
├── AuthModule                     — Authentication
│   ├── AuthService                — JWT creation, password hashing, user lookup
│   ├── AuthController             — /auth/:entity/login, signup, me
│   ├── IsAdminGuard               — Admin-only route protection
│   └── IsDbEmptyGuard             — First-admin-signup gate
│
├── CrudModule                     — Auto-generated CRUD
│   ├── CrudService                — Generic repository operations
│   ├── CollectionController       — GET/POST/PUT/PATCH/DELETE collections
│   ├── SingleController           — GET/PUT/PATCH singletons
│   ├── PaginationService          — Offset/limit pagination
│   └── IsCollectionGuard / IsSingleGuard
│
├── PolicyModule                   — Access control
│   ├── PolicyGuard                — Evaluates manifest policies per route
│   └── PolicyService              — Policy resolution logic
│
├── EndpointModule                 — Custom API endpoints
│   ├── EndpointService            — Dynamic route matching
│   ├── EndpointController         — Catches /endpoints/* routes
│   └── MatchEndpointMiddleware    — URL pattern matching
│
├── HandlerModule                  — Custom business logic
│   ├── HandlerService             — Loads & executes handler JS files
│   └── BackendSDK                 — Helper for handler code
│
├── HookModule                     — Lifecycle hooks (webhooks)
│   ├── HookService                — Before/after CRUD event dispatch
│   └── HookInterceptor            — Intercepts controller responses
│
├── MiddlewareModule               — Custom middleware execution
├── UploadModule                   — File & image upload
├── StorageModule                  — S3 + local filesystem
├── ValidationModule               — DTO validation
├── SeedModule                     — Faker data seeding
├── OpenApiModule                  — Swagger spec generation
├── HealthModule                   — /health endpoint
├── EventModule                    — Internal event bus
├── LoggerModule (global)          — Logging
└── SdkModule                      — BackendSDK for handlers
```

### Key Design Patterns

- **Async Factory:** TypeORM and Throttler use `forRootAsync()` with injected services
- **Guard Composition:** Multiple guards per route (PolicyGuard + type guards)
- **Interceptor Stacking:** HookInterceptor + MiddlewareInterceptor on controllers
- **Forward References:** `forwardRef()` to resolve circular module dependencies
- **Dynamic Routing:** Custom endpoints matched via middleware, not static decorators

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/:entity/login` | Login with email/password, returns JWT |
| POST | `/api/auth/admins/signup` | Initial admin signup (only if DB empty) |
| POST | `/api/auth/:entity/signup` | Public signup for authenticable entities |
| GET | `/api/auth/:entity/me` | Get current authenticated user |
| GET | `/api/auth/admins/default-exists` | Check if default admin exists |

### Collections (CRUD)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/collections/:entity` | List with pagination & filtering |
| GET | `/api/collections/:entity/select-options` | Dropdown options (admin) |
| GET | `/api/collections/:entity/:id` | Get by UUID |
| POST | `/api/collections/:entity` | Create |
| PUT | `/api/collections/:entity/:id` | Full update |
| PATCH | `/api/collections/:entity/:id` | Partial update |
| DELETE | `/api/collections/:entity/:id` | Delete |

### Singles (Singletons)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/singles/:entity` | Get singleton (auto-creates if missing) |
| PUT | `/api/singles/:entity` | Full update |
| PATCH | `/api/singles/:entity` | Partial update |

### File Upload
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload/file` | Upload file |
| POST | `/api/upload/image` | Upload image (multi-size generation) |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/manifest` | Get full manifest (admin only) |
| GET | `/api/manifest/app-name` | Get app name (public) |
| GET | `/api/manifest/entities/:slug` | Get entity schema (admin only) |
| GET | `/api/db/is-db-empty` | Check if DB is empty |
| GET | `/api/health` | Health check |
| * | `/api/endpoints/*` | Custom user-defined endpoints |

## Data Architecture

### Base Entity Schema
All entities extend a base with:
- `id` — UUID primary key
- `createdAt` — Auto-generated timestamp
- `updatedAt` — Auto-generated timestamp

Authenticable entities add:
- `email` — Unique string
- `password` — bcrypt hashed

### Supported Property Types
String, Text, RichText, Number, Money, Date, Timestamp, Email, Password, Boolean, Link, Choice, Location, File, Image, Group (nested)

### Relationship Types
- **belongsTo** (many-to-one) — Parent reference column
- **belongsToMany** (many-to-many) — Junction table
- **hasMany** (one-to-many) — Inverse side
- Optional `eager: true` for automatic loading

### Dynamic Schema Generation
Entities are NOT defined as TypeScript classes. Instead:
1. `ManifestService` reads `manifest.yml`
2. `EntityLoaderService` converts manifest entities to TypeORM `EntitySchema` objects
3. TypeORM creates tables and relationships at startup
4. All CRUD operations use dynamic repositories

## Authentication & Authorization

### Authentication Flow
1. Client sends `POST /api/auth/:entity/login` with email + password
2. `AuthService` validates credentials against hashed password
3. JWT token returned with entity slug and user ID
4. Client includes `Authorization: Bearer <token>` on subsequent requests
5. `AuthService.getUserFromRequest()` decodes and validates token

### Access Control (PolicyGuard)
Policies are defined per-entity per-operation in `manifest.yml`:

| Access Level | Description |
|-------------|-------------|
| `public` | Anyone can access |
| `admin` | Only admin users |
| `restricted` | Specific entity users, optional `condition: "self"` for owner-only |
| `forbidden` | Access denied |

### Security Features
- CORS enabled globally
- X-Powered-By header removed
- Global ValidationPipe (DTO validation)
- 50MB payload limit
- Rate limiting (manifest-configurable)
- Production requires custom TOKEN_SECRET_KEY

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 1111 | Server port |
| `TOKEN_SECRET_KEY` | (required in prod) | JWT signing secret |
| `DB_CONNECTION` | sqlite | Database engine: sqlite, postgres, mysql |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | auto | Database port |
| `DB_USERNAME` | — | Database user |
| `DB_PASSWORD` | — | Database password |
| `DB_DATABASE` | manifest | Database name |
| `DB_PATH` | ./.manifest/db.sqlite | SQLite file path |
| `DB_SSL` | false | Enable SSL |
| `MANIFEST_FILE_PATH` | ./manifest.yml | Path to manifest file |
| `S3_BUCKET` | — | S3 bucket name |
| `S3_ENDPOINT` | — | S3 endpoint URL |
| `S3_REGION` | — | S3 region |
| `OPEN_API_DOCS` | false | Generate OpenAPI spec |

## Bootstrap Flow

1. `NestFactory.create(AppModule)` with CORS
2. Disable X-Powered-By header
3. Set global API prefix `/api`
4. Register global ValidationPipe
5. Validate TOKEN_SECRET_KEY in production
6. Enable livereload in development
7. Serve admin panel static files
8. Serve `/storage` path for uploaded files
9. SPA fallback: redirect non-API routes to admin index.html
10. Generate TypeScript interfaces from entities
11. Generate OpenAPI spec if enabled
12. Start server on configured PORT

## Testing Strategy

### Unit Tests
- Jest with ts-jest transform
- Pattern: `**/*.spec.ts` in `src/`
- Coverage output: `coverage/`

### E2E Tests
- Supertest for HTTP assertions
- Three database configurations: SQLite, PostgreSQL, MySQL
- Testcontainers for Postgres and MySQL in CI
- Mock manifest with 20+ entities for comprehensive testing
- Faker-based data seeding

### E2E Test Coverage
- Authentication (login, signup, JWT)
- Authorization (all policy types)
- Relationships (all types)
- Nested entities (groups)
- Validation rules
- File/image upload
- Custom endpoints
- Health check
- OpenAPI generation

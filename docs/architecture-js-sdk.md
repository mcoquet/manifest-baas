# Architecture — JavaScript SDK

## Executive Summary

The Manifest JS SDK (`@mnfst/sdk`) is a lightweight TypeScript client library that provides typed methods for consuming Manifest backend APIs. It extends `BaseSDK` from the common package and supports CRUD operations, authentication, file uploads, and chainable query building.

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Language | TypeScript | — | Type safety |
| Module System | ESM | — | Modern module format |
| HTTP Client | Fetch API | native | HTTP requests |
| Base Class | BaseSDK | @repo/common | Query building foundation |

## Public API

### Manifest Class (Main Export)

```typescript
const manifest = new Manifest('http://localhost:1111/api')
```

### Collection Operations (via `.from(slug)`)

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| `find<T>(params?)` | GET | `/collections/{slug}` | List with pagination |
| `findOneById<T>(id)` | GET | `/collections/{slug}/{id}` | Get by ID |
| `create<T>(data)` | POST | `/collections/{slug}` | Create record |
| `update<T>(id, data)` | PUT | `/collections/{slug}/{id}` | Full replace |
| `patch<T>(id, data)` | PATCH | `/collections/{slug}/{id}` | Partial update |
| `delete<T>(id)` | DELETE | `/collections/{slug}/{id}` | Delete record |

### Single Entity Operations (via `.single(slug)`)

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| `get<T>()` | GET | `/singles/{slug}` | Get singleton |
| `update<T>(data)` | PUT | `/singles/{slug}` | Full replace |
| `patch<T>(data)` | PATCH | `/singles/{slug}` | Partial update |

### Authentication

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| `login(entity, email, pw)` | POST | `/auth/{entity}/login` | Returns & stores token |
| `signup(entity, email, pw)` | POST | `/auth/{entity}/signup` | Create account + auto-login |
| `logout()` | — | — | Removes Authorization header |
| `me()` | GET | `/auth/{entity}/me` | Get current user |

### File Operations

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| `upload(prop, file)` | POST | `/upload/file` | Upload generic file |
| `uploadImage(prop, img)` | POST | `/upload/image` | Upload with multi-size generation |
| `imageUrl(image, size)` | — | — | Helper for absolute image URLs |

### Query Building (Chainable)

```typescript
manifest.from('cats')
  .where('age > 3')
  .andWhere('name like Whiskers')
  .orderBy('name', 'ASC')
  .with('owner,tags')
  .find()
```

**Operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, `like`, `in`

## Dependency Graph

```
@mnfst/sdk
├── @repo/common (BaseSDK class, helpers)
├── @repo/types (Paginator<T>, etc.)
└── Fetch API (native — no external HTTP lib)
```

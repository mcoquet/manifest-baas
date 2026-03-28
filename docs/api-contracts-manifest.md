# API Contracts — Manifest Backend

## Base URL
`http://localhost:1111/api`

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

Tokens are obtained via the login endpoint.

---

## Auth Endpoints

### POST `/auth/:entity/login`
Login and receive JWT token.

**Request:**
```json
{ "email": "user@example.com", "password": "secret" }
```
**Response:** `{ "token": "eyJhbG..." }`

### POST `/auth/admins/signup`
Create first admin account (only works when DB is empty).

**Request:**
```json
{ "email": "admin@example.com", "password": "admin123" }
```
**Response:** `{ "token": "eyJhbG..." }`

### POST `/auth/:entity/signup`
Public signup for authenticable entities (subject to policy).

**Request:**
```json
{ "email": "user@example.com", "password": "pass123" }
```
**Response:** `{ "token": "eyJhbG..." }`

### GET `/auth/:entity/me`
Get current authenticated user info.

**Auth:** Required
**Response:** Entity object (varies by entity type)

### GET `/auth/admins/default-exists`
Check if default admin account exists.

**Response:** `true` or `false`

---

## Collection Endpoints (CRUD)

### GET `/collections/:entity`
List all items with pagination and filtering.

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `page` | Page number (default: 1) |
| `perPage` | Items per page (default: 20) |
| `orderBy` | Sort field |
| `order` | ASC or DESC |
| `relations` | Comma-separated relations to eager load |
| `{field}` | Filter by exact value |
| `{field}_gt` | Greater than |
| `{field}_gte` | Greater than or equal |
| `{field}_lt` | Less than |
| `{field}_lte` | Less than or equal |
| `{field}_like` | LIKE pattern match |
| `{field}_in` | IN array match |
| `{field}_ne` | Not equal |

**Response:**
```json
{
  "data": [...],
  "currentPage": 1,
  "lastPage": 5,
  "from": 1,
  "to": 20,
  "total": 100,
  "perPage": 20
}
```

### GET `/collections/:entity/select-options`
Get entity items formatted for dropdown select fields.

**Auth:** Admin only
**Response:** Array of select options

### GET `/collections/:entity/:id`
Get a single item by UUID.

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `relations` | Comma-separated relations to eager load |

**Response:** Entity object

### POST `/collections/:entity`
Create a new item.

**Request:** Entity fields as JSON body
**Response:** Created entity object

### PUT `/collections/:entity/:id`
Full update — replaces all fields.

**Request:** Complete entity fields as JSON body
**Response:** Updated entity object

### PATCH `/collections/:entity/:id`
Partial update — merges provided fields.

**Request:** Partial entity fields as JSON body
**Response:** Updated entity object

### DELETE `/collections/:entity/:id`
Delete an item by UUID.

**Response:** Deleted entity object

---

## Single (Singleton) Endpoints

### GET `/singles/:entity`
Get the singleton entity. Auto-creates if it doesn't exist.

**Response:** Entity object

### PUT `/singles/:entity`
Full update of singleton.

**Request:** Complete entity fields
**Response:** Updated entity object

### PATCH `/singles/:entity`
Partial update of singleton.

**Request:** Partial entity fields
**Response:** Updated entity object

---

## Upload Endpoints

### POST `/upload/file`
Upload a generic file.

**Content-Type:** `multipart/form-data`
**Fields:**
| Field | Description |
|-------|-------------|
| `file` | The file to upload |
| `entity` | Entity slug |
| `property` | Property name on the entity |

**Response:** `{ "path": "/storage/files/abc123.pdf" }`

### POST `/upload/image`
Upload an image with automatic multi-size generation.

**Content-Type:** `multipart/form-data`
**Fields:**
| Field | Description |
|-------|-------------|
| `image` | The image file |
| `entity` | Entity slug |
| `property` | Property name on the entity |

**Response:** Object with size keys mapping to image paths

---

## Manifest Endpoints

### GET `/manifest/app-name`
Get application name (public).

**Response:** `"My App"`

### GET `/manifest`
Get full application manifest.

**Auth:** Admin only
**Response:** Complete AppManifest object

### GET `/manifest/entities/:slug`
Get entity manifest schema.

**Auth:** Admin only
**Response:** EntityManifest object

---

## Database Endpoints

### GET `/db/is-db-empty`
Check if the database has no records.

**Response:** `true` or `false`

---

## Health Endpoint

### GET `/health`
Health check.

**Response:** `{ "status": "OK" }`

---

## Custom Endpoints

### `* /endpoints/*`
User-defined custom endpoints declared in `manifest.yml`.

Method, path, and handler are configured per endpoint. Access controlled by endpoint-level policies.

---

## Access Control Summary

Each entity's CRUD operations have independently configurable policies:

| Policy | Meaning |
|--------|---------|
| `public` | No authentication needed |
| `admin` | Requires admin JWT |
| `restricted` | Requires JWT from allowed entity type |
| `restricted + condition: self` | Requires JWT + ownership match |
| `forbidden` | Always denied |

Policies are defined per-operation: `create`, `read`, `update`, `delete`, `signup`.

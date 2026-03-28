# Data Models — Manifest Backend

## Overview

Manifest uses **dynamic schema generation** — entities are not defined as TypeScript classes. Instead, they are declared in `manifest.yml` and converted to TypeORM `EntitySchema` objects at runtime. This document describes the base schema structure and supported property/relationship types.

## Base Entity Schema

All entities automatically include:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `createdAt` | timestamp | Auto-set on creation, not selected by default |
| `updatedAt` | timestamp | Auto-set on update, not selected by default |

## Authenticable Entity Schema

Entities marked `authenticable: true` add:

| Column | Type | Notes |
|--------|------|-------|
| `email` | string | Unique, required |
| `password` | string | bcrypt hashed, not selected by default |

## Supported Property Types

| PropType | DB Column | Description |
|----------|-----------|-------------|
| `string` | varchar | Plain text |
| `text` | text | Multi-line text |
| `richtext` | text | HTML content (WYSIWYG) |
| `number` | numeric | Integer or decimal |
| `money` | numeric | Currency value (with currency option) |
| `date` | date | Date only |
| `timestamp` | timestamp | Date and time |
| `email` | varchar | Email address |
| `password` | varchar | bcrypt hashed on save |
| `boolean` | boolean | True/false |
| `link` | varchar | URL |
| `choice` | varchar | Enum-like (with options list) |
| `location` | varchar | Geolocation coordinates |
| `file` | varchar | File path reference |
| `image` | json | Multi-size image paths |
| `group` | — | Nested object (creates related entity) |

## Relationship Types

| Type | Manifest Key | DB Representation |
|------|-------------|-------------------|
| Many-to-one | `belongsTo` | Foreign key column on child |
| Many-to-many | `belongsToMany` | Junction table |
| One-to-many | `hasMany` | Inverse of belongsTo |
| One-to-one | — | Via relationship config |

**Options:**
- `eager: true` — Auto-load related entities
- Relationships can reference any entity slug

## Singleton Entities

Entities marked `single: true` are singletons — only one record exists. Accessed via `/api/singles/:entity` instead of collections.

## Nested Groups

Properties of type `group` create nested entity relationships. Groups can be:
- **Single nested object** — One child entity
- **Array of nested objects** — Multiple child entities (like steps in a tutorial)

## Example Manifest Entity

```yaml
entities:
  cats:
    properties:
      - name: name
        type: string
      - name: age
        type: number
      - name: isGoodBoy
        type: boolean
      - name: photo
        type: image
    belongsTo:
      - owner
    policies:
      read: public
      create: admin
      update:
        access: restricted
        allow: owners
      delete: admin
```

## Validation Rules

Properties support validation via the `validation` key:

| Rule | Description |
|------|-------------|
| `required` | Field must be present |
| `min` | Minimum value (number) or length (string) |
| `max` | Maximum value or length |
| `minLength` | Minimum string length |
| `maxLength` | Maximum string length |
| `pattern` | Regex pattern match |
| `isEmail` | Must be valid email format |
| `isUrl` | Must be valid URL |
| `isIn` | Must be one of listed values |

## Database Support

| Engine | Driver | Default Port | Notes |
|--------|--------|-------------|-------|
| SQLite | sqlite3 | — | Default for development, file at `.manifest/db.sqlite` |
| PostgreSQL | pg | 5432 | Recommended for production |
| MySQL | mysql2 | 3306 | Alternative production option |

TypeORM `synchronize: true` is used — schema changes are auto-applied on startup. No manual migrations needed.

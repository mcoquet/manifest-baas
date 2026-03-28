# Architecture — Shared Libraries

## Common Library (`@repo/common`)

Shared utilities and base classes consumed by the JS SDK and potentially other SDK implementations.

### BaseSDK Class
Foundation for all SDK implementations. Provides chainable query building:

| Method | Description |
|--------|-------------|
| `from(slug)` | Set target entity, reset to collection mode |
| `single(slug)` | Set target entity in singleton mode |
| `where(clause)` | Add WHERE filter with operator parsing |
| `andWhere(clause)` | Alias for where() |
| `orderBy(prop, order?)` | Sort ASC/DESC |
| `with(relations)` | Eager load comma-separated relations |

### String Helpers
| Function | Description |
|----------|-------------|
| `camelize(str)` | snake_case/kebab-case to camelCase |
| `kebabize(str)` | camelCase to kebab-case |
| `lowerCaseFirstLetter(str)` | Lowercase first character |
| `upperCaseFirstLetter(str)` | Uppercase first character |
| `getRecordKeyByValue(record, value)` | Reverse object lookup |

### Utility Helpers
| Function | Description |
|----------|-------------|
| `getDtoPropertyNameFromRelationship(rel)` | "tags" → "tagIds", "author" → "authorId" |
| `getRelationshipNameFromDtoPropertyName(prop)` | Reverse of above |
| `forceNumberArray(value)` | Coerce to number[] |
| `getSmallestImageSize(sizes)` | Find minimum width image |
| `base64ToBlob(b64, type)` | Convert encoding format |
| `getRandomIntExcluding(opts)` | Random int with exclusions |

---

## JSON Schema (`@repo/json-schema`)

Defines the JSON Schema for `manifest.yml` validation. Used by IDEs for YAML autocomplete and by the backend for manifest validation.

### Schema Definitions (23 schemas)
| Schema | Purpose |
|--------|---------|
| `manifestSchema` | Root app definition |
| `entitySchema` | Entity configuration |
| `propertySchema` | Property definitions |
| `relationshipSchema` | Entity relationships |
| `validationSchema` | Validation rules |
| `policiesSchema` / `policySchema` | Access control rules |
| `hooksSchema` / `hookSchema` | Lifecycle webhooks |
| `middlewaresSchema` / `middlewareSchema` | Request interceptors |
| `endpointSchema` | Custom API endpoints |
| `groupSchema` | Nested entity groups |
| `settingsSchema` | App-wide settings |
| `choiceOptionsSchema` | Enum/select options |
| `moneyOptionsSchema` | Currency configuration |
| `imageOptionsSchema` | Image upload settings |
| `groupOptionsSchema` | Nested group configuration |

### Build Process
`scripts/generate-types.ts` uses `json-schema-to-typescript` to auto-generate `ManifestSchema.ts` in the types package.

---

## Types (`@repo/types`)

Pure TypeScript type definitions consumed by all packages via `@repo/types`.

### Core Types
| Type | Description |
|------|-------------|
| `BaseEntity` | `{ id, createdAt, updatedAt }` |
| `AuthenticableEntity` | Extends BaseEntity with `email`, `password` |
| `PropType` | Enum: String, Text, RichText, Number, Money, Date, Timestamp, Email, Boolean, Password, Choice, Location, File, Image, Nested |
| `Paginator<T>` | `{ data[], currentPage, lastPage, from, to, total, perPage }` |
| `AccessPolicy` | Access control levels |

### Manifest Types
| Type | Description |
|------|-------------|
| `AppManifest` | Root app config (entities, endpoints, settings) |
| `EntityManifest` | Entity definition (properties, relationships, policies, hooks) |
| `PropertyManifest` | Property config (name, type, validation, options) |
| `RelationshipManifest` | Relationship config (type, eager, entity reference) |
| `PolicyManifest` | Access rule (access level, allowed entities, conditions) |
| `EndpointManifest` | Custom endpoint (path, method, handler, policies) |
| `HookManifest` | Webhook trigger (event, URL, method, headers) |
| `MiddlewareManifest` | Request/response interceptor |

### Query Types
| Type | Description |
|------|-------------|
| `WhereOperator` | Enum: =, !=, >, >=, <, <=, like, in |
| `WhereKeySuffix` | Query parameter suffixes for operators |

### Other Types
| Type | Description |
|------|-------------|
| `AppEnvironment` | Enum: development, staging, production, testing |
| `HttpMethod` | Union: GET, POST, PUT, PATCH, DELETE |
| `ImageSizesObject` | Image size definitions (width, height per size) |
| `ManifestSchema` | Auto-generated from JSON Schema |

## Package Dependency Graph

```
types (no deps)
  ▲
  │
common (depends on types)
  ▲
  │
js-sdk (depends on common + types)
```

All three packages are private workspace packages (`@repo/*`) except `@mnfst/sdk` which is published to npm.

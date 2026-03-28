# Architecture — Admin Panel

## Executive Summary

The Manifest admin panel is an Angular 17 single-page application that auto-generates a complete CRUD interface from the backend's manifest metadata. It renders dynamic forms with 16 specialized input types, handles authentication, and provides entity management without any entity-specific frontend code.

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Angular | 17.3.1 | SPA framework |
| Styling | Bulma CSS | 0.9.4 | Responsive CSS framework |
| Rich Text | ngx-quill | 25.3.3 | WYSIWYG editor |
| Auth | @auth0/angular-jwt | 5.2.0 | JWT auto-injection |
| Async | RxJS | 7.8.1 | Reactive state management |
| Language | TypeScript | 5.4.3 | Type safety |
| Testing | Karma + Jasmine | 6.4.0 / 4.5.0 | Component testing |

## Architecture Pattern

**Pattern:** Modular Angular with lazy loading and service-based state management
**Style:** Dynamic UI generation from manifest metadata — no entity-specific components

### Module Structure

```
AppModule (root)
├── SharedModule                — Common services, pipes, input/yield components
│   ├── ManifestService         — Caches backend manifest metadata
│   ├── CrudService             — CRUD API wrapper
│   ├── FlashMessageService     — Toast notifications
│   ├── UploadService           — File/image upload
│   ├── VersionService          — Update checking
│   ├── MetaService             — Page title management
│   ├── CapitalizeFirstLetterPipe
│   └── TruncatePipe
│
├── LayoutModule                — UI shell components
│   ├── SideMenuComponent       — Dynamic nav from manifest entities
│   ├── TouchMenuComponent      — Mobile menu
│   ├── FlashMessageComponent   — Toast display
│   ├── FooterComponent
│   └── UserMenuItemComponent
│
├── AuthModule (lazy-loaded)    — Authentication
│   ├── LoginComponent
│   ├── RegisterFirstAdminComponent
│   ├── LogoutComponent
│   ├── AuthService             — JWT management, user state
│   ├── AuthGuard               — Route protection
│   ├── NotLoggedInGuard        — Prevent auth page access when logged in
│   └── IsDbEmptyGuard          — First-setup redirect
│
├── CrudCollectionModule (lazy-loaded)  — Entity list/detail/form
│   └── CrudModule (shared views)
│
└── CrudSingleModule (lazy-loaded)      — Singleton entity views
    └── CrudModule (shared views)
```

## Routing

```
/                              → HomeComponent (AuthGuard)
/auth/login                    → LoginComponent (NotLoggedInGuard)
/auth/logout                   → LogoutComponent
/auth/welcome                  → RegisterFirstAdminComponent (IsDbEmptyGuard)
/collections/:entitySlug       → ListComponent (AuthGuard)
/collections/:entitySlug/create → CreateEditComponent
/collections/:entitySlug/:id   → DetailComponent
/collections/:entitySlug/:id/edit → CreateEditComponent
/singles/:entitySlug           → DetailComponent (AuthGuard)
/singles/:entitySlug/edit      → CreateEditComponent
/404                           → Error404Component
/**                            → Redirect to /404
```

## State Management

**Approach:** Service-based with RxJS BehaviorSubjects/Subjects — no NgRx/Redux.

| Service | State | Pattern |
|---------|-------|---------|
| AuthService | Current user | `BehaviorSubject<Admin>` with `currentUser$` observable |
| ManifestService | App manifest | Cached promise (single load) |
| FlashMessageService | Notifications | `Subject<FlashMessage>` with auto-clear (5s) |
| CrudService | — | Stateless API wrapper |

**Token Storage:** localStorage key `manifestToken`
**JWT Auto-Injection:** `@auth0/angular-jwt` attaches Bearer token to all API requests

## Component Inventory

### Input Components (16 types)
Standalone components that dynamically render based on `PropType`:

| Component | PropType | Description |
|-----------|----------|-------------|
| TextInputComponent | String | Plain text |
| TextareaInputComponent | Text | Multi-line |
| RichTextInputComponent | RichText | ngx-quill WYSIWYG |
| NumberInputComponent | Number | Numeric |
| CurrencyInputComponent | Money | Currency with symbol |
| EmailInputComponent | Email | Email validation |
| PasswordInputComponent | Password | Masked |
| UrlInputComponent | Link | URL |
| DateInputComponent | Date | Date picker |
| TimestampInputComponent | Timestamp | DateTime picker |
| BooleanInputComponent | Boolean | Toggle/checkbox |
| SelectInputComponent | many-to-one | Single select dropdown |
| MultiSelectInputComponent | many-to-many | Multi-select |
| LocationInputComponent | Location | Geolocation |
| FileInputComponent | File | File upload |
| ImageInputComponent | Image | Image upload + preview |

### Display Components (15 yield types)
Read-only display components for detail views:

TextYield, LabelYield, NumberYield, BooleanYield, CurrencyYield, DateYield, TimestampYield, EmailYield, ImageYield, ProgressBarYield, LocationYield, LinkYield, RichTextYield, RelationYield

### CRUD Components
- **ListComponent** — Paginated entity listing with filtering
- **DetailComponent** — Entity detail view with relationships
- **CreateEditComponent** — Dynamic form for create/update
- **ListMetaComponent** — List metadata display
- **PaginationComponent** — Page navigation (20 items/page)

## Authentication Flow

1. User submits login form → POST `/api/auth/admins/login`
2. Backend returns `{ token: string }`
3. Token saved to `localStorage`
4. `AuthService.currentUserSubject` emits authenticated admin
5. `JwtModule` auto-attaches Bearer token to all HTTP requests
6. On app load: if token exists, `loadCurrentUser()` calls `/api/auth/admins/me`

### Guards
- **AuthGuard** — Checks localStorage for token; redirects to `/auth/login`
- **NotLoggedInGuard** — Redirects authenticated users away from login
- **IsDbEmptyGuard** — Routes to welcome screen for first-time setup

## Build & Deployment

The admin panel is **not deployed independently**. It is built and bundled into the backend:

```bash
ng build --configuration production
cp -r ./dist ../manifest/dist/admin
```

The backend serves the admin as static files and provides SPA fallback routing.

### Build Configuration
- Output: `dist/`
- Bundle limits: 2MB warning / 4MB error
- SCSS support for Bulma customization
- Production optimizations: output hashing, license extraction disabled

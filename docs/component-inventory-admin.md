# Component Inventory — Admin Panel

## Overview

The admin panel contains 48 Angular components organized by domain. Components are a mix of standard NgModule declarations and Angular 14+ standalone components.

## Input Components (16) — Standalone

Dynamic field renderers selected by `PropType`. Located in `src/app/modules/shared/inputs/`.

| Component | PropType | Description |
|-----------|----------|-------------|
| `TextInputComponent` | String | Plain text input |
| `TextareaInputComponent` | Text | Multi-line text area |
| `RichTextInputComponent` | RichText | ngx-quill WYSIWYG editor |
| `NumberInputComponent` | Number | Numeric input with validation |
| `CurrencyInputComponent` | Money | Currency input with symbol display |
| `EmailInputComponent` | Email | Email-validated input |
| `PasswordInputComponent` | Password | Masked password field |
| `UrlInputComponent` | Link | URL input |
| `DateInputComponent` | Date | Date picker |
| `TimestampInputComponent` | Timestamp | DateTime picker |
| `BooleanInputComponent` | Boolean | Toggle/checkbox |
| `SelectInputComponent` | (many-to-one) | Single-select dropdown for relations |
| `MultiSelectInputComponent` | (many-to-many) | Multi-select for relations |
| `LocationInputComponent` | Location | Geolocation input |
| `FileInputComponent` | File | File upload handler |
| `ImageInputComponent` | Image | Image upload with thumbnail preview |

## Display Components (15) — Standalone (Yields)

Read-only renderers for detail views. Located in `src/app/modules/shared/yields/`.

| Component | PropType | Description |
|-----------|----------|-------------|
| `TextYieldComponent` | String | Plain text display |
| `LabelYieldComponent` | — | Label display |
| `NumberYieldComponent` | Number | Number display |
| `BooleanYieldComponent` | Boolean | True/false indicator |
| `CurrencyYieldComponent` | Money | Formatted currency |
| `DateYieldComponent` | Date | Formatted date |
| `TimestampYieldComponent` | Timestamp | Formatted datetime |
| `EmailYieldComponent` | Email | Clickable email link |
| `ImageYieldComponent` | Image | Image thumbnail display |
| `ProgressBarYieldComponent` | — | Progress bar visualization |
| `LocationYieldComponent` | Location | Location display |
| `LinkYieldComponent` | Link | Clickable URL |
| `RichTextYieldComponent` | RichText | Rendered HTML content |
| `RelationYieldComponent` | (relation) | Related entity display |

## CRUD Components (5)

Located in `src/app/modules/crud/`.

| Component | Description |
|-----------|-------------|
| `ListComponent` | Paginated entity listing with filtering (20 items/page) |
| `DetailComponent` | Single entity detail view with relationships |
| `CreateEditComponent` | Dynamic form for create and update operations |
| `ListMetaComponent` | Metadata display for list views |
| `PaginationComponent` | Page navigation controls |

## Auth Components (3)

Located in `src/app/modules/auth/`.

| Component | Description |
|-----------|-------------|
| `LoginComponent` | Login form with default credential suggestions |
| `RegisterFirstAdminComponent` | First-time admin account setup |
| `LogoutComponent` | Logout handler (clears token, redirects) |

## Layout Components (5)

Located in `src/app/modules/layout/`.

| Component | Description |
|-----------|-------------|
| `SideMenuComponent` | Dynamic navigation sidebar built from manifest entities |
| `TouchMenuComponent` | Mobile-responsive menu overlay |
| `UserMenuItemComponent` | User profile menu dropdown |
| `FlashMessageComponent` | Toast-style notifications (success/error/warning/info) |
| `FooterComponent` | Footer with Manifest branding |

## Root Components (3)

Located in `src/app/`.

| Component | Description |
|-----------|-------------|
| `AppComponent` | Root component with auth state, version checking, sidebar toggle |
| `HomeComponent` | Dashboard/home page |
| `Error404Component` | 404 error page |

## Services (6)

Located in `src/app/modules/shared/services/` and `src/app/modules/auth/`.

| Service | State Pattern | Description |
|---------|--------------|-------------|
| `AuthService` | BehaviorSubject | JWT auth, user state, login/logout |
| `ManifestService` | Cached promise | Loads and caches backend manifest metadata |
| `CrudService` | Stateless | CRUD API operations wrapper |
| `FlashMessageService` | Subject | Global toast notifications (5s auto-clear) |
| `UploadService` | Stateless | File/image upload via FormData |
| `VersionService` | Stateless | Update checking against platform API |

## Guards (3)

| Guard | Description |
|-------|-------------|
| `AuthGuard` | Checks localStorage for JWT token |
| `NotLoggedInGuard` | Prevents auth pages when logged in |
| `IsDbEmptyGuard` | Routes to welcome screen for first setup |

## Pipes (2)

| Pipe | Description |
|------|-------------|
| `CapitalizeFirstLetterPipe` | Capitalize first character |
| `TruncatePipe` | Truncate long strings |

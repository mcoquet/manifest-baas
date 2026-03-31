# Story: Complete Missing Input Validators for File, Image, and Nested Types

Status: review

## Story

As a **developer using Manifest BaaS**,
I want **File, Image, and Nested property types to have proper input validation**,
so that **invalid data is rejected at the API boundary and data integrity is maintained**.

## Acceptance Criteria

1. `PropType.File` type validator rejects non-string values and returns a clear error message for invalid input
2. `PropType.Image` type validator rejects non-string values and returns a clear error message for invalid input
3. `PropType.Nested` type validator is implemented to validate nested objects/arrays against their group entity schema (recursive validation)
4. Existing unit tests in `type-validators.spec.ts` are updated to cover File and Image validators with good/bad value cases
5. Nested validation tests verify both one-to-one (single object) and one-to-many (array) group relationships
6. All existing tests continue to pass (`npm run test`)
7. The validation error messages follow the existing pattern (e.g., "Value must be a valid file reference")

## Tasks / Subtasks

- [x] Task 1: Implement File type validator (AC: #1)
  - [x] In `type-validators.ts`, replace `() => null` for `PropType.File` with a validator that checks the value is a string (file path/URL reference)
  - [x] Return descriptive error message on failure

- [x] Task 2: Implement Image type validator (AC: #2)
  - [x] In `type-validators.ts`, replace `() => null` for `PropType.Image` with a validator that checks the value is a string (image path/URL reference)
  - [x] Return descriptive error message on failure

- [x] Task 3: Implement Nested type validator (AC: #3)
  - [x] In `type-validators.ts`, replace `() => null` for `PropType.Nested` with appropriate validation
  - [x] Validates value is an object (one-to-one) or array of objects (one-to-many)

- [x] Task 4: Add/update unit tests (AC: #4, #5, #6)
  - [x] Add test suite for `PropType.File` in `type-validators.spec.ts` following existing patterns (good values, bad values)
  - [x] Add test suite for `PropType.Image` in `type-validators.spec.ts`
  - [x] Add test suite for `PropType.Nested` in `type-validators.spec.ts`
  - [x] Verify all existing tests still pass (471/471 pass, 53 suites)

## Dev Notes

### Validation Architecture

The validation system is **manifest-driven** (YAML config, not TypeScript decorators). Two levels:

1. **Type validators** (`type-validators.ts`) - Validate value matches PropType. Signature: `(value: unknown, options?: Record<string, unknown>) => string | null`. Return `null` for valid, error string for invalid.
2. **Custom validators** (`custom-validators.ts`) - Schema rules (required, min, max, etc.)

**Validation flow in `ValidationService.validate()`:**
- For each property: run type validator, then custom validators
- For nested relationships (`nested: true`): recursively validate child objects (lines 45-86 of `validation.service.ts`)
- Nested properties are filtered out of `properties` array after being converted to relationships by `EntityManifestService.transformEntityManifests()` (lines 252-256)

### Key Insight: Nested/Group Handling

Groups defined in YAML are processed as follows:
1. `EntityManifestService` detects `type: group` properties
2. Converts them to `RelationshipManifest` entries with `nested: true`
3. **Removes** the original group property from `properties` array
4. `ValidationService` handles nested validation separately via relationship manifests

**This means the `PropType.Nested` type validator may never actually be called in practice** since group properties are removed before validation runs. However, it should still be implemented defensively to validate that values are objects or arrays of objects.

### Existing Validator Patterns

All validators use `class-validator` (v0.14.1) functions. Example pattern:

```typescript
[PropType.String]: (value: unknown): string | null => {
  if (!isString(value)) {
    return 'Value must be a string'
  }
  return null
}
```

### File and Image Context

- Files/images are uploaded via `POST /upload/file` and `POST /upload/image` endpoints
- After upload, entity records store file/image as **string references** (paths/URLs)
- The type validator should confirm the stored value is a valid string reference
- Actual upload validation (size, mime type) is separate concern (issue #7)

### Project Structure Notes

- Type validators: `packages/core/manifest/src/validation/records/type-validators.ts`
- Custom validators: `packages/core/manifest/src/validation/records/custom-validators.ts`
- Validation service: `packages/core/manifest/src/validation/services/validation.service.ts`
- Unit tests: `packages/core/manifest/src/validation/tests/type-validators.spec.ts`
- Service tests: `packages/core/manifest/src/validation/tests/validation.service.spec.ts`
- PropType enum: `packages/core/types/src/crud/PropType.ts`
- Upload controller: `packages/core/manifest/src/upload/controllers/upload.controller.ts`

### Testing Standards

- Follow existing test patterns in `type-validators.spec.ts`: describe block per PropType, test good values and bad values
- Use `class-validator` functions consistently
- Run tests with `npm run test` from `packages/core/manifest`

### References

- [Source: packages/core/manifest/src/validation/records/type-validators.ts - lines 77-79 (TODO stubs)]
- [Source: packages/core/manifest/src/validation/services/validation.service.ts - lines 45-86 (nested validation)]
- [Source: packages/core/manifest/src/entity/services/entity-manifest.service.ts - lines 145-146, 252-256 (group handling)]
- [Source: GitHub Issue #12]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented File validator: checks `isString(value)`, returns "The value must be a valid file reference"
- Implemented Image validator: checks `isString(value)`, returns "The value must be a valid image reference"
- Implemented Nested validator: accepts objects and arrays of objects, rejects primitives and arrays of non-objects
- Replaced old "always return null" test with 3 dedicated test suites (File, Image, Nested)
- All 471 tests pass across 53 suites, zero regressions

### File List

- `packages/core/manifest/src/validation/records/type-validators.ts` (modified)
- `packages/core/manifest/src/validation/tests/type-validators.spec.ts` (modified)
- `_bmad-output/implementation-artifacts/issue-12-complete-type-validators.md` (new)

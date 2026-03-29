# Project: manifest-baas

## Development Workflow — Required Skills

Follow this workflow when developing features, fixing bugs, or making changes.
Use the Skill tool to invoke skills. Do not skip steps unless the user explicitly asks.

### 1. Before Starting Work (Issue/Task Pickup)

When picking up a new issue or task:
- Run `/bmad-create-story` to build a comprehensive story file with acceptance criteria, technical context, and architecture compliance requirements.
- If the issue is complex or the approach is unclear, run `/bmad-brainstorming` to explore options before committing to an approach.
- If you need to validate a planned approach or push your thinking deeper, run `/bmad-advanced-elicitation`.

Skip story creation only for trivial single-file fixes (typos, one-line config changes).

### 2. During Implementation

- For story-driven work: use `/bmad-dev-story` to follow the red-green-refactor cycle with structured task tracking.
- For quick fixes or small features: use `/bmad-quick-dev` for lightweight structured implementation.
- For ad-hoc changes without a story file: proceed normally but still follow the pre-commit review steps below.

### 3. Pre-Commit Quality Gates (MANDATORY)

Before every commit, run these in order:

1. **`/simplify`** — Review changed code for reuse, quality, and efficiency. Fix any issues found.
2. **`/bmad-review-edge-case-hunter`** — Walk every branch and boundary condition. Fix unhandled edge cases.

For changes that touch security, auth, config, or span 3+ files, also run:

3. **`/bmad-code-review`** — Full adversarial review with parallel analysis layers (Blind Hunter, Edge Case Hunter, Acceptance Auditor).

### 4. Post-Implementation

- After adding new features or API endpoints: run `/bmad-qa-generate-e2e-tests` to generate automated test coverage.
- After modifying documentation: run `/bmad-editorial-review-prose` to catch communication issues.

### 5. Sprint Lifecycle (when using BMAD sprint tracking)

- Start of session: run `/bmad-sprint-status` to orient and surface risks.
- Mid-sprint changes: run `/bmad-correct-course` for impact assessment.
- Epic complete: run `/bmad-retrospective` to extract lessons.

## Quick Reference

| Trigger | Skill |
|---------|-------|
| New issue/task | `/bmad-create-story` |
| Unclear approach | `/bmad-brainstorming` |
| Validate thinking | `/bmad-advanced-elicitation` |
| Story implementation | `/bmad-dev-story` |
| Quick fix | `/bmad-quick-dev` |
| Before EVERY commit | `/simplify` then `/bmad-review-edge-case-hunter` |
| Security/auth/config or 3+ files | `/bmad-code-review` |
| New feature/endpoint | `/bmad-qa-generate-e2e-tests` |
| Docs changes | `/bmad-editorial-review-prose` |
| Session start (sprint) | `/bmad-sprint-status` |

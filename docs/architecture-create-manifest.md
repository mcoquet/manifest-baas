# Architecture — Create Manifest CLI

## Executive Summary

`create-manifest` is a CLI scaffolding tool built with Oclif that generates new Manifest backend projects. It creates the project structure, installs dependencies, starts the server, seeds the database, and optionally adds IDE-specific configuration files.

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| CLI Framework | Oclif | Command parsing & execution |
| HTTP | Axios | Health check polling |
| JSON | jsonc-parser | JSON with comments support |
| Node APIs | child_process, fs, crypto | Spawning, file I/O, secret generation |

## CLI Usage

```bash
npx create-manifest@latest [project-name]
```

### Flags
| Flag | Description |
|------|-------------|
| `--backendFile` | Remote URL for custom manifest.yml template |
| `--cursor` | Add Cursor IDE rules |
| `--copilot` | Add GitHub Copilot instructions |
| `--windsurf` | Add Windsurf IDE rules |

## Scaffolding Flow

1. Prompt for project name (if not provided)
2. Slugify name (normalize, kebab-case)
3. Create project directory
4. Write `manifest.yml` from template (or remote URL)
5. Write `package.json` with latest `manifest` dependency
6. Write `.env` with generated `TOKEN_SECRET_KEY` (32-byte random hex)
7. Write `.gitignore`, `.vscode/` config
8. Optionally fetch IDE rules from GitHub (Cursor, Copilot, Windsurf)
9. Write `README.md`
10. Run `npm install`
11. Start server in background, poll `/api/health` (30s timeout)
12. Run `npm run seed` to populate database
13. Kill background server

## Template Structure

```
assets/
├── standalone/          # Default project template
│   ├── manifest.yml     # Sample entities (Owner, Cat, Homepage)
│   ├── api-package.json # Base package.json
│   └── README.md        # Getting started guide
│
└── monorepo/            # Multi-package template (hidden feature)
    ├── manifest.yml
    ├── api-package.json
    ├── web-package.json
    ├── root-package.json
    └── README.md
```

## Helper Utilities

- `slugify(text)` — Normalize project names (NFD, remove accents/special chars)
- `updatePackageJsonFile()` — Merge dependencies and scripts
- `getLatestPackageVersion()` — Fetch latest npm version
- `getBackendFileContent()` — Load local or remote manifest.yml
- `execInDirectory()` — Run commands with cross-platform support
- `spawnInDirectory()` — Background process spawning (Windows shell support)

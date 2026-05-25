# RDK DOC Maintenance Guide

English | [简体中文](./README.md)

## 1. Dependency Installation

### Requirements

- Node.js >= 18
- npm (bundled with Node.js)

### Install

For first-time setup or daily local development:

```bash
npm install
```

For CI or strictly locked dependency installation:

```bash
npm ci
```

## 2. Documentation Maintenance Workflow

1. Update Chinese docs in `docs/`.
2. Update English docs in `i18n/en/docusaurus-plugin-content-docs/current/`.
3. If you changed visibility scope (`sidebar_versions`, `sidebar_products`, `_sidebar_scope.json`, `DocScope`), regenerate config once:

   ```bash
   npm run generate-sidebar-config
   ```

   Or run:

   ```bash
   npm run start
   ```

4. Verify locally (Chinese or English):
   - Chinese: `npm run start`
   - English: `npm run start:en`
5. Run full build check before commit:

   ```bash
   npm run build
   ```

6. Preview build artifacts locally when needed:

   ```bash
   npm run serve
   ```

## 3. Common Maintenance Commands

| Command | Purpose |
|---|---|
| `npm run generate-sidebar-config` | Manually generate sidebar visibility scope config |
| `npm run watch-sidebar-config` | Watch doc changes and auto-update scope config |
| `npm run start` | Start Chinese docs dev server (with config watch) |
| `npm run start:en` | Start English docs dev server (with config watch) |
| `npm run start:no-watch` | Start Chinese docs without config watch |
| `npm run start:no-watch:en` | Start English docs without config watch |
| `npm run start:port` | Start Chinese docs on port 3001 (with config watch) |
| `npm run build` | Production build (includes sidebar config generation) |
| `npm run serve` | Preview build artifacts locally |
| `npm run deploy` | Build and deploy to GitHub Pages |


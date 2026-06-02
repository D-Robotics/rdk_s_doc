[English](./README.md) | 简体中文

# Documentation Repository

This repository contains the source code for the RDK S100 / S600 development documentation site, built with Docusaurus. It includes the main Chinese documentation, English translations, site theme customization, document scope filtering (Doc Scope), and an automated release process.

Core features of the documentation site include:
- Multilingual documentation (`zh-Hans` / `en`)
- Document content filtering by product and version (`DOC_BUILD_PRODUCT`, `DOC_BUILD_VERSION`)
- Automatic generation and monitoring of sidebar scope configuration
- GitHub Pages build and deployment, as well as OSS synchronization

## Repository Structure Overview

The main directories are described as follows:

- `docs/`: Main content of the Chinese documentation
- `i18n/en/docusaurus-plugin-content-docs/current/`: English documentation content
- `scripts/`: Maintenance and build helper scripts (numbering, link fixing, scope building, etc.)
- `src/`: Theme customization, plugins, and remark extensions
- `static/`: Static assets
- `.github/workflows/`: CI/CD workflows (Pages deployment and OSS synchronization)
- `docusaurus.config.js`: Main site configuration
- `sidebars.js`: Entry point for document sidebar configuration

## Environment Setup

- Node.js: `>= 18`
- Package manager: `npm`

```bash
# Install dependencies (recommended: unified approach for CI and local)
npm ci

# Or: Quick installation for daily development (updates dependencies according to semver)
npm install
```

## Documentation Maintenance Workflow

It is recommended to follow the steps below in order:

```bash
# 1) Modify document content
# Chinese directory: docs/
# English directory: i18n/en/docusaurus-plugin-content-docs/current/

# 2) Renumber only the Markdown files under docs/ (as needed)
npm run renumber-docs-md

# 3) Renumber directories + Markdown files under docs/ (as needed, use with caution as it has wide impact)
node scripts/renumber-docs-and-folders.js

# 4) Renumber the English directory (optional, only needed if English directory also requires adjustment)
node scripts/renumber-docs-and-folders.js i18n/en/docusaurus-plugin-content-docs/current

# 5) Fix relative Markdown links under docs/ affected by renaming (as needed)
npm run fix-relative-docs-links

# 6) Generate/update sidebar scope configuration
npm run generate-sidebar-config

# 7) Local preview (Chinese)
npm run start

# 8) Local preview (English)
npm run start:en

# 9) Perform a full build check before committing
npm run build

# 10) Locally serve the build output for verification
npm run serve
```

## Common Maintenance Commands

### Content and Structure Maintenance

```bash
# Use the following with caution

# Renumber Markdown files under docs/ according to sidebar_position
npm run renumber-docs-md

# Renumber directories + Markdown files, and attempt to batch fix repository path references
node scripts/renumber-docs-and-folders.js

# Renumber the English documentation directory (optional)
node scripts/renumber-docs-and-folders.js i18n/en/docusaurus-plugin-content-docs/current

# Fix relative links under docs/ affected by renaming
npm run fix-relative-docs-links

# Generate sidebar scope configuration (Doc Scope)
npm run generate-sidebar-config

# Watch document changes during development and automatically update sidebar scope configuration
npm run watch-sidebar-config
```

### Local Development

```bash
# Chinese development mode (includes sidebar config watching)
npm run start

# English development mode (includes sidebar config watching)
npm run start:en

# Chinese development mode, using port 3001
npm run start:port

# Chinese development mode (without starting watcher)
npm run start:no-watch

# English development mode (without starting watcher)
npm run start:no-watch:en

# Clear Docusaurus cache
npm run clear
```

### Build and Output Verification

```bash
# Standard full build
npm run build

# Locally preview the build directory
npm run serve

# Preview with specified host and port (example)
npm run serve -- --host=10.64.62.34 --port=1688 --no-open
```

Common access paths (the port will depend on the actual `serve` output):
- English: `http://localhost:3000/en/rdk_s_doc/RDK`
- Chinese: `http://localhost:3000/rdk_s_doc/RDK`

### CI Automated Deployment

Two workflows are configured in the repository:

1. `Deploy Docusaurus site to GitHub Pages` (`.github/workflows/deploy.yml`)  
   - Trigger: Push to the `main` branch or manual trigger  
   - Actions: Install dependencies, build, deploy to `gh-pages`

2. `Sync gh-pages to OSS` (`.github/workflows/sync-gh-pages.yml`)  
   - Trigger: Successful completion of the Pages deployment workflow  
   - Actions: Sync the content of `gh-pages` to OSS
[English](./README.md) | 简体中文

# Documentation Repository

This repository contains the source code for the RDK S100 / S600 development documentation site, built with Docusaurus. It includes the main Chinese documentation, English translations, site theme customization, document scope filtering (Doc Scope), and an automated release process.

## Environment Setup

- Node.js: `>= 18`
- Package manager: `npm`

```bash
#  Quick installation for daily development (updates dependencies according to semver)
npm install
```

## Common Maintenance Commands

### Content and Structure Maintenance

```bash

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

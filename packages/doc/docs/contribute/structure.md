---
sidebar_position: 2
---

# Project structure

The project has a monorepo structure to include different aspects of the service : API server, SDK client library, DTOs and documentation.

This structure is organised using npm native `workspaces` defined in the root `package.json` file.

<!-- prettier-ignore -->
- `readme.md`
- `package.json`       <-- main project definition
- `packages/`
  - **`api`**          <-- API server
    - `config/`        <-- configuration files per environment
    - `src/`
      - `index.ts`     <-- Application launch and teardown
      - `server.ts`    <-- API server setup and initialisation logic
      - `db.ts`        <-- Db initialisation
      - `logger.ts`    <-- Logger setup
      - `app.ts`       <-- The main application router
      - `base/`        <-- Basic api middlewares (ok, notfound, health, ...)
  - **`doc`**          <-- Documentation website
    - `docs/`
    - `src/`
    - `static/`
  - **`dto`**
  - **`sdk`**         <-- API Client library
    - `src`
- `.github/workflows/` <-- CI/CD github actions

## Project setup

- [x] nvm setup for node version
- [x] Typescript setup
  - [x] Linter
  - [x] Import synax
  - [x] Build scripts
  - [x] Production setup
- [x] Nodemon
  - [x] Reload on config and code changes
  - [x] Ignores tests
  - [x] Dev Tool inspect
- [x] Tests
  - [x] Jest for typescript
  - [x] Detect open handles
  - [x] Code coverage
  - [x] Supertest
- [x] Config
  - [x] Env variables support
  - [x] Defaults, dev, test & prod environment settings
- [x] Logger
  - [x] Json output
  - [x] Api request log
- [ ] Assets
  - [x] Docker file
    - [x] Incremental changes
    - [ ] Test image
    - [x] Production image excluding dev dependencies
  - [ ] Private packages
  - [ ] Helm chart
- [x] CI - Publishing
  - [x] Linter
  - [x] Tests
  - [x] Licences audit
  - [ ] Sonarqube
  - [x] Public doc to github pages
  - [x] OpenAPI doc
  - [x] Build image
  - [x] Publish image to Github packages
- [ ] CD - Environments deploiment
  - [ ] Production
  - [ ] Public integration
  - [ ] Dev, Staging, Test
- [x] Server setup
  - [x] `ok` and `not found` middlewares
  - [x] error handler for uncatched and silent exceptions
  - [x] exit on initialization error
  - [x] health probe
  - [x] prometheus metrics
  - [x] license, licenses and license summary endpoints
  - [x] API doc
    - [x] OpenAPI doc
    - [x] Development server url from config
- [x] Persistency
  - [x] Mongodb setup

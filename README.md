# AdaptiveAuth

AdaptiveAuth is a full-stack adaptive authentication starter organized as a pnpm monorepo.

> **Local folder** may still be named `vue-smart-layout` (Cursor workspace). The **git remote** and product name are **AdaptiveAuth** (`adaptive-auth`).

## Project structure

- `apps/vue-app` — Vue + Vite SPA
- `services/auth-server` — Express + TypeScript API
- `packages/` — shared libraries (Phase B+)
- root — workspace orchestration, shared lint/TS config, CI

## Prerequisites

- Node.js 22+
- pnpm 10+

## Install

```sh
pnpm install
```

## Development

Run the Vue app only:

```sh
pnpm dev
```

Run Vue app and auth server:

```sh
pnpm dev:full
```

Run packages independently:

```sh
pnpm dev:vue-app
pnpm dev:auth-server
```

Legacy script aliases `dev:front-end` and `dev:back-end` still work.

## Quality checks

```sh
pnpm lint
pnpm type-check
pnpm test:vue-app
pnpm test:auth-server
pnpm test:e2e
```

## Build

```sh
pnpm build:vue-app
pnpm build:auth-server
pnpm build
```

## Environment

- Copy `apps/vue-app/.env.example` → `apps/vue-app/.env`
- Copy `services/auth-server/.env.example` → `services/auth-server/.env`

If you had `.env` files under the old `front-end/` or `back-end/` paths, move them to the locations above.

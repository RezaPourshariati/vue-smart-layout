# @adaptive-auth/auth-server

Express + TypeScript authentication API for AdaptiveAuth.

## Commands

From repo root:

```sh
pnpm dev:auth-server
pnpm build:auth-server
pnpm test:auth-server
```

From this directory:

```sh
pnpm dev
pnpm build
pnpm start
```

## Environment

Copy `.env.example` to `.env` in this folder. If you migrated from `back-end/.env`, move that file here unchanged.

## Migrations

```sh
pnpm --dir services/auth-server migrate:tokens
```

Optional `-- --dry-run` before applying.

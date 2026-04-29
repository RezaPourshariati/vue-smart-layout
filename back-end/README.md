# Back-End Package

This package is the canonical back-end root for Smart Layout.

Current status:

- Runtime backend code and configuration live directly in this folder (`back-end/src`, `back-end/tsconfig.json`, `back-end/.env.example`).
- Use this package directly for development and build.

Run commands:

- `pnpm --dir back-end dev`
- `pnpm --dir back-end build`
- `pnpm --dir back-end start`

Next step (later migration batch):

- Move or recreate your local `.env` from the previous server location into `back-end/.env`.

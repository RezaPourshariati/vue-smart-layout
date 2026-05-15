# Back-End Package

This package is the canonical back-end root for AdaptiveAuth.

Current status:

- Runtime backend code and configuration live directly in this folder (`back-end/src`, `back-end/tsconfig.json`, `back-end/.env.example`).
- Use this package directly for development and build.

Run commands:

- `pnpm --dir back-end dev`
- `pnpm --dir back-end build`
- `pnpm --dir back-end start`

API base:

- Auth routes: `/api/auth` (login, refresh, logout, password flows).
- User/profile routes: `/api/users` (me, directory, profile updates).
- Set `REDIS_URL` in production for distributed rate limiting across instances.
- Feature routes are organized under `src/features/*` and mounted via `src/app.ts`.
- Cross-cutting infrastructure lives under `src/common/*` (`middleware`, `errors`, `utils`).

Next step (later migration batch):

- Move or recreate your local `.env` from the previous server location into `back-end/.env`.

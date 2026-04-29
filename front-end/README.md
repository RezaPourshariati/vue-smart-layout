# Front-End Package (Staged Migration)

This package is the staged front-end boundary for Smart Layout.

Current status:

- Front-end runtime, config, and source now live in this directory.
- This folder is now the canonical frontend root (`front-end/src`, `front-end/public`).
- Front-end style/config files are now colocated here (`tailwind.config.js`, `uno.config.ts`, `eslint.config.mjs`).

Run commands:

- `pnpm --dir front-end dev`
- `pnpm --dir front-end build`
- `pnpm --dir front-end type-check`

Next step (later migration batch):

- Update CI/deploy to run frontend commands from `front-end` directly.
- Optionally split root lint/type-check scripts into separate root orchestrator scripts per package.

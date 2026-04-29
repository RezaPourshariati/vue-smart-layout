# vue-smart-layout

Smart Layout is organized as a pnpm workspace with separate front-end and back-end packages.

## Project Structure

- `front-end`: Vue + Vite application
- `back-end`: Express + TypeScript API
- root: workspace orchestration, shared lint config, CI workflows

## Prerequisites

- Node.js 22+
- pnpm 10+

## Install

```sh
pnpm install
```

## Development

Run front-end only:

```sh
pnpm dev
```

Run both front-end and back-end:

```sh
pnpm dev:full
```

Run packages independently:

```sh
pnpm dev:front-end
pnpm dev:back-end
```

## Quality Checks

Lint both packages:

```sh
pnpm lint
```

Type-check both packages:

```sh
pnpm type-check
```

## Build

Build front-end:

```sh
pnpm build:front-end
```

Build back-end:

```sh
pnpm build:back-end
```

Build all (type-check + front-end build):

```sh
pnpm build
```

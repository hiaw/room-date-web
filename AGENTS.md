# Agent Guidelines for Convex + Svelte Project

## Build/Test Commands

- **Build**: `bun run build`
- **Dev server**: `bun run dev`
- **Type check**: `bun run check`
- **Lint**: `bun run lint` (Prettier + ESLint)
- **Format**: `bun run format`
- **Test all**: `bun test src/`
- **Test single file**: `bun test path/to/test.ts`
- **E2E tests**: `bun run test:e2e`
- **E2E with UI**: `bun run test:e2e:ui`
- **E2E debug**: `bun run test:e2e:debug`

## Code Style

- **Formatting**: Prettier defaults with Svelte/Tailwind plugins
- **Imports**: Use `.js` extensions (e.g., `import { api } from '../convex/_generated/api.js'`)
- **TypeScript**: Strict mode, explicit types, interfaces for props
- **Naming**: camelCase variables/functions, PascalCase components
- **Error handling**: `try/catch` with `err instanceof Error` checks
- **Svelte**: Use `<script lang="ts">`, `$props()`, reactive statements
- **Comments**: DO NOT ADD unless requested

## Tech Stack & Patterns

- Svelte 5 + SvelteKit + TypeScript + Tailwind + Convex + Vitest + Playwright
- **Convex**: `useQuery(api.func, args)` for queries, `useConvexClient().mutation(api.func, args)` for mutations
- **Never use `createMutation()`** - not available in this setup
- **Environment**: NEVER modify `SITE_URL` - auto-managed by dev server

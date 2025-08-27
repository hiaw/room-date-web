# Project Overview

This is a full-stack task management application built with SvelteKit and Convex. It uses `@convex-dev/auth` for password-based authentication and features a real-time task list. The frontend is built with SvelteKit and styled with Tailwind CSS.

## Building and Running

**1. Install Dependencies:**

```bash
npm install
```

**2. Set up Convex:**

This command will log you into Convex, create a new project, and generate environment variables.

```bash
npx convex dev
```

**3. Start the Development Server:**

```bash
npm run dev
```

The application will be available at [http://localhost:5174](http://localhost:5174).

### Other Commands

- **`npm run build`**: Build the application for production.
- **`npm run preview`**: Preview the production build.
- **`npm run check`**: Run type checking.
- **`npm run lint`**: Lint the codebase with ESLint and Prettier.
- **`npm test`**: Run unit tests with Vitest.
- **`npm run test:e2e`**: Run end-to-end tests with Playwright.

## Development Conventions

- **Authentication**: The application uses `@convex-dev/auth` for authentication. The authentication configuration can be found in `src/convex/auth.config.ts`.
- **Database**: The database schema is defined in `src/convex/schema.ts`. All database queries and mutations are located in the `src/convex` directory.
- **Frontend**: The frontend is built with SvelteKit. The main application page is `src/routes/+page.svelte`. Reusable components are located in `src/lib/components`.
- **Styling**: The application is styled with Tailwind CSS.
- **State Management**: The application uses Svelte stores for state management. The authentication store can be found in `src/lib/stores/auth.ts`.

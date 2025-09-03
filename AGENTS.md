# Agent Guidelines for Convex + Svelte Project

## Build/Test Commands

- **Build**: `npm run build`
- **Dev server**: `npm run dev`
- **Type check**: `npm run check`
- **Lint**: `npm run lint` (Prettier + ESLint)
- **Format**: `npm run format`
- **Test all**: `npm run test`
- **Test watch**: `npm run test:unit`
- **Test single file**: `npm run test:unit -- path/to/test.ts`
- **E2E tests**: `npm run test:e2e`
- **E2E with UI**: `npm run test:e2e:ui`
- **E2E debug**: `npm run test:e2e:debug`

## Architecture & Design Principles

### DRY (Don't Repeat Yourself)

- Extract common logic into reusable utilities in `lib/utils/`
- Create shared components for repeated UI patterns
- Use Svelte stores for shared state management
- Centralize API calls and data fetching logic
- Abstract common Convex query/mutation patterns

### SOLID Principles

- **Single Responsibility**: Each component/function has one clear purpose
- **Open/Closed**: Extend behavior through composition, not modification
- **Dependency Inversion**: Depend on abstractions (stores, utilities) not concrete implementations

### Separation of Concerns

- Keep business logic separate from UI components
- Use dedicated files for types, constants, and configurations
- Separate data fetching from presentation logic

## Directory Structure & Organization

### Recommended Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   │   ├── forms/          # Form-specific components
│   │   └── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── stores/             # Svelte stores for state management
│   ├── utils/              # Pure utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Application constants
├── routes/                 # SvelteKit routes
└── convex/                # Convex backend functions
    ├── lib/               # Shared Convex utilities
    └── schema/            # Data schema definitions
```

### File Naming

- Components: PascalCase (e.g., `UserProfile.svelte`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase with `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE in `constants.ts` files

## Component Architecture

### Component Size & Responsibility

- Keep components under 200 lines when possible
- Split large components into smaller, focused sub-components
- Each component should have a single, clear responsibility
- Use composition over inheritance

### Component Patterns

```typescript
// Good: Small, focused component
<script lang="ts">
  interface Props {
    user: User;
    onEdit?: (user: User) => void;
  }

  let { user, onEdit }: Props = $props();
</script>

// Bad: Component doing too many things
// (user management + form handling + validation + API calls)
```

### Props & Events

- Use TypeScript interfaces for prop definitions
- Prefer callback props over custom events for simple interactions
- Keep prop interfaces minimal and focused
- Use optional props with sensible defaults

## Code Reusability & Modularity

### Shared Utilities

```typescript
// lib/utils/date.ts
export function formatDate(date: Date): string {
  /* */
}
export function isToday(date: Date): boolean {
  /* */
}

// lib/utils/validation.ts
export function validateEmail(email: string): boolean {
  /* */
}
export function validateRequired(value: string): boolean {
  /* */
}
```

### Composable Logic

```typescript
// lib/stores/user.ts
import { writable } from "svelte/store";

export function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    login: (user: User) => set(user),
    logout: () => set(null),
    updateProfile: (updates: Partial<User>) =>
      update((user) => (user ? { ...user, ...updates } : null)),
  };
}
```

### Component Composition

```svelte
<!-- Good: Composable components -->
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <UserForm {user} on:submit={handleSubmit} />
  </CardContent>
</Card>
```

## Svelte-Specific Best Practices

### State Management

- Use local component state for UI-only state
- Use Svelte stores for shared application state
- Consider derived stores for computed values
- Use context for deeply nested prop passing

### Reactivity

```typescript
// Good: Clear reactive statements
$: fullName = `${user.firstName} ${user.lastName}`;
$: isValid = email.length > 0 && password.length >= 8;

// Avoid: Complex reactive blocks
$: {
  // Keep reactive blocks simple and focused
  if (user) {
    updateLastSeen(user.id);
  }
}
```

### Event Handling

```typescript
// Good: Clear, typed event handlers
function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  // Handle form submission
}

// Use event delegation for lists
function handleListClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const itemId = target.dataset.itemId;
  if (itemId) handleItemClick(itemId);
}
```

## Convex Integration Best Practices

### Query Organization

```typescript
// convex/queries/users.ts
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// convex/queries/tasks.ts
export const getTasksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

### Data Modeling

- Use meaningful table and field names
- Define proper indexes for query patterns
- Keep related data together when possible
- Use validation schemas consistently

### Real-time Patterns

```typescript
// Good: Reactive data fetching
$: tasks = $page.data.user
  ? createQuery(api.tasks.getTasksByUser, { userId: $page.data.user._id })
  : null;
```

## Performance & Optimization

### Bundle Optimization

- Use dynamic imports for route-level code splitting
- Lazy load components that aren't immediately visible
- Import only what you need from utility libraries

### Efficient Rendering

```svelte
<!-- Good: Keyed each blocks -->
{#each items as item (item.id)}
  <ItemComponent {item} />
{/each}

<!-- Good: Conditional rendering -->
{#if shouldRender}
  <ExpensiveComponent />
{/if}
```

### Convex Optimization

- Use indexes for efficient queries
- Batch related operations when possible
- Cache expensive computations in derived stores
- Use pagination for large datasets

## Playwright E2E Testing Best Practices

### Authentication Strategy

**Use Setup Projects for Authentication** (Recommended)

Follow Playwright's "Basic: shared account in all tests" pattern for tests without conflicting server-side state:

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from "playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/");

  // Wait for page to be fully loaded
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  // Handle UI state changes with retry logic for reliability
  let retries = 3;
  while (retries > 0) {
    await page.getByRole("button", { name: "Sign Up" }).click();
    await page.waitForTimeout(1000);

    try {
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible({
        timeout: 2000,
      });
      break; // Success!
    } catch {
      retries--;
      if (retries === 0) throw new Error("Failed to switch to Sign Up mode");
    }
  }

  // Complete authentication flow
  await expect(page.locator("#name")).toBeVisible({ timeout: 5000 });

  const testEmail = `test-user-${Date.now()}@playwright-test.com`;
  const testPassword = `TestPass123!${Date.now()}`;
  const testName = `Test User ${Date.now()}`;

  await page.locator("#email").fill(testEmail);
  await page.locator("#password").fill(testPassword);
  await page.locator("#name").fill(testName);

  await page.getByRole("button", { name: "Sign Up with Email" }).click();
  await expect(page.getByRole("heading", { name: "Your Tasks" })).toBeVisible({
    timeout: 15000,
  });

  // Save authenticated state for reuse
  await page.context().storageState({ path: authFile });
});
```

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Setup project runs first
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json", // Reuse auth state
      },
      dependencies: ["setup"], // Wait for setup to complete
    },
  ],
  // Add to .gitignore: playwright/.auth (contains sensitive data)
});
```

### Test Structure

**Do:**

- Start tests already authenticated (via setup project)
- Focus tests on specific functionality, not authentication
- Use descriptive test steps with `test.step()`
- Use reliable selectors (role-based preferred)
- Test one feature/workflow per test file

```typescript
test("task management workflow", async ({ page }) => {
  await page.goto("/"); // Already authenticated via setup

  await test.step("Create task", async () => {
    const taskText = "Complete project documentation";
    await page
      .getByRole("textbox", { name: "Enter a new task..." })
      .fill(taskText);
    await page.getByRole("button", { name: "Add Task" }).click();
    await expect(page.getByText(taskText)).toBeVisible();
  });

  await test.step("Mark task as complete", async () => {
    await page.getByRole("button", { name: "Mark as complete" }).click();
    await expect(
      page.getByRole("button", { name: "Mark as incomplete" }),
    ).toBeVisible();
  });
});
```

**Don't:**

- Authenticate in every test (use setup project instead)
- Test authentication logic in functional tests
- Use fragile selectors (CSS classes, complex hierarchies)
- Mix multiple unrelated features in one test

### Selector Best Practices

**Priority Order:**

1. `getByRole()` - Most reliable, semantic, accessibility-friendly
2. `getByLabel()` - Good for forms with proper labels
3. `getByText()` - Stable for unique text content
4. `locator('#id')` - When semantic options aren't available
5. CSS selectors - Last resort

```typescript
// Good: Semantic selectors
await page.getByRole("button", { name: "Mark as complete" });
await page.getByRole("textbox", { name: "Enter a new task..." });
await page.getByRole("heading", { name: "Your Tasks" });

// Acceptable: ID selectors when role isn't available
await page.locator("#name");

// Avoid: Fragile selectors
await page.locator(".btn-primary.task-button");
await page.locator("div > ul > li:first-child button");
```

### Handling UI State Changes

Use retry logic for unreliable UI interactions like mode switches:

```typescript
// Handle mode switches, loading states, dynamic content
let retries = 3;
while (retries > 0) {
  await page.getByRole("button", { name: "Toggle Mode" }).click();
  await page.waitForTimeout(1000); // Allow for state change

  try {
    await expect(page.getByText("New Mode Indicator")).toBeVisible({
      timeout: 2000,
    });
    break; // Success!
  } catch {
    retries--;
    if (retries === 0) throw new Error("Mode switch failed after retries");
  }
}
```

### File Organization

```
tests/
├── auth.setup.ts           # Authentication setup (runs first)
├── helpers/                # Shared test utilities
│   └── test-data-manager.ts
├── task-workflow.spec.ts   # Feature-specific tests
├── basic.spec.ts          # Smoke/accessibility tests
└── README.md              # Test documentation

playwright/
└── .auth/                 # Auth state files (add to .gitignore)
    └── user.json
```

### Data Management

- **Security**: Add `playwright/.auth/` to `.gitignore` (contains sensitive auth cookies)
- **Cleanup**: Clean up test data when possible to avoid pollution
- **Uniqueness**: Use unique identifiers for test data (`Date.now()`, UUIDs)
- **Isolation**: Each test should be independent and not rely on data from other tests

### Debugging

- Use `await page.pause()` for interactive debugging
- Check `test-results/` directory for screenshots and traces on failures
- Use `--debug` flag: `npx playwright test --debug`
- Verify actual UI state with page snapshots in error contexts
- Use `page.screenshot()` to capture specific moments

### Common Patterns

```typescript
// Wait for navigation/loading to complete
await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

// Handle forms with proper labels
await page.getByLabel("Email").fill("test@example.com");
await page.getByLabel("Password").fill("password123");
await page.getByRole("button", { name: "Submit" }).click();

// Verify lists/collections
const tasks = page.getByRole("listitem");
await expect(tasks).toHaveCount(3);

// Handle modals/dialogs
await page.getByRole("button", { name: "Delete" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click();

// Test persistence with page reload
await page.reload();
await expect(page.getByText("Persisted Data")).toBeVisible();
```

### When to Use Different Test Types

- **Setup Projects**: Authentication, global state setup
- **E2E Tests**: Complete user workflows, critical paths
- **Component Tests**: Individual component behavior (use Vitest for this)
- **API Tests**: Backend functionality (use Convex test utilities)

## Code Style

- **Formatting**: Use Prettier with single quotes, no trailing commas, 100 char width
- **Imports**: Use `.js` extensions in imports (e.g., `import { api } from '../convex/_generated/api.js'`)
- **TypeScript**: Strict mode enabled, use explicit types
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error handling**: Use try/catch with proper error typing (`err instanceof Error`)
- **Svelte**: Use `<script lang="ts">`, bind directives, and reactive statements
- **Tailwind**: Used for styling with custom config
- **Console logs**: OK for debugging Convex functions

## Tech Stack

- Svelte 5 + SvelteKit + TypeScript + Tailwind + Convex + Vitest + Playwright

## Development Environment

### Environment Variables

- **NEVER modify `SITE_URL`** - This is always set to the correct running port
- The dev server may run on different ports (5174, 5175, etc.) but `SITE_URL` is managed automatically
- Other environment variables are set via `npx convex env set VARIABLE_NAME value`
- Use `.env.example` as reference but never commit actual `.env` files

### Convex Integration Patterns

- Use `useConvexClient()` for mutations: `const convex = useConvexClient(); await convex.mutation(api.func, args)`
- Use `useQuery()` for queries: `let data = useQuery(api.func, args)`
- **Never use `createMutation()`** - this is not available in the current setup
- Follow existing patterns in other components for consistency

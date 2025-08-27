# Playwright E2E Tests

This directory contains end-to-end tests for the Convex + Svelte Task Management application using Playwright.

## Test Structure

### Test Files

- `task-workflow.spec.ts` - Main test suite covering the complete user workflow
- `helpers/test-data-manager.ts` - Utility class for managing test data and cleanup

### Backend Test Utils

- `src/convex/test-utils.ts` - Convex mutations for cleaning up test data

## Test Coverage

The tests cover the following workflows:

1. **Complete User Workflow**
   - User registration with email/password
   - Task creation via the form
   - Task completion by clicking the toggle
   - State persistence after page refresh
   - Toggle back to incomplete

2. **Authentication Flow**
   - User registration
   - Logout functionality
   - Login with existing credentials

3. **Task Management**
   - Creating multiple tasks
   - Marking some as completed
   - Verifying state persistence

## Running Tests

### Prerequisites

1. Make sure your Convex backend is running and deployed
2. The dev server should be available at `http://localhost:5174`

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test task-workflow.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Test Features

### Automatic Cleanup

- Each test creates a unique temporary user
- Test data is automatically cleaned up after each test
- Uses Convex mutations to remove test users and their tasks

### Realistic User Flow

- Tests actual UI interactions (clicking, typing, form submission)
- Verifies visual feedback (checkboxes, line-through text)
- Tests state persistence across page refreshes

### Isolation

- Each test uses a unique test user email
- No test interference or data pollution
- Parallel test execution supported

## Configuration

The tests are configured in `playwright.config.ts`:

- Uses Chromium browser by default
- Automatically starts dev server before tests
- Captures traces on first retry for debugging
- Generates HTML reports

## Troubleshooting

### Common Issues

1. **Convex URL not found**: Make sure `.env.local` contains `PUBLIC_CONVEX_URL`
2. **Test timeouts**: Increase timeout in test steps if needed
3. **UI element not found**: Check that selectors match the actual UI
4. **Cleanup failures**: Verify test-utils.ts is deployed to Convex

### Debug Tips

1. Use `--headed` flag to see browser interactions
2. Use `--debug` flag to step through tests
3. Check browser console for errors
4. Verify Convex deployment is accessible

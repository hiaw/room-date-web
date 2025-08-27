import { ConvexClient } from "convex/browser";

export class TestDataManager {
  private convex: ConvexClient;
  private testUsers: string[] = [];

  constructor() {
    // Use the same URL that the app uses
    const convexUrl =
      process.env.PUBLIC_CONVEX_URL || "https://formal-eel-684.convex.cloud";
    this.convex = new ConvexClient(convexUrl);
  }

  generateTestEmail(): string {
    const timestamp = Date.now();
    const email = `test-user-${timestamp}@playwright-test.com`;
    this.testUsers.push(email);
    return email;
  }

  generateTestPassword(): string {
    return "TestPassword123!";
  }

  async cleanupUser(email: string): Promise<void> {
    // Note: Test utilities are now internal functions and cannot be called directly from client
    // Manual cleanup may be needed or a separate cleanup script should be created
    console.log(
      `Test user cleanup needed for: ${email} (now requires manual cleanup)`,
    );
  }

  async cleanupAllTestUsers(): Promise<void> {
    for (const email of this.testUsers) {
      await this.cleanupUser(email);
    }
    this.testUsers = [];
  }

  async findUserByEmail(email: string) {
    // This would also need to be moved to a public query if needed for tests
    // For now, tests should not rely on this functionality
    console.log(
      `User lookup for ${email} not available (test utils are now internal)`,
    );
    return null;
  }

  getConvexClient(): ConvexClient {
    return this.convex;
  }
}

async function globalSetup() {
  console.log("🚀 Starting E2E test setup...");

  // Load environment variables
  if (process.env.NODE_ENV !== "production") {
    const fs = await import("fs");
    const path = await import("path");

    const envPath = path.resolve(".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const lines = envContent.split("\n");

      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }

      console.log("✅ Environment variables loaded from .env.local");
    }
  }

  console.log("✅ E2E test setup complete");
}

export default globalSetup;

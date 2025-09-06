import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("+page.svelte", () => {
  it("should be a valid Svelte file", () => {
    const filePath = join(import.meta.dirname, "+page.svelte");
    const content = readFileSync(filePath, "utf8");

    // Check that it's a valid Svelte component structure
    expect(content).toContain("<script");
    expect(content).toContain("</script>");
  });

  it("should import necessary dependencies", () => {
    const filePath = join(import.meta.dirname, "+page.svelte");
    const content = readFileSync(filePath, "utf8");

    // Check for expected imports
    expect(content).toContain("import { onMount, tick }");
    expect(content).toContain("useConvexClient");
    expect(content).toContain("AuthenticatedView");
    expect(content).toContain("MarketingHomepage");
  });

  it("should contain conditional rendering logic", () => {
    const filePath = join(import.meta.dirname, "+page.svelte");
    const content = readFileSync(filePath, "utf8");

    // Check for conditional rendering
    expect(content).toContain("#if $isAuthenticated");
    expect(content).toContain("AuthenticatedView");
    expect(content).toContain("{:else}");
    expect(content).toContain("MarketingHomepage");
  });

  it("should handle OAuth callback logic", () => {
    const filePath = join(import.meta.dirname, "+page.svelte");
    const content = readFileSync(filePath, "utf8");

    // Check for OAuth handling
    expect(content).toContain("onMount");
    expect(content).toContain("URLSearchParams");
    expect(content).toContain("code");
    expect(content).toContain("oauth_verifier");
  });
});

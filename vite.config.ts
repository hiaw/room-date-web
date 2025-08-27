import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 5174,
    host: "0.0.0.0", // Allow external connections (useful for mobile testing)
    strictPort: true,
  },
  // Mobile-first optimizations
  build: {
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ["svelte"],
          convex: ["convex", "convex-svelte", "@convex-dev/auth"],
          ui: ["lucide-svelte"],
        },
      },
    },
    // Optimize for mobile networks
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
  },
  // Optimize dependencies for mobile
  optimizeDeps: {
    include: ["convex", "convex-svelte", "@convex-dev/auth", "date-fns"],
  },
  // Mobile-friendly preview options
  preview: {
    port: 4173,
    host: "0.0.0.0",
    strictPort: true,
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: fs.existsSync("./tests/setup.ts") ? ["./tests/setup.ts"] : [],
    passWithNoTests: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", ".next", "anas-ai-portfolio-blueprint", "tests"],
    },
  },
  resolve: {
    alias: [
      { find: "@/app", replacement: path.resolve(__dirname, "./app") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});

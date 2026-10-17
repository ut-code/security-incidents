import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "static-404-fallback",
      apply: "build",
      writeBundle(output) {
        if (output.dir) {
          const indexFile = resolve(output.dir, "index.html");
          copyFileSync(indexFile, resolve(output.dir, "404.html"));
        }
      },
    },
  ],
});

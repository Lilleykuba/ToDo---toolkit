import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure the build directory is set correctly
    assetsDir: "assets", // Avoid issues with asset serving
  },
  base: "/",
});

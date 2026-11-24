import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ruta base del sitio: "/" en local; el workflow de GitHub Pages define BASE_PATH
  base: process.env.BASE_PATH || "/",
});

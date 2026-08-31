import { defineConfig } from "vite";

// Base relative: indispensable pour Tauri, qui sert les fichiers depuis
// un protocole local et non depuis la racine d'un domaine.
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
  server: {
    port: 5180,
    strictPort: true,
  },
});

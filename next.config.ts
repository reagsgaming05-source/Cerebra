import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse embarque pdfjs-dist qui charge son worker via un import dynamique.
  // Sous le bundler Turbopack du dev server, le chemin du worker ne se résout pas
  // (erreur "Setting up fake worker failed: Cannot find module ...pdf.worker.mjs").
  // En externalisant le package, Next le require depuis node_modules à l'exécution et
  // l'import du worker se résout sur disque (comme en Node standalone).
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;

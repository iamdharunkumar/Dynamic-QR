import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), tanstackRouter({}), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["unsooty-janae-perceptive.ngrok-free.dev"],
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/rpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Proxy 6-character alphanumeric paths (short codes) to backend
      "^/[a-zA-Z0-9]{6}$": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

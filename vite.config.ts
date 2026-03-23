import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        action: resolve(__dirname, "action.html"),
        settings: resolve(__dirname, "settings.html"),
        background: resolve(__dirname, "background.html"),
        contextMenu: resolve(__dirname, "contextMenu.html"),
        statblockSearch: resolve(__dirname, "statblockSearch.html"),
        statblockViewer: resolve(__dirname, "statblockViewer.html"),
        statblockBuilder: resolve(__dirname, "statblockBuilder.html"),
        resourceCalculator: resolve(__dirname, "resourceCalculator.html"),
      },
    },
  },
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
});

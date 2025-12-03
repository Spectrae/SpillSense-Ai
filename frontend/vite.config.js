// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the crucial part for API integration
    proxy: {
      // All requests starting with /api will be sent to the backend at port 5000
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false, // Use false if your backend is plain HTTP
        // The rewrite rule is optional, but often useful if your backend root is the API
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

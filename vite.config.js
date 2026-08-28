import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA — build output goes to dist/ (deploy that to Netlify/Vercel/etc).
export default defineConfig({
  plugins: [react()],
});

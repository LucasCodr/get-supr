import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), TanStackRouterVite(), react()],
  server: {
    port: 3000,
    host: "web.superdapp.dev",
    https: {
      cert: "./cert/superdapp.pem",
      key: "./cert/superdapp-key.pem",
    },
  },
});

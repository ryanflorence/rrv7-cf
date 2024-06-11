import { vitePlugin as react } from "@react-router/dev";
import { reactRouterCloudflareDevProxy } from "./tmp_modules/cloudflare-vite-dev-proxy/index";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouterCloudflareDevProxy(), react(), tsconfigPaths()],
});

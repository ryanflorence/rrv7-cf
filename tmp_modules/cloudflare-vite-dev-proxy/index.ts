import { createRequestHandler } from "@react-router/server-runtime";
import {
  type AppLoadContext,
  type ServerBuild,
} from "@react-router/server-runtime";
import { type Plugin } from "vite";
import {
  type GetPlatformProxyOptions,
  type PlatformProxy,
  getPlatformProxy,
} from "wrangler";

import { fromNodeRequest, toNodeRequest } from "./node-adapter";

let serverBuildId = "virtual:react-router/server-build";

type CfProperties = Record<string, unknown>;

type LoadContext<Env, Cf extends CfProperties> = {
  cloudflare: Omit<PlatformProxy<Env, Cf>, "dispose">;
};

type GetLoadContext<Env, Cf extends CfProperties> = (args: {
  request: Request;
  context: LoadContext<Env, Cf>;
}) => AppLoadContext | Promise<AppLoadContext>;

const PLUGIN_NAME = "react-router-cloudflare-vite-dev-proxy";

export const reactRouterCloudflareDevProxy = <Env, Cf extends CfProperties>({
  getLoadContext,
  ...options
}: {
  getLoadContext?: GetLoadContext<Env, Cf>;
} & GetPlatformProxyOptions = {}): Plugin => {
  return {
    name: PLUGIN_NAME,
    config: () => ({
      ssr: {
        resolve: {
          externalConditions: ["workerd", "worker"],
        },
      },
    }),
    configResolved: (viteConfig) => {
      let pluginIndex = (name: string) =>
        viteConfig.plugins.findIndex((plugin) => plugin.name === name);
      let reactRouterPluginIndex = pluginIndex("react-router");
      if (
        reactRouterPluginIndex >= 0 &&
        reactRouterPluginIndex < pluginIndex(PLUGIN_NAME)
      ) {
        throw new Error(
          `The "${PLUGIN_NAME}" plugin should be placed before the React Router plugin in your Vite config file`
        );
      }
    },
    configureServer: async (viteDevServer) => {
      // Do not include `dispose` in Cloudflare context
      let { dispose, ...cloudflare } = await getPlatformProxy<Env, Cf>(options);
      let context = { cloudflare };
      return () => {
        if (!viteDevServer.config.server.middlewareMode) {
          viteDevServer.middlewares.use(async (nodeReq, nodeRes, next) => {
            try {
              let build = (await viteDevServer.ssrLoadModule(
                serverBuildId
              )) as ServerBuild;

              let handler = createRequestHandler(build, "development");
              let req = fromNodeRequest(nodeReq);
              let loadContext = getLoadContext
                ? await getLoadContext({ request: req, context })
                : context;
              let res = await handler(req, loadContext);
              await toNodeRequest(res, nodeRes);
            } catch (error) {
              next(error);
            }
          });
        }
      };
    },
  };
};

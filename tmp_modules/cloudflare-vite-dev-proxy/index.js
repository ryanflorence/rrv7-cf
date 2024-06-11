/**
 * @react-router/cloudflare-vite-dev-proxy v0.0.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serverRuntime = require('@react-router/server-runtime');
var wrangler = require('wrangler');
var nodeAdapter = require('./node-adapter.js');

let serverBuildId = "virtual:react-router/server-build";
const PLUGIN_NAME = "react-router-cloudflare-vite-dev-proxy";
const reactRouterCloudflareDevProxy = ({
  getLoadContext,
  ...options
} = {}) => {
  return {
    name: PLUGIN_NAME,
    config: () => ({
      ssr: {
        resolve: {
          externalConditions: ["workerd", "worker"]
        }
      }
    }),
    configResolved: viteConfig => {
      let pluginIndex = name => viteConfig.plugins.findIndex(plugin => plugin.name === name);
      let reactRouterPluginIndex = pluginIndex("react-router");
      if (reactRouterPluginIndex >= 0 && reactRouterPluginIndex < pluginIndex(PLUGIN_NAME)) {
        throw new Error(`The "${PLUGIN_NAME}" plugin should be placed before the React Router plugin in your Vite config file`);
      }
    },
    configureServer: async viteDevServer => {
      // Do not include `dispose` in Cloudflare context
      let {
        dispose,
        ...cloudflare
      } = await wrangler.getPlatformProxy(options);
      let context = {
        cloudflare
      };
      return () => {
        if (!viteDevServer.config.server.middlewareMode) {
          viteDevServer.middlewares.use(async (nodeReq, nodeRes, next) => {
            try {
              let build = await viteDevServer.ssrLoadModule(serverBuildId);
              let handler = serverRuntime.createRequestHandler(build, "development");
              let req = nodeAdapter.fromNodeRequest(nodeReq);
              let loadContext = getLoadContext ? await getLoadContext({
                request: req,
                context
              }) : context;
              let res = await handler(req, loadContext);
              await nodeAdapter.toNodeRequest(res, nodeRes);
            } catch (error) {
              next(error);
            }
          });
        }
      };
    }
  };
};

exports.reactRouterCloudflareDevProxy = reactRouterCloudflareDevProxy;

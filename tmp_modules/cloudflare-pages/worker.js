/**
 * @react-router/cloudflare-pages v0.0.0
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

function createRequestHandler({
  build,
  mode,
  getLoadContext = ({
    context
  }) => ({
    ...context,
    cloudflare: {
      ...context.cloudflare,
      cf: context.cloudflare.request.cf
    }
  })
}) {
  let handleRequest = serverRuntime.createRequestHandler(build, mode);
  return async cloudflare => {
    let loadContext = await getLoadContext({
      request: cloudflare.request,
      context: {
        cloudflare: {
          ...cloudflare,
          cf: cloudflare.request.cf,
          ctx: {
            waitUntil: cloudflare.waitUntil,
            passThroughOnException: cloudflare.passThroughOnException
          },
          caches
        }
      }
    });
    return handleRequest(cloudflare.request, loadContext);
  };
}
function createPagesFunctionHandler({
  build,
  getLoadContext,
  mode
}) {
  let handleRequest = createRequestHandler({
    build,
    getLoadContext,
    mode
  });
  let handleFetch = async context => {
    let response;
    // https://github.com/cloudflare/wrangler2/issues/117
    context.request.headers.delete("if-none-match");
    try {
      response = await context.env.ASSETS.fetch(context.request.url, context.request.clone());
      response = response && response.status >= 200 && response.status < 400 ? new Response(response.body, response) : undefined;
    } catch {}
    if (!response) {
      response = await handleRequest(context);
    }
    return response;
  };
  return async context => {
    try {
      return await handleFetch(context);
    } catch (error) {
      if (process.env.NODE_ENV === "development" && error instanceof Error) {
        console.error(error);
        return new Response(error.message || error.toString(), {
          status: 500
        });
      }
      return new Response("Internal Error", {
        status: 500
      });
    }
  };
}

exports.createPagesFunctionHandler = createPagesFunctionHandler;
exports.createRequestHandler = createRequestHandler;

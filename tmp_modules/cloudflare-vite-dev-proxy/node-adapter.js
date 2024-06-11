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

var node_events = require('node:events');
var node_stream = require('node:stream');
var setCookieParser = require('set-cookie-parser');
var node = require('@react-router/node');
var invariant = require('./invariant.js');

function fromNodeHeaders(nodeHeaders) {
  let headers = new Headers();
  for (let [key, values] of Object.entries(nodeHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }
  return headers;
}
// Based on `createRemixRequest` in server.ts from @react-router/express
function fromNodeRequest(nodeReq) {
  let origin = nodeReq.headers.origin && "null" !== nodeReq.headers.origin ? nodeReq.headers.origin : `http://${nodeReq.headers.host}`;
  // Use `req.originalUrl` so React Router is aware of the full path
  invariant["default"](nodeReq.originalUrl, "Expected `nodeReq.originalUrl` to be defined");
  let url = new URL(nodeReq.originalUrl, origin);
  let init = {
    method: nodeReq.method,
    headers: fromNodeHeaders(nodeReq.headers)
  };
  if (nodeReq.method !== "GET" && nodeReq.method !== "HEAD") {
    init.body = node.createReadableStreamFromReadable(nodeReq);
    init.duplex = "half";
  }
  return new Request(url.href, init);
}
// Adapted from solid-start's `handleNodeResponse`:
// https://github.com/solidjs/solid-start/blob/7398163869b489cce503c167e284891cf51a6613/packages/start/node/fetch.js#L162-L185
async function toNodeRequest(res, nodeRes) {
  nodeRes.statusCode = res.status;
  nodeRes.statusMessage = res.statusText;
  let cookiesStrings = [];
  for (let [name, value] of res.headers) {
    if (name === "set-cookie") {
      cookiesStrings.push(...setCookieParser.splitCookiesString(value));
    } else nodeRes.setHeader(name, value);
  }
  if (cookiesStrings.length) {
    nodeRes.setHeader("set-cookie", cookiesStrings);
  }
  if (res.body) {
    // https://github.com/microsoft/TypeScript/issues/29867
    let responseBody = res.body;
    let readable = node_stream.Readable.from(responseBody);
    readable.pipe(nodeRes);
    await node_events.once(readable, "end");
  } else {
    nodeRes.end();
  }
}

exports.fromNodeRequest = fromNodeRequest;
exports.toNodeRequest = toNodeRequest;

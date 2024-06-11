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

function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    console.error("The following error is a bug; please open an issue! https://github.com/remix-run/react-router-cloudflare/issues/new");
    throw new Error(message);
  }
}

exports["default"] = invariant;

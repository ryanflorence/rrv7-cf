/**
 * @react-router/cloudflare v0.0.0
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

const encoder = new TextEncoder();
const sign = async (value, secret) => {
  let key = await createKey(secret, ["sign"]);
  let data = encoder.encode(value);
  let signature = await crypto.subtle.sign("HMAC", key, data);
  let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "");
  return value + "." + hash;
};
const unsign = async (signed, secret) => {
  let index = signed.lastIndexOf(".");
  let value = signed.slice(0, index);
  let hash = signed.slice(index + 1);
  let key = await createKey(secret, ["verify"]);
  let data = encoder.encode(value);
  let signature = byteStringToUint8Array(atob(hash));
  let valid = await crypto.subtle.verify("HMAC", key, signature, data);
  return valid ? value : false;
};
async function createKey(secret, usages) {
  let key = await crypto.subtle.importKey("raw", encoder.encode(secret), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, usages);
  return key;
}
function byteStringToUint8Array(byteString) {
  let array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }
  return array;
}

exports.sign = sign;
exports.unsign = unsign;

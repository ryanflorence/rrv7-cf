/// <reference types="@cloudflare/workers-types" />
import type { SessionStorage, SessionIdStorageStrategy, SessionData } from "@react-router/server-runtime";
interface WorkersKVSessionStorageOptions {
    /**
     * The Cookie used to store the session id on the client, or options used
     * to automatically create one.
     */
    cookie?: SessionIdStorageStrategy["cookie"];
    /**
     * The KVNamespace used to store the sessions.
     */
    kv: KVNamespace;
}
/**
 * Creates a SessionStorage that stores session data in the Clouldflare KV Store.
 *
 * The advantage of using this instead of cookie session storage is that
 * KV Store may contain much more data than cookies.
 */
export declare function createWorkersKVSessionStorage<Data = SessionData, FlashData = Data>({ cookie, kv, }: WorkersKVSessionStorageOptions): SessionStorage<Data, FlashData>;
export {};

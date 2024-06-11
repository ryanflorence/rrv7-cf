import type { AppLoadContext, ServerBuild } from "@react-router/server-runtime";
import { type CacheStorage } from "@cloudflare/workers-types";
/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */
export type GetLoadContextFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (args: {
    request: Request;
    context: {
        cloudflare: EventContext<Env, Params, Data> & {
            cf: EventContext<Env, Params, Data>["request"]["cf"];
            ctx: {
                waitUntil: EventContext<Env, Params, Data>["waitUntil"];
                passThroughOnException: EventContext<Env, Params, Data>["passThroughOnException"];
            };
            caches: CacheStorage;
        };
    };
}) => AppLoadContext | Promise<AppLoadContext>;
export type RequestHandler<Env = any> = PagesFunction<Env>;
export interface createPagesFunctionHandlerParams<Env = any> {
    build: ServerBuild | (() => ServerBuild | Promise<ServerBuild>);
    getLoadContext?: GetLoadContextFunction<Env>;
    mode?: string;
}
export declare function createRequestHandler<Env = any>({ build, mode, getLoadContext, }: createPagesFunctionHandlerParams<Env>): RequestHandler<Env>;
export declare function createPagesFunctionHandler<Env = any>({ build, getLoadContext, mode, }: createPagesFunctionHandlerParams<Env>): (context: EventContext<Env, any, any>) => Promise<Response>;

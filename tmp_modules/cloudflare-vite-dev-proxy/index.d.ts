import { type AppLoadContext } from "@react-router/server-runtime";
import { type Plugin } from "vite";
import { type GetPlatformProxyOptions, type PlatformProxy } from "wrangler";
type CfProperties = Record<string, unknown>;
type LoadContext<Env, Cf extends CfProperties> = {
    cloudflare: Omit<PlatformProxy<Env, Cf>, "dispose">;
};
type GetLoadContext<Env, Cf extends CfProperties> = (args: {
    request: Request;
    context: LoadContext<Env, Cf>;
}) => AppLoadContext | Promise<AppLoadContext>;
export declare const reactRouterCloudflareDevProxy: <Env, Cf extends CfProperties>({ getLoadContext, ...options }?: {
    getLoadContext?: GetLoadContext<Env, Cf>;
} & GetPlatformProxyOptions) => Plugin;
export {};
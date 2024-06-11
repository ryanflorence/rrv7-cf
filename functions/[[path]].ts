// functions/[[path]].ts
import { createPagesFunctionHandler } from "../tmp_modules/cloudflare-pages/index";

import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({ build });

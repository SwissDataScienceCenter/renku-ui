import { serverOnly$ } from "vite-env-only/macros";

import { CONFIG_JSON } from "~/utils/.server/config.constants";

/**
 * Can be imported both client-side and server-side,
 * will evaluate to `CONFIG_JSON` server-side and `undefined` client-side.
 */
export const CONFIG_JSON_SERVER_ONLY = serverOnly$(CONFIG_JSON);

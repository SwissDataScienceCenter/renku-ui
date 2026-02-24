import {
  index,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

import { RELATIVE_ROUTES } from "./routing/routes.constants";

/**
 * Routes
 *
 * Docs:
 * - https://reactrouter.com/api/framework-conventions/routes.ts
 * - https://reactrouter.com/start/framework/routing
 */

export default [
  // Help pages
  route(RELATIVE_ROUTES.v2.help.root, "routes/help/root.tsx", [
    index("routes/help/index.tsx"),
    route(RELATIVE_ROUTES.v2.help.status, "routes/help/status.tsx"),
    route(RELATIVE_ROUTES.v2.help.release, "routes/help/release.tsx"),
    route(RELATIVE_ROUTES.v2.help.tos, "routes/help/tos.tsx"),
    route(RELATIVE_ROUTES.v2.help.privacy, "routes/help/privacy.tsx"),
  ]),
  // Not found page for /help/*
  route(`${RELATIVE_ROUTES.v2.help.root}/*`, "routes/help/catchall.tsx"),
  // Some project pages
  ...prefix("p", [
    route(":namespace/:slug", "routes/projects/root.tsx", [
      index("routes/projects/index.tsx"),
      route(
        RELATIVE_ROUTES.v2.projects.show.settings,
        "routes/projects/settings.tsx"
      ),
    ]),
  ]),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "routes/catchall.tsx"),
] satisfies RouteConfig;

import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * Routes
 *
 * Docs:
 * - https://reactrouter.com/api/framework-conventions/routes.ts
 * - https://reactrouter.com/start/framework/routing
 */

export default [
  // Help pages
  route("help", "routes/help/root.tsx", [index("routes/help/index.tsx")]),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "routes/catchall.tsx"),
] satisfies RouteConfig;

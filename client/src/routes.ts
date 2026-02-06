import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "routes/catchall.tsx"),
  route("/sentry-example-page", "routes/sentry-example-page.tsx"),
  route("/ui/api/sentry-example-api", "routes/api.sentry-example-api.ts"),
] satisfies RouteConfig;

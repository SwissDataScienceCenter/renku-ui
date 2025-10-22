import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "routes/catchall.tsx"),
] satisfies RouteConfig;

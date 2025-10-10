import AppRoot from "~/index";

import { data, type LoaderFunctionArgs } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

type RouteGroup = Record<string, string> | Record<string, unknown>;
type Route = string | RouteGroup;

function routeGroupToPaths(routeGroup: RouteGroup): string[] {
  return Object.entries(routeGroup).flatMap(([, route]) =>
    routeToPaths(route as Route)
  );
}

function routeToPaths(route: Route) {
  if (typeof route === "string") {
    return route == "/" ? [] : [route];
  }
  return routeGroupToPaths(route as RouteGroup);
}

function routeToStaticPart(route: string) {
  const parts = route.split("/");
  const staticParts = [];
  for (const part of parts) {
    if (part.startsWith(":") || part.startsWith("*")) break;
    staticParts.push(part);
  }
  return staticParts.join("/");
}

const KNOWN_ROUTES_SET = new Set(
  routeGroupToPaths(ABSOLUTE_ROUTES).map((route) => routeToStaticPart(route))
);
const KNOWN_ROUTES = [...Array.from(KNOWN_ROUTES_SET), "/v2", "/admin"];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname;
  const isKnownRoute =
    path == "/" || KNOWN_ROUTES.some((route) => path.startsWith(route));
  if (!isKnownRoute) {
    throw data("Not Found", { status: 404 });
  }
  return data({});
}

export default function Component() {
  return <AppRoot />;
}

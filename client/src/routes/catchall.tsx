import { data, useOutletContext } from "react-router";

import AppRoot from "~/index";
import type { RootOutletContext } from "~/root";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
// import { CONFIG_JSON } from "~server/constants";
import type { Route } from "./+types/catchall";

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

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const path = url.pathname;
  const isKnownRoute =
    path == "/" || KNOWN_ROUTES.some((route) => path.startsWith(route));
  if (!isKnownRoute) {
    throw data("Not Found", { status: 404, statusText: "Not Found" });
  }
  return data(null);
  // const clientSideFetch =
  //   process.env.NODE_ENV === "development" || process.env.CYPRESS === "1";
  // if (clientSideFetch) {
  //   return data({ config: undefined, clientSideFetch } as const);
  // }

  // //? In production, directly load what we would return for /config.json
  // return data({ config: CONFIG_JSON, clientSideFetch } as const);
}

// export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
//   const { config, clientSideFetch } = await serverLoader();
//   //? Load the config.json contents from localhost in development
//   if (clientSideFetch) {
//     const configResponse = await fetch("/config.json");
//     const configData = await configResponse.json();
//     return { config: configData as typeof CONFIG_JSON, clientSideFetch };
//   }
//   return { config, clientSideFetch };
// }
// clientLoader.hydrate = true as const;

export default function Component() {
  const { params } = useOutletContext<RootOutletContext>();

  // const { config } = loaderData;
  // if (config == null) {
  //   return null;
  // }
  // return <AppRoot config={config} />;

  return <AppRoot params={params} />;
}

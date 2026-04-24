import { data, redirect } from "react-router";

import ClientSideCheckForRedirects from "~/features/legacy/ClientSideCheckForRedirects";
import NoLegacySupportForProjects from "~/features/legacy/NoLegacySupportForProjects";
import { platformApi } from "~/features/platform/api/platform.api";
import { locationPathnameToSourceUrl } from "~/features/platform/api/platform.utils";
import { storeContext } from "~/store/store.utils.server";
import type { Route } from "./+types/projects";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the redirects data client-side
    return data({
      clientSideFetch,
      redirectPlan: undefined,
      error: undefined,
    });
  }

  //? Otherwise, we load the redirects data to send a redirect if there is one
  const splat = params["*"];
  const sourceUrl = locationPathnameToSourceUrl(splat);
  if (!sourceUrl) {
    // The is no project slug to try to redirect to
    return data({ clientSideFetch, redirectPlan: undefined, error: undefined });
  }

  const url = new URL(request.url);
  const autostart = !!url.searchParams.get("autostart");

  const endpoint = platformApi.endpoints.getPlatformRedirectsBySourceUrl;
  const apiArgs = { sourceUrl };
  store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(store.dispatch(platformApi.util.getRunningQueriesThunk()));
  const selector = endpoint.select(apiArgs);
  const { data: redirectPlan, error } = selector(store.getState());
  store.dispatch(platformApi.util.resetApiState());
  if (error && "status" in error && typeof error.status === "number") {
    if (error.status == 404) {
      // Ignore 404s: there is no redirect
      return data({
        clientSideFetch,
        redirectPlan: undefined,
        error: undefined,
      });
    }
    return data({ clientSideFetch, redirectPlan, error }, error.status);
  }

  // Send redirect response if we found a match
  if (redirectPlan?.target_url != null) {
    const redirectUrl = new URL(redirectPlan.target_url, request.url);
    if (autostart) {
      redirectUrl.search = new URLSearchParams({
        autostartRedirect: "true",
      }).toString();
    }
    return redirect(redirectUrl.toString(), 301);
  }

  return data({ clientSideFetch, redirectPlan, error });
}

//? NOTE: we do not provide a client-side loader since there is no
//? navigation link to legacy pages in the UI.

export default function LegacyProjectPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (loaderData.clientSideFetch) {
    return <ClientSideCheckForRedirects projectSlug={params["*"]} />;
  }
  return <NoLegacySupportForProjects />;
}

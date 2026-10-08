import { useEffect } from "react";
import {
  data,
  generatePath,
  redirect,
  useLocation,
  useNavigate,
  type MetaDescriptor,
} from "react-router";

import { Loader } from "~/components/Loader";
import { type Project } from "~/features/projectsV2/api/projectV2.api";
import {
  projectV2Api,
  useGetProjectsByProjectIdQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import ProjectNotFound from "~/features/projectsV2/notFound/ProjectNotFound";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/projects";

// Stable link to a project page: `/id/p/:id/:path*` redirects to `/p/:namespace/:slug/:path*`, keeping the query string.

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we resolve the project client-side
    return data({ clientSideFetch, error: undefined });
  }

  const { id: projectId } = params;
  const endpoint = projectV2Api.endpoints.getProjectsByProjectId;
  const apiArgs = { projectId };
  store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = endpoint.select(apiArgs);
  const { data: project, error } = projectSelector(store.getState());
  store.dispatch(projectV2Api.util.resetApiState());

  if (project != null) {
    const url = new URL(request.url);
    throw redirect(makeRedirectUrl(project, projectId, url));
  }
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, error }, error.status);
  }
  return data({ clientSideFetch, error });
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  //? Client-side navigation: resolve the project (or use cached data) and redirect
  const { id: projectId } = params;
  const endpoint = projectV2Api.endpoints.getProjectsByProjectId;
  const apiArgs = { projectId };
  const promise = store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = endpoint.select(apiArgs);
  const { data: project, error } = projectSelector(store.getState());
  //? Unsubscribe to let the cache expire when navigating to other pages
  promise.unsubscribe();

  if (project != null) {
    const url = new URL(request.url);
    throw redirect(makeRedirectUrl(project, projectId, url));
  }
  return { clientSideFetch: false, error };
}

const metaNotFound = makeMeta({
  title: makeMetaTitle(["Project Not Found", "Renku"]),
});

export function meta({ loaderData }: Route.MetaArgs): MetaDescriptor[] {
  if (loaderData.clientSideFetch) {
    return makeMeta({ title: makeMetaTitle(["Project stable link", "Renku"]) });
  }
  return metaNotFound;
}

export default function ProjectByIdRedirect({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (loaderData.clientSideFetch) {
    return <ClientSideProjectByIdRedirect projectId={params.id} />;
  }
  return <ProjectNotFound error={loaderData.error} />;
}

function ClientSideProjectByIdRedirect({ projectId }: { projectId: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    data: project,
    isLoading,
    error,
  } = useGetProjectsByProjectIdQuery({ projectId });

  useEffect(() => {
    if (project != null) {
      navigate(makeRedirectUrl(project, projectId, location), {
        replace: true,
      });
    }
  }, [location, navigate, project, projectId]);

  if (isLoading || project != null) {
    return <Loader className="align-self-center" />;
  }
  return <ProjectNotFound error={error} />;
}

function makeRedirectUrl(
  project: Pick<Project, "namespace" | "slug">,
  projectId: string,
  location: { pathname: string; search: string; hash: string },
): string {
  const previousBasePath = generatePath(ABSOLUTE_ROUTES.v2.byId.projects.root, {
    id: projectId,
  });
  const deltaUrl = location.pathname.slice(previousBasePath.length);
  const newBasePath = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace,
    slug: project.slug,
  });
  return `${newBasePath}${deltaUrl}${location.search}${location.hash}`;
}

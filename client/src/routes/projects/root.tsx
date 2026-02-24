import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import {
  data,
  generatePath,
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  type MetaDescriptor,
} from "react-router";

import { Loader } from "~/components/Loader";
import ProjectPageLayout from "~/features/ProjectPageV2/ProjectPageLayout/ProjectPageLayout";
import { type Project } from "~/features/projectsV2/api/projectV2.api";
import { projectV2Api } from "~/features/projectsV2/api/projectV2.enhanced-api";
import ProjectNotFound from "~/features/projectsV2/notFound/ProjectNotFound";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/root";

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch =
    store == null ||
    process.env.NODE_ENV === "development" ||
    process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In development, we do not load the project data client-side
    return data({
      clientSideFetch,
      project: undefined,
      error: undefined,
    });
  }

  //? In production, we load the project data to generate meta tags
  const { namespace, slug } = params;
  const endpoint =
    projectV2Api.endpoints.getNamespacesByNamespaceProjectsAndSlug;
  const apiArgs = {
    namespace,
    slug,
    withDocumentation: true,
  };
  store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = endpoint.select(apiArgs);
  const { data: project, error } = projectSelector(store.getState());
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, project, error }, error.status);
  }
  return data({ clientSideFetch, project, error });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  //? We fetch (or use cached data) on the client-side to allow the meta() function to work as intended
  const { namespace, slug } = params;
  const endpoint =
    projectV2Api.endpoints.getNamespacesByNamespaceProjectsAndSlug;
  const apiArgs = {
    namespace,
    slug,
    withDocumentation: true,
  };
  store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = endpoint.select(apiArgs);
  const { data: project, error } = projectSelector(store.getState());
  return {
    clientSideFetch: true,
    project,
    error,
  };
}

const metaNotFound = makeMeta({
  title: makeMetaTitle(["Project Not Found", "Renku"]),
});
const metaError = makeMeta({
  title: makeMetaTitle(["Error", "Renku"]),
});

export function meta({
  loaderData,
  location,
}: Route.MetaArgs): MetaDescriptor[] {
  const { project, error } = loaderData;
  if (error && "status" in error && error.status == 404) {
    return metaNotFound;
  }
  if (error) {
    return metaError;
  }
  if (project == null) {
    return makeMeta({ title: makeMetaTitle(["Project Page", "Renku"]) });
  }

  const matchSettings = matchPath(
    ABSOLUTE_ROUTES.v2.projects.show.settings,
    location.pathname
  );
  const title = makeMetaTitle([
    ...(matchSettings ? ["Settings"] : []),
    project.name,
    `Project in @${project.namespace}`,
    "Renku",
  ]);
  return makeMeta({
    title,
    description: project.description || undefined,
  });
}

export default function ProjectPagesRoot({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { namespace, slug } = params;

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  //? Inject the server-side data into the RTK Query cache
  useEffect(() => {
    if (loaderData.project != null) {
      const apiArgs = {
        namespace,
        slug,
        withDocumentation: true,
      };
      dispatch(
        projectV2Api.util.upsertQueryData(
          "getNamespacesByNamespaceProjectsAndSlug",
          apiArgs,
          loaderData.project
        )
      );
    }
  }, [dispatch, loaderData.project, namespace, slug]);

  //? Load the project data client-side if it did not load server-side
  projectV2Api.endpoints.getNamespacesByNamespaceProjectsAndSlug.useQuerySubscription(
    loaderData.project == null
      ? { namespace, slug, withDocumentation: true }
      : skipToken
  );

  const {
    currentData: project,
    isLoading,
    error,
  } = projectV2Api.endpoints.getNamespacesByNamespaceProjectsAndSlug.useQueryState(
    {
      namespace,
      slug,
      withDocumentation: true,
    }
  );

  useEffect(() => {
    if (namespace && project && project.namespace !== namespace) {
      const previousBasePath = generatePath(
        ABSOLUTE_ROUTES.v2.projects.show.root,
        {
          namespace: namespace,
          slug: project.slug,
        }
      );
      const deltaUrl = pathname.slice(previousBasePath.length);
      const newUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      });
      navigate(newUrl + deltaUrl, { replace: true });
    } else if (slug && project && project.slug !== slug) {
      const previousBasePath = generatePath(
        ABSOLUTE_ROUTES.v2.projects.show.root,
        {
          namespace: project.namespace,
          slug: slug,
        }
      );
      const deltaUrl = pathname.slice(previousBasePath.length);
      const newUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      });
      navigate(newUrl + deltaUrl, { replace: true });
    }
  }, [namespace, navigate, pathname, project, slug]);

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || project == null) {
    return <ProjectNotFound error={error} />;
  }

  return (
    <ProjectPageLayout project={project}>
      <Outlet context={{ project } satisfies ContextType} />
    </ProjectPageLayout>
  );
}

type ContextType = { project: Project };

export function useProject() {
  return useOutletContext<ContextType>();
}

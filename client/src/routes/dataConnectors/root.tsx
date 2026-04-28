import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import {
  data,
  generatePath,
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  type MetaDescriptor,
} from "react-router";

import { Loader } from "~/components/Loader";
import {
  dataConnectorsApi,
  useGetNamespacesByNamespaceDataConnectorsAndSlugQuery,
  useGetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugQuery,
} from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import DataConnectorPageLayout from "~/features/dataConnectorsV2/show/DataConnectorPageLayout";
import { NamespaceContextType } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import renkuDataConnectorSocialCard from "~/styles/assets/renkuDataSocialCard.png";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/root";

// We have 3 different scopes for API, each one with different APIs.
// Global, user/group-scoped, project-scoped
type DataConnectorLookup =
  | {
      kind: "project";
      namespace: string;
      project: string;
      slug: string;
    }
  | {
      kind: "namespace";
      namespace: string;
      slug: string;
    }
  | {
      kind: "global";
      slug: string;
    };

function getDataConnectorLookup(
  params: Route.LoaderArgs["params"]
): DataConnectorLookup {
  const { projectNamespace, dataConnectorNamespace, slug } = params;

  if (projectNamespace && dataConnectorNamespace) {
    return {
      kind: "project",
      namespace: projectNamespace,
      project: dataConnectorNamespace,
      slug,
    };
  }

  if (projectNamespace) {
    return {
      kind: "namespace",
      namespace: projectNamespace,
      slug,
    };
  }

  return {
    kind: "global",
    slug,
  };
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    return data({
      clientSideFetch,
      dataConnector: undefined,
      error: undefined,
    });
  }

  const lookup = getDataConnectorLookup(params);
  let dataConnector;
  let error;

  if (lookup.kind === "project") {
    const endpoint =
      dataConnectorsApi.endpoints
        .getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug;
    const apiArgs = {
      namespace: lookup.namespace,
      project: lookup.project,
      slug: lookup.slug,
    };

    store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
  } else if (lookup.kind === "namespace") {
    const endpoint =
      dataConnectorsApi.endpoints.getNamespacesByNamespaceDataConnectorsAndSlug;
    const apiArgs = {
      namespace: lookup.namespace,
      slug: lookup.slug,
    };

    store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
  } else {
    const endpoint = dataConnectorsApi.endpoints.getDataConnectorsGlobalBySlug;
    const apiArgs = {
      slug: lookup.slug,
    };

    store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
  }

  store.dispatch(dataConnectorsApi.util.resetApiState());
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, dataConnector, error }, error.status);
  }

  return data({ clientSideFetch, dataConnector, error });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const lookup = getDataConnectorLookup(params);

  let dataConnector;
  let error;

  if (lookup.kind === "project") {
    const endpoint =
      dataConnectorsApi.endpoints
        .getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug;
    const apiArgs = {
      namespace: lookup.namespace,
      project: lookup.project,
      slug: lookup.slug,
    };

    const promise = store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
    promise.unsubscribe();
  } else if (lookup.kind === "namespace") {
    const endpoint =
      dataConnectorsApi.endpoints.getNamespacesByNamespaceDataConnectorsAndSlug;
    const apiArgs = {
      namespace: lookup.namespace,
      slug: lookup.slug,
    };

    const promise = store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
    promise.unsubscribe();
  } else {
    const endpoint = dataConnectorsApi.endpoints.getDataConnectorsGlobalBySlug;
    const apiArgs = {
      slug: lookup.slug,
    };

    const promise = store.dispatch(endpoint.initiate(apiArgs));
    await Promise.all(
      store.dispatch(dataConnectorsApi.util.getRunningQueriesThunk())
    );

    ({ data: dataConnector, error } = endpoint.select(apiArgs)(
      store.getState()
    ));
    promise.unsubscribe();
  }

  return {
    clientSideFetch: true,
    dataConnector,
    error,
  };
}

const metaNotFound = makeMeta({
  title: makeMetaTitle(["Data Connector Not Found", "Renku"]),
});
const metaError = makeMeta({
  title: makeMetaTitle(["Error", "Renku"]),
});

export function meta({
  loaderData,
  location,
}: Route.MetaArgs): MetaDescriptor[] {
  const { dataConnector, error } = loaderData;
  if (error && "status" in error && error.status == 404) {
    return metaNotFound;
  }
  if (error) {
    return metaError;
  }
  if (dataConnector == null) {
    return makeMeta({
      title: makeMetaTitle(["Data Connector", "Renku"]),
      image: renkuDataConnectorSocialCard,
    });
  }
  const matchSettings = matchPath(
    ABSOLUTE_ROUTES.v2.dataConnectors.show.settings,
    location.pathname
  );
  const title = makeMetaTitle([
    ...(matchSettings ? ["Settings"] : []),
    dataConnector.name,
    "Data Connector",
    "Renku",
  ]);

  return makeMeta({
    title,
    description: dataConnector.description || undefined,
    image: renkuDataConnectorSocialCard,
  });
}

export default function DataConnectorPagesRoot({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { projectNamespace, dataConnectorNamespace, slug } = params;

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isCacheReady, setIsCacheReady] = useState<boolean>(false);

  const shouldQuery =
    loaderData.clientSideFetch ||
    isCacheReady ||
    loaderData.dataConnector == null;

  //? Inject the server-side data into the RTK Query cache
  useEffect(() => {
    if (loaderData.dataConnector == null) return;

    let ignore = false;

    const promise =
      projectNamespace && dataConnectorNamespace
        ? dispatch(
            dataConnectorsApi.util.upsertQueryData(
              "getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug",
              {
                namespace: projectNamespace,
                project: dataConnectorNamespace,
                slug,
              },
              loaderData.dataConnector
            )
          )
        : projectNamespace
        ? dispatch(
            dataConnectorsApi.util.upsertQueryData(
              "getNamespacesByNamespaceDataConnectorsAndSlug",
              {
                namespace: projectNamespace,
                slug,
              },
              loaderData.dataConnector
            )
          )
        : dispatch(
            dataConnectorsApi.util.upsertQueryData(
              "getDataConnectorsGlobalBySlug",
              {
                slug,
              },
              loaderData.dataConnector
            )
          );

    promise.then(() => {
      if (!ignore) {
        setIsCacheReady(true);
      }
    });

    return () => {
      ignore = true;
    };
  }, [
    dataConnectorNamespace,
    dispatch,
    loaderData.dataConnector,
    projectNamespace,
    slug,
  ]);

  //? Subscribe this component to exactly one of the 3 possible queries:
  //? * if the data is loaded client-side
  //? * once the cache is ready (will use cache data)
  const globalQuery =
    dataConnectorsApi.endpoints.getDataConnectorsGlobalBySlug.useQuery(
      !projectNamespace && shouldQuery ? { slug } : skipToken
    );

  const namespaceQuery = useGetNamespacesByNamespaceDataConnectorsAndSlugQuery(
    projectNamespace && !dataConnectorNamespace && shouldQuery
      ? {
          namespace: projectNamespace,
          slug,
        }
      : skipToken
  );

  const projectQuery =
    useGetNamespacesByNamespaceProjectsAndProjectDataConnectorsSlugQuery(
      projectNamespace && dataConnectorNamespace && shouldQuery
        ? {
            namespace: projectNamespace,
            project: dataConnectorNamespace,
            slug,
          }
        : skipToken
    );

  const queryResult =
    projectNamespace && dataConnectorNamespace
      ? projectQuery
      : projectNamespace
      ? namespaceQuery
      : globalQuery;

  const dataConnector = queryResult.currentData ?? loaderData.dataConnector;
  const error =
    queryResult.error ?? (dataConnector == null ? loaderData.error : undefined);
  const isLoading = queryResult.isLoading || queryResult.isFetching;

  useEffect(() => {
    if (dataConnector == null) return;

    const previousBasePath = generatePath(
      ABSOLUTE_ROUTES.v2.dataConnectors.show.root,
      {
        projectNamespace: projectNamespace ?? null,
        dataConnectorNamespace: dataConnectorNamespace ?? null,
        slug,
      }
    );

    let nextProjectNamespace: string | null = null;
    let nextDataConnectorNamespace: string | null = null;

    if (dataConnector.namespace) {
      const parts = dataConnector.namespace.split("/");

      if (parts.length >= 2) {
        nextProjectNamespace = parts[0] ?? null;
        nextDataConnectorNamespace = parts[1] ?? null;
      } else {
        nextProjectNamespace = dataConnector.namespace;
      }
    }

    const nextBasePath = generatePath(
      ABSOLUTE_ROUTES.v2.dataConnectors.show.root,
      {
        projectNamespace: nextProjectNamespace,
        dataConnectorNamespace: nextDataConnectorNamespace,
        slug: dataConnector.slug,
      }
    );

    if (previousBasePath !== nextBasePath) {
      const deltaUrl = pathname.slice(previousBasePath.length);
      navigate(nextBasePath + deltaUrl, { replace: true });
    }
  }, [
    dataConnector,
    dataConnectorNamespace,
    navigate,
    pathname,
    projectNamespace,
    slug,
  ]);

  if (
    isLoading ||
    (!loaderData.clientSideFetch &&
      loaderData.dataConnector != null &&
      !isCacheReady)
  ) {
    return <Loader className="align-self-center" />;
  }

  if (error || dataConnector == null) {
    return <h1>TODO: DC not found</h1>;
    // ! Implement that "not found" page
    // return <DataConnectorNotFound error={error ?? loaderData.error} />;
  }

  const routeParams = {
    projectNamespace: projectNamespace ?? null,
    dataConnectorNamespace: dataConnectorNamespace ?? null,
    slug: dataConnector.slug,
  };

  return (
    <DataConnectorPageLayout
      dataConnector={dataConnector}
      routeParams={routeParams}
    >
      <Outlet
        context={
          {
            kind: "dataConnector",
            namespace: dataConnector.namespace ?? "",
            dataConnector,
          } satisfies NamespaceContextType
        }
      />
    </DataConnectorPageLayout>
  );
}

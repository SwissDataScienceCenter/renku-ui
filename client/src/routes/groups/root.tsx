import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import {
  data,
  generatePath,
  matchPath,
  Outlet,
  useNavigate,
  type MetaDescriptor,
} from "react-router";

import { Loader } from "~/components/Loader";
import GroupPageLayout from "~/features/groupsV2/show/GroupPageLayout";
import {
  projectV2Api,
  useGetGroupsByGroupSlugQuery,
  useGetNamespacesByNamespaceSlugQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import GroupNotFound from "~/features/projectsV2/notFound/GroupNotFound";
import type { NamespaceContextType } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import renkuGroupSocialCard from "~/styles/assets/renkuGroupSocialCard.png";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/root";

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the project data client-side
    return data({
      clientSideFetch,
      namespace: undefined,
      group: undefined,
      error: undefined,
    });
  }

  //? Otherwise, we load the group data to generate meta tags
  const { slug } = params;
  const namespaceEndpoint = projectV2Api.endpoints.getNamespacesByNamespaceSlug;
  const namespaceApiArgs = { namespaceSlug: slug };
  store.dispatch(namespaceEndpoint.initiate(namespaceApiArgs));
  const groupEndpoint = projectV2Api.endpoints.getGroupsByGroupSlug;
  const groupApiArgs = {
    groupSlug: slug,
  };
  store.dispatch(groupEndpoint.initiate(groupApiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const namespaceSelector = namespaceEndpoint.select(namespaceApiArgs);
  const { data: namespace, error: namespaceError } = namespaceSelector(
    store.getState()
  );
  const groupSelector = groupEndpoint.select(groupApiArgs);
  const { data: group, error: groupError } = groupSelector(store.getState());
  store.dispatch(projectV2Api.util.resetApiState());
  const error = namespaceError ?? groupError;
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, namespace, group, error }, error.status);
  }
  // TODO: redirect to the canonical page, see below the effects which navigate()
  return data({ clientSideFetch, namespace, group, error });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  //? We fetch (or use cached data) on the client-side to allow the meta() function to work as intended
  const { slug } = params;
  const namespaceEndpoint = projectV2Api.endpoints.getNamespacesByNamespaceSlug;
  const namespaceApiArgs = { namespaceSlug: slug };
  const namespacePromise = store.dispatch(
    namespaceEndpoint.initiate(namespaceApiArgs)
  );
  const groupEndpoint = projectV2Api.endpoints.getGroupsByGroupSlug;
  const groupApiArgs = {
    groupSlug: slug,
  };
  const groupPromise = store.dispatch(groupEndpoint.initiate(groupApiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const namespaceSelector = namespaceEndpoint.select(namespaceApiArgs);
  const { data: namespace, error: namespaceError } = namespaceSelector(
    store.getState()
  );
  const groupSelector = groupEndpoint.select(groupApiArgs);
  const { data: group, error: groupError } = groupSelector(store.getState());
  //? Unsubscribe to let the cache expire when navigating to other pages
  namespacePromise.unsubscribe();
  groupPromise.unsubscribe();
  const error = namespaceError ?? groupError;
  return {
    clientSideFetch: true,
    namespace,
    group,
    error,
  };
}

const metaNotFound = makeMeta({
  title: makeMetaTitle(["Group Not Found", "Renku"]),
});
const metaError = makeMeta({
  title: makeMetaTitle(["Error", "Renku"]),
});

export function meta({
  loaderData,
  location,
}: Route.MetaArgs): MetaDescriptor[] {
  const { group, error } = loaderData;
  if (error && "status" in error && error.status == 404) {
    return metaNotFound;
  }
  if (error) {
    return metaError;
  }
  if (group == null) {
    return makeMeta({
      title: makeMetaTitle(["Group Page", "Renku"]),
      image: renkuGroupSocialCard,
    });
  }
  const matchSearch = matchPath(
    ABSOLUTE_ROUTES.v2.groups.show.search,
    location.pathname
  );
  const matchSettings = matchPath(
    ABSOLUTE_ROUTES.v2.groups.show.settings,
    location.pathname
  );
  const title = makeMetaTitle([
    ...(matchSearch ? ["Search"] : matchSettings ? ["Settings"] : []),
    group.name,
    "Group",
    "Renku",
  ]);
  return makeMeta({
    title,
    description: group.description || undefined,
    image: renkuGroupSocialCard,
  });
}

export default function GroupPagesRoot({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { slug } = params;

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [isCacheReady, setIsCacheReady] = useState<boolean>(false);

  //? Inject the server-side data into the RTK Query cache
  useEffect(() => {
    if (loaderData.namespace != null && loaderData.group != null) {
      let ignore: boolean = false;
      const namespaceApiArgs = { namespaceSlug: slug };
      const namespacePromise = dispatch(
        projectV2Api.util.upsertQueryData(
          "getNamespacesByNamespaceSlug",
          namespaceApiArgs,
          loaderData.namespace
        )
      );
      const groupApiArgs = { groupSlug: slug };
      const groupPromise = dispatch(
        projectV2Api.util.upsertQueryData(
          "getGroupsByGroupSlug",
          groupApiArgs,
          loaderData.group
        )
      );
      Promise.all([namespacePromise, groupPromise]).then(() => {
        if (!ignore) {
          setIsCacheReady(true);
        }
      });
      return () => {
        ignore = true;
      };
    }
  }, [dispatch, loaderData.group, loaderData.namespace, slug]);

  //? Subscribe this component to the namespace and group queries:
  //? * if the data is loaded client-side
  //? * once the cache is ready (will use cache data)
  const {
    currentData: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    loaderData.clientSideFetch || isCacheReady
      ? { namespaceSlug: slug }
      : skipToken
  );
  const {
    currentData: group,
    isLoading: isLoadingGroup,
    error: groupError,
  } = useGetGroupsByGroupSlugQuery(
    loaderData.clientSideFetch || isCacheReady ? { groupSlug: slug } : skipToken
  );
  const isLoading = isLoadingNamespace || isLoadingGroup;
  const error = namespaceError ?? groupError;

  useEffect(() => {
    if (slug && namespace?.namespace_kind === "user") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show.root, { username: slug }),
        {
          replace: true,
        }
      );
    } else if (
      slug &&
      namespace?.namespace_kind === "group" &&
      namespace.slug !== slug
    ) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: namespace.slug,
        }),
        { replace: true }
      );
    }
  }, [namespace?.namespace_kind, namespace?.slug, navigate, slug]);

  if (
    isLoading ||
    (!loaderData.clientSideFetch &&
      loaderData.namespace != null &&
      loaderData.group != null &&
      !isCacheReady)
  ) {
    return <Loader className="align-self-center" />;
  }

  if (error || namespace == null || group == null) {
    return <GroupNotFound error={error ?? loaderData.error} />;
  }

  return (
    <GroupPageLayout group={group}>
      <Outlet
        context={
          {
            kind: "group",
            namespace: group.slug,
            group: group,
          } satisfies NamespaceContextType
        }
      />
    </GroupPageLayout>
  );
}

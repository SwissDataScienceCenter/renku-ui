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
import {
  projectV2Api,
  useGetNamespacesByNamespaceSlugQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import UserNotFound from "~/features/projectsV2/notFound/UserNotFound";
import type { NamespaceContextType } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import {
  useGetUserByIdQuery,
  usersApi,
} from "~/features/usersV2/api/users.api";
import UserPageLayout from "~/features/usersV2/show/UserPageLayout";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store, type RootState } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import renkuUserSocialCard from "~/styles/assets/renkuUserSocialCard.png";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/root";

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the user data client-side
    return data({
      clientSideFetch,
      namespace: undefined,
      user: undefined,
      error: undefined,
    });
  }

  //? Otherwise, we load the group data to generate meta tags
  const { username } = params;
  const namespaceEndpoint = projectV2Api.endpoints.getNamespacesByNamespaceSlug;
  const namespaceApiArgs = { namespaceSlug: username };
  await store.dispatch(namespaceEndpoint.initiate(namespaceApiArgs));
  const namespaceSelector = namespaceEndpoint.select(namespaceApiArgs);
  const { data: namespace, error: namespaceError } = namespaceSelector(
    store.getState()
  );
  // Early return if the namespace is not a user
  if (namespace?.namespace_kind !== "user" || !namespace.created_by) {
    await Promise.all(
      store.dispatch(projectV2Api.util.getRunningQueriesThunk())
    );
    store.dispatch(projectV2Api.util.resetApiState());
    if (
      namespaceError &&
      "status" in namespaceError &&
      typeof namespaceError.status === "number"
    ) {
      return data(
        { clientSideFetch, namespace, user: undefined, error: namespaceError },
        namespaceError.status
      );
    }
    return data({
      clientSideFetch,
      namespace,
      user: undefined,
      error: namespaceError,
    });
  }
  const userEndpoint = usersApi.endpoints.getUsersByUserId;
  const userApiArgs = { userId: namespace.created_by };
  store.dispatch(userEndpoint.initiate(userApiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
  const userSelector = userEndpoint.select(userApiArgs);
  const { data: user, error: userError } = userSelector(store.getState());
  store.dispatch(projectV2Api.util.resetApiState());
  store.dispatch(usersApi.util.resetApiState());
  const error = namespaceError ?? userError;
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, namespace, user, error }, error.status);
  }
  // TODO: redirect to the canonical page, see below the effects which navigate()
  return data({ clientSideFetch, namespace, user, error });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  //? We fetch (or use cached data) on the client-side to allow the meta() function to work as intended
  const { username } = params;
  const namespaceEndpoint = projectV2Api.endpoints.getNamespacesByNamespaceSlug;
  const namespaceApiArgs = { namespaceSlug: username };
  const namespacePromise = store.dispatch(
    namespaceEndpoint.initiate(namespaceApiArgs)
  );
  await namespacePromise;
  const namespaceSelector = namespaceEndpoint.select(namespaceApiArgs);
  const { data: namespace, error: namespaceError } = namespaceSelector(
    store.getState()
  );
  // Early return if the namespace is not a user
  if (namespace?.namespace_kind !== "user" || !namespace.created_by) {
    await Promise.all(
      store.dispatch(projectV2Api.util.getRunningQueriesThunk())
    );
    //? Unsubscribe to let the cache expire when navigating to other pages
    namespacePromise.unsubscribe();
    return {
      clientSideFetch: true,
      namespace,
      user: undefined,
      error: namespaceError,
    };
  }

  const userEndpoint = usersApi.endpoints.getUsersByUserId;
  const userApiArgs = { userId: namespace.created_by };
  const userPromise = store.dispatch(userEndpoint.initiate(userApiArgs));
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
  const userSelector = userEndpoint.select(userApiArgs);
  const { data: user, error: userError } = userSelector(
    store.getState() as RootState & {
      [usersApi.reducerPath]: ReturnType<typeof usersApi.reducer>;
    }
  );
  //? Unsubscribe to let the cache expire when navigating to other pages
  namespacePromise.unsubscribe();
  userPromise.unsubscribe();
  const error = namespaceError ?? userError;
  return {
    clientSideFetch: true,
    namespace,
    user,
    error,
  };
}

const metaNotFound = makeMeta({
  title: makeMetaTitle(["User Not Found", "Renku"]),
});
const metaError = makeMeta({
  title: makeMetaTitle(["Error", "Renku"]),
});

export function meta({
  loaderData,
  location,
}: Route.MetaArgs): MetaDescriptor[] {
  const { user, error } = loaderData;
  if (error && "status" in error && error.status == 404) {
    return metaNotFound;
  }
  if (error) {
    return metaError;
  }
  if (user == null) {
    return makeMeta({
      title: makeMetaTitle(["User Page", "Renku"]),
      image: renkuUserSocialCard,
    });
  }
  const matchSearch = matchPath(
    ABSOLUTE_ROUTES.v2.users.show.search,
    location.pathname
  );
  const name =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.last_name;
  const title = makeMetaTitle([
    ...(matchSearch ? ["Search"] : []),
    ...(name ? [name] : []),
    `@${user.username}`,
    "User",
    "Renku",
  ]);
  return makeMeta({
    title,
    image: renkuUserSocialCard,
  });
}

export default function UserPagesRoot({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { username } = params;

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [isNamespaceCacheReady, setIsNamespaceCacheReady] =
    useState<boolean>(false);
  const [isUserCacheReady, setIsUserCacheReady] = useState<boolean>(false);
  const isCacheReady = isNamespaceCacheReady && isUserCacheReady;

  //? Inject the server-side data into the RTK Query cache
  useEffect(() => {
    if (loaderData.namespace != null) {
      let ignore: boolean = false;
      const namespaceApiArgs = { namespaceSlug: loaderData.namespace.slug };
      const namespacePromise = dispatch(
        projectV2Api.util.upsertQueryData(
          "getNamespacesByNamespaceSlug",
          namespaceApiArgs,
          loaderData.namespace
        )
      );
      namespacePromise.then(() => {
        if (!ignore) {
          setIsNamespaceCacheReady(true);
        }
      });
      return () => {
        ignore = true;
      };
    }
  }, [dispatch, loaderData.namespace]);
  useEffect(() => {
    if (loaderData.user != null) {
      let ignore: boolean = false;
      const userApiArgs = { userId: loaderData.user.id };
      const userPromise = dispatch(
        usersApi.util.upsertQueryData(
          "getUsersByUserId",
          userApiArgs,
          loaderData.user
        )
      );
      userPromise.then(() => {
        if (!ignore) {
          setIsUserCacheReady(true);
        }
      });
      return () => {
        ignore = true;
      };
    }
  }, [dispatch, loaderData.user]);

  //? Subscribe this component to the namespace and user queries:
  //? * if the data is loaded client-side
  //? * once the cache is ready (will use cache data)
  const {
    currentData: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    loaderData.clientSideFetch || isNamespaceCacheReady
      ? { namespaceSlug: username }
      : skipToken
  );
  const {
    currentData: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserByIdQuery(
    (loaderData.clientSideFetch || isUserCacheReady) &&
      namespace?.namespace_kind === "user" &&
      namespace.created_by
      ? { userId: namespace.created_by }
      : skipToken
  );
  const isLoading = isLoadingNamespace || isLoadingUser;
  const error = namespaceError ?? userError;

  useEffect(() => {
    if (username && namespace?.namespace_kind === "group") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, { slug: username }),
        { replace: true }
      );
    } else if (
      username &&
      namespace?.namespace_kind === "user" &&
      namespace.slug !== username
    ) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: namespace.slug,
        }),
        { replace: true }
      );
    }
  }, [namespace?.namespace_kind, namespace?.slug, navigate, username]);

  if (
    isLoading ||
    (!loaderData.clientSideFetch &&
      loaderData.namespace != null &&
      loaderData.user != null &&
      !isCacheReady)
  ) {
    return <Loader className="align-self-center" />;
  }

  if (error || namespace == null || user == null) {
    return <UserNotFound error={error ?? loaderData.error} />;
  }

  return (
    <UserPageLayout user={user}>
      <Outlet
        context={
          {
            kind: "user",
            namespace: username,
            user: user,
          } satisfies NamespaceContextType
        }
      />
    </UserPageLayout>
  );
}

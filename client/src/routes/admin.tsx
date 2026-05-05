import { data, type MetaDescriptor } from "react-router";

import ContainerWrap from "~/components/container/ContainerWrap";
import LazyAdminPageContent from "~/features/admin/LazyAdminPage";
import {
  useGetUserQueryState,
  usersApi,
} from "~/features/usersV2/api/users.api";
import LazyNotFound from "~/not-found/LazyNotFound";
import { store, type RootState } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/admin";

export async function loader({ context }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the user data client-side
    return data({
      clientSideFetch,
      selfUser: undefined,
      error: undefined,
    });
  }

  //? Otherwise, we load the user data server-side
  const endpoint = usersApi.endpoints.getUser;
  store.dispatch(endpoint.initiate());
  await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
  const selector = endpoint.select();
  const { data: selfUser, error } = selector(store.getState());
  store.dispatch(usersApi.util.resetApiState());
  if (
    error != null ||
    selfUser == null ||
    !selfUser.isLoggedIn ||
    !selfUser.is_admin
  ) {
    // Return 404 - not found
    return data({ clientSideFetch, selfUser, error }, 404);
  }
  return data({ clientSideFetch, selfUser, error });
}

export async function clientLoader() {
  //? We fetch (or use cached data) on the client-side to allow the meta() function to work as intended
  const endpoint = usersApi.endpoints.getUser;
  const promise = store.dispatch(endpoint.initiate());
  await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
  const selector = endpoint.select();
  const { data: selfUser, error } = selector(
    store.getState() as RootState & {
      [usersApi.reducerPath]: ReturnType<typeof usersApi.reducer>;
    }
  );
  //? Unsubscribe to let the cache expire when navigating to other pages
  promise.unsubscribe();
  return {
    clientSideFetch: true,
    selfUser,
    error,
  };
}

const meta_ = makeMeta({
  title: makeMetaTitle(["Admin Panel", "Renku"]),
});

const metaNotFound = makeMeta({
  title: makeMetaTitle(["Page Not Found", "Renku"]),
});
const metaError = makeMeta({
  title: makeMetaTitle(["Error", "Renku"]),
});

export function meta({ loaderData }: Route.MetaArgs): MetaDescriptor[] {
  const { selfUser, error } = loaderData;
  if (error) {
    return metaError;
  }
  if (selfUser == null || !selfUser.isLoggedIn || !selfUser.is_admin) {
    return metaNotFound;
  }
  return meta_;
}

export default function AdminPage() {
  const { data: user } = useGetUserQueryState();
  if (user == null || !user.isLoggedIn || !user.is_admin) {
    return (
      <ContainerWrap fullSize>
        <LazyNotFound />
      </ContainerWrap>
    );
  }
  return (
    <ContainerWrap>
      <LazyAdminPageContent />
    </ContainerWrap>
  );
}

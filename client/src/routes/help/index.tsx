import { type MetaDescriptor } from "react-router";

import GettingHelp from "~/features/help/GettingHelp";
import { usersApi } from "~/features/usersV2/api/users.api";
import { storeContext } from "~/store/store.utils.server";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/index";

const title = makeMetaTitle(["Getting Help", "Renku"]);
const meta_ = makeMeta({ title });

export async function loader({ context }: Route.LoaderArgs) {
  console.log("client/src/routes/help/index.tsx");
  const store = context.get(storeContext);
  if (store != null) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1_000);
    });
    const userSelector = usersApi.endpoints.getUser.select();
    const preState = userSelector(store.getState());
    console.log("in client/src/routes/help/index.tsx initial state:", {
      requestId: preState.requestId,
    });
    store.dispatch(usersApi.endpoints.getUser.initiate());
    await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
    const { data, error, requestId } = userSelector(store.getState());
    console.log("in client/src/routes/help/index.tsx:", {
      data,
      error,
      requestId,
    });
  }

  //   const { renkuSessionCookie } = store
  //     ? cookieSlice.selectSlice(store.getState())
  //     : {};
  //   if (store != null && renkuSessionCookie) {
  //     store.dispatch(usersApi.endpoints.getUser.initiate());
  //     await Promise.all(store.dispatch(usersApi.util.getRunningQueriesThunk()));
  //     const userSelector = usersApi.endpoints.getUser.select();
  //     const { data, error } = userSelector(store.getState());
  //     console.log({ data, error });
  //     // To populate on the client side: usersApi.util.upsertQueryData('getUser', undefined, <data>)
  //   }
  //   console.log({ state: store?.getState() });
}

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function GettingHelpPage() {
  return <GettingHelp />;
}

import { data } from "react-router";

import { sessionsV2Api } from "~/features/sessionsV2/api/sessionsV2.api"; //client/src/features/sessionsV2/api/sessionsV2.api.ts
import { storeContext } from "~/store/store.utils.server";
import type { Route } from "./+types/redirect";

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the session data client-side
    return data({
      clientSideFetch,
      // TODO: data
      error: undefined,
    });
  }

  console.log("hello", params);

  const { id: sessionId } = params;
  const endpoint = sessionsV2Api.endpoints.getSessionsBySessionId;
  const apiArgs = { sessionId };
  store.dispatch(endpoint.initiate(apiArgs));
  await Promise.all(
    store.dispatch(sessionsV2Api.util.getRunningQueriesThunk()),
  );
  const sessionSelector = endpoint.select(apiArgs);
  const result = sessionSelector(store.getState());
  console.log(result);
  store.dispatch(sessionsV2Api.util.resetApiState());
  return data({
    clientSideFetch: true,
    // TODO: data
    error: undefined,
  });
}

export default function Component() {
  return <>TODO: redirect to session page</>;
}

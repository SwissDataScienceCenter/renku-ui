import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { data, generatePath, redirect, useNavigate } from "react-router";
import type { Reducer, Store } from "redux";

import { Loader } from "~/components/Loader";
import {
  projectV2Api,
  useGetProjectsByProjectIdQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import {
  sessionsV2Api,
  useGetSessionsBySessionIdQuery,
} from "~/features/sessionsV2/api/sessionsV2.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { store } from "~/store/store";
import { storeContext } from "~/store/store.utils.server";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Route } from "./+types/redirect";

type SessionsV2ApiStoreType =
  typeof sessionsV2Api.reducer extends Reducer<infer S> ? S : never;

export async function loader({ context, params }: Route.LoaderArgs) {
  const store = context.get(storeContext);
  const clientSideFetch = store == null || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    //? In testing, we load the session data client-side
    return data({
      clientSideFetch,
      session: undefined,
      project: undefined,
      error: undefined,
    });
  }

  const { id: sessionId } = params;
  const sessionEndpoint = sessionsV2Api.endpoints.getSessionsBySessionId;
  const sessionApiArgs = { sessionId };
  await store.dispatch(sessionEndpoint.initiate(sessionApiArgs));
  const sessionSelector = sessionEndpoint.select(sessionApiArgs);
  const { data: session, error: sessionError } = sessionSelector(
    store.getState(),
  );
  // Early return if the session does not exist
  if (!session?.project_id) {
    await Promise.all(
      store.dispatch(sessionsV2Api.util.getRunningQueriesThunk()),
    );
    store.dispatch(sessionsV2Api.util.resetApiState());

    if (
      sessionError &&
      "status" in sessionError &&
      typeof sessionError.status === "number"
    ) {
      return data(
        {
          clientSideFetch,
          session,
          project: undefined,
          error: sessionError,
        },
        sessionError.status,
      );
    }
    return data({
      clientSideFetch,
      session,
      project: undefined,
      error: sessionError,
    });
  }
  const projectEndpoint = projectV2Api.endpoints.getProjectsByProjectId;
  const projectApiArgs = { projectId: session.project_id };
  store.dispatch(projectEndpoint.initiate(projectApiArgs));
  await Promise.all(
    store.dispatch(sessionsV2Api.util.getRunningQueriesThunk()),
  );
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = projectEndpoint.select(projectApiArgs);
  const { data: project, error: projectError } = projectSelector(
    store.getState(),
  );
  store.dispatch(sessionsV2Api.util.resetApiState());
  store.dispatch(projectV2Api.util.resetApiState());
  if (project != null) {
    throw redirect(
      generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
        namespace: project.namespace,
        slug: project.slug,
        session: sessionId,
      }),
    );
  }
  const error = sessionError ?? projectError;
  if (error && "status" in error && typeof error.status === "number") {
    return data({ clientSideFetch, session, project, error }, error.status);
  }
  return data({ clientSideFetch, session, project, error });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  //? We fetch (or use cached data) on the client-side to allow the meta() function to work as intended
  const { id: sessionId } = params;
  const sessionEndpoint = sessionsV2Api.endpoints.getSessionsBySessionId;
  const sessionApiArgs = { sessionId };
  const sessionPromise = store.dispatch(
    sessionEndpoint.initiate(sessionApiArgs),
  );
  await sessionPromise;
  const sessionSelector = sessionEndpoint.select(sessionApiArgs);
  const { data: session, error: sessionError } = sessionSelector(
    (
      store as unknown as Store<{
        [sessionsV2Api.reducerPath]: SessionsV2ApiStoreType;
      }>
    ).getState(),
  );
  if (!session?.project_id) {
    //? Unsubscribe to let the cache expire when navigating to other pages
    sessionPromise.unsubscribe();
    return {
      clientSideFetch: true,
      session,
      project: undefined,
      error: sessionError,
    };
  }
  const projectEndpoint = projectV2Api.endpoints.getProjectsByProjectId;
  const projectApiArgs = { projectId: session.project_id };
  const projectPromise = store.dispatch(
    projectEndpoint.initiate(projectApiArgs),
  );
  await Promise.all(
    store.dispatch(sessionsV2Api.util.getRunningQueriesThunk()),
  );
  await Promise.all(store.dispatch(projectV2Api.util.getRunningQueriesThunk()));
  const projectSelector = projectEndpoint.select(projectApiArgs);
  const { data: project, error: projectError } = projectSelector(
    store.getState(),
  );
  //? Unsubscribe to let the cache expire when navigating to other pages
  sessionPromise.unsubscribe();
  projectPromise.unsubscribe();
  if (project != null) {
    throw redirect(
      generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
        namespace: project.namespace,
        slug: project.slug,
        session: sessionId,
      }),
    );
  }
  const error = sessionError ?? projectError;
  return { clientSideFetch: true, session, project, error };
}

export default function Component({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { id: sessionId } = params;

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [isCacheReady, setIsCacheReady] = useState<boolean>(false);

  //? Inject the server-side data into the RTK Query cache
  useEffect(() => {
    if (loaderData.session != null) {
      let ignore: boolean = false;
      const sessionApiArgs = { sessionId: loaderData.session.name };
      const sessionPromise = dispatch(
        sessionsV2Api.util.upsertQueryData(
          "getSessionsBySessionId",
          sessionApiArgs,
          loaderData.session,
        ),
      );
      sessionPromise.then(() => {
        if (!ignore) {
          setIsCacheReady(true);
        }
      });
      return () => {
        ignore = true;
      };
    }
  }, [dispatch, loaderData.session]);

  //? Subscribe this component to the session and project queries:
  //? * if the data is loaded client-side
  //? * once the cache is ready (will use cache data)
  const {
    currentData: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useGetSessionsBySessionIdQuery(
    loaderData.clientSideFetch || isCacheReady ? { sessionId } : skipToken,
  );
  const {
    currentData: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectsByProjectIdQuery(
    session?.project_id ? { projectId: session.project_id } : skipToken,
  );

  const isLoading = isLoadingSession || isLoadingProject;
  const error = sessionError ?? projectError;

  useEffect(() => {
    if (project != null) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
          namespace: project.namespace,
          slug: project.slug,
          session: sessionId,
        }),
      );
    }
  }, [navigate, project, sessionId]);

  if (
    isLoading ||
    (!loaderData.clientSideFetch && loaderData.session != null && !isCacheReady)
  ) {
    return <Loader className="align-self-center" />;
  }

  if (error || session == null || project == null) {
    return <>TODO: not found</>;
  }

  return (
    <>
      <div>
        <p>TODO: redirect to session page</p>
        <div>
          <pre>{JSON.stringify(loaderData, null, 2)}</pre>
        </div>
        <div>
          <pre>
            {JSON.stringify(
              {
                session,
                isLoadingSession,
                sessionError,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </>
  );
}

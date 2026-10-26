/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect } from "react";
import { ArrowRepeat, BoxArrowUpRight } from "react-bootstrap-icons";
import { generatePath, useParams } from "react-router";
import { Button } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import PageLoader from "~/components/PageLoader";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  type StepsProgressBar,
} from "~/components/progress/ProgressSteps";
import LazyNotFound from "~/not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { FaviconStatus } from "../../display/display.types";
import { resetFavicon, setFavicon } from "../../display/displaySlice";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import type { AppResponse } from "../api/apps.api";
import { useGetProjectsByProjectIdSessionLaunchersQuery as useGetProjectSessionLaunchersQuery } from "../api/sessionLaunchersV2.api";
import { getLauncherCategory } from "../session.utils";
import AppLobbyLayout, { BackToProjectLink } from "./AppLobbyLayout";
import AppNotRunning from "./AppNotRunning";
import { toSecureAppUrl } from "./apps.utils";
import useAppForLauncher from "./useAppForLauncher.hook";
import useAppLobby from "./useAppLobby.hook";

import progressBoxStyles from "~/components/progress/ProgressBox.module.scss";

/**
 * The page every shared app link points at. Apps run with min-scale 0, so it
 * wakes the app, waits for it to answer, then hands the visitor over.
 */
export default function AppLobbyPage() {
  const { namespace, slug, launcherId } = useParams<{
    namespace: string;
    slug: string;
    launcherId: string;
  }>();

  if (namespace == null || slug == null || launcherId == null) {
    return <LazyNotFound />;
  }

  return <AppLobby namespace={namespace} slug={slug} launcherId={launcherId} />;
}

interface AppLobbyProps {
  namespace: string;
  slug: string;
  launcherId: string;
}

function AppLobby({ namespace, slug, launcherId }: AppLobbyProps) {
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetNamespacesByNamespaceProjectsAndSlugQuery({ namespace, slug });

  const projectId = project?.id;

  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);

  // useAppForLauncher polls while the app is pending, so the lobby need not.
  const {
    app,
    isLoading: isLoadingApp,
    error: appError,
  } = useAppForLauncher({
    projectId: projectId ?? "",
    launcherId,
    skip: projectId == null,
  });

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace,
    slug,
  });

  if (isLoadingProject || isLoadingApp) {
    return <PageLoader />;
  }

  const error = projectError ?? appError;
  if (error || project == null) {
    return (
      <AppLobbyLayout title="This app could not be loaded">
        {error && <RtkOrDataServicesError error={error} dismissible={false} />}
        <BackToProjectLink projectUrl={projectUrl} />
      </AppLobbyLayout>
    );
  }

  const launcher = launchers?.find(({ id }) => id === launcherId);

  if (app != null && app.status !== "failed") {
    return (
      <AppLobbyProbe
        app={app}
        appName={launcher?.name}
        projectUrl={projectUrl}
      />
    );
  }

  // Nothing left to wake: the launcher decides dead link vs stopped app.
  if (isLoadingLaunchers) {
    return <PageLoader />;
  }

  // A launcher id that does not resolve is a bad address, not a stopped app.
  // Only trust the absence when the query succeeded.
  if (launchersError == null && launcher == null) {
    return <LazyNotFound />;
  }

  if (launcher != null && getLauncherCategory(launcher) !== "app") {
    return <LazyNotFound />;
  }

  return (
    <AppNotRunning
      hasFailed={app?.status === "failed"}
      launcher={launcher}
      project={project}
      projectUrl={projectUrl}
    />
  );
}

interface AppLobbyProbeProps {
  app: AppResponse;
  appName: string | undefined;
  projectUrl: string;
}

function AppLobbyProbe({ app, appName, projectUrl }: AppLobbyProbeProps) {
  const appUrl = app.url ? toSecureAppUrl(app.url) : undefined;

  const isDeploying = app.status === "pending";
  const { state, retry } = useAppLobby({
    appUrl,
    enabled: !isDeploying && appUrl != null,
  });

  const isReady = state.status === "ready";

  const favicon: FaviconStatus =
    state.status === "exhausted" ? "error" : isReady ? "running" : "waiting";

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFavicon(favicon));
  }, [dispatch, favicon]);

  useEffect(
    () => () => {
      dispatch(resetFavicon());
    },
    [dispatch],
  );

  useEffect(() => {
    if (isReady && appUrl != null) {
      // replace(), not assign(): Back should skip the lobby.
      window.location.replace(appUrl);
    }
  }, [appUrl, isReady]);

  if (appUrl == null) {
    return (
      <AppLobbyLayout title="This app has no address yet">
        <p className="mb-0">
          The deployment exists but has not been given a public URL yet. Try
          again in a moment.
        </p>
        <BackToProjectLink projectUrl={projectUrl} />
      </AppLobbyLayout>
    );
  }

  const isExhausted = state.status === "exhausted";

  const steps: StepsProgressBar[] = [
    {
      id: 0,
      status: isDeploying
        ? StatusStepProgressBar.EXECUTING
        : StatusStepProgressBar.READY,
      step: "Publishing the app",
    },
    {
      id: 1,
      status: isDeploying
        ? StatusStepProgressBar.WAITING
        : isExhausted
          ? StatusStepProgressBar.FAILED
          : isReady
            ? StatusStepProgressBar.READY
            : StatusStepProgressBar.EXECUTING,
      step: "Waking the app",
    },
  ];

  const description = isDeploying
    ? "The app is being deployed. This page will continue on its own."
    : isExhausted
      ? "It has not answered yet. It may still be starting up, or it may not be healthy."
      : isReady
        ? "Taking you to the app…"
        : "Apps go to sleep when nobody is using them. This page will continue on its own.";

  return (
    <div
      className={cx(
        progressBoxStyles.progressBoxSmall,
        progressBoxStyles.progressBoxSmallSteps,
      )}
      data-cy="app-lobby-page"
    >
      <ProgressStepsIndicator
        description={description}
        moreOptions={
          isExhausted && (
            <ExhaustedActions
              appUrl={appUrl}
              projectUrl={projectUrl}
              retry={retry}
            />
          )
        }
        status={steps}
        style={ProgressStyle.Light}
        title={appName ? `Launching app ${appName}` : "Launching app"}
        type={ProgressType.Determinate}
      />
      <p
        aria-live="polite"
        className="visually-hidden"
        data-cy="app-lobby-progress"
      >
        {description}
      </p>
    </div>
  );
}

interface ExhaustedActionsProps {
  appUrl: string;
  projectUrl: string;
  retry: () => void;
}

function ExhaustedActions({
  appUrl,
  projectUrl,
  retry,
}: ExhaustedActionsProps) {
  return (
    <>
      <div className={cx("d-flex", "flex-wrap", "gap-2", "mt-3")}>
        <Button color="primary" data-cy="app-lobby-retry" onClick={retry}>
          <ArrowRepeat className={cx("bi", "me-1")} aria-hidden="true" />
          Try again
        </Button>
        <Button
          color="outline-primary"
          data-cy="app-lobby-open-anyway"
          href={appUrl}
          tag="a"
        >
          <BoxArrowUpRight className={cx("bi", "me-1")} aria-hidden="true" />
          Open it anyway
        </Button>
      </div>
      <div>
        <BackToProjectLink projectUrl={projectUrl} />
      </div>
    </>
  );
}

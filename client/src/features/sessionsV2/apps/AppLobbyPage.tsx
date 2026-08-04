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
 * The app lobby.
 *
 * This is the page every shared app link points at. Apps run with min-scale 0,
 * so an app that exists and reports Ready may still be scaled to zero and need
 * a cold start before it answers a request. The lobby absorbs that wait: it
 * kicks the app awake, waits for it to answer, and only then hands the visitor
 * over to the app itself.
 *
 * Routing guarantees the three params, but useParams types them as optional.
 * Validating them here — before any other hook runs — lets the rest of the page
 * take them as plain strings.
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

  // The launcher is what the URL actually addresses, so it decides whether this
  // link is meaningful at all — separately from whether an app is deployed.
  const {
    data: launchers,
    isLoading: isLoadingLaunchers,
    error: launchersError,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);

  // useAppForLauncher polls while any app in the project is pending, so a
  // deployment that is still being created settles into ready here without the
  // lobby having to poll for it.
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

  // Deliberately not waiting on the launchers query here. The probe is what
  // wakes the app, so every millisecond before it goes out is added to the
  // visitor's cold start — and the probe needs nothing but the app's URL.
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

  // Start waking the app the moment we know there is one, without waiting for
  // the launcher. An app found by launcher id proves that launcher exists, so
  // the checks below cannot change this outcome — the launcher only supplies a
  // name, which appears on its own once the query lands.
  if (app != null && app.status !== "failed") {
    return (
      <AppLobbyProbe
        app={app}
        appName={launcher?.name}
        projectUrl={projectUrl}
      />
    );
  }

  // Past here there is nothing to wake, and the launcher is what decides
  // between a dead link and a stopped app — so now it is worth waiting for.
  if (isLoadingLaunchers) {
    return <PageLoader />;
  }

  // A launcher id that does not resolve is a bad address, not a stopped app —
  // a deleted launcher or a mistyped link. Saying "this app isn't running"
  // there would imply the link will start working again, which it will not.
  // Only trust the absence when the query actually succeeded: on an error we
  // fall through and let the app itself decide what to show.
  if (launchersError == null && launcher == null) {
    return <LazyNotFound />;
  }

  // The lobby only means anything for app launchers. A session launcher has no
  // shareable public address, so this URL is not one of its pages.
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

/**
 * The wake-and-wait stage, reached once a deployment exists.
 *
 * Split out from AppLobby so the state machine is mounted only when there is
 * genuinely an app to probe, and so it survives the /apps poll: remounting on
 * every refetch would restart the retry budget.
 */
function AppLobbyProbe({ app, appName, projectUrl }: AppLobbyProbeProps) {
  const appUrl = app.url ? toSecureAppUrl(app.url) : undefined;

  // A pending app is still being created, so there is nothing to wake yet. The
  // /apps poll flips it to ready and the probe starts then.
  const isDeploying = app.status === "pending";
  const { state, retry } = useAppLobby({
    appUrl,
    enabled: !isDeploying && appUrl != null,
  });

  const isReady = state.status === "ready";

  // A cold start is long enough that people switch tabs while they wait, which
  // is exactly where the favicon is the only thing still reporting. Sessions
  // already do this during launch; the lobby needs it more, since it has no
  // in-page progress to come back to.
  const favicon: FaviconStatus =
    state.status === "exhausted" ? "error" : isReady ? "running" : "waiting";

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFavicon(favicon));
  }, [dispatch, favicon]);

  // Reset only on unmount. Folding this into the effect above would reset and
  // re-set on every status change, which flickers the tab icon.
  useEffect(
    () => () => {
      dispatch(resetFavicon());
    },
    [dispatch],
  );

  useEffect(() => {
    if (isReady && appUrl != null) {
      // replace(), not assign(): the lobby is only a stop along the way, so
      // Back should return the visitor to where they came from rather than
      // drop them into the wait again.
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

  // The same two-stage shape the session launch page uses, and for the same
  // reason: both stages are genuinely observable, so the checklist reports
  // rather than guesses. "Publishing" comes from the app's own status via the
  // /apps poll; "waking" is the probe. There is deliberately no third,
  // finer-grained stage — the probe is a no-cors request whose response is
  // opaque by construction, so nothing can be known about its progress.
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
          isExhausted ? (
            <ExhaustedActions
              appUrl={appUrl}
              projectUrl={projectUrl}
              retry={retry}
            />
          ) : undefined
        }
        status={steps}
        style={ProgressStyle.Light}
        title={appName ? `Launching app ${appName}` : "Launching app"}
        type={ProgressType.Determinate}
      />
      {/* ProgressStepsIndicator renders its description as plain text, so the
          change of state is visible but never announced. Screen readers get
          it from here instead. */}
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

/**
 * What the visitor can do once the retry budget is spent. Rendered inside the
 * progress box rather than replacing it, so the failed stage stays on screen
 * and the buttons read as a response to it.
 */
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
        {/* The probe is a heuristic, not a health check, so let the visitor
            overrule it and go straight to the app. */}
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
      {/* Block-level so the link sits under the buttons rather than trailing
          them — the Link's own margin is inline and would not separate it. */}
      <div>
        <BackToProjectLink projectUrl={projectUrl} />
      </div>
    </>
  );
}

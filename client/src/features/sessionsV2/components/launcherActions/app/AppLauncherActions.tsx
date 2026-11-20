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
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BootstrapReboot,
  BoxArrowUpRight,
  FileEarmarkText,
  Link45deg,
  Power,
  StopCircle,
} from "react-bootstrap-icons";
import { Button, ButtonGroup, UncontrolledTooltip } from "reactstrap";

import { MenuButton, MenuButtonItem } from "~/components/buttons/MenuButton";
import { Loader } from "~/components/Loader";
import useRenkuToast from "~/components/toast/useRenkuToast";
import AppLogsModal from "~/features/logsDisplay/AppLogsModal";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { AppStatus } from "~/features/sessionsV2/api/apps.api";
import {
  useDeleteAppsByAppNameMutation,
  usePostAppsMutation,
} from "~/features/sessionsV2/api/apps.api";
import {
  sessionLaunchersV2Api,
  usePostEnvironmentsByEnvironmentIdBuildsMutation as usePostBuildMutation,
} from "~/features/sessionsV2/api/sessionLaunchersV2.api";
import {
  DeleteAppModal,
  RedeployAppModal,
} from "~/features/sessionsV2/apps/AppActionModals";
import AppLiveIndicator from "~/features/sessionsV2/apps/AppLiveIndicator";
import type {
  AppRedeployPhase,
  AppTransition,
} from "~/features/sessionsV2/apps/apps.utils";
import {
  APP_ALREADY_EXISTS_MESSAGE,
  APP_PUBLIC_PROJECT_ONLY_MESSAGE,
  APP_STARTING_MESSAGE,
  getAppLobbyPath,
  getAppLobbyUrl,
  getAppTransition,
  getNextRedeployStep,
  hasAppOnAnotherLauncher,
} from "~/features/sessionsV2/apps/apps.utils";
import useAppForLauncher from "~/features/sessionsV2/apps/useAppForLauncher.hook";
import useWaitForAppStatus from "~/features/sessionsV2/apps/useWaitForAppStatus.hook";
import {
  getLaunchActionTooltip,
  isTruthy,
} from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import AppContext from "~/utils/context/appContext";
import BuildLauncherButtons, {
  CancelBuildDropdownItem,
  RebuildLauncherDropdownItem,
} from "../../BuildLauncherButtons";
import CheckingLauncherButton from "../shared/CheckingLauncherButton";
import type { LauncherCardActionsProps } from "../types";

const APP_SPIN_UP_TARGET: AppStatus[] = ["ready", "failed"];

export default function AppLauncherActions({
  builds,
  lastBuild,
  launcher,
  otherActions,
  project,
  displayBuildActions: displayBuildActionsProp,
}: LauncherCardActionsProps) {
  const { renkuToastDanger, renkuToastSuccess } = useRenkuToast();
  const { params } = useContext(AppContext);
  const { isLoadingPermissions, write } = useProjectPermissions({
    projectId: launcher.project_id,
  });
  const isPublic = project.visibility === "public";

  const {
    app,
    data: apps,
    isLoading: isLoadingApps,
  } = useAppForLauncher({
    projectId: project.id,
    launcherId: launcher.id,
  });
  const hasOtherApp = hasAppOnAnotherLauncher(apps, launcher.id);
  const isLive = app?.status === "ready";

  const lobbyPath = getAppLobbyPath({
    namespace: project.namespace,
    slug: project.slug,
    launcherId: launcher.id,
  });

  const {
    isBuildInProgress,
    isCodeEnvironment,
    isLoadingContainerImage,
    useOldImage: shouldUseOldImage,
    hasValidImage,
    imageStatus,
    lastBuild: currentLastBuild,
  } = useLauncherEnvironmentReadiness({ builds, launcher, lastBuild });

  const [publishApp, publishResult] = usePostAppsMutation();
  const [deleteApp, deleteResult] = useDeleteAppsByAppNameMutation();

  const { isWaiting: isSpinningUp } = useWaitForAppStatus({
    projectId: project.id,
    launcherId: launcher.id,
    target: { desiredStatus: APP_SPIN_UP_TARGET },
    skip: publishResult.isUninitialized,
  });
  const { isWaiting: isDeleting } = useWaitForAppStatus({
    projectId: project.id,
    launcherId: launcher.id,
    target: { deletion: true },
    skip: deleteResult.isUninitialized,
  });

  const { reset: resetPublish } = publishResult;
  const { reset: resetDelete } = deleteResult;

  useEffect(() => {
    if (publishResult.isError) {
      renkuToastDanger({
        textHeader: "App",
        textBody: "Unable to start the app.",
      });
      resetPublish();
    } else if (publishResult.isSuccess && !isSpinningUp) {
      resetPublish();
    }
  }, [
    publishResult.isError,
    publishResult.isSuccess,
    isSpinningUp,
    renkuToastDanger,
    resetPublish,
  ]);

  useEffect(() => {
    if (deleteResult.isError) {
      renkuToastDanger({
        textHeader: "App",
        textBody: "Unable to stop the app.",
      });
      resetDelete();
    } else if (deleteResult.isSuccess && !isDeleting) {
      resetDelete();
    }
  }, [
    deleteResult.isError,
    deleteResult.isSuccess,
    isDeleting,
    renkuToastDanger,
    resetDelete,
  ]);

  const [postBuild] = usePostBuildMutation();
  const [redeploy, setRedeploy] = useState<{
    phase: AppRedeployPhase;
    buildId: string;
    appName?: string;
  } | null>(null);

  const onRebuildAndRedeploy = useCallback(() => {
    postBuild({ environmentId: launcher.environment.id })
      .unwrap()
      .then((build) => setRedeploy({ phase: "building", buildId: build.id }))
      .catch(() =>
        renkuToastDanger({
          textHeader: "App",
          textBody: "Unable to start the image build.",
        }),
      );
  }, [launcher.environment.id, postBuild, renkuToastDanger]);

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    redeploy?.phase === "building"
      ? { environmentId: launcher.environment.id }
      : skipToken,
    { pollingInterval: 1_000 },
  );

  const redeployStep = redeploy
    ? getNextRedeployStep({
        ...redeploy,
        lastBuild: currentLastBuild,
        hasApp: app != null,
        stop: {
          isPending: deleteResult.isLoading || isDeleting,
          isError: deleteResult.isError,
        },
        start: {
          isPending: publishResult.isLoading || isSpinningUp,
          isError: publishResult.isError,
          isSuccess: publishResult.isSuccess,
        },
      })
    : null;

  if (redeploy && redeployStep === "stop" && app) {
    setRedeploy({ ...redeploy, phase: "stopping", appName: app.name });
  } else if (redeploy && redeployStep === "start") {
    setRedeploy({ ...redeploy, phase: "starting" });
  } else if (redeployStep === "done" || redeployStep === "failed") {
    setRedeploy(null);
  }

  const sentRedeployRequest = useRef<string | null>(null);
  useEffect(() => {
    if (redeploy == null || redeploy.phase === "building") {
      return;
    }
    const request = `${redeploy.buildId}:${redeploy.phase}`;
    if (sentRedeployRequest.current === request) {
      return;
    }
    sentRedeployRequest.current = request;
    if (redeploy.phase === "stopping" && redeploy.appName) {
      deleteApp({ appName: redeploy.appName });
    } else if (redeploy.phase === "starting") {
      publishApp({ appPostRequest: { launcher_id: launcher.id } });
    }
  }, [deleteApp, launcher.id, publishApp, redeploy]);

  const transition = getAppTransition(app, {
    isRebuilding: redeploy?.phase === "building",
    isStarting: publishResult.isLoading || isSpinningUp,
    isStopping: deleteResult.isLoading || isDeleting,
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => setIsDeleteOpen((open) => !open), []);

  const [isRedeployOpen, setIsRedeployOpen] = useState(false);
  const toggleRedeploy = useCallback(
    () => setIsRedeployOpen((open) => !open),
    [],
  );

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const toggleLogs = useCallback(() => setIsLogsOpen((open) => !open), []);

  const onPublish = useCallback(() => {
    publishApp({ appPostRequest: { launcher_id: launcher.id } });
  }, [publishApp, launcher.id]);

  const onDelete = useCallback(() => {
    if (app) {
      deleteApp({ appName: app.name });
    }
  }, [app, deleteApp]);

  const onCopyShareLink = useCallback(() => {
    const shareLink = getAppLobbyUrl({
      origin: params?.BASE_URL || window.location.origin,
      namespace: project.namespace,
      slug: project.slug,
      launcherId: launcher.id,
    });
    window.navigator.clipboard.writeText(shareLink).then(
      () =>
        renkuToastSuccess({
          textHeader: "App",
          textBody: "The share link was copied to your clipboard.",
        }),
      () =>
        renkuToastDanger({
          textHeader: "App",
          textBody: "Unable to copy the share link to your clipboard.",
        }),
    );
  }, [
    launcher.id,
    params?.BASE_URL,
    project.namespace,
    project.slug,
    renkuToastDanger,
    renkuToastSuccess,
  ]);

  const displayBuildActions =
    displayBuildActionsProp && isCodeEnvironment && write && !app;
  const applyDefaultBuildActions = Boolean(
    displayBuildActions &&
    (shouldUseOldImage || lastBuild?.status !== "succeeded"),
  );

  const menuItems = [
    write && app && !transition && (
      <MenuButtonItem
        key="delete-app"
        data-cy="app-menu-delete"
        onClick={toggleDelete}
      >
        <StopCircle className={cx("bi", "me-1")} />
        Stop app
      </MenuButtonItem>
    ),
    write &&
      app &&
      !transition &&
      isCodeEnvironment &&
      !isBuildInProgress &&
      launcher.environment.environment_image_source === "build" && (
        <MenuButtonItem
          key="rebuild-redeploy-app"
          data-cy="app-menu-rebuild-redeploy"
          onClick={toggleRedeploy}
        >
          <BootstrapReboot className={cx("bi", "me-1")} />
          Rebuild and redeploy
        </MenuButtonItem>
      ),
    displayBuildActions && !applyDefaultBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild-launcher" launcher={launcher} />
    ),
    displayBuildActions && isBuildInProgress && (
      <CancelBuildDropdownItem key="cancel-build" launcher={launcher} />
    ),
    write && app && (
      <MenuButtonItem
        key="app-logs"
        data-cy="app-menu-view-logs"
        onClick={toggleLogs}
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        View logs
      </MenuButtonItem>
    ),
    isLive && (
      <MenuButtonItem
        key="copy-share-link"
        data-cy="app-menu-copy-share-link"
        onClick={onCopyShareLink}
      >
        <Link45deg className={cx("bi", "me-1")} />
        Copy share link
      </MenuButtonItem>
    ),
    write && otherActions && (
      <Fragment key="other-actions">{otherActions}</Fragment>
    ),
  ].filter(isTruthy);
  const hasMenuItems = menuItems.length > 0;

  const defaultAction = useMemo(() => {
    if (transition) {
      return <AppTransitionButton transition={transition} />;
    }

    if (isLoadingApps || isLoadingContainerImage) {
      return <CheckingLauncherButton />;
    }

    if (!app || app.status === "failed") {
      const publishDisabled =
        !write || !isPublic || hasOtherApp || !hasValidImage;
      const tooltip = !write
        ? "You do not have permission to start apps in this project."
        : !isPublic
          ? APP_PUBLIC_PROJECT_ONLY_MESSAGE
          : hasOtherApp
            ? APP_ALREADY_EXISTS_MESSAGE
            : getLaunchActionTooltip(write, imageStatus, "app");
      const publishButton = (
        <AppActionButton
          color="primary"
          dataCy="publish-app-button"
          disabled={publishDisabled}
          icon={<Power className={cx("bi", "me-1")} />}
          label={app?.status === "failed" ? "Restart" : "Start"}
          onClick={onPublish}
          tooltip={tooltip}
        />
      );
      if (applyDefaultBuildActions) {
        return (
          <ButtonGroup onClick={(e) => e.stopPropagation()}>
            <BuildLauncherButtons
              launcher={launcher}
              isMainButton={false}
              showCancelBuild={false}
            />
            {publishButton}
          </ButtonGroup>
        );
      }
      return publishButton;
    }

    if (!isLive) {
      return (
        <AppActionButton
          color="primary"
          dataCy="open-app-button"
          disabled
          icon={<BoxArrowUpRight className={cx("bi", "me-1")} />}
          label="Open"
          tooltip={APP_STARTING_MESSAGE}
        />
      );
    }

    return (
      <Button
        color="primary"
        data-cy="open-app-button"
        href={lobbyPath}
        onClick={(event) => event.stopPropagation()}
        rel="noreferrer noopener"
        size="sm"
        tag="a"
        target="_blank"
      >
        <BoxArrowUpRight className={cx("bi", "me-1")} />
        Open
      </Button>
    );
  }, [
    app,
    applyDefaultBuildActions,
    lobbyPath,
    hasOtherApp,
    hasValidImage,
    imageStatus,
    isLive,
    isLoadingApps,
    isLoadingContainerImage,
    isPublic,
    launcher,
    onPublish,
    transition,
    write,
  ]);

  const actionControl = isLoadingPermissions ? (
    <CheckingLauncherButton />
  ) : !hasMenuItems ? (
    defaultAction
  ) : (
    <MenuButton
      color="primary"
      default={defaultAction}
      preventPropagation
      dataCy="app-button-with-menu-dropdown"
    >
      {menuItems}
    </MenuButton>
  );

  return (
    <>
      <div className={cx("d-flex", "align-items-center", "gap-2")}>
        {isLive && !transition && <AppLiveIndicator />}
        {actionControl}
      </div>
      {app && (
        <>
          <DeleteAppModal
            appName={app.name}
            isOpen={isDeleteOpen}
            toggle={toggleDelete}
            onConfirm={onDelete}
          />
          <RedeployAppModal
            appName={app.name}
            isOpen={isRedeployOpen}
            toggle={toggleRedeploy}
            onConfirm={onRebuildAndRedeploy}
          />
          <AppLogsModal
            appName={app.name}
            isOpen={isLogsOpen}
            toggle={toggleLogs}
          />
        </>
      )}
    </>
  );
}

const TRANSITION_LABEL: Record<AppTransition, string> = {
  rebuilding: "Rebuilding",
  starting: "Starting",
  stopping: "Stopping",
};

function AppTransitionButton({ transition }: { transition: AppTransition }) {
  return (
    <Button
      className="text-nowrap"
      color="primary"
      data-app-transition={transition}
      data-cy="app-transition-button"
      disabled
      size="sm"
      type="button"
    >
      <Loader className="me-1" inline size={12} />
      {TRANSITION_LABEL[transition]}
    </Button>
  );
}

interface AppActionButtonProps {
  color: string;
  dataCy: string;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tooltip?: string;
}

function AppActionButton({
  color,
  dataCy,
  disabled = false,
  icon,
  label,
  onClick,
  tooltip,
}: AppActionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.();
    },
    [disabled, onClick],
  );

  return (
    <>
      <Button
        innerRef={buttonRef}
        aria-disabled={disabled || undefined}
        className={cx("text-nowrap", disabled && "opacity-75")}
        color={color}
        data-cy={dataCy}
        onClick={handleClick}
        size="sm"
        type="button"
      >
        {icon}
        {label}
      </Button>
      {tooltip ? (
        <UncontrolledTooltip placement="top" target={buttonRef}>
          {tooltip}
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

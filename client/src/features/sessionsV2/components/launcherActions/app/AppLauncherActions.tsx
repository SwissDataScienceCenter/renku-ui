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
  BoxArrowUpRight,
  FileEarmarkText,
  Link45deg,
  Power,
  ToggleOff,
} from "react-bootstrap-icons";
import {
  Button,
  ButtonGroup,
  DropdownItem,
  UncontrolledTooltip,
} from "reactstrap";

import {
  ButtonWithMenuV2,
  SingleButtonWithMenu,
} from "~/components/buttons/Button";
import { Loader } from "~/components/Loader";
import useRenkuToast from "~/components/toast/useRenkuToast";
import AppLogsModal from "~/features/logsDisplay/AppLogsModal";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { AppStatus } from "~/features/sessionsV2/api/apps.api";
import {
  useDeleteAppsByAppNameMutation,
  usePostAppsMutation,
} from "~/features/sessionsV2/api/apps.api";
import { DeleteAppModal } from "~/features/sessionsV2/apps/AppActionModals";
import AppLiveIndicator from "~/features/sessionsV2/apps/AppLiveIndicator";
import type { AppTransition } from "~/features/sessionsV2/apps/apps.utils";
import {
  APP_ALREADY_EXISTS_MESSAGE,
  APP_PUBLIC_PROJECT_ONLY_MESSAGE,
  getAppLobbyPath,
  getAppLobbyUrl,
  getAppTransition,
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

// Statuses that end a publish wait: the app is up ("ready") or it has settled
// into a terminal failure. Kept module-level so the array is stable across
// renders (it feeds a query-options object).
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
  } = useLauncherEnvironmentReadiness({ builds, launcher, lastBuild });

  // One mutation instance per action so their life cycles (isLoading /
  // isSuccess / reset) stay independent and can each drive their own wait.
  const [publishApp, publishResult] = usePostAppsMutation();
  const [deleteApp, deleteResult] = useDeleteAppsByAppNameMutation();

  // While an action is in flight, poll /apps until the deployment reaches the
  // action's target, then reset the mutation (which flips `skip` back on and
  // stops the poll). This mirrors ActiveSessionButton + useWaitForSessionStatus:
  // the transitions are async server-side, so the single cache-invalidation
  // refetch a mutation triggers is not enough on its own.
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

  // Publish: clear once the app has settled (up, or failed), or on error.
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

  // Delete: clear once the app is gone (or on error).
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

  // The transition the primary action should report: a mutation is in flight, or
  // it returned but the server-side effect has not settled yet.
  const transition = getAppTransition(app, {
    isStarting: publishResult.isLoading || isSpinningUp,
    isStopping: deleteResult.isLoading || isDeleting,
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => setIsDeleteOpen((open) => !open), []);

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
      <DropdownItem
        key="delete-app"
        className="text-danger"
        data-cy="app-menu-delete"
        onClick={toggleDelete}
      >
        <ToggleOff className={cx("bi", "me-1")} />
        Stop app
      </DropdownItem>
    ),
    displayBuildActions && !applyDefaultBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild-launcher" launcher={launcher} />
    ),
    displayBuildActions && isBuildInProgress && (
      <CancelBuildDropdownItem key="cancel-build" launcher={launcher} />
    ),
    write && app && (
      <DropdownItem
        key="app-logs"
        data-cy="app-menu-view-logs"
        onClick={toggleLogs}
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        View logs
      </DropdownItem>
    ),
    isLive && (
      <DropdownItem
        key="copy-share-link"
        data-cy="app-menu-copy-share-link"
        onClick={onCopyShareLink}
      >
        <Link45deg className={cx("bi", "me-1")} />
        Copy share link
      </DropdownItem>
    ),
    write && otherActions && (
      <Fragment key="other-actions">{otherActions}</Fragment>
    ),
  ].filter(isTruthy);
  const hasMenuItems = menuItems.length > 0;

  const defaultAction = useMemo(() => {
    // A start or stop has not settled yet: hold the slot with a disabled
    // progress button rather than dropping the primary action, so the card does
    // not appear to lose its button mid-transition.
    if (transition) {
      return <AppTransitionButton transition={transition} />;
    }

    if (isLoadingApps || isLoadingContainerImage) {
      return <CheckingLauncherButton />;
    }

    // No deployment yet (or the previous one failed): offer "Publish".
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

    // Defensive: every known status is handled above, so this only trips if the
    // backend grows a new one.
    if (!isLive) {
      return null;
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
  ) : defaultAction ? (
    <ButtonWithMenuV2
      color="primary"
      default={defaultAction}
      preventPropagation
      size="sm"
      dataCy="app-button-with-menu-dropdown"
    >
      {menuItems}
    </ButtonWithMenuV2>
  ) : (
    // No primary action to offer: fall back to a menu-only kebab so the actions
    // stay reachable without a primary button.
    <div onClick={(event) => event.stopPropagation()}>
      <SingleButtonWithMenu color="primary" size="sm">
        {menuItems}
      </SingleButtonWithMenu>
    </div>
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
  starting: "Starting",
  stopping: "Stopping",
};

/**
 * The primary action slot while a start or stop is settling: a disabled button
 * carrying a spinner and the transition's label.
 */
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
  onClick: () => void;
  tooltip?: string;
}

/** A small button that guards its click when disabled and shows a tooltip. */
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
      onClick();
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

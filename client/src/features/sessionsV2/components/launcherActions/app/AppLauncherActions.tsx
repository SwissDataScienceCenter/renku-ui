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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BoxArrowUpRight,
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
import useRenkuToast from "~/components/toast/useRenkuToast";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { AppStatus } from "~/features/sessionsV2/api/apps.api";
import {
  useDeleteAppsByAppNameMutation,
  usePostAppsMutation,
} from "~/features/sessionsV2/api/apps.api";
import { DeleteAppModal } from "~/features/sessionsV2/apps/AppActionModals";
import AppStatusIndicator from "~/features/sessionsV2/apps/AppStatusIndicator";
import {
  APP_ALREADY_EXISTS_MESSAGE,
  APP_PUBLIC_PROJECT_ONLY_MESSAGE,
  getAppIndicatorState,
  hasAppOnAnotherLauncher,
  toSecureAppUrl,
} from "~/features/sessionsV2/apps/apps.utils";
import useAppForLauncher from "~/features/sessionsV2/apps/useAppForLauncher.hook";
import useWaitForAppStatus from "~/features/sessionsV2/apps/useWaitForAppStatus.hook";
import {
  getLaunchActionTooltip,
  isTruthy,
} from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import BuildLauncherButtons, {
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
  const appUrl = app?.url ? toSecureAppUrl(app.url) : undefined;
  const canOpen = isLive && !!appUrl;

  const {
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

  // Busy while a mutation is in flight or its transition has not yet settled, so
  // the button shows progress instead of a stale action the whole time.
  const isBusy =
    publishResult.isLoading ||
    deleteResult.isLoading ||
    isSpinningUp ||
    isDeleting;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => setIsDeleteOpen((open) => !open), []);

  const onPublish = useCallback(() => {
    publishApp({ appPostRequest: { launcher_id: launcher.id } });
  }, [publishApp, launcher.id]);

  const onDelete = useCallback(() => {
    if (app) {
      deleteApp({ appName: app.name });
    }
  }, [app, deleteApp]);

  const onCopyUrl = useCallback(() => {
    if (!appUrl) {
      return;
    }
    window.navigator.clipboard.writeText(appUrl).then(
      () =>
        renkuToastSuccess({
          textHeader: "App",
          textBody: "The app URL was copied to your clipboard.",
        }),
      () =>
        renkuToastDanger({
          textHeader: "App",
          textBody: "Unable to copy the app URL to your clipboard.",
        }),
    );
  }, [appUrl, renkuToastDanger, renkuToastSuccess]);

  // The pill shown next to the primary action. While a publish is in flight but
  // the deployment has not yet surfaced in the /apps response, force "starting"
  // so the indicator reflects intent immediately.
  const indicatorState = getAppIndicatorState(app, {
    isStarting: isSpinningUp || publishResult.isLoading,
  });

  const displayBuildActions =
    displayBuildActionsProp && isCodeEnvironment && write && !app;
  const applyDefaultBuildActions = Boolean(
    displayBuildActions &&
    (shouldUseOldImage || lastBuild?.status !== "succeeded"),
  );

  const menuItems = [
    write && app && (
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
    canOpen && appUrl && (
      <DropdownItem
        key="copy-app-url"
        data-cy="app-menu-copy-url"
        onClick={onCopyUrl}
      >
        <Link45deg className={cx("bi", "me-1")} />
        Copy app URL
      </DropdownItem>
    ),
    write && otherActions && (
      <Fragment key="other-actions">{otherActions}</Fragment>
    ),
  ].filter(isTruthy);
  const hasMenuItems = menuItems.length > 0;

  const defaultAction = useMemo(() => {
    if (isLoadingApps || isLoadingContainerImage || isBusy) {
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
            <BuildLauncherButtons launcher={launcher} isMainButton={false} />
            {publishButton}
          </ButtonGroup>
        );
      }
      return publishButton;
    }

    // Stopped: the UI no longer offers start/resume for a hibernated app (that
    // only arrives via platform-side hibernation now), so it has no primary
    // action and is managed through the menu only (Stop app). Return null and
    // let the caller render a menu-only control.
    if (app.status === "hibernated") {
      return null;
    }

    // Still starting (pending): nothing to open yet, show the in-progress
    // indicator until the deployment settles.
    if (!isLive) {
      return <CheckingLauncherButton />;
    }

    // Live: opening the app is the only primary action. Stop app / Copy URL
    // live in the dropdown menu alongside the launcher-level actions.
    return (
      <Button
        color="primary"
        data-cy="open-app-button"
        disabled={!canOpen}
        href={canOpen ? appUrl : undefined}
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
    appUrl,
    applyDefaultBuildActions,
    canOpen,
    hasOtherApp,
    hasValidImage,
    imageStatus,
    isBusy,
    isLive,
    isLoadingApps,
    isLoadingContainerImage,
    isPublic,
    launcher,
    onPublish,
    write,
  ]);

  const actionControl = isLoadingPermissions ? (
    <CheckingLauncherButton />
  ) : !write || !hasMenuItems ? (
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
    // No primary action (e.g. an app the platform hibernated): show a menu-only
    // kebab so Stop app stays reachable without a primary button.
    <div onClick={(event) => event.stopPropagation()}>
      <SingleButtonWithMenu color="primary" size="sm">
        {menuItems}
      </SingleButtonWithMenu>
    </div>
  );

  return (
    <>
      <div className={cx("d-flex", "align-items-center", "gap-2")}>
        {!isLoadingApps && <AppStatusIndicator state={indicatorState} />}
        {actionControl}
      </div>
      {app && (
        <DeleteAppModal
          appName={app.name}
          isOpen={isDeleteOpen}
          toggle={toggleDelete}
          onConfirm={onDelete}
        />
      )}
    </>
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

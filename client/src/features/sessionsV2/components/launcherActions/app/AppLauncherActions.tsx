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
  PauseCircle,
  PlayFill,
  Rocket,
  Trash,
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
import { Clipboard } from "~/components/clipboard/Clipboard";
import useRenkuToast from "~/components/toast/useRenkuToast";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import type { AppStatus } from "~/features/sessionsV2/api/apps.api";
import {
  useDeleteAppsByAppNameMutation,
  usePatchAppsByAppNameMutation,
  usePostAppsMutation,
} from "~/features/sessionsV2/api/apps.api";
import {
  DeleteAppModal,
  StopAppModal,
} from "~/features/sessionsV2/apps/AppActionModals";
import {
  APP_PUBLIC_PROJECT_ONLY_MESSAGE,
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

// Statuses that end a publish/resume wait: the app is up ("ready") or it has
// settled into a terminal failure. Statuses that end a stop wait: the app is
// scaled down ("hibernated") or has settled as failed. Kept module-level so the
// arrays are stable across renders (they feed a query-options object).
const APP_SPIN_UP_TARGET: AppStatus[] = ["ready", "failed"];
const APP_STOP_TARGET: AppStatus[] = ["hibernated", "failed"];

// Stop and Resume are temporarily disabled: the backend does not yet apply the
// stop/resume transitions, so the buttons would appear to do nothing. The
// supporting code (mutations, wait hooks, modal) is kept behind this flag; set
// it back to `true` once the backend applies those transitions to restore the
// actions. Typed as `boolean` (not the literal `false`) so the gated branches
// stay type-reachable and lint-clean.
const APP_STOP_RESUME_ENABLED: boolean = false;

export default function AppLauncherActions({
  builds,
  lastBuild,
  launcher,
  otherActions,
  project,
  displayBuildActions: displayBuildActionsProp,
}: LauncherCardActionsProps) {
  const { renkuToastDanger } = useRenkuToast();
  const { isLoadingPermissions, write } = useProjectPermissions({
    projectId: launcher.project_id,
  });
  const isPublic = project.visibility === "public";

  const { app, isLoading: isLoadingApps } = useAppForLauncher({
    projectId: project.id,
    launcherId: launcher.id,
  });
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
  const [resumeApp, resumeResult] = usePatchAppsByAppNameMutation();
  const [stopApp, stopResult] = usePatchAppsByAppNameMutation();
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
    skip: publishResult.isUninitialized && resumeResult.isUninitialized,
  });
  const { isWaiting: isStopping } = useWaitForAppStatus({
    projectId: project.id,
    launcherId: launcher.id,
    target: { desiredStatus: APP_STOP_TARGET },
    skip: stopResult.isUninitialized,
  });
  const { isWaiting: isDeleting } = useWaitForAppStatus({
    projectId: project.id,
    launcherId: launcher.id,
    target: { deletion: true },
    skip: deleteResult.isUninitialized,
  });

  const { reset: resetPublish } = publishResult;
  const { reset: resetResume } = resumeResult;
  const { reset: resetStop } = stopResult;
  const { reset: resetDelete } = deleteResult;

  // Publish / resume: clear once the app has settled (up, or failed), or on error.
  useEffect(() => {
    if (publishResult.isError || resumeResult.isError) {
      renkuToastDanger({
        textHeader: "App",
        textBody: "Unable to start the app.",
      });
      resetPublish();
      resetResume();
    } else if (
      (publishResult.isSuccess || resumeResult.isSuccess) &&
      !isSpinningUp
    ) {
      resetPublish();
      resetResume();
    }
  }, [
    publishResult.isError,
    publishResult.isSuccess,
    resumeResult.isError,
    resumeResult.isSuccess,
    isSpinningUp,
    renkuToastDanger,
    resetPublish,
    resetResume,
  ]);

  // Stop: clear once the app is scaled down (or on error).
  useEffect(() => {
    if (stopResult.isError) {
      renkuToastDanger({
        textHeader: "App",
        textBody: "Unable to stop the app.",
      });
      resetStop();
    } else if (stopResult.isSuccess && !isStopping) {
      resetStop();
    }
  }, [
    stopResult.isError,
    stopResult.isSuccess,
    isStopping,
    renkuToastDanger,
    resetStop,
  ]);

  // Delete: clear once the app is gone (or on error).
  useEffect(() => {
    if (deleteResult.isError) {
      renkuToastDanger({
        textHeader: "App",
        textBody: "Unable to delete the app.",
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
    resumeResult.isLoading ||
    stopResult.isLoading ||
    deleteResult.isLoading ||
    isSpinningUp ||
    isStopping ||
    isDeleting;

  const [isStopOpen, setIsStopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleStop = useCallback(() => setIsStopOpen((open) => !open), []);
  const toggleDelete = useCallback(() => setIsDeleteOpen((open) => !open), []);

  const onPublish = useCallback(() => {
    publishApp({ appPostRequest: { launcher_id: launcher.id } });
  }, [publishApp, launcher.id]);

  const onResume = useCallback(() => {
    if (app) {
      resumeApp({ appName: app.name, appPatchRequest: { state: "running" } });
    }
  }, [app, resumeApp]);

  const onStop = useCallback(() => {
    if (app) {
      stopApp({ appName: app.name, appPatchRequest: { state: "hibernated" } });
    }
  }, [app, stopApp]);

  const onDelete = useCallback(() => {
    if (app) {
      deleteApp({ appName: app.name });
    }
  }, [app, deleteApp]);

  const displayBuildActions =
    displayBuildActionsProp && isCodeEnvironment && write && !app;
  const applyDefaultBuildActions = Boolean(
    displayBuildActions &&
    (shouldUseOldImage || lastBuild?.status !== "succeeded"),
  );

  const menuItems = [
    displayBuildActions && !applyDefaultBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild-launcher" launcher={launcher} />
    ),
    APP_STOP_RESUME_ENABLED && write && isLive && (
      <DropdownItem key="stop-app" data-cy="stop-app-menu" onClick={toggleStop}>
        <PauseCircle className={cx("bi", "me-1")} />
        Stop app
      </DropdownItem>
    ),
    write && app && (
      <DropdownItem
        key="delete-app"
        data-cy="app-menu-delete"
        onClick={toggleDelete}
      >
        <Trash className={cx("bi", "me-1")} />
        Delete app
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
      const publishDisabled = !write || !isPublic || !hasValidImage;
      const tooltip = !write
        ? "You do not have permission to publish apps in this project."
        : !isPublic
          ? APP_PUBLIC_PROJECT_ONLY_MESSAGE
          : getLaunchActionTooltip(write, imageStatus, "app");
      const publishButton = (
        <AppActionButton
          color="primary"
          dataCy="publish-app-button"
          disabled={publishDisabled}
          icon={<Rocket className={cx("bi", "me-1")} />}
          label={app?.status === "failed" ? "Republish" : "Publish"}
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

    // Stopped: normally offers "Resume". Resume is temporarily disabled (see
    // APP_STOP_RESUME_ENABLED), so a stopped app has no primary action and is
    // managed through the menu only (Delete); return null and let the caller
    // render a menu-only control.
    if (app.status === "hibernated") {
      if (!APP_STOP_RESUME_ENABLED) {
        return null;
      }
      return (
        <AppActionButton
          color="primary"
          dataCy="resume-app-button"
          disabled={!write || !isPublic}
          icon={<PlayFill className={cx("bi", "me-1")} />}
          label="Resume"
          onClick={onResume}
          tooltip={
            !write
              ? "You do not have permission to manage apps in this project."
              : !isPublic
                ? "This app cannot be resumed because its project is not public."
                : undefined
          }
        />
      );
    }

    // Publishing (pending): nothing to open yet. With Stop enabled this is the
    // "cancel publish in progress" control; while Stop is disabled there is no
    // action to offer, so show the in-progress indicator instead.
    if (!isLive) {
      if (!APP_STOP_RESUME_ENABLED) {
        return <CheckingLauncherButton />;
      }
      return (
        <AppActionButton
          color="outline-primary"
          dataCy="stop-app-button-action"
          disabled={!write}
          icon={<PauseCircle className={cx("bi", "me-1")} />}
          label="Stop"
          onClick={toggleStop}
        />
      );
    }

    // Live: opening the app is the primary action, with a copy-URL button
    // beside it. Stop/Delete move into the dropdown menu.
    return (
      <ButtonGroup onClick={(event) => event.stopPropagation()}>
        <Button
          color="primary"
          data-cy="open-app-button"
          disabled={!canOpen}
          href={canOpen ? appUrl : undefined}
          rel="noreferrer noopener"
          size="sm"
          tag="a"
          target="_blank"
        >
          <BoxArrowUpRight className={cx("bi", "me-1")} />
          Open app
        </Button>
        {canOpen && appUrl && (
          <Clipboard
            className={cx(
              "btn",
              "btn-outline-primary",
              "btn-sm",
              "d-inline-flex",
              "align-items-center",
            )}
            clipboardText={appUrl}
          />
        )}
      </ButtonGroup>
    );
  }, [
    app,
    appUrl,
    applyDefaultBuildActions,
    canOpen,
    hasValidImage,
    imageStatus,
    isBusy,
    isLive,
    isLoadingApps,
    isLoadingContainerImage,
    isPublic,
    launcher,
    onPublish,
    onResume,
    toggleStop,
    write,
  ]);

  return (
    <>
      {isLoadingPermissions ? (
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
        // No primary action (e.g. a stopped app while Resume is disabled): show
        // a menu-only kebab so Delete stays reachable without a primary button.
        <div onClick={(event) => event.stopPropagation()}>
          <SingleButtonWithMenu color="primary" size="sm">
            {menuItems}
          </SingleButtonWithMenu>
        </div>
      )}
      {app && (
        <>
          <StopAppModal
            appName={app.name}
            isOpen={isStopOpen}
            toggle={toggleStop}
            onConfirm={onStop}
          />
          <DeleteAppModal
            appName={app.name}
            isOpen={isDeleteOpen}
            toggle={toggleDelete}
            onConfirm={onDelete}
          />
        </>
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

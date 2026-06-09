/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query/react";
import cx from "classnames";
import { ReactNode, useCallback } from "react";
import { PlayCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { Button, ButtonGroup, UncontrolledTooltip } from "reactstrap";

import { Loader } from "~/components/Loader";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
  toggleLauncherHash,
} from "~/features/sessionsV2/session.utils";
import StartSessionButton from "~/features/sessionsV2/StartSessionButton";
import useLocationHash from "~/utils/customHooks/useLocationHash.hook";
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { projectV2Api } from "../../projectsV2/api/projectV2.enhanced-api";
import {
  Build,
  SessionLauncher,
} from "../api/sessionLaunchersV2.generated-api";
import {
  useGetSessionsImagesQuery,
  type ImageCheckResponse,
} from "../api/sessionsV2.api";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "../session.constants";
import { LauncherCategory } from "../sessionsV2.types";
import BuildLauncherButtons, {
  RebuildLauncherDropdownItem,
} from "./BuildLauncherButtons";
import SubmitJobLauncherAction from "./SubmitJobLauncherAction";

interface SessionLauncherDefaultAction
  extends Pick<
    SessionLauncherButtonsProps,
    "hasSession" | "launcher" | "namespace" | "slug"
  > {
  displayBuildActions: boolean;
  displayLaunchSession: boolean;
  displaySubmitJob: boolean;
  imageCheckData: ImageCheckResponse | undefined;
  imageCheckLoading: boolean;
  launcherCategory: LauncherCategory;
}

function SessionLauncherDefaultAction({
  displayBuildActions,
  displayLaunchSession,
  displaySubmitJob,
  hasSession,
  launcherCategory,
  imageCheckData,
  imageCheckLoading,
  launcher,
  namespace,
  slug,
}: SessionLauncherDefaultAction) {
  const { environment } = launcher;
  const isExternalImageEnvironment =
    environment.environment_kind === "CUSTOM" &&
    environment.environment_image_source === "image";

  const [, setHash] = useLocationHash();
  const toggleLauncherView = useCallback(() => {
    setHash((prev) => toggleLauncherHash(prev, launcher.id));
  }, [launcher.id, setHash]);

  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    }
  );

  if (imageCheckLoading)
    return (
      <Button color="outline-primary" className={cx("disabled")} size="sm">
        <Loader size={12} inline /> Checking launcher
      </Button>
    );

  const launchAction =
    launcherCategory === "session"
      ? displayLaunchSession && (
          <span id={`launch-btn-${launcher.id}`}>
            <Link
              className={cx(
                "btn",
                "btn-sm",
                hasSession ? "btn-outline-primary" : "btn-primary",
                hasSession && "disabled",
                displayBuildActions ? "rounded-0" : "rounded-end-0"
              )}
              to={startUrl}
              data-cy="start-session-button"
            >
              <PlayCircle className={cx("bi", "me-1")} />
              Launch
            </Link>
          </span>
        )
      : displaySubmitJob &&
        launcher && (
          <span id={`launch-btn-${launcher.id}`}>
            <SubmitJobLauncherAction
              launcher={launcher}
              className={displayBuildActions ? "rounded-0" : "rounded-end-0"}
            />
          </span>
        );

  const isMainButton = launcherCategory === "session";

  if (displayBuildActions) {
    return (
      <ButtonGroup onClick={(e) => e.stopPropagation()}>
        <BuildLauncherButtons launcher={launcher} isMainButton={isMainButton} />
        {launchAction}
      </ButtonGroup>
    );
  }

  const shouldShowPrimaryAction =
    launcherCategory === "session"
      ? displayLaunchSession &&
        (!isExternalImageEnvironment || imageCheckData?.accessible)
      : displaySubmitJob;

  if (shouldShowPrimaryAction) {
    return launchAction;
  }

  return (
    <span id={`open-panel-btn-${launcher.id}`}>
      <Button
        className="rounded-end-0"
        color="outline-primary"
        size="sm"
        onClick={toggleLauncherView}
        data-cy="open-panel-button"
      >
        Show launcher details
      </Button>
    </span>
  );
}

interface SessionLauncherButtonsProps {
  hasSession?: boolean;
  lastBuild?: Build;
  launcher: SessionLauncher;
  namespace: string;
  otherActions?: ReactNode;
  slug: string;
  useOldImage?: boolean;
}

export function SessionLauncherButtons({
  hasSession,
  lastBuild,
  launcher,
  namespace,
  otherActions,
  slug,
  useOldImage,
}: SessionLauncherButtonsProps) {
  const launcherCategory = getLauncherCategory(launcher);
  const { environment } = launcher;
  const {
    isLoading: isLoadingPermissions,
    isUninitialized: isPermissionsUninitialized,
  } = projectV2Api.endpoints.getProjectsByProjectIdPermissions.useQueryState(
    launcher.project_id ? { projectId: launcher.project_id } : skipToken
  );
  const permissions = useProjectPermissions({ projectId: launcher.project_id });
  const arePermissionsResolved =
    !isLoadingPermissions && !isPermissionsUninitialized;
  const isCodeEnvironment = environment.environment_image_source === "build";
  const isExternalImageEnvironment =
    environment.environment_kind === "CUSTOM" &&
    environment.environment_image_source === "image";
  const categoryDefinition = getLauncherCategoryDefinition(launcherCategory);
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    }
  );
  const { data, isLoading } = useGetSessionsImagesQuery(
    environment.environment_kind === "CUSTOM" && environment.container_image
      ? { imageUrl: environment.container_image }
      : skipToken
  );
  const displayLaunchSession =
    !isCodeEnvironment ||
    (isCodeEnvironment && lastBuild?.status === "succeeded") ||
    (isCodeEnvironment && data?.accessible) ||
    (useOldImage ?? false);

  const displayBuildActions =
    isCodeEnvironment &&
    permissions.write &&
    (useOldImage || lastBuild?.status !== "succeeded");

  const isBuildInProgress =
    isCodeEnvironment && lastBuild?.status === "in_progress";

  const hasValidImage =
    !isCodeEnvironment ||
    lastBuild?.status === "succeeded" ||
    data?.accessible === true ||
    (useOldImage ?? false);

  const showSubmitJob =
    launcherCategory === "job" &&
    !(isBuildInProgress && !hasValidImage && !(useOldImage ?? false));

  const defaultAction = (
    <SessionLauncherDefaultAction
      displayBuildActions={displayBuildActions}
      displayLaunchSession={displayLaunchSession}
      displaySubmitJob={showSubmitJob}
      launcherCategory={launcherCategory}
      imageCheckData={data}
      imageCheckLoading={isLoading}
      hasSession={hasSession}
      launcher={launcher}
      namespace={namespace}
      slug={slug}
    />
  );

  const force = isExternalImageEnvironment && !isLoading && !data?.accessible;

  const customizeLaunch = displayLaunchSession &&
    launcherCategory === "session" && (
      <Link
        className={cx("dropdown-item", hasSession && "disabled")}
        to={{
          pathname: startUrl,
          search: new URLSearchParams({
            [CUSTOM_LAUNCH_SEARCH_PARAM]: "1",
          }).toString(),
        }}
        data-cy="start-custom-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        {force ? "Force custom launch" : "Custom launch"}
      </Link>
    );

  const launchAnyway = displayLaunchSession &&
    launcherCategory === "session" && (
      <Link
        className={cx("dropdown-item", hasSession && "disabled")}
        to={startUrl}
        data-cy="start-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        {force ? "Force launch" : "Launch"}
      </Link>
    );

  if (!defaultAction) return null;

  if (
    launcherCategory === "job" &&
    arePermissionsResolved &&
    !permissions.write
  )
    return (
      <StartSessionButton
        launcher={launcher}
        namespace={namespace}
        slug={slug}
        launcherCategory={launcherCategory}
        isDisabledDropdownToggle={true}
      />
    );

  return (
    <>
      <ButtonWithMenuV2
        color={
          displayBuildActions || (launcherCategory === "session" && hasSession)
            ? "outline-primary"
            : "primary"
        }
        default={defaultAction}
        preventPropagation
        size="sm"
        // hasSession disables the dropdown for session launchers (one session each).
        // Job launchers allow multiple jobs; the Submit button stays enabled.
        disabled={hasSession}
        isDisabledDropdownToggle={false}
      >
        {isExternalImageEnvironment && !data?.accessible && launchAnyway}
        {customizeLaunch}
        {isCodeEnvironment && permissions.write && !displayBuildActions && (
          <RebuildLauncherDropdownItem launcher={launcher} />
        )}
        {otherActions}
      </ButtonWithMenuV2>
      {hasSession && launcher && launcherCategory === "session" ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : useOldImage && data?.accessible !== false && launcher ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Launch {categoryDefinition.text.inline} using an older image
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

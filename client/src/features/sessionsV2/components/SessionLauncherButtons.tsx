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
import { ReactNode, useCallback, useMemo } from "react";
import { Gear, PlayCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { Button, ButtonGroup, UncontrolledTooltip } from "reactstrap";
import { Loader } from "~/components/Loader";
import useLocationHash from "~/utils/customHooks/useLocationHash.hook";
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import {
  Build,
  SessionLauncher,
} from "../api/sessionLaunchersV2.generated-api";
import { useGetSessionsImagesQuery } from "../api/sessionsV2.api";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "../session.constants";
import BuildLauncherButtons from "./BuildLauncherButtons";

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
  const { environment } = launcher;
  const permissions = useProjectPermissions({ projectId: launcher.project_id });
  const isCodeEnvironment = environment.environment_image_source === "build";
  const isExternalImageEnvironment =
    environment.environment_kind === "CUSTOM" &&
    environment.environment_image_source === "image";

  const [, setHash] = useLocationHash();
  const launcherHash = useMemo(() => `launcher-${launcher.id}`, [launcher.id]);
  const toggleLauncherView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === launcherHash;
      return isOpen ? "" : launcherHash;
    });
  }, [launcherHash, setHash]);

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
  const onClickFix = (e: React.MouseEvent) => e.stopPropagation();
  const displayLaunchSession =
    !isCodeEnvironment ||
    (isCodeEnvironment && lastBuild?.status === "succeeded") ||
    (isCodeEnvironment && data?.accessible) ||
    useOldImage;

  const buildActions = isCodeEnvironment &&
    permissions.write &&
    (useOldImage || lastBuild?.status !== "succeeded") && (
      <BuildLauncherButtons
        launcher={launcher}
        isMainButton={!displayLaunchSession}
      />
    );

  const launchAction = displayLaunchSession && (
    <span id={`launch-btn-${launcher.id}`}>
      <Link
        className={cx(
          "btn",
          "btn-sm",
          hasSession ? "btn-outline-primary" : "btn-primary",
          hasSession && "disabled",
          buildActions ? "rounded-0" : "rounded-end-0"
        )}
        to={startUrl}
        data-cy="start-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        Launch
      </Link>
    </span>
  );

  const openPanelAction = displayLaunchSession &&
    isExternalImageEnvironment &&
    !data?.accessible && (
      <span id={`open-panel-btn-${launcher.id}`}>
        <Button
          className="rounded-end-0"
          color="outline-primary"
          size="sm"
          onClick={toggleLauncherView}
          data-cy="open-panel-button"
        >
          <Gear className={cx("bi", "me-1")} />
          Show launcher details
        </Button>
      </span>
    );

  const loadingPlaceholder = isLoading && (
    <Button color="outline-primary" className={cx("disabled")} size="sm">
      <Loader size={12} inline /> Checking launcher
    </Button>
  );

  const defaultAction = buildActions ? (
    <ButtonGroup onClick={onClickFix}>
      {buildActions}
      {launchAction}
    </ButtonGroup>
  ) : launchAction && (!isExternalImageEnvironment || data?.accessible) ? (
    launchAction
  ) : (isExternalImageEnvironment && !isLoading) ||
    (!isExternalImageEnvironment && !data?.accessible) ? (
    openPanelAction
  ) : (
    loadingPlaceholder
  );

  const force = defaultAction === openPanelAction;

  const customizeLaunch = displayLaunchSession && (
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

  const launchAnyway = displayLaunchSession && (
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
  return (
    <>
      <ButtonWithMenuV2
        color={"primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
        disabled={hasSession}
        isDisabledDropdownToggle={false}
      >
        {isExternalImageEnvironment && !data?.accessible && launchAnyway}
        {customizeLaunch}
        {otherActions}
      </ButtonWithMenuV2>
      {hasSession && displayLaunchSession && !data?.accessible === false ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : useOldImage && !data?.accessible === false ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Launch session using an older image
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

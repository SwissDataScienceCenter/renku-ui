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
import cx from "classnames";
import { ReactNode } from "react";
import { PlayCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { ButtonGroup, UncontrolledTooltip } from "reactstrap";
import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import {
  Build,
  SessionLauncher,
} from "../api/sessionLaunchersV2.generated-api";
import { BuildLauncherButtons } from "./BuildLauncherButtons";

interface SessionLauncherButtonsProps {
  namespace: string;
  slug: string;
  launcher: SessionLauncher;
  hasSession?: boolean;
  useOldImage?: boolean;
  otherActions?: ReactNode;
  lastBuild?: Build;
}
export function SessionLauncherButtons({
  launcher,
  namespace,
  slug,
  hasSession,
  useOldImage,
  otherActions,
  lastBuild,
}: SessionLauncherButtonsProps) {
  const environment = launcher?.environment;
  const isBuildEnvironment =
    environment && environment.environment_image_source === "build";
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    }
  );
  const onClickFix = (e: React.MouseEvent) => e.stopPropagation();
  const displayLaunchSession =
    !isBuildEnvironment ||
    (isBuildEnvironment && lastBuild?.status === "succeeded") ||
    useOldImage;

  const buildActions = isBuildEnvironment &&
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

  const defaultAction = buildActions ? (
    <ButtonGroup onClick={onClickFix}>
      {buildActions}
      {launchAction}
    </ButtonGroup>
  ) : (
    launchAction
  );

  const customizeLaunch = displayLaunchSession && (
    <Link
      className={cx("dropdown-item", hasSession && "disabled")}
      to={{
        pathname: startUrl,
        search: new URLSearchParams({ custom: "1" }).toString(),
      }}
      data-cy="start-custom-session-button"
    >
      <PlayCircle className={cx("bi", "me-1")} />
      Custom launch
    </Link>
  );

  return (
    <>
      <ButtonWithMenuV2
        color={hasSession ? "outline-primary" : "primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
        disabled={hasSession}
        isDisabledDropdownToggle={false}
      >
        {customizeLaunch}
        {otherActions}
      </ButtonWithMenuV2>
      {hasSession && displayLaunchSession ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : useOldImage ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Launch session using an older image
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

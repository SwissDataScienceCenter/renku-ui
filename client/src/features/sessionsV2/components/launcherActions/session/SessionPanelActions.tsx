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
import { generatePath } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "../../../session.constants";
import SessionLaunchLink, {
  sessionLaunchLinkTargetId,
} from "../shared/SessionLaunchLink";
import type { LauncherPanelActionsProps } from "../types";

export default function SessionPanelActions({
  hasSession,
  launcher,
  namespace,
  slug,
  useOldImage,
}: LauncherPanelActionsProps) {
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    },
  );

  const { forceLaunch, isLaunchButtonDisabled } =
    useLauncherEnvironmentReadiness({
      launcher,
      useOldImage,
    });

  const permissions = useProjectPermissions({ projectId: launcher.project_id });

  const isDisabled = isLaunchButtonDisabled || !!hasSession;

  const launchButtonDisableReason = hasSession
    ? "Cannot launch more than 1 session per session launcher."
    : `No image available. ${
        permissions.write
          ? "Run the Build action"
          : "Contact the project administrator "
      } to generate an image.`;

  const launchAction = (
    <>
      <SessionLaunchLink
        className={cx(
          "btn",
          "btn-sm",
          forceLaunch ? "btn-outline-primary" : "btn-primary",
          "rounded-end-0",
          isDisabled && "disabled",
        )}
        isPrimaryAction
        label={forceLaunch ? "Force launch" : "Launch"}
        launcherId={launcher.id}
        to={startUrl}
      />
      {isDisabled && (
        <UncontrolledTooltip
          placement="top"
          target={sessionLaunchLinkTargetId(launcher.id)}
        >
          {launchButtonDisableReason}
        </UncontrolledTooltip>
      )}
    </>
  );

  const customizeLaunchUrl = {
    pathname: startUrl,
    search: new URLSearchParams({
      [CUSTOM_LAUNCH_SEARCH_PARAM]: "1",
    }).toString(),
  };

  return (
    <ButtonWithMenuV2
      color="primary"
      default={launchAction}
      preventPropagation
      size="sm"
      disabled={isDisabled}
    >
      <SessionLaunchLink
        className={cx("dropdown-item", hasSession && "disabled")}
        isCustomLaunch
        label={forceLaunch ? "Force custom launch" : "Custom launch"}
        launcherId={launcher.id}
        to={customizeLaunchUrl}
      />
    </ButtonWithMenuV2>
  );
}

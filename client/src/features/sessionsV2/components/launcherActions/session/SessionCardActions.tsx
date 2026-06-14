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
import { Fragment, type ReactNode } from "react";
import { generatePath } from "react-router";
import { ButtonGroup, UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { getLauncherCategoryDefinition } from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "../../../session.constants";
import BuildLauncherButtons, {
  RebuildLauncherDropdownItem,
} from "../../BuildLauncherButtons";
import CheckingLauncherButton from "../shared/CheckingLauncherButton";
import SessionLaunchLink, {
  sessionLaunchLinkTargetId,
} from "../shared/SessionLaunchLink";
import ShowLauncherDetailsButton from "../shared/ShowLauncherDetailsButton";
import type { LauncherCardActionsProps } from "../types";

export default function SessionCardActions({
  hasSession,
  lastBuild,
  launcher,
  namespace,
  otherActions,
  slug,
  useOldImage,
}: LauncherCardActionsProps) {
  const permissions = useProjectPermissions({ projectId: launcher.project_id });

  const {
    containerImage,
    displayLaunchSession,
    forceLaunch,
    isCodeEnvironment,
    isExternalImageEnvironment,
    isLoadingContainerImage,
    useOldImage: resolvedUseOldImage,
  } = useLauncherEnvironmentReadiness({
    launcher,
    lastBuild,
    useOldImage,
  });

  const categoryDefinition = getLauncherCategoryDefinition("session");
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    },
  );

  const displayBuildActions =
    isCodeEnvironment &&
    permissions.write &&
    (resolvedUseOldImage || lastBuild?.status !== "succeeded");

  const customizeLaunchUrl = {
    pathname: startUrl,
    search: new URLSearchParams({
      [CUSTOM_LAUNCH_SEARCH_PARAM]: "1",
    }).toString(),
  };

  const shouldShowPrimaryLaunchAction =
    displayLaunchSession &&
    (!isExternalImageEnvironment || containerImage?.accessible);

  const hasPrimaryLaunchTarget =
    !isLoadingContainerImage &&
    displayLaunchSession &&
    (displayBuildActions || shouldShowPrimaryLaunchAction);

  const defaultAction = (() => {
    if (isLoadingContainerImage) {
      return <CheckingLauncherButton />;
    }

    const launchAction = displayLaunchSession && (
      <SessionLaunchLink
        className={cx(
          "btn",
          "btn-sm",
          hasSession ? "btn-outline-primary" : "btn-primary",
          hasSession && "disabled",
          displayBuildActions ? "rounded-0" : "rounded-end-0",
        )}
        isPrimaryAction
        label="Launch"
        launcherId={launcher.id}
        to={startUrl}
      />
    );

    if (displayBuildActions) {
      return (
        <ButtonGroup onClick={(e) => e.stopPropagation()}>
          <BuildLauncherButtons launcher={launcher} isMainButton />
          {launchAction}
        </ButtonGroup>
      );
    }

    if (shouldShowPrimaryLaunchAction) {
      return launchAction;
    }

    return <ShowLauncherDetailsButton launcherId={launcher.id} />;
  })();

  const menuItems = [
    isExternalImageEnvironment &&
      containerImage?.accessible === false &&
      displayLaunchSession && (
        <SessionLaunchLink
          key="force-launch"
          className={cx("dropdown-item", hasSession && "disabled")}
          label={forceLaunch ? "Force launch" : "Launch"}
          launcherId={launcher.id}
          to={startUrl}
        />
      ),
    displayLaunchSession && (
      <SessionLaunchLink
        key="custom-launch"
        className={cx("dropdown-item", hasSession && "disabled")}
        isCustomLaunch
        label={forceLaunch ? "Force custom launch" : "Custom launch"}
        launcherId={launcher.id}
        to={customizeLaunchUrl}
      />
    ),
    isCodeEnvironment && permissions.write && !displayBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild" launcher={launcher} />
    ),
    otherActions ? (
      <Fragment key="launcher-menu-actions">{otherActions}</Fragment>
    ) : null,
  ].filter(Boolean) as ReactNode[];

  const actionControl =
    menuItems.length === 0 ? (
      defaultAction
    ) : (
      <ButtonWithMenuV2
        color="primary"
        default={defaultAction}
        preventPropagation
        size="sm"
        disabled={hasSession}
        isDisabledDropdownToggle={false}
      >
        {menuItems}
      </ButtonWithMenuV2>
    );

  return (
    <>
      {actionControl}
      {hasSession && hasPrimaryLaunchTarget ? (
        <UncontrolledTooltip target={sessionLaunchLinkTargetId(launcher.id)}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : resolvedUseOldImage &&
        containerImage?.accessible !== false &&
        hasPrimaryLaunchTarget ? (
        <UncontrolledTooltip target={sessionLaunchLinkTargetId(launcher.id)}>
          Launch {categoryDefinition.text.inline} using an older image
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}

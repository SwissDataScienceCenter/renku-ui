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
import { Fragment, useMemo, useRef } from "react";
import { generatePath } from "react-router";
import { Button, ButtonGroup, UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetResourcePoolsQuery } from "~/features/sessionsV2/api/computeResources.api";
import { isTruthy } from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "../../../session.constants";
import BuildLauncherButtons, {
  RebuildLauncherDropdownItem,
} from "../../BuildLauncherButtons";
import CheckingLauncherButton from "../shared/CheckingLauncherButton";
import SessionLaunchLink from "../shared/SessionLaunchLink";
import ShowLauncherDetailsButton from "../shared/ShowLauncherDetailsButton";
import type { LauncherCardActionsProps } from "../types";

interface UsageQuotaReachedLaunchButtonProps {
  className?: string;
}

function UsageQuotaReachedLaunchButton({
  className,
}: UsageQuotaReachedLaunchButtonProps) {
  const tooltipTarget = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={tooltipTarget}>
        <Button
          className={cx("disabled", className)}
          color="outline-primary"
          data-cy="start-session-button"
          disabled
          size="sm"
        >
          Quota Reached
        </Button>
      </span>
      <UncontrolledTooltip target={tooltipTarget}>
        Please launch using a different resource class. The quota for this
        resource pool has been fully used.
      </UncontrolledTooltip>
    </>
  );
}

interface SessionLauncherCardActionsProps extends LauncherCardActionsProps {
  alwaysShowLaunchAction?: boolean;
}

export default function SessionLauncherActions({
  builds,
  hasSession,
  lastBuild,
  launcher,
  project,
  otherActions,
  alwaysShowLaunchAction = false,
  displayBuildActions: displayBuildActionsProp,
}: SessionLauncherCardActionsProps) {
  const { namespace, slug } = project;
  const { isLoadingPermissions, write } = useProjectPermissions({
    projectId: launcher.project_id,
  });
  const {
    containerImage,
    forceLaunch,
    hasSuccessfulBuild,
    isCodeEnvironment,
    isLoadingContainerImage,
    useOldImage: shouldUseOldImage,
    imageStatus,
  } = useLauncherEnvironmentReadiness({
    builds,
    launcher,
    lastBuild,
  });
  const { data: resourcePools, isLoading: isLoadingResourcePools } =
    useGetResourcePoolsQuery({});
  const resourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap(({ classes }) => classes)
        .find(({ id }) => id === launcher.resource_class_id),
    [launcher.resource_class_id, resourcePools],
  );
  const isUsageQuotaReached =
    resourceClass?.quota_enforced === true &&
    resourceClass.usage_hours_remaining != null &&
    resourceClass.usage_hours_remaining <= 0;

  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    },
  );
  const displayBuildActions =
    displayBuildActionsProp && isCodeEnvironment && write;

  const applyDefaultBuildActions =
    displayBuildActions &&
    (shouldUseOldImage || lastBuild?.status !== "succeeded");

  const customizeLaunchUrl = {
    pathname: startUrl,
    search: new URLSearchParams({
      [CUSTOM_LAUNCH_SEARCH_PARAM]: "1",
    }).toString(),
  };
  const displayLaunchButton =
    !isCodeEnvironment ||
    hasSuccessfulBuild ||
    containerImage?.accessible ||
    shouldUseOldImage;
  const isLaunchDisabled = !!hasSession || !displayLaunchButton;
  const menuItems = [
    displayLaunchButton && (
      <SessionLaunchLink
        key="custom-launch"
        alreadyRunningSession={!!hasSession}
        isDisabled={!!hasSession}
        className="dropdown-item"
        isCustomLaunch
        label={forceLaunch ? "Force custom launch" : "Custom launch"}
        to={customizeLaunchUrl}
        canWriteProject={write}
        imageStatus={imageStatus}
      />
    ),
    displayBuildActions && !applyDefaultBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild-launcher" launcher={launcher} />
    ),
    write && otherActions && (
      <Fragment key="other-actions">{otherActions}</Fragment>
    ),
  ].filter(isTruthy);
  const hasMenuItems = menuItems.length > 0;
  const defaultAction = useMemo(() => {
    if (isLoadingContainerImage || isLoadingResourcePools) {
      return <CheckingLauncherButton />;
    }
    if (isUsageQuotaReached) {
      return (
        <UsageQuotaReachedLaunchButton
          className={
            hasMenuItems ? cx("border-end-0", "rounded-end-0") : undefined
          }
        />
      );
    }
    const launchAction = (
      <SessionLaunchLink
        alreadyRunningSession={!!hasSession}
        isDisabled={isLaunchDisabled}
        className={cx(
          "btn",
          "btn-sm",
          hasSession ? "btn-outline-primary" : "btn-primary",
          applyDefaultBuildActions
            ? "rounded-0"
            : hasMenuItems && "rounded-end-0",
        )}
        label={forceLaunch ? "Force launch" : "Launch"}
        to={startUrl}
        canWriteProject={write}
        imageStatus={imageStatus}
      />
    );
    if (applyDefaultBuildActions) {
      return (
        <ButtonGroup onClick={(e) => e.stopPropagation()}>
          <BuildLauncherButtons
            launcher={launcher}
            isMainButton={!displayLaunchButton && !alwaysShowLaunchAction}
          />
          {displayLaunchButton && launchAction}
        </ButtonGroup>
      );
    }

    if (displayLaunchButton || alwaysShowLaunchAction) {
      return launchAction;
    }
    return (
      <ShowLauncherDetailsButton
        launcherId={launcher.id}
        className={hasMenuItems ? "rounded-end-0" : undefined}
      />
    );
  }, [
    applyDefaultBuildActions,
    forceLaunch,
    hasSession,
    isLaunchDisabled,
    isLoadingContainerImage,
    isLoadingResourcePools,
    isUsageQuotaReached,
    launcher,
    displayLaunchButton,
    startUrl,
    write,
    imageStatus,
    hasMenuItems,
    alwaysShowLaunchAction,
  ]);
  // Keep this guard after hooks and useMemo to preserve React hook call order.
  if (isLoadingPermissions) return <CheckingLauncherButton />;

  return !hasMenuItems ? (
    defaultAction
  ) : (
    <ButtonWithMenuV2
      color="primary"
      default={defaultAction}
      disabled={hasSession}
      preventPropagation
      size="sm"
    >
      {menuItems}
    </ButtonWithMenuV2>
  );
}

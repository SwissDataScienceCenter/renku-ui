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

import { Fragment, useMemo } from "react";
import { ButtonGroup } from "reactstrap";

import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { isTruthy } from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import BuildLauncherButtons, {
  RebuildLauncherDropdownItem,
} from "../../BuildLauncherButtons";
import CheckingLauncherButton from "../shared/CheckingLauncherButton";
import type { LauncherCardActionsProps } from "../types";
import JobSubmitButton from "./JobSubmitButton";

function getSubmitButtonClassName({
  applyDefaultBuildActions,
  hasMenuItems,
}: {
  applyDefaultBuildActions: boolean;
  hasMenuItems: boolean;
}) {
  if (applyDefaultBuildActions) {
    return "rounded-0";
  }
  if (hasMenuItems) {
    return "rounded-end-0";
  }
  return "";
}

export default function JobLauncherActions({
  builds,
  lastBuild,
  launcher,
  otherActions,
  project,
  displayBuildActions: displayBuildActionsProp,
}: LauncherCardActionsProps) {
  const { isLoadingPermissions, write } = useProjectPermissions({
    projectId: launcher.project_id,
  });

  const {
    isCodeEnvironment,
    isLoadingContainerImage,
    useOldImage: shouldUseOldImage,
    hasValidImage,
    imageStatus,
  } = useLauncherEnvironmentReadiness({
    builds,
    launcher,
    lastBuild,
  });

  const displayBuildActions =
    displayBuildActionsProp && isCodeEnvironment && write;

  // When only an old successful image is available or the last build failed,
  // we prioritize inline build actions over placing them in the overflow menu.
  const applyDefaultBuildActions = Boolean(
    displayBuildActions &&
    (shouldUseOldImage || lastBuild?.status !== "succeeded"),
  );

  const menuItems = [
    displayBuildActions && !applyDefaultBuildActions && (
      <RebuildLauncherDropdownItem key="rebuild-launcher" launcher={launcher} />
    ),
    write && otherActions && (
      <Fragment key="other-actions">{otherActions}</Fragment>
    ),
  ].filter(isTruthy);
  const hasMenuItems = menuItems.length > 0;

  const submitButtonClassName = getSubmitButtonClassName({
    applyDefaultBuildActions,
    hasMenuItems,
  });

  const defaultAction = useMemo(() => {
    if (isLoadingContainerImage) {
      return <CheckingLauncherButton />;
    }

    const submitAction = (
      <JobSubmitButton
        canWriteProject={write}
        className={submitButtonClassName}
        disabled={!hasValidImage}
        imageStatus={imageStatus}
        launcher={launcher}
        project={project}
      />
    );

    if (!write) {
      return submitAction;
    }

    if (applyDefaultBuildActions) {
      return (
        <ButtonGroup onClick={(e) => e.stopPropagation()}>
          <BuildLauncherButtons launcher={launcher} isMainButton={false} />
          {submitAction}
        </ButtonGroup>
      );
    }

    return submitAction;
  }, [
    applyDefaultBuildActions,
    hasValidImage,
    imageStatus,
    isLoadingContainerImage,
    launcher,
    project,
    submitButtonClassName,
    write,
  ]);

  if (isLoadingPermissions) {
    return <CheckingLauncherButton />;
  }

  if (!write || !hasMenuItems) {
    return defaultAction;
  }

  return (
    <ButtonWithMenuV2
      color="primary"
      default={defaultAction}
      preventPropagation
      size="sm"
      dataCy="job-button-with-menu-dropdown"
    >
      {menuItems}
    </ButtonWithMenuV2>
  );
}

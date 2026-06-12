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

import { type ReactNode } from "react";
import { ButtonGroup } from "reactstrap";

import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useProjectPermissions from "~/features/ProjectPageV2/utils/useProjectPermissions.hook";
import { getLauncherCategoryDefinition } from "~/features/sessionsV2/session.utils";
import useLauncherEnvironmentReadiness from "~/features/sessionsV2/useLauncherEnvironmentReadiness.hook";
import BuildLauncherButtons, {
  RebuildLauncherDropdownItem,
} from "../../BuildLauncherButtons";
import CheckingLauncherButton from "../shared/CheckingLauncherButton";
import ShowLauncherDetailsButton from "../shared/ShowLauncherDetailsButton";
import type { LauncherCardActionsProps } from "../types";
import JobPanelSubmit from "./JobPanelSubmit";
import JobSubmitButton from "./JobSubmitButton";

export default function JobCardActions({
  lastBuild,
  launcher,
  otherActions,
  useOldImage,
}: LauncherCardActionsProps) {
  const { isLoadingPermissions, write } = useProjectPermissions({
    projectId: launcher.project_id,
  });

  const {
    containerImage,
    isCodeEnvironment,
    isLoadingContainerImage,
    showSubmitJob,
    useOldImage: resolvedUseOldImage,
    isLaunchButtonDisabled,
  } = useLauncherEnvironmentReadiness({
    launcher,
    lastBuild,
    useOldImage,
  });

  const categoryDefinition = getLauncherCategoryDefinition("job");

  const displayBuildActions =
    isCodeEnvironment &&
    write &&
    (resolvedUseOldImage || lastBuild?.status !== "succeeded");

  const submitTooltip =
    resolvedUseOldImage && containerImage?.accessible !== false
      ? `Launch ${categoryDefinition.text.inline} using an older image`
      : undefined;

  if (isLoadingPermissions) {
    return <CheckingLauncherButton />;
  }

  if (!write) {
    return <JobPanelSubmit launcher={launcher} useOldImage={useOldImage} />;
  }

  const defaultAction = (() => {
    if (isLoadingContainerImage) {
      return <CheckingLauncherButton />;
    }

    const submitAction = showSubmitJob && (
      <JobSubmitButton
        launcherId={launcher.id}
        className={displayBuildActions ? "rounded-0" : "rounded-end-0"}
        tooltip={submitTooltip}
        disabled={isLaunchButtonDisabled}
      />
    );

    if (displayBuildActions) {
      return (
        <ButtonGroup onClick={(e) => e.stopPropagation()}>
          <BuildLauncherButtons launcher={launcher} isMainButton={false} />
          {submitAction}
        </ButtonGroup>
      );
    }

    if (showSubmitJob) {
      return submitAction;
    }

    return <ShowLauncherDetailsButton launcherId={launcher.id} />;
  })();

  const menuItems = [
    isCodeEnvironment && write && !displayBuildActions && (
      <RebuildLauncherDropdownItem launcher={launcher} />
    ),
    otherActions,
  ].filter(Boolean) as ReactNode[];

  if (menuItems.length === 0) {
    return defaultAction;
  }

  return (
    <ButtonWithMenuV2
      color="primary"
      default={defaultAction}
      preventPropagation
      size="sm"
      isDisabledDropdownToggle={false}
    >
      {menuItems}
    </ButtonWithMenuV2>
  );
}

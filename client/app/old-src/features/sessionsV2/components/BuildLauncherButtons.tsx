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
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useMemo, useState } from "react";
import {
  BootstrapReboot,
  FileEarmarkText,
  XOctagon,
} from "react-bootstrap-icons";
import { Button, ButtonGroup } from "reactstrap";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import {
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
  usePatchBuildsByBuildIdMutation as usePatchBuildMutation,
  usePostEnvironmentsByEnvironmentIdBuildsMutation as usePostBuildMutation,
} from "../api/sessionLaunchersV2.api";
import {
  BuildActionFailedModal,
  BuildActionsProps,
  BuildLogsModal,
} from "./BuildStatusComponents";

export default function BuildLauncherButtons({
  launcher,
  isMainButton = true,
}: BuildActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const toggleLogs = useCallback(() => {
    setIsLogsOpen((open) => !open);
  }, []);

  const { data: builds } = useGetBuildsQuery(
    launcher.environment.environment_image_source === "build"
      ? { environmentId: launcher.environment.id }
      : skipToken
  );
  const inProgressBuild = useMemo(
    () => builds?.find(({ status }) => status === "in_progress"),
    [builds]
  );
  const hasInProgressBuild = !!inProgressBuild;

  const [postBuild, postResult] = usePostBuildMutation();
  const triggerBuild = useCallback(() => {
    postBuild({ environmentId: launcher.environment.id });
  }, [launcher.environment.id, postBuild]);

  const [patchBuild, patchResult] = usePatchBuildMutation();
  const onCancelBuild = useCallback(() => {
    if (inProgressBuild != null) {
      patchBuild({
        buildId: inProgressBuild?.id,
        buildPatch: { status: "cancelled" },
      });
    }
  }, [inProgressBuild, patchBuild]);

  if (launcher.environment.environment_image_source !== "build") return null;

  const onClickFix = (e: React.MouseEvent) => e.stopPropagation();

  const buttons = hasInProgressBuild ? (
    <>
      <Button
        className="text-nowrap"
        color="outline-primary"
        data-cy="session-view-menu-show-logs"
        onClick={toggleLogs}
        size="sm"
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        Logs
      </Button>
      <Button
        className={cx("text-nowrap", "rounded-end-0")}
        color={"outline-primary"}
        data-cy="session-view-menu-cancel-build"
        onClick={onCancelBuild}
        size="sm"
      >
        <XOctagon className={cx("bi", "me-1")} />
        Cancel build
      </Button>
    </>
  ) : (
    <>
      <Button
        className="text-nowrap"
        color="outline-primary"
        data-cy="session-view-menu-show-logs"
        onClick={toggleLogs}
        size="sm"
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        Logs
      </Button>
      <Button
        className={cx("text-nowrap", "rounded-end-0")}
        color={isMainButton ? "primary" : "outline-primary"}
        data-cy="session-view-menu-rebuild"
        onClick={triggerBuild}
        size="sm"
      >
        <BootstrapReboot className={cx("bi", "me-1")} />
        Rebuild
      </Button>
    </>
  );

  const groupButtons = isMainButton ? (
    <ButtonGroup onClick={onClickFix}>{buttons}</ButtonGroup>
  ) : (
    buttons
  );

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
            {groupButtons}
            <BuildActionFailedModal
              error={postResult.error}
              reset={postResult.reset}
              title="Error: could not rebuild session image"
            />
            <BuildActionFailedModal
              error={patchResult.error}
              reset={patchResult.reset}
              title="Error: could not cancel image build"
            />
            <BuildLogsModal
              builds={builds}
              isOpen={isLogsOpen}
              toggle={toggleLogs}
            />
          </>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}

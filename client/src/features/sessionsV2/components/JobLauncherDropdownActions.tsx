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
import { Pencil, Trash } from "react-bootstrap-icons";
import { DropdownItem } from "reactstrap";

import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { LauncherEnvironmentIcon } from "./SessionForm/LauncherEnvironmentIcon";

interface JobLauncherDropdownActionsProps {
  launcher: SessionLauncher;
}

export default function JobLauncherDropdownActions({
  launcher,
}: JobLauncherDropdownActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  return (
    <PermissionsGuard
      disabled={null}
      enabled={
        <>
          <DropdownItem
            data-cy="job-launcher-menu-edit"
            onClick={(event) => event.stopPropagation()}
          >
            <Pencil className={cx("bi", "me-1")} />
            Edit launcher
          </DropdownItem>
          <DropdownItem
            data-cy="job-launcher-menu-edit-environment"
            onClick={(event) => event.stopPropagation()}
          >
            <LauncherEnvironmentIcon
              className={cx("me-1")}
              launcher={launcher}
            />
            Edit environment
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem
            data-cy="job-launcher-menu-delete"
            onClick={(event) => event.stopPropagation()}
          >
            <Trash className={cx("bi", "me-1")} />
            Delete launcher
          </DropdownItem>
        </>
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
  );
}

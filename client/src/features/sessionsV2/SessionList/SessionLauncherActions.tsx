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
import { useCallback, useMemo, useRef, useState } from "react";
import { Pencil, PlayCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router-dom-v5-compat";
import { Button, DropdownItem, UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { useGetResourcePoolsQuery } from "../../dataServices/computeResources.api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";
import UpdateSessionLauncherModal from "../components/SessionModals/UpdateSessionLauncherModal";
import type { SessionLauncher, SessionV2 } from "../sessionsV2.types";

interface SessionLauncherActionsProps {
  launcher: SessionLauncher;
  sessions: SessionV2[];
}

export default function SessionLauncherActions({
  launcher,
  sessions,
}: SessionLauncherActionsProps) {
  const { project } = useProject();
  const permissions = useProjectPermissions({ projectId: project.id });

  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace: project.namespace,
      slug: project.slug,
    }
  );

  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const userLauncherResourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == launcher?.resource_class_id),
    [launcher, resourcePools]
  );

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);

  const [isResourcesOpen, setResourcesOpen] = useState(false);
  const toggleResources = useCallback(() => {
    setResourcesOpen((open) => !open);
  }, []);

  const defaultAction =
    sessions.length > 0 ? (
      <DisabledLaunchButton />
    ) : (
      <Link
        className={cx("btn", "btn-sm", "btn-primary")}
        to={startUrl}
        data-cy="start-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        Launch
      </Link>
    );

  const customLaunch =
    sessions.length > 0 ? (
      <DropdownItem disabled>
        <PlayCircle className={cx("bi", "me-1")} />
        Custom launch
      </DropdownItem>
    ) : (
      <Link
        className="dropdown-item"
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

  const editActions = (
    <PermissionsGuard
      disabled={null}
      enabled={
        <>
          <DropdownItem onClick={toggleUpdate}>
            <Pencil className={cx("bi", "me-1")} />
            Modify session environment
          </DropdownItem>
          <DropdownItem onClick={toggleResources}>
            <Pencil className={cx("bi", "me-1")} />
            Set resource class
          </DropdownItem>
        </>
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
  );

  return (
    <>
      <ButtonWithMenuV2
        color="primary"
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        {customLaunch}
        {editActions}
      </ButtonWithMenuV2>

      <UpdateSessionLauncherModal
        isOpen={isUpdateOpen}
        launcher={launcher}
        toggle={toggleUpdate}
      />
      <ModifyResourcesLauncherModal
        isOpen={isResourcesOpen}
        toggleModal={toggleResources}
        resourceClassId={userLauncherResourceClass?.id}
        diskStorage={launcher.disk_storage}
        sessionLauncherId={launcher.id}
      />
    </>
  );
}

function DisabledLaunchButton() {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span className={cx("d-inline-block", "btn-sm")} tabIndex={0} ref={ref}>
        <Button
          type="button"
          className="rounded-end-0"
          color="primary"
          disabled
          size="sm"
        >
          <PlayCircle className={cx("bi", "me-1")} />
          Launch
        </Button>
      </span>
      <UncontrolledTooltip target={ref}>
        A session is already running from this launcher
      </UncontrolledTooltip>
    </>
  );
}

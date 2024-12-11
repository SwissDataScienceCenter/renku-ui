/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useCallback, useState } from "react";
import { generatePath } from "react-router-dom-v5-compat";

import { ThreeDotsVertical } from "react-bootstrap-icons";
import { Button, DropdownItem } from "reactstrap";

import {
  ButtonWithMenuV2,
  EditButtonLink,
} from "../../../../components/buttons/Button";
import BootstrapCopyIcon from "../../../../components/icons/BootstrapCopyIcon";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";

import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../../usersV2/api/users.api";

import useProjectPermissions from "../../utils/useProjectPermissions.hook";

import { ProjectCopyModal } from "../../ProjectPageHeader/ProjectCopyButton";

function ProjectNoPermissionsButton({ project }: { project: Project }) {
  const { data: currentUser } = useGetUserQuery();
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const toggleCopyModal = useCallback(() => {
    setCopyModalOpen((open) => !open);
  }, []);
  const defaultAction = (
    <Button color="primary" disabled={true} outline={true}>
      <ThreeDotsVertical />
    </Button>
  );
  return (
    <>
      <ButtonWithMenuV2
        color="outline-primary"
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        <DropdownItem
          data-cy="project-copy-menu-item"
          onClick={toggleCopyModal}
        >
          <BootstrapCopyIcon className={cx("bi")} />
          <span className={cx("ms-2")}>Copy project</span>
        </DropdownItem>
      </ButtonWithMenuV2>
      {isCopyModalOpen && (
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isCopyModalOpen}
          project={project}
          toggle={toggleCopyModal}
        />
      )}
    </>
  );
}

export default function ProjectInformationButton({
  userPermissions,
  project,
}: {
  userPermissions: ReturnType<typeof useProjectPermissions>;
  project: Project;
}) {
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });
  return (
    <PermissionsGuard
      disabled={<ProjectNoPermissionsButton project={project} />}
      enabled={
        <EditButtonLink
          data-cy="project-settings-edit"
          to={settingsUrl}
          tooltip="Modify project information"
        />
      }
      requestedPermission="write"
      userPermissions={userPermissions}
    />
  );
}

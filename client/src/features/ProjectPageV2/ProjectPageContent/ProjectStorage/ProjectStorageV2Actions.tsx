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
import { useCallback, useState } from "react";
import { Pencil, Trash } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import { MenuButton, MenuButtonItem } from "~/components/buttons/MenuButton";
import type { ProjectStorageV2 } from "~/features/cloudStorage/api/projectCloudStorage.api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectStorageV2DeleteModal from "./ProjectStorageV2DeleteModal";

interface ProjectStorageV2ActionsProps {
  storage: ProjectStorageV2;
  toggleView?: () => void;
  toggleEdit: () => void;
}

export default function ProjectStorageV2Actions({
  storage,
  toggleView,
  toggleEdit,
}: ProjectStorageV2ActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const onDeleteSuccess = useCallback(() => {
    if (toggleView) toggleView();
    setIsDeleteOpen(false);
  }, [toggleView]);

  const permissions = useProjectPermissions({
    projectId: storage.project_id,
  });

  // Display actions only if user is project owner
  if (!permissions.delete) {
    return null;
  }

  const actions = [
    {
      key: "project-storage-edit",
      onClick: toggleEdit,
      content: (
        <>
          <Pencil className={cx("bi", "me-1")} />
          Edit
        </>
      ),
    },
    {
      key: "project-storage-delete",
      onClick: toggleDelete,
      content: (
        <>
          <Trash className={cx("bi", "me-1")} />
          Delete
        </>
      ),
    },
  ];

  const actionsContent =
    actions.length === 0 ? null : actions.length === 1 ? (
      <Button
        color="outline-primary"
        data-cy={actions[0].key}
        onClick={actions[0].onClick}
        size="sm"
      >
        {actions[0].content}
      </Button>
    ) : (
      <MenuButton
        color="outline-primary"
        dataCy="project-storage-menu-dropdown"
        default={
          <Button
            color="outline-primary"
            data-cy={actions[0].key}
            onClick={actions[0].onClick}
            size="sm"
          >
            {actions[0].content}
          </Button>
        }
      >
        {actions.slice(1).map(({ key, onClick, content }) => (
          <MenuButtonItem key={key} data-cy={key} onClick={onClick}>
            {content}
          </MenuButtonItem>
        ))}
      </MenuButton>
    );

  return (
    <>
      {actionsContent}
      <ProjectStorageV2DeleteModal
        isOpen={isDeleteOpen}
        storageId={storage.id}
        toggle={toggleDelete}
        executeOnSuccess={onDeleteSuccess}
      />
    </>
  );
}

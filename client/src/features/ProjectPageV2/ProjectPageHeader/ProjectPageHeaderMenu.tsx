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

import { useCallback, useState } from "react";
import { CheckLg, ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import useCopyToClipboard from "~/components/clipboard/useCopyToClipboard.hook";
import ProjectCopyModal from "~/features/ProjectPageV2/ProjectPageHeader/ProjectCopyModal";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import type { Project } from "../../projectsV2/api/projectV2.api";

interface ProjectPageHeaderMenuProps {
  project: Project;
}

export default function ProjectPageHeaderMenu({
  project,
}: ProjectPageHeaderMenuProps) {
  const { data: currentUser } = useGetUserQueryState();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const clipboardText = `${project.namespace}/${project.slug}`;
  const { copied, copy } = useCopyToClipboard(clipboardText);
  const toggleCopyModal = useCallback(() => {
    setCopyModalOpen((open) => !open);
  }, []);
  const isUserLoggedIn = currentUser?.isLoggedIn === true;

  return (
    <>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen((open) => !open)}>
        <DropdownToggle
          aria-label={copied ? "Copied project identifier" : "Project actions"}
          caret={false}
          color="outline-primary"
          data-cy="project-actions-menu"
        >
          {copied ? (
            <CheckLg className="bi" />
          ) : (
            <ThreeDotsVertical className="bi" />
          )}
        </DropdownToggle>

        <DropdownMenu container="body" end flip={false} strategy="fixed">
          {isUserLoggedIn && (
            <DropdownItem
              data-cy="project-copy-project-menu-item"
              onClick={toggleCopyModal}
            >
              Copy this project
            </DropdownItem>
          )}
          <DropdownItem
            data-cy="project-copy-identifier-menu-item"
            onClick={copy}
          >
            Copy identifier
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {isUserLoggedIn && (
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

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
import { Copy, ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import CopyIdentifierMenuItem from "~/components/clipboard/CopyIdentifierMenuItem";
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

  const [isCopyProjectModalOpen, setCopyProjectModalOpen] = useState(false);
  const toggleCopyModal = useCallback(() => {
    setCopyProjectModalOpen((open) => !open);
  }, []);

  const clipboardText = `${project.namespace}/${project.slug}`;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  const isUserLoggedIn = currentUser?.isLoggedIn === true;

  return (
    <>
      <Dropdown isOpen={isMenuOpen} toggle={toggleMenu}>
        <DropdownToggle
          aria-label="Project actions"
          caret={false}
          color="outline-primary"
          data-cy="project-actions-menu"
          size="sm"
        >
          <ThreeDotsVertical className="bi" />
        </DropdownToggle>

        <DropdownMenu container="body" end flip={false} strategy="fixed">
          {isUserLoggedIn && (
            <DropdownItem
              data-cy="project-copy-project-menu-item"
              onClick={toggleCopyModal}
            >
              <Copy className="bi" /> Copy this project
            </DropdownItem>
          )}
          <CopyIdentifierMenuItem
            clipboardText={clipboardText}
            dataCy="project-copy-identifier-menu-item"
            isMenuOpen={isMenuOpen}
            label="Copy project identifier"
            confirmationText="Copied project identifier"
            onClose={closeMenu}
          />
        </DropdownMenu>
      </Dropdown>
      {isUserLoggedIn && (
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isCopyProjectModalOpen}
          project={project}
          toggle={toggleCopyModal}
        />
      )}
    </>
  );
}

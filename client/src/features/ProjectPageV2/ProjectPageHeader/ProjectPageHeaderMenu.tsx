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

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckLg,
  Clipboard,
  Copy,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
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

const IDENTIFIER_COPIED_FEEDBACK_MS = 1_000;

interface ProjectPageHeaderMenuProps {
  project: Project;
}

function useProjectIdentifierCopy(clipboardText: string) {
  const { copy } = useCopyToClipboard(clipboardText);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [identifierCopied, setIdentifierCopied] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const isMenuOpenRef = useRef(isMenuOpen);

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current == null) {
      return;
    }
    window.clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    clearFeedbackTimeout();
    isMenuOpenRef.current = false;
    setIdentifierCopied(false);
    setIsMenuOpen(false);
  }, [clearFeedbackTimeout]);

  const toggleMenu = useCallback(() => {
    if (isMenuOpenRef.current) {
      closeMenu();
      return;
    }
    isMenuOpenRef.current = true;
    setIsMenuOpen(true);
  }, [closeMenu]);

  const copyIdentifier = useCallback(() => {
    copy()
      .then(() => {
        if (!isMenuOpenRef.current) {
          return;
        }
        setIdentifierCopied(true);
        clearFeedbackTimeout();
        feedbackTimeoutRef.current = window.setTimeout(() => {
          closeMenu();
        }, IDENTIFIER_COPIED_FEEDBACK_MS);
      })
      .catch(() => undefined);
  }, [clearFeedbackTimeout, closeMenu, copy]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout();
    };
  }, [clearFeedbackTimeout]);

  return { copyIdentifier, identifierCopied, isMenuOpen, toggleMenu };
}

export default function ProjectPageHeaderMenu({
  project,
}: ProjectPageHeaderMenuProps) {
  const { data: currentUser } = useGetUserQueryState();
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const clipboardText = `${project.namespace}/${project.slug}`;
  const { copyIdentifier, identifierCopied, isMenuOpen, toggleMenu } =
    useProjectIdentifierCopy(clipboardText);
  const toggleCopyModal = useCallback(() => {
    setCopyModalOpen((open) => !open);
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
          <DropdownItem
            data-cy="project-copy-identifier-menu-item"
            onClick={copyIdentifier}
            toggle={false}
          >
            {identifierCopied ? (
              <>
                <CheckLg className="bi" /> Identifier copied
              </>
            ) : (
              <>
                <Clipboard className="bi" /> Copy project identifier
              </>
            )}
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

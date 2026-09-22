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

import { useCallback } from "react";
import { FiletypeKey, SkipForward, XLg } from "react-bootstrap-icons"; // eslint-disable-line spellcheck/spell-checker
import { generatePath, Link, useNavigate } from "react-router";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface SessionSshKeyRequiredModalProps {
  isOpen: boolean;
  project: Project;
  onCancel?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
}
export default function SessionSshKeyRequiredModal({
  isOpen,
  project,
  onCancel: onCancelProp,
  onSkip: onSkipProp,
  continueLabel = "Launch anyway",
}: SessionSshKeyRequiredModalProps) {
  const navigate = useNavigate();
  const defaultOnCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const onCancel = onCancelProp ?? defaultOnCancel;

  const dispatch = useAppDispatch();
  const defaultOnSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setSshKeysReady(true));
  }, [dispatch]);
  const onSkip = onSkipProp ?? defaultOnSkip;

  return (
    <ScrollableModal
      centered
      data-cy="session-ssh-key-required-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">
        <FiletypeKey className="me-1" />
        SSH keys required
      </ModalHeader>
      <ModalBody>
        <p data-cy="session-ssh-key-required-warning">
          This session is configured for SSH access, but you have not set up an
          SSH key yet. Without one, you will not be able to connect to the
          session over SSH.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="session-ssh-key-required-cancel"
          onClick={onCancel}
        >
          <XLg className="me-1" />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          data-cy="session-ssh-key-required-continue"
          onClick={onSkip}
        >
          <SkipForward className="me-1" />
          {continueLabel}
        </Button>
        <Button
          color="primary"
          data-cy="session-ssh-key-required-setup"
          tag={Link}
          to={ABSOLUTE_ROUTES.v2.keys}
        >
          <FiletypeKey className="me-1" />
          Set up an SSH key
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

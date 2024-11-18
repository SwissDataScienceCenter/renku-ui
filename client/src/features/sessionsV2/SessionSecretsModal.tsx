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
import { useCallback, useMemo } from "react";
import {
  CheckCircleFill,
  SkipForward,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type {
  Project,
  SessionSecretSlot,
} from "../projectsV2/api/projectV2.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface SessionSecretsModalProps {
  isOpen: boolean;
  project: Project;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

export default function SessionSecretsModal({
  isOpen,
  project,
  sessionSecretSlotsWithSecrets,
}: SessionSecretsModalProps) {
  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  const dispatch = useAppDispatch();

  const onSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setUserSecretsReady(true));
  }, [dispatch]);

  return (
    <Modal centered isOpen={isOpen} size="lg">
      <ModalHeader>Session secrets</ModalHeader>
      <ModalBody>
        <ReadySessionSecrets
          sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
        />
        <UnreadySessionSecrets
          sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={onCancel}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button color="outline-primary" onClick={onSkip}>
          Skip <SkipForward className={cx("bi", "me-1")} />
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ReadySessionSecretsProps {
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function ReadySessionSecrets({
  sessionSecretSlotsWithSecrets,
}: ReadySessionSecretsProps) {
  const readySessionSecrets = useMemo(
    () => sessionSecretSlotsWithSecrets.filter(({ secretId }) => secretId),
    [sessionSecretSlotsWithSecrets]
  );

  if (readySessionSecrets.length == 0) {
    return null;
  }

  return (
    <div>
      {readySessionSecrets.map(({ secretSlot }) => (
        <ReadySessionSecretItem key={secretSlot.id} secretSlot={secretSlot} />
      ))}
    </div>
  );
}

interface ReadySessionSecretItemProps {
  secretSlot: SessionSecretSlot;
}

function ReadySessionSecretItem({ secretSlot }: ReadySessionSecretItemProps) {
  const { name, filename } = secretSlot;

  return (
    <div>
      <span>
        <CheckCircleFill className={cx("bi", "me-1", "text-success")} />
        <span className="fw-bold">{name}</span>
        {" (filename: "}
        <code>{filename}</code>
        {")"}
      </span>
    </div>
  );
}

interface UnreadySessionSecretsProps {
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function UnreadySessionSecrets({
  sessionSecretSlotsWithSecrets,
}: UnreadySessionSecretsProps) {
  const unreadySessionSecrets = useMemo(
    () => sessionSecretSlotsWithSecrets.filter(({ secretId }) => !secretId),
    [sessionSecretSlotsWithSecrets]
  );

  if (unreadySessionSecrets.length == 0) {
    return null;
  }

  return (
    <div>
      {unreadySessionSecrets.map(({ secretSlot }) => (
        <UnreadySessionSecretItem key={secretSlot.id} secretSlot={secretSlot} />
      ))}
    </div>
  );
}

interface UnreadySessionSecretItemProps {
  secretSlot: SessionSecretSlot;
}

function UnreadySessionSecretItem({
  secretSlot,
}: UnreadySessionSecretItemProps) {
  const { name, filename } = secretSlot;

  return (
    <div>
      <span>
        <XCircleFill className={cx("bi", "me-1", "text-danger")} />
        <span className="fw-bold">{name}</span>
        {" (filename: "}
        <code>{filename}</code>
        {")"}
      </span>
    </div>
  );
}

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
import { useCallback } from "react";
import { ArrowRight, PlayCircle, XLg } from "react-bootstrap-icons";
import { generatePath, useNavigate } from "react-router";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { useLoginUrl } from "~/authentication/useLoginUrl.hook";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import type { Project } from "../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { getEnvironmentKindLabel } from "./launcherEnvironment.utils";
import { BUILDER_IMAGE_NOT_READY_VALUE } from "./session.constants";

interface SessionExternalStartConfirmModalProps {
  launcher: SessionLauncher;
  onContinue: () => void;
  project: Project;
}

const NOT_READY_LABEL = "Not ready";

function containerImageLabel(image: string | undefined): {
  asCode: boolean;
  label: string;
} {
  if (
    image == null ||
    image.length === 0 ||
    image === BUILDER_IMAGE_NOT_READY_VALUE
  ) {
    return { asCode: false, label: NOT_READY_LABEL };
  }
  return { asCode: true, label: image };
}

interface SessionStartDetailProps {
  asCode?: boolean;
  dataCy: string;
  label: string;
  value: string;
}

function SessionStartDetail({
  asCode = false,
  dataCy,
  label,
  value,
}: SessionStartDetailProps) {
  return (
    <div>
      <dt className="d-inline">{label}: </dt>
      <dd className="d-inline mb-0" data-cy={dataCy}>
        {asCode ? <code className="text-break">{value}</code> : value}
      </dd>
    </div>
  );
}

export default function SessionExternalStartConfirmModal({
  launcher,
  onContinue,
  project,
}: SessionExternalStartConfirmModalProps) {
  const navigate = useNavigate();
  const loginUrl = useLoginUrl();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const environmentLabel =
    getEnvironmentKindLabel(launcher.environment) ?? NOT_READY_LABEL;
  const containerImage = containerImageLabel(
    launcher.environment.container_image,
  );

  return (
    <ScrollableModal
      backdrop="static"
      centered
      data-cy="session-external-start-confirm-modal"
      isOpen
      size="lg"
      toggle={onCancel}
    >
      <ModalHeader data-cy="session-external-start-confirm-header" tag="h2">
        Start a Renku session?
      </ModalHeader>
      <ModalBody>
        <p>
          You are not logged in. Continue only if you meant to start this
          session.
        </p>
        <p className="fw-bold mb-2">Session to start</p>
        <dl className={cx("d-flex", "flex-column", "gap-2", "mb-0")}>
          <SessionStartDetail
            dataCy="session-external-start-project"
            label="Project"
            value={project.name}
          />
          <SessionStartDetail
            dataCy="session-external-start-namespace"
            label="Namespace"
            value={project.namespace}
          />
          <SessionStartDetail
            dataCy="session-external-start-name"
            label="Name"
            value={launcher.name}
          />
          <SessionStartDetail
            dataCy="session-external-start-environment"
            label="Environment"
            value={environmentLabel}
          />
          <SessionStartDetail
            asCode={containerImage.asCode}
            dataCy="session-external-start-image"
            label="Container image"
            value={containerImage.label}
          />
        </dl>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="session-external-start-confirm-cancel"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          data-cy="session-external-start-confirm-continue"
          onClick={onContinue}
        >
          <PlayCircle className={cx("bi", "me-1")} />
          Continue
        </Button>
        <a
          className={cx("btn", "btn-primary")}
          data-cy="session-external-start-confirm-login"
          href={loginUrl.href}
        >
          Log in
          <ArrowRight className={cx("bi", "ms-1")} />
        </a>
      </ModalFooter>
    </ScrollableModal>
  );
}

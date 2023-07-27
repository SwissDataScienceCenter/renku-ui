/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React from "react";
import cx from "classnames";
import { InfoCircle } from "react-bootstrap-icons";
import { RootStateOrAny, useSelector } from "react-redux";
import { Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { ExternalLink } from "../../../components/ExternalLinks";
import { EntityType } from "../../../components/entities/Entities";
import EntityHeader from "../../../components/entityHeader/EntityHeader";
import { ProjectMetadata } from "../../../notebooks/components/Session";
import { Docs } from "../../../utils/constants/Docs";
import { Session } from "../sessions.types";
import styles from "./SessionModals.module.scss";
import SessionsList from "./SessionsList";

interface AboutSessionModalProps {
  isOpen: boolean;
  session: Session | null | undefined;
  toggleModal: () => void;
}

export default function AboutSessionModal({
  isOpen,
  session,
  toggleModal,
}: AboutSessionModalProps) {
  return (
    <Modal
      className={styles.aboutModal}
      isOpen={isOpen}
      scrollable={true}
      toggle={toggleModal}
    >
      <ModalHeader
        className={cx("bg-body", "header-multiline")}
        data-cy="modal-header"
        toggle={toggleModal}
      >
        About
      </ModalHeader>
      <ModalBody className="bg-body">
        <div className={cx(styles.aboutBox, "d-flex", "flex-column")}>
          <ProjectHeader />
          <SessionStatus session={session} />
          <Help />
        </div>
      </ModalBody>
    </Modal>
  );
}

function ProjectHeader() {
  const projectMetadata = useSelector<RootStateOrAny, ProjectMetadata>(
    (state) => state.stateModel.project.metadata
  );
  const slug = projectMetadata.pathWithNamespace;

  return (
    <div>
      <h3 className="text-rk-text-light">Project</h3>
      <EntityHeader
        creators={projectMetadata.owner ? [projectMetadata.owner] : []}
        description={{ value: projectMetadata.description }}
        devAccess={projectMetadata.accessLevel >= ACCESS_LEVELS.DEVELOPER}
        fullPath={
          projectMetadata.path_with_namespace ??
          projectMetadata.pathWithNamespace
        }
        gitUrl={projectMetadata.externalUrl}
        imageUrl={projectMetadata.avatarUrl}
        itemType={"project" as EntityType}
        labelCaption={"Updated"}
        showFullHeader={false}
        slug={slug}
        tagList={projectMetadata.tagList}
        timeCaption={projectMetadata.lastActivityAt}
        title={projectMetadata.title}
        url={`projects/${slug}`}
        visibility={projectMetadata.visibility}
      />
    </div>
  );
}

interface SessionStatusProps {
  session: Session | null | undefined;
}

function SessionStatus({ session }: SessionStatusProps) {
  return (
    <div>
      <h3 className="text-rk-text-light">Session</h3>
      <Container>
        <SessionsList sessions={session ? { [session.name]: session } : {}} />
      </Container>
    </div>
  );
}

function Help() {
  return (
    <div>
      <h3 className="text-rk-text-light">Help</h3>
      <div className={cx("d-flex", "flex-column", "gap-1")}>
        <ExternalLink
          className={cx(
            "mx-1",
            "text-rk-green",
            "text-decoration-none",
            "d-flex",
            "align-items-center",
            "gap-2"
          )}
          role="link"
          url={Docs.rtdTopicGuide("sessions/session-basics.html")}
        >
          <InfoCircle /> How to use sessions
        </ExternalLink>
        <ExternalLink
          className={cx(
            "mx-1",
            "text-rk-green",
            "text-decoration-none",
            "d-flex",
            "align-items-center",
            "gap-2"
          )}
          role="link"
          url={Docs.READ_THE_DOCS_INTRODUCTION}
        >
          <InfoCircle /> About Renku
        </ExternalLink>
      </div>
    </div>
  );
}

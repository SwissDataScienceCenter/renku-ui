/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  AboutSessionModal.tsx
 *  AboutSessionModal component
 */

import { useSelector } from "react-redux";
import { ACCESS_LEVELS } from "../../api-client";
import { ExternalLink } from "../../components/ExternalLinks";
import { EntityType } from "../../components/entities/Entities";
import EntityHeader from "../../components/entityHeader/EntityHeader";
import { Docs } from "../../utils/constants/Docs";
import { toHumanDateTime } from "../../utils/helpers/DateTimeUtils";
import {
  InfoCircle,
  Modal,
  ModalBody,
  ModalHeader,
} from "../../utils/ts-wrappers";
import { NotebookServerRow } from "../Notebooks.present";
import { Notebook, ProjectMetadata } from "./Session";
import "./SessionModal.css";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AboutSessionModalProp {
  toggleModal: Function; // eslint-disable-line @typescript-eslint/ban-types
  isOpen: boolean;
  projectMetadata: ProjectMetadata;
  notebook: Notebook;
}
const AboutSessionModal = ({
  toggleModal,
  isOpen,
  projectMetadata,
  notebook,
}: AboutSessionModalProp) => {
  const slug =
    projectMetadata.path_with_namespace ?? projectMetadata.pathWithNamespace;
  const projectHeader = (
    <div>
      <h3 className="text-rk-text-light">Project</h3>
      <EntityHeader
        creators={projectMetadata.owner ? [projectMetadata.owner] : []}
        description={{ value: projectMetadata.description }}
        devAccess={projectMetadata.accessLevel > ACCESS_LEVELS.DEVELOPER}
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

  const session = (
    <div>
      <h3 className="text-rk-text-light">Session</h3>
      <SessionHeader notebook={notebook} />
    </div>
  );

  const help = (
    <div>
      <h3 className="text-rk-text-light">Help</h3>
      <div className="d-flex flex-column gap-1">
        <ExternalLink
          className="mx-1 text-rk-green text-decoration-none d-flex align-items-center gap-2"
          role="link"
          url={Docs.rtdTopicGuide("sessions/session-basics.html")}
        >
          <InfoCircle /> How to use sessions
        </ExternalLink>
        <ExternalLink
          className="mx-1 text-rk-green text-decoration-none d-flex align-items-center gap-2"
          role="link"
          url={Docs.READ_THE_DOCS_INTRODUCTION}
        >
          <InfoCircle /> About Renku
        </ExternalLink>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      className="about-modal"
      scrollable={true}
      toggle={() => {
        toggleModal();
      }}
    >
      <ModalHeader
        className="bg-body header-multiline"
        toggle={() => {
          toggleModal();
        }}
        data-cy="modal-header"
      >
        About
      </ModalHeader>
      <ModalBody className="bg-body">
        <div className="about-box d-flex flex-column">
          {projectHeader}
          {session}
          {help}
        </div>
      </ModalBody>
    </Modal>
  );
};

interface SessionHeaderProp {
  notebook: Notebook;
}
function SessionHeader({ notebook }: SessionHeaderProp) {
  const validAnnotations = Object.keys(notebook.data.annotations)
    .filter((key) => key.startsWith("renku.io"))
    .reduce((obj: any, key: any) => {
      obj[key] = notebook.data.annotations[key];
      return obj;
    }, {});
  const resources = notebook.data.resources?.requests;
  const startTime = toHumanDateTime({
    datetime: notebook.data.started,
    format: "full",
  });
  const commits = useSelector(
    (state: any) => state.stateModel.notebooks.data.commits
  );
  const logs = useSelector((state: any) => state.stateModel.notebooks.logs);

  return (
    <NotebookServerRow
      commits={commits}
      logs={{ ...logs, show: false }}
      annotations={validAnnotations}
      resources={resources}
      image={notebook.data.image}
      name={notebook.data.name}
      startTime={startTime}
      status={notebook.data.status}
      url={notebook.data.url}
      showMenu={false}
    />
  );
}

export { AboutSessionModal };

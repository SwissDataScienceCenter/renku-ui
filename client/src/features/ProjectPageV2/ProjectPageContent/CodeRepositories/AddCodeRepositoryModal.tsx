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
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { useCallback, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { CodeSquare, Github, PlusLg } from "react-bootstrap-icons";
import cx from "classnames";
import styles from "../ProjectOverview/ProjectOverview.module.scss";
import stylesButton from "../../../../components/buttons/Buttons.module.scss";
import BootstrapGitLabIcon from "../../../../components/icons/BootstrapGitLabIcon.tsx";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import FieldGroup from "../../../../components/FieldGroups.tsx";
import { Loader } from "../../../../components/Loader.tsx";
import RenkuFrogIcon from "../../../../components/icons/RenkuIcon.tsx";

interface AddCodeRepositoryModalProps {
  project: Project;
  isOpen: boolean;
  toggleModal: () => void;
}
export function AddCodeRepositoryStep1Modal({
  project,
  toggleModal,
  isOpen,
}: AddCodeRepositoryModalProps) {
  const [isOpenStep2, setIsOpenStep2] = useState(false);
  const toggle = useCallback(() => {
    setIsOpenStep2((open) => !open);
  }, []);
  const openNextStep = useCallback(() => {
    setIsOpenStep2((open) => !open);
    toggleModal();
  }, [toggleModal]);
  return (
    <>
      <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>
          <span className="d-flex align-items-center">
            <CodeSquare size={20} className="me-3 mb-1" />
            <small>ADD CODE REPOSITORIES</small>
          </span>
        </ModalHeader>
        <ModalBody className="pt-0">
          <p className="fw-500 fst-normal">
            Connect a code repository to save and share code.
            <br />
            You can skip this step and add your repositories later.
          </p>
          <Row className="mb-3">
            <Col xs={12}>
              <Button
                onClick={() => openNextStep()}
                className={cx(
                  "w-100",
                  "bg-transparent",
                  "text-dark",
                  "rounded-3",
                  "my-2",
                  "py-3",
                  "border-black",
                  styles.BorderDashed,
                  stylesButton.EmptyButton
                )}
              >
                <Github className="bi me-2" />
                <BootstrapGitLabIcon className="bi me-2" />
                <RenkuFrogIcon className="me-2" size={24} />
                Connect an existing repository
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                disabled
                className={cx(
                  "w-100",
                  "bg-transparent",
                  "text-dark",
                  "rounded-3",
                  "my-2",
                  "py-3",
                  "border-black",
                  styles.BorderDashed,
                  stylesButton.EmptyButton
                )}
              >
                <PlusLg className="me-2" />
                Create new repository
                <Badge
                  pill
                  className={cx(
                    "fst-italic",
                    "text-warning",
                    "bg-rk-warning-50",
                    "border",
                    "border-warning",
                    "ms-2"
                  )}
                  title="coming soon"
                >
                  {" "}
                  coming soon{" "}
                </Badge>
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      <AddCodeRepositoryStep2Modal
        project={project}
        toggleModal={toggle}
        isOpen={isOpenStep2}
      />
    </>
  );
}
function AddCodeRepositoryStep2Modal({
  project,
  toggleModal,
  isOpen,
}: AddCodeRepositoryModalProps) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [updateProject, { isLoading }] = usePatchProjectsByProjectIdMutation();
  const onAddCodeRepository = (url: string) => {
    if (!url) return;
    const repositories = project?.repositories?.length
      ? [...project.repositories]
      : [];
    repositories.push(url);
    updateProject({
      "If-Match": project.etag ? project.etag : undefined,
      projectId: project.id,
      projectPatch: { repositories },
    })
      .unwrap()
      .then(() => toggleModal());
  };

  return (
    <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader toggle={toggleModal}>
        <RenkuFrogIcon className="me-2" size={30} />
        Connect an existing code repository
      </ModalHeader>
      <ModalBody className="py-0">
        <p>
          Specify a code repository by its URL. <br /> Note that currently only
          repositories from{" "}
          <code className="text-rk-green">gitlab.renkulab.io</code> are
          supported.
        </p>
        <Row>
          <Col>
            <FieldGroup
              id="url"
              label="Repository URL"
              value={repositoryUrl}
              help={"https://github.com/my-repository"}
              isRequired={true}
              onChange={(e) => setRepositoryUrl(e.target.value)}
            />
          </Col>
        </Row>
        <ModalFooter className="px-0">
          <Button
            color="rk-green"
            className={cx("float-right", "mt-1", "ms-2")}
            data-cy="add-code-repository-modal-button"
            type="submit"
            onClick={() => onAddCodeRepository(repositoryUrl)}
          >
            {isLoading ? (
              <>
                <Loader className="me-2" inline size={16} />
                Adding code repository
              </>
            ) : (
              <>Add code repository</>
            )}
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
}

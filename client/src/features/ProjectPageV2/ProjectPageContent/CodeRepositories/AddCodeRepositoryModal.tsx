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
import { useCallback, useEffect, useState } from "react";
import { CodeSquare, Github, PlusLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Badge,
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { Loader } from "../../../../components/Loader.tsx";
import stylesButton from "../../../../components/buttons/Buttons.module.scss";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert.tsx";
import BootstrapGitLabIcon from "../../../../components/icons/BootstrapGitLabIcon.tsx";
import RenkuFrogIcon from "../../../../components/icons/RenkuIcon.tsx";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import styles from "../ProjectOverview/ProjectOverview.module.scss";

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
            <small className="text-uppercase">Add code repositories</small>
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
                    "bg-warning-subtle",
                    "border",
                    "border-warning",
                    "ms-2",
                    "alert-warning"
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
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddCodeRepositoryForm>();

  const [updateProject, result] = usePatchProjectsByProjectIdMutation();
  const onSubmit = useCallback(
    (data: AddCodeRepositoryForm) => {
      const repositories = project?.repositories?.length
        ? [...project.repositories]
        : [];
      repositories.push(data.repositoryUrl);
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: { repositories },
      });
    },
    [project.etag, project.id, project.repositories, updateProject]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggleModal}>
          <RenkuFrogIcon className="me-2" size={30} />
          Connect an existing code repository
        </ModalHeader>
        <ModalBody className="py-0">
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <p>Specify a code repository by its URL.</p>
          <Row>
            <Col>
              <FormGroup className="field-group">
                <Label for={`project-${project.id}-add-repository-url`}>
                  Repository URL
                  <span className="required-label">*</span>
                </Label>
                <Controller
                  control={control}
                  name="repositoryUrl"
                  render={({ field }) => (
                    <Input
                      className={cx(
                        "form-control",
                        errors.repositoryUrl && "is-invalid"
                      )}
                      id={`project-${project.id}-add-repository-url`}
                      aria-describedby={`project-${project.id}-add-repository-url-help`}
                      type="text"
                      placeholder="https://github.com/my-repository"
                      {...field}
                    />
                  )}
                  rules={{ required: true }}
                />
                <div className="invalid-feedback">
                  Please provide a valid URL.
                </div>
              </FormGroup>
            </Col>
          </Row>
          <ModalFooter className="px-0">
            <Button
              color="rk-green"
              className={cx("float-right", "mt-1", "ms-2")}
              data-cy="add-code-repository-modal-button"
              type="submit"
            >
              {result.isLoading ? (
                <>
                  <Loader className="me-1" inline size={16} />
                  Adding code repository
                </>
              ) : (
                <>
                  <PlusLg className={cx("bi", "me-1")} />
                  Add code repository
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalBody>
      </Form>
    </Modal>
  );
}

interface AddCodeRepositoryForm {
  repositoryUrl: string;
}

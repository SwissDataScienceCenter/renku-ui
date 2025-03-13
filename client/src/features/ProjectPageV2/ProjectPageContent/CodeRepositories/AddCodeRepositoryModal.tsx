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
import { useCallback, useEffect } from "react";
import { CodeSquare, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
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

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

interface AddCodeRepositoryForm {
  repositoryUrl: string;
}

interface AddCodeRepositoryModalProps {
  project: Project;
  isOpen: boolean;
  toggleModal: () => void;
}
export default function AddCodeRepositoryModal({
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
      const repositories = project.repositories?.length
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
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggleModal}>
          <CodeSquare className={cx("bi", "me-1")} />
          Connect an existing code repository
        </ModalHeader>
        <ModalBody>
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
                      data-cy="project-add-repository-url"
                      type="text"
                      placeholder="https://github.com/my-org/my-repository.git"
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
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color="primary"
            data-cy="add-code-repository-modal-button"
            disabled={result.isLoading}
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
      </Form>
    </Modal>
  );
}

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
import { useCallback, useEffect, useMemo } from "react";
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

import { WarnAlert } from "../../../../components/Alert";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  detectSSHRepository,
  validateCodeRepository,
  validateNoDuplicatesInCodeRepositories,
} from "./repositories.utils";

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
  const { control, handleSubmit, reset, setError, watch } =
    useForm<AddCodeRepositoryForm>({
      defaultValues: {
        repositoryUrl: "",
      },
    });

  const [updateProject, result] = usePatchProjectsByProjectIdMutation();
  const onSubmit = useCallback(
    (data: AddCodeRepositoryForm) => {
      const repositories = project.repositories?.length
        ? [...project.repositories]
        : [];
      repositories.push(data.repositoryUrl);
      const validationResult =
        validateNoDuplicatesInCodeRepositories(repositories);
      if (typeof validationResult === "string") {
        setError("repositoryUrl", { message: validationResult });
        return;
      }
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: { repositories },
      });
    },
    [project.etag, project.id, project.repositories, setError, updateProject]
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

  const watchRepositoryUrl = watch("repositoryUrl");

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader tag="h2" toggle={toggleModal}>
          <CodeSquare className={cx("bi", "me-1")} />
          Connect an existing code repository
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <p>Specify a code repository by its URL.</p>
          <Row>
            <Col>
              <FormGroup className="field-group" noMargin>
                <Label for={`project-${project.id}-add-repository-url`}>
                  Repository URL
                </Label>
                <Controller
                  control={control}
                  name="repositoryUrl"
                  render={({
                    field: { ref, ...rest },
                    fieldState: { error },
                  }) => (
                    <>
                      <Input
                        className={cx("form-control", error && "is-invalid")}
                        data-cy="project-add-repository-url"
                        id={`project-${project.id}-add-repository-url`}
                        innerRef={ref}
                        placeholder="https://github.com/my-org/my-repository.git"
                        type="text"
                        {...rest}
                      />
                      <div className="invalid-feedback">
                        {error?.message
                          ? error.message
                          : "Please provide a valid URL."}
                      </div>
                    </>
                  )}
                  rules={{ required: true, validate: validateCodeRepository }}
                />
                <SshRepositoryUrlWarning repositoryUrl={watchRepositoryUrl} />
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

interface SshRepositoryUrlWarningProps {
  repositoryUrl: string;
}

export function SshRepositoryUrlWarning({
  repositoryUrl,
}: SshRepositoryUrlWarningProps) {
  const isSsh = useMemo(
    () => detectSSHRepository(repositoryUrl),
    [repositoryUrl]
  );

  if (!isSsh) {
    return null;
  }

  return (
    <WarnAlert className={cx("mt-3", "mb-0")} dismissible={false}>
      It looks like you are trying to use a <code>git+ssh</code> URL. RenkuLab
      only supports HTTP(S) for repositories at the moment.
    </WarnAlert>
  );
}

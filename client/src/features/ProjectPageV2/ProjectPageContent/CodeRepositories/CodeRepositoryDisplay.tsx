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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BoxArrowUpRight,
  Pencil,
  ThreeDotsVertical,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import RenkuFrogIcon from "../../../../components/icons/RenkuIcon";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

import dotsDropdownStyles from "../../../../components/buttons/ThreeDots.module.scss";

interface EditCodeRepositoryModalProps {
  project: Project;
  isOpen: boolean;
  toggleModal: () => void;
  repositoryUrl: string;
}
function EditCodeRepositoryModal({
  project,
  toggleModal,
  isOpen,
  repositoryUrl,
}: EditCodeRepositoryModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<EditCodeRepositoryForm>({
    defaultValues: { repositoryUrl },
  });

  const [updateProject, result] = usePatchProjectsByProjectIdMutation();
  const onSubmit = useCallback(
    (data: EditCodeRepositoryForm) => {
      if (!project.repositories || project.repositories.length == 0) {
        return;
      }
      const repositories = project.repositories.map((url) =>
        url === repositoryUrl ? data.repositoryUrl : url
      );
      updateProject({
        "If-Match": project.etag ?? "",
        projectId: project.id,
        projectPatch: { repositories },
      });
    },
    [
      project.etag,
      project.id,
      project.repositories,
      repositoryUrl,
      updateProject,
    ]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  useEffect(() => {
    reset({ repositoryUrl });
  }, [repositoryUrl, reset]);

  return (
    <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggleModal}>
          <RenkuFrogIcon className="me-2" size={30} />
          Edit code repository
        </ModalHeader>
        <ModalBody className="py-0">
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <p>Specify a code repository by its URL.</p>
          <Row>
            <Col>
              <FormGroup className="field-group">
                <Label for={`project-${project.id}-edit-repository-url`}>
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
                      id={`project-${project.id}-edit-repository-url`}
                      data-cy="project-edit-repository-url"
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
          <ModalFooter className="px-0">
            <Button
              color="rk-green"
              className={cx("float-right", "mt-1", "ms-2")}
              data-cy="edit-code-repository-modal-button"
              type="submit"
            >
              {result.isLoading ? (
                <>
                  <Loader className="me-1" inline size={16} />
                  Edit code repository
                </>
              ) : (
                <>Edit code repository</>
              )}
            </Button>
          </ModalFooter>
        </ModalBody>
      </Form>
    </Modal>
  );
}

interface EditCodeRepositoryForm {
  repositoryUrl: string;
}

interface CodeRepositoryDeleteModalProps {
  repositoryUrl: string;
  project: Project;
  isOpen: boolean;
  toggleModal: () => void;
}
function CodeRepositoryDeleteModal({
  project,
  repositoryUrl,
  toggleModal,
  isOpen,
}: CodeRepositoryDeleteModalProps) {
  const [updateProject, result] = usePatchProjectsByProjectIdMutation();

  const onDeleteCodeRepository = useCallback(() => {
    const repositories = project?.repositories
      ? project?.repositories?.filter((repo) => repo !== repositoryUrl)
      : [];
    updateProject({
      "If-Match": project.etag ? project.etag : "",
      projectId: project.id,
      projectPatch: { repositories },
    });
  }, [
    project.etag,
    project.id,
    project.repositories,
    repositoryUrl,
    updateProject,
  ]);

  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Remove Code Repository
      </ModalHeader>
      <ModalBody className="py-0">
        <Row>
          <Col>
            {result.error && <RtkOrNotebooksError error={result.error} />}
            <p>
              Are you sure about removing this code repository from the project?
            </p>
            <p>
              Repository URL: <code className="fw-bold">{repositoryUrl}</code>
            </p>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-end">
          <Button color="outline-danger" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="danger"
            className={cx("float-right", "ms-2")}
            data-cy="delete-code-repository-modal-button"
            type="submit"
            onClick={onDeleteCodeRepository}
          >
            {result.isLoading ? (
              <>
                <Loader className="me-2" inline size={16} />
                Deleting code repository
              </>
            ) : (
              <>
                <Trash className={cx("bi", "me-1")} />
                Remove repository
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
function CodeRepositoryActions({
  url,
  project,
}: {
  url: string;
  project: Project;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  return (
    <>
      <UncontrolledDropdown>
        <DropdownToggle
          className={cx(
            "m-0",
            "p-0",
            "bg-transparent",
            "d-flex",
            "border-0",
            "shadow-none",
            dotsDropdownStyles.threeDotsDark
          )}
        >
          <ThreeDotsVertical size={24} className="fs-3" />
          <span className="visually-hidden">Actions</span>
        </DropdownToggle>
        <DropdownMenu className={cx("text-end", "mx-0", "mt-2")} end>
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-start"
            )}
            onClick={toggleEdit}
          >
            <Pencil /> Edit code repository
          </DropdownItem>
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-start"
            )}
            onClick={toggleDelete}
          >
            <Trash /> Remove code repository
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
      <CodeRepositoryDeleteModal
        repositoryUrl={url}
        isOpen={isDeleteOpen}
        toggleModal={toggleDelete}
        project={project}
      />
      <EditCodeRepositoryModal
        toggleModal={toggleEdit}
        isOpen={isEditOpen}
        project={project}
        repositoryUrl={url}
      />
    </>
  );
}
interface RepositoryItemProps {
  project: Project;
  url: string;
  showMenu: boolean;
}

export function RepositoryItem({
  url,
  project,
  showMenu = true,
}: RepositoryItemProps) {
  const canonicalUrlStr = useMemo(() => `${url.replace(/.git$/i, "")}`, [url]);
  const canonicalUrl = useMemo(
    () => new URL(canonicalUrlStr),
    [canonicalUrlStr]
  );

  const title = canonicalUrl.pathname.split("/").pop();

  const urlDisplay = (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <RepositoryIcon
        className="flex-shrink-0"
        provider={canonicalUrl.origin}
      />
      <div className={cx("d-flex", "flex-column")}>
        <span>{canonicalUrl.hostname}</span>
        <a href={canonicalUrlStr} target="_blank" rel="noreferrer noopener">
          {title || canonicalUrlStr}
          <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
        </a>
      </div>
    </div>
  );

  return (
    <Row className={cx("mb-4")}>
      <Col xs={showMenu ? 10 : 12} className={cx("text-truncate", "col")}>
        {urlDisplay}
      </Col>
      {showMenu && (
        <Col xs={2} className={cx("d-flex", "justify-content-end")}>
          <CodeRepositoryActions project={project} url={url} />
        </Col>
      )}
    </Row>
  );
}

interface RepositoryIconProps {
  className?: string;
  provider: string;
}

function RepositoryIcon({ className, provider }: RepositoryIconProps) {
  // eslint-disable-next-line spellcheck/spell-checker
  const iconUrl = new URL("/favicon.ico", provider);
  return (
    <img
      className={className}
      src={iconUrl.toString()}
      width={24}
      height={24}
    />
  );
}

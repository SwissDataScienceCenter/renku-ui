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
  CheckCircleFill,
  Pencil,
  SlashCircleFill,
  ThreeDotsVertical,
  Trash,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Badge,
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

import { skipToken } from "@reduxjs/toolkit/query";
import {
  ErrorAlert,
  RenkuAlert,
  WarnAlert,
} from "../../../../components/Alert";
import dotsDropdownStyles from "../../../../components/buttons/ThreeDots.module.scss";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import connectedServicesApi, {
  useGetProvidersQuery,
} from "../../../connectedServices/connectedServices.api";
import { INTERNAL_GITLAB_PROVIDER_ID } from "../../../connectedServices/connectedServices.constants";
import repositoriesApi, {
  useGetRepositoryMetadataQuery,
  useGetRepositoryProbeQuery,
} from "../../../repositories/repositories.api";

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
          data-cy="code-repository-actions"
        >
          <ThreeDotsVertical size={24} className="fs-3" />
          <span className="visually-hidden">Actions</span>
        </DropdownToggle>
        <DropdownMenu
          className={cx("text-end", "mx-0", "mt-2")}
          end
          data-cy="code-repository-menu"
        >
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-start"
            )}
            onClick={toggleEdit}
            data-cy="code-repository-edit"
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
            data-cy="code-repository-delete"
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
  const canonicalUrl = useMemo(() => {
    try {
      return new URL(canonicalUrlStr);
    } catch (error) {
      if (error instanceof TypeError) {
        return null;
      }
      throw error;
    }
  }, [canonicalUrlStr]);

  const title = canonicalUrl?.pathname.split("/").pop() || canonicalUrlStr;

  const urlDisplay = (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <RepositoryIcon
        className="flex-shrink-0"
        provider={canonicalUrl?.origin}
      />
      <div className={cx("d-flex", "flex-column")}>
        {canonicalUrl?.hostname && (
          <span data-cy="code-repository-title">{canonicalUrl.hostname}</span>
        )}
        <a href={canonicalUrlStr} target="_blank" rel="noreferrer noopener">
          {title || canonicalUrlStr}
          <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
        </a>
      </div>
    </div>
  );

  return (
    <Row className={cx("mb-4")}>
      <Col xs={showMenu ? 8 : 10} className="text-truncate">
        {urlDisplay}
      </Col>
      <Col xs={2} className="text-truncate">
        <RepositoryPermissions repositoryUrl={url} />
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
  provider?: string | null;
}

function RepositoryIcon({ className, provider }: RepositoryIconProps) {
  if (provider == null) {
    return null;
  }

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

interface RepositoryPermissionsProps {
  repositoryUrl: string;
}

function RepositoryPermissions({ repositoryUrl }: RepositoryPermissionsProps) {
  const {
    data: repositoryProviderMatch,
    isLoading: isLoadingRepositoryProviderMatch,
    error,
  } = useGetRepositoryMetadataQuery({ repositoryUrl });

  const isNotFound = error != null && "status" in error && error.status == 404;

  const { data: repositoryProbe, isLoading: isLoadingRepositoryProbe } =
    useGetRepositoryProbeQuery(isNotFound ? { repositoryUrl } : skipToken);

  const isLoading =
    isLoadingRepositoryProviderMatch || isLoadingRepositoryProbe;

  const permissions = useMemo(() => {
    if (isNotFound && repositoryProbe) {
      return { pull: true, push: false };
    }
    const { pull, push } = repositoryProviderMatch?.repository_metadata
      ?.permissions ?? { pull: false, push: false };
    return { pull, push };
  }, [
    isNotFound,
    repositoryProbe,
    repositoryProviderMatch?.repository_metadata?.permissions,
  ]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((open) => !open);
  }, []);

  const commonButtonClasses = [
    "border",
    "rounded-circle",
    "fs-6",
    "lh-1",
    "p-2",
  ];

  const buttonContent = isLoading ? (
    <Loader className="bi" inline size={16} />
  ) : permissions.pull && permissions.push ? (
    <CheckCircleFill className="bi" />
  ) : permissions.pull ? (
    <SlashCircleFill className="bi" />
  ) : (
    <XCircleFill className="bi" />
  );

  const buttonClasses = isLoading
    ? ["border-dark-subtle", "bg-light", "text-dark"]
    : permissions.pull && permissions.push
    ? ["border-success", "bg-success-subtle", "text-success"]
    : permissions.pull
    ? ["border-warning", "bg-warning-subtle", "text-warning"]
    : ["border-danger", "bg-danger-subtle", "text-danger"];

  return (
    <>
      <Button
        className={cx(...commonButtonClasses, ...buttonClasses)}
        onClick={toggleDetails}
        title="View repository permissions"
      >
        {buttonContent}
        <span className="visually-hidden">View repository permissions</span>
      </Button>
      <Modal
        size="lg"
        fullscreen="sm"
        isOpen={isDetailsOpen}
        toggle={toggleDetails}
        centered
      >
        <ModalHeader toggle={toggleDetails}>Repository permissions</ModalHeader>
        <RepositoryPermissionsModalContent repositoryUrl={repositoryUrl} />
        <ModalFooter>
          <div className="d-flex justify-content-end">
            <Button color="outline-danger" onClick={toggleDetails}>
              <XLg className={cx("bi", "me-1")} />
              Close
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}

function RepositoryPermissionsModalContent({
  repositoryUrl,
}: RepositoryPermissionsProps) {
  const {
    data: repositoryProviderMatch,
    isLoading: isLoadingRepositoryProviderMatch,
    error,
  } = repositoriesApi.endpoints.getRepositoryMetadata.useQueryState({
    repositoryUrl,
  });
  const { isLoading: isLoadingProviders, error: providersError } =
    useGetProvidersQuery();

  const isNotFound = error != null && "status" in error && error.status == 404;

  const { data: repositoryProbe, isLoading: isLoadingRepositoryProbe } =
    repositoriesApi.endpoints.getRepositoryProbe.useQueryState(
      isNotFound ? { repositoryUrl } : skipToken
    );

  const isLoading =
    isLoadingRepositoryProviderMatch ||
    isLoadingProviders ||
    isLoadingRepositoryProbe;

  const permissions = useMemo(() => {
    if (isNotFound && repositoryProbe) {
      return { pull: true, push: false };
    }
    const { pull, push } = repositoryProviderMatch?.repository_metadata
      ?.permissions ?? { pull: false, push: false };
    return { pull, push };
  }, [
    isNotFound,
    repositoryProbe,
    repositoryProviderMatch?.repository_metadata?.permissions,
  ]);

  const canonicalUrlStr = useMemo(
    () => `${repositoryUrl.replace(/.git$/i, "")}`,
    [repositoryUrl]
  );

  return (
    <ModalBody>
      <Row className="gy-2">
        <Col xs={12}>
          Repository:{" "}
          <a href={canonicalUrlStr} target="_blank" rel="noreferrer noopener">
            {repositoryUrl}
            <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
          </a>
        </Col>
        {providersError && (
          <Col xs={12}>
            <RtkOrNotebooksError error={providersError} dismissible={false} />
          </Col>
        )}
        {error && !isNotFound && (
          <Col xs={12}>
            <RtkOrNotebooksError error={error} dismissible={false} />
          </Col>
        )}
        {!isLoading && !permissions.push && (
          <Col xs={12}>
            <RepositoryPermissionsAlert repositoryUrl={repositoryUrl} />
          </Col>
        )}
        <Col xs={12}>
          <h6 className={cx("fs-5", "fw-bold", "mb-0")}>Permissions</h6>
        </Col>
        <Col className="mt-0" xs={12} sm={6}>
          Clone, Pull:{" "}
          {isLoading ? (
            <Loader className="bi" inline size={16} />
          ) : permissions.pull ? (
            <YesBadge />
          ) : (
            <NoBadge />
          )}
        </Col>
        <Col className={cx("mt-1", "mt-sm-0")} xs={12} sm={6}>
          Push:{" "}
          {isLoading ? (
            <Loader className="bi" inline size={16} />
          ) : permissions.push ? (
            <YesBadge />
          ) : (
            <NoBadge />
          )}
        </Col>
        <Col xs={12}>
          <RepositoryProviderDetails repositoryUrl={repositoryUrl} />
        </Col>
      </Row>
    </ModalBody>
  );
}

function RepositoryPermissionsAlert({
  repositoryUrl,
}: RepositoryPermissionsProps) {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const { data: repositoryProviderMatch, error } =
    repositoriesApi.endpoints.getRepositoryMetadata.useQueryState({
      repositoryUrl,
    });
  const { data: providers } =
    connectedServicesApi.endpoints.getProviders.useQueryState();

  const isNotFound = error != null && "status" in error && error.status == 404;

  const { data: repositoryProbe } =
    repositoriesApi.endpoints.getRepositoryProbe.useQueryState(
      isNotFound ? { repositoryUrl } : skipToken
    );

  const permissions = useMemo(() => {
    if (isNotFound && repositoryProbe) {
      return { pull: true, push: false };
    }
    const { pull, push } = repositoryProviderMatch?.repository_metadata
      ?.permissions ?? { pull: false, push: false };
    return { pull, push };
  }, [
    isNotFound,
    repositoryProbe,
    repositoryProviderMatch?.repository_metadata?.permissions,
  ]);

  const provider = useMemo(
    () =>
      repositoryProviderMatch?.provider_id === INTERNAL_GITLAB_PROVIDER_ID
        ? { id: INTERNAL_GITLAB_PROVIDER_ID, display_name: "Internal GitLab" }
        : providers?.find(
            ({ id }) => id === repositoryProviderMatch?.provider_id
          ),
    [providers, repositoryProviderMatch?.provider_id]
  );

  const status =
    repositoryProviderMatch?.connection_id ||
    (userLogged &&
      repositoryProviderMatch?.provider_id === INTERNAL_GITLAB_PROVIDER_ID)
      ? "connected"
      : "not-connected";

  if (error && isNotFound) {
    const color = permissions.pull ? "warning" : "danger";

    return (
      <Col xs={12}>
        <RenkuAlert
          color={color}
          className="mb-0"
          dismissible={false}
          timeout={0}
        >
          <p className="mb-1">No git provider found for this repository.</p>
          {permissions.pull ? (
            <p className={cx("mb-0", "fst-italic")}>
              This repository seems to be publicly available so you may be able
              to clone and pull.
            </p>
          ) : (
            <p className={cx("mb-0")}>
              This repository does not exist or RenkuLab cannot access it.
            </p>
          )}
        </RenkuAlert>
      </Col>
    );
  }

  if (error == null && !permissions.pull) {
    return (
      <Col xs={12}>
        <ErrorAlert className="mb-0" dismissible={false} timeout={0}>
          <p className="mb-0">
            This repository does not exist or you do not have access to it.
          </p>
          {!userLogged ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              As an anonymous user, you are not allowed to clone or pull private
              repositories.
            </p>
          ) : provider && status === "not-connected" ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              Your user account is not currently connected to{" "}
              {provider.display_name}.
            </p>
          ) : null}
        </ErrorAlert>
      </Col>
    );
  }

  if (error == null && !permissions.push) {
    return (
      <Col xs={12}>
        <WarnAlert className="mb-0" dismissible={false} timeout={0}>
          <p className="mb-0">
            You are not allowed to push on this repository.
          </p>
          {!userLogged ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              As an anonymous user, you are not allowed to perform pushes on git
              repositories.
            </p>
          ) : provider && status === "not-connected" ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              Your user account is not currently connected to{" "}
              {provider.display_name}.
            </p>
          ) : null}
        </WarnAlert>
      </Col>
    );
  }

  return null;
}

function YesBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "rounded-pill",
        "fs-6",
        "lh-1",
        "p-2",
        "border-success",
        "bg-success-subtle",
        "text-success"
      )}
    >
      <CheckCircleFill className={cx("bi", "me-1")} />
      Yes
    </Badge>
  );
}

function NoBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "rounded-pill",
        "fs-6",
        "lh-1",
        "p-2",
        "border-danger",
        "bg-danger-subtle",
        "text-danger"
      )}
    >
      <XCircleFill className={cx("bi", "me-1")} />
      No
    </Badge>
  );
}

function RepositoryProviderDetails({
  repositoryUrl,
}: RepositoryPermissionsProps) {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const {
    data: repositoryProviderMatch,
    isLoading: isLoadingRepositoryProviderMatch,
    error: repositoryProviderMatchError,
  } = repositoriesApi.endpoints.getRepositoryMetadata.useQueryState({
    repositoryUrl,
  });
  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = connectedServicesApi.endpoints.getProviders.useQueryState();

  const isLoading = isLoadingRepositoryProviderMatch || isLoadingProviders;
  const error = repositoryProviderMatchError ?? providersError;

  const isNotFound =
    repositoryProviderMatchError != null &&
    "status" in repositoryProviderMatchError &&
    repositoryProviderMatchError.status == 404;

  const provider = useMemo(
    () =>
      repositoryProviderMatch?.provider_id === INTERNAL_GITLAB_PROVIDER_ID
        ? { id: INTERNAL_GITLAB_PROVIDER_ID, display_name: "Internal GitLab" }
        : providers?.find(
            ({ id }) => id === repositoryProviderMatch?.provider_id
          ),
    [providers, repositoryProviderMatch?.provider_id]
  );

  const status =
    repositoryProviderMatch?.connection_id ||
    (userLogged &&
      repositoryProviderMatch?.provider_id === INTERNAL_GITLAB_PROVIDER_ID)
      ? "Connected"
      : "Not connected";

  if (isLoading) {
    return (
      <>
        <Loader inline className={cx("bi", "me-1")} size={16} />
        Loading git provider details...
      </>
    );
  }

  if (error && isNotFound) {
    return null;
  }

  if (error) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (provider) {
    return (
      <>
        <h6 className={cx("fs-5", "fw-bold", "mb-0")}>Git Provider</h6>
        <p className="mb-0">{provider.display_name}</p>
        <p className="mb-0">Status: {status}</p>
      </>
    );
  }

  return null;
}

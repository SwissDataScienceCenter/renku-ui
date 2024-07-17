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
  CircleFill,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Badge,
  Button,
  Col,
  DropdownItem,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Offcanvas,
  OffcanvasBody,
  Row,
} from "reactstrap";
import { skipToken } from "@reduxjs/toolkit/query";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { safeNewUrl } from "../../../../utils/helpers/safeNewUrl.utils";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  ErrorAlert,
  RenkuAlert,
  WarnAlert,
} from "../../../../components/Alert";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import connectedServicesApi, {
  useGetProvidersQuery,
} from "../../../connectedServices/connectedServices.api";
import { INTERNAL_GITLAB_PROVIDER_ID } from "../../../connectedServices/connectedServices.constants";
import repositoriesApi, {
  useGetRepositoryMetadataQuery,
  useGetRepositoryProbeQuery,
} from "../../../repositories/repositories.api";
import { Link, useLocation } from "react-router-dom-v5-compat";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { Url } from "../../../../utils/helpers/url";
import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";

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
        <ModalHeader toggle={toggleModal}>Edit code repository</ModalHeader>
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggleModal}>
            <XLg className={cx("me-2", "text-icon")} />
            Close
          </Button>
          <Button
            color="primary"
            data-cy="edit-code-repository-modal-button"
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("me-2", "text-icon")} />
            )}
            Edit code repository
          </Button>
        </ModalFooter>
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
        <div className={cx("d-flex", "justify-content-end", "gap-2")}>
          <Button color="outline-danger" onClick={toggleModal}>
            <XLg className={cx("me-2", "text-icon")} />
            Cancel
          </Button>
          <Button
            color="danger"
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
                <Trash className={cx("me-2", "text-icon")} />
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

  const defaultAction = (
    <Button
      className="text-nowrap"
      color="outline-primary"
      data-cy="code-repository-edit"
      onClick={toggleEdit}
      size="sm"
    >
      <Pencil className={cx("me-2", "text-icon")} />
      Edit
    </Button>
  );

  return (
    <>
      <ButtonWithMenuV2
        color="outline-primary"
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        <DropdownItem data-cy="code-repository-delete" onClick={toggleDelete}>
          <Trash className={cx("me-2", "text-icon")} />
          Remove
        </DropdownItem>
      </ButtonWithMenuV2>
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
  readonly?: boolean;
  url: string;
}
export function RepositoryItem({
  project,
  readonly = false,
  url,
}: RepositoryItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = useCallback(() => {
    setShowDetails((open) => !open);
  }, []);
  const canonicalUrlStr = useMemo(() => `${url.replace(/.git$/i, "")}`, [url]);
  const canonicalUrl = useMemo(
    () => safeNewUrl(canonicalUrlStr),
    [canonicalUrlStr]
  );

  const title = canonicalUrl?.pathname.split("/").pop() || canonicalUrlStr;
  const mainInteraction = !readonly
    ? {
        className: cx(
          !readonly && [
            "cursor-pointer",
            "link-primary",
            "text-body",
            "text-decoration-none",
          ]
        ),
      }
    : {};
  // ! Product team wants this restored -- keeping the code for the next iteration
  // const urlDisplay = (
  //   <div className={cx("d-flex", "align-items-center", "gap-2")}>
  //     <RepositoryIcon
  //       className="flex-shrink-0"
  //       provider={canonicalUrl?.origin ?? window.location.origin}
  //     />
  //     <div className={cx("d-flex", "flex-column")}>
  //       {canonicalUrl?.hostname && (
  //         <span data-cy="code-repository-title">{canonicalUrl.hostname}</span>
  //       )}
  //       <a href={canonicalUrlStr} target="_blank" rel="noreferrer noopener">
  //         {title || canonicalUrlStr}
  //         <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
  //       </a>
  //     </div>
  //   </div>
  // );

  return (
    <Row className={cx("align-items-center", "g-2")}>
      <Col
        className={cx("align-items-center", "cursor-pointer", "flex-row")}
        onClick={toggleDetails}
      >
        <div {...mainInteraction}>
          <span className={cx("me-2", !readonly && "fw-bold")}>
            {title || canonicalUrlStr || (
              <span className="fwd-italic">Unknown repository</span>
            )}
          </span>
          <RepositoryPermissions repositoryUrl={url} />
        </div>
      </Col>
      {!readonly && (
        <>
          <Col xs={12} sm="auto" className="ms-auto">
            <CodeRepositoryActions project={project} url={url} />
          </Col>
          <RepositoryView
            project={project}
            repositoryUrl={url}
            showDetails={showDetails}
            title={title}
            toggleDetails={toggleDetails}
          />
        </>
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
      width={16}
      height={16}
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

  const badgeIcon = isLoading ? (
    <Loader className="me-1" inline size={16} />
  ) : permissions.pull && permissions.push ? (
    <CircleFill className={cx("me-1", "text-icon")} />
  ) : permissions.pull ? (
    <CircleFill className={cx("me-1", "text-icon")} />
  ) : (
    <CircleFill className={cx("me-1", "text-icon")} />
  );

  const badgeText = isLoading
    ? ""
    : permissions.push
    ? "Push & pull"
    : permissions.pull
    ? "Pull only"
    : "No access";

  const badgeColorClasses = isLoading
    ? ["border-dark-subtle", "bg-light", "text-dark-emphasis"]
    : permissions.push
    ? ["border-success", "bg-success-subtle", "text-success-emphasis"]
    : permissions.pull
    ? ["border-warning", "bg-warning-subtle", "text-warning-emphasis"]
    : ["border-danger", "bg-danger-subtle", "text-danger-emphasis"];

  return (
    <Badge pill className={cx("border", badgeColorClasses)}>
      {badgeIcon}
      <span className="fw-normal">{badgeText}</span>
    </Badge>
  );
}

interface RepositoryViewProps {
  project: Project;
  repositoryUrl: string;
  showDetails: boolean;
  title: string;
  toggleDetails: () => void;
}
function RepositoryView({
  project,
  repositoryUrl,
  showDetails,
  title,
  toggleDetails,
}: RepositoryViewProps) {
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

  return (
    <Offcanvas
      key={`data-source-details-${repositoryUrl}`}
      toggle={toggleDetails}
      isOpen={showDetails}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            onClick={toggleDetails}
          ></button>
        </div>

        <div>
          <div className="mb-4">
            <div className={cx("d-flex", "justify-content-between")}>
              <h2 className="m-0" data-cy="data-source-title">
                {title}
              </h2>
              <div className="my-auto">
                <CodeRepositoryActions project={project} url={repositoryUrl} />
              </div>
            </div>
            <p className={cx("fst-italic", "m-0")}>Code repository</p>
          </div>

          <div className={cx("d-flex", "flex-column", "gap-3")}>
            <div>
              <h5>Repository</h5>
              <p className="mb-0">
                URL:{" "}
                <a
                  href={canonicalUrlStr}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {repositoryUrl}
                  <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
                </a>
              </p>
            </div>
            {canonicalUrl && (
              <p className="mb-0">
                From:{" "}
                <RepositoryIcon
                  className="me-1"
                  provider={canonicalUrl?.origin}
                />
                <span data-cy="code-repository-title">
                  {canonicalUrl?.hostname}
                </span>
              </p>
            )}
            {providersError && (
              <RtkOrNotebooksError error={providersError} dismissible={false} />
            )}
            {error && !isNotFound && (
              <RtkOrNotebooksError error={error} dismissible={false} />
            )}
            {!isLoading && !permissions.push && (
              <RepositoryPermissionsAlert repositoryUrl={repositoryUrl} />
            )}
            <div>
              <h5>Permissions</h5>
              <Row>
                <Col xs={6}>
                  Clone, Pull:{" "}
                  {isLoading ? (
                    <Loader className="bi" inline size={12} />
                  ) : permissions.pull ? (
                    <YesBadge />
                  ) : (
                    <NoBadge />
                  )}
                </Col>
                <Col xs={6}>
                  Push:{" "}
                  {isLoading ? (
                    <Loader className="bi" inline size={12} />
                  ) : permissions.push ? (
                    <YesBadge />
                  ) : (
                    <NoBadge />
                  )}
                </Col>
              </Row>
            </div>
            <Col xs={12}>
              <RepositoryProviderDetails repositoryUrl={repositoryUrl} />
            </Col>
          </div>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}

function RepositoryPermissionsAlert({
  repositoryUrl,
}: RepositoryPermissionsProps) {
  const location = useLocation();

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

  const loginUrl = Url.get(Url.pages.login.link, {
    pathname: location.pathname,
  });

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
              You need to <Link to={loginUrl}>log in</Link> to perform pushes on
              git repositories.
            </p>
          ) : provider && status === "not-connected" ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              Your user account is not currently connected to{" "}
              {provider.display_name}. See{" "}
              <Link to={ABSOLUTE_ROUTES.v2.connectedServices}>
                connected services
              </Link>
              .
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
              You need to <Link to={loginUrl}>log in</Link> to perform pushes on
              git repositories.
            </p>
          ) : provider && status === "not-connected" ? (
            <p className={cx("mt-1", "mb-0", "fst-italic")}>
              Your user account is not currently connected to{" "}
              {provider.display_name}. See{" "}
              <Link to={ABSOLUTE_ROUTES.v2.connectedServices}>
                connected services
              </Link>
              .
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
        "border-success",
        "bg-success-subtle",
        "text-success-emphasis"
      )}
    >
      <CircleFill className={cx("bi", "me-1")} />
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
        "border-danger",
        "bg-danger-subtle",
        "text-danger-emphasis"
      )}
    >
      <CircleFill className={cx("bi", "me-1")} />
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

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
  CircleFill,
  FileCode,
  Pencil,
  Plugin,
  Send,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation } from "react-router";
import {
  Button,
  Col,
  DropdownItem,
  Form,
  FormGroup,
  Input,
  Label,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Offcanvas,
  OffcanvasBody,
  Row,
} from "reactstrap";

import { ErrorAlert, InfoAlert, WarnAlert } from "~/components/Alert";
import { CommandCopy } from "~/components/commandCopy/CommandCopy";
import { ExternalLink } from "~/components/LegacyExternalLinks";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import RepositoryGitLabWarnBadge from "~/features/legacy/RepositoryGitLabWarnBadge";
import { useGetRepositoryQuery } from "~/features/repositories/api/repositories.api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { RenkuContactEmail } from "~/utils/constants/Docs";
import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import { SshRepositoryUrlWarning } from "./AddCodeRepositoryModal";
import {
  getRepositoryName,
  validateCodeRepository,
  validateNoDuplicatesInCodeRepositories,
} from "./repositories.utils";

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
    formState: { isDirty },
    handleSubmit,
    reset,
    setError,
    watch,
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
      const validationResult =
        validateNoDuplicatesInCodeRepositories(repositories);
      if (typeof validationResult === "string") {
        setError("repositoryUrl", { message: validationResult });
        return;
      }
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
      setError,
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
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  useEffect(() => {
    reset({ repositoryUrl });
  }, [repositoryUrl, reset]);

  const watchRepositoryUrl = watch("repositoryUrl");

  return (
    <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader tag="h2" toggle={toggleModal}>
          <FileCode className={cx("me-1", "bi")} />
          Edit code repository
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <p>Specify a code repository by its URL.</p>
          <Row>
            <Col>
              <FormGroup
                className="field-group"
                noMargin
                onClickCapture={(e) => {
                  // ? Prevent offcanvas from toggling when clicking inside the form group
                  e.stopPropagation();
                }}
              >
                <Label for={`project-${project.id}-edit-repository-url`}>
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
                        data-cy="project-edit-repository-url"
                        id={`project-${project.id}-edit-repository-url`}
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
            data-cy="edit-code-repository-modal-button"
            disabled={!isDirty}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Update code repository
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
      <ModalBody>
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
        <Button color="outline-danger" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
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
              <Loader className="me-1" inline size={16} />
              Deleting code repository
            </>
          ) : (
            <>
              <Trash className={cx("bi", "me-1")} />
              Remove repository
            </>
          )}
        </Button>
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
  const permissions = useProjectPermissions({ projectId: project.id });

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
      <Pencil className={cx("bi", "me-1")} />
      Edit
    </Button>
  );

  return (
    <PermissionsGuard
      disabled={null}
      enabled={
        <>
          <ButtonWithMenuV2
            color="outline-primary"
            default={defaultAction}
            preventPropagation
            size="sm"
          >
            <DropdownItem
              data-cy="code-repository-delete"
              onClick={toggleDelete}
            >
              <Trash className={cx("bi", "me-1")} />
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
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
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
  const projectPermissions = useProjectPermissions({ projectId: project.id });
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = useCallback(() => {
    setShowDetails((open) => !open);
  }, []);
  const canonicalUrlStr = useMemo(
    () => `${url.replace(/(?:\.git|\/)$/i, "")}`,
    [url]
  );
  const title = getRepositoryName(url);

  const listGroupProps = !readonly
    ? {
        action: true,
        className: cx(
          !readonly && ["cursor-pointer", "link-primary", "text-body"]
        ),
        onClick: toggleDetails,
      }
    : {};

  return (
    <>
      <ListGroupItem {...listGroupProps} data-cy="code-repository-item">
        <Row className={cx("align-items-center", "g-2")}>
          <Col className={cx("align-items-center", "flex-row")}>
            <div>
              <span
                className={cx("me-2", !readonly && "fw-bold")}
                data-cy="code-repository-title"
              >
                {title || canonicalUrlStr || (
                  <span className="fwd-italic">Unknown repository</span>
                )}
              </span>
              <RepositoryPermissionsBadge
                hasWriteAccess={projectPermissions?.write}
                repositoryUrl={url}
              />
            </div>
          </Col>
          {!readonly && (
            <>
              <Col xs={12} sm="auto" className="ms-auto">
                <CodeRepositoryActions project={project} url={url} />
              </Col>
            </>
          )}
        </Row>
        <Row>
          <Col data-cy="repo-gitlab-warning">
            <RepositoryGitLabWarnBadge project={project} url={url} />
          </Col>
        </Row>
      </ListGroupItem>
      {!readonly && (
        <RepositoryView
          project={project}
          repositoryUrl={url}
          showDetails={showDetails}
          title={title}
          toggleDetails={toggleDetails}
        />
      )}
    </>
  );
}

interface RepositoryPermissionsProps {
  hasWriteAccess?: boolean;
  repositoryUrl: string;
}
export function RepositoryPermissionsBadge({
  hasWriteAccess,
  repositoryUrl,
}: RepositoryPermissionsProps) {
  const { data, isLoading, error } = useGetRepositoryQuery({
    url: repositoryUrl,
  });

  let badgeColor: "light" | "danger" | "warning" | "success";
  let badgeText: string;

  if (isLoading) {
    badgeColor = "light";
    badgeText = "Loading...";
  } else if (error) {
    badgeColor = "danger";
    badgeText = "Error";
  } else if (!data?.metadata?.pull_permission && !data?.provider?.id) {
    badgeColor = "danger";
    badgeText = "Inaccessible";
  } else if (
    !data?.metadata?.pull_permission &&
    data?.connection?.status !== "connected"
  ) {
    badgeColor = "danger";
    badgeText = "Integration required";
  } else if (
    !data?.metadata?.pull_permission &&
    data?.connection?.status === "connected"
  ) {
    badgeColor = "danger";
    badgeText = "Inaccessible";
  } else if (!data?.metadata?.push_permission && !data?.provider?.id) {
    badgeText = hasWriteAccess ? "Request integration" : "Read only";
    badgeColor = hasWriteAccess ? "warning" : "success";
  } else if (
    !data?.metadata?.push_permission &&
    data?.connection?.status !== "connected"
  ) {
    badgeText = hasWriteAccess ? "Integration recommended" : "Read only";
    badgeColor = hasWriteAccess ? "warning" : "success";
  } else if (
    !data?.metadata?.push_permission &&
    data?.connection?.status === "connected"
  ) {
    badgeColor = "success";
    badgeText = "Read only";
  } else if (
    data?.metadata?.push_permission &&
    data?.connection?.status === "connected"
  ) {
    badgeColor = "success";
    badgeText = "Read & write";
  } else {
    badgeColor = "light";
    badgeText = "Unexpected";
  }

  const badgeIcon = isLoading ? (
    <Loader className="me-1" inline size={12} />
  ) : (
    <CircleFill className={cx("me-1", "bi")} />
  );

  return (
    <RenkuBadge
      className="fw-normal"
      color={badgeColor}
      data-cy="code-repository-permission-badge"
      pill
    >
      {badgeIcon}
      {badgeText}
    </RenkuBadge>
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
  const { pathname, hash } = useLocation();
  const { data, isLoading, error } = useGetRepositoryQuery({
    url: repositoryUrl,
  });

  const webUrl = useMemo(() => {
    return data?.metadata?.web_url ? data.metadata.web_url : repositoryUrl;
  }, [data, repositoryUrl]);

  const search = useMemo(() => {
    return `?${new URLSearchParams({
      targetProvider: data?.provider?.id ?? "",
      source: `${pathname}${hash}`,
    }).toString()}`;
  }, [data, pathname, hash]);

  const projectPermissions = useProjectPermissions({ projectId: project.id });

  return (
    <Offcanvas
      key={`data-source-details-${repositoryUrl}`}
      toggle={toggleDetails}
      isOpen={showDetails}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody data-cy="code-repository-details">
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
            <div>
              <div className={cx("float-end", "mt-1", "ms-1")}>
                <CodeRepositoryActions project={project} url={repositoryUrl} />
              </div>
              <div className={cx("d-flex", "flex-column")}>
                <span className={cx("small", "text-muted", "me-3")}>
                  Code repository
                </span>
                <h2
                  className={cx("m-0", "text-break")}
                  data-cy="code-repository-title"
                >
                  {title}
                </h2>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <div>
              <div className="mb-4">
                <h3>Repository</h3>
                <p>
                  URL:{" "}
                  <ExternalLink
                    iconAfter={true}
                    role="link"
                    url={webUrl}
                    title={webUrl}
                  />
                </p>
                {data?.metadata?.git_url && (
                  <div>
                    <span>Git command: </span>
                    <CommandCopy
                      command={`git clone ${data.metadata.git_url}`}
                    />
                  </div>
                )}
              </div>

              <div>
                <h3>Permissions</h3>
                {error ? (
                  <RtkOrNotebooksError error={error} dismissible={false} />
                ) : (
                  <>
                    <div
                      className={cx("d-flex", "flex-column", "gap-2", "mb-3")}
                    >
                      <div>
                        <RepositoryPermissionsBadge
                          hasWriteAccess={projectPermissions?.write}
                          repositoryUrl={repositoryUrl}
                        />
                      </div>
                      <RepositoryCallToActionAlert
                        hasWriteAccess={projectPermissions?.write}
                        repositoryUrl={repositoryUrl}
                      />
                    </div>

                    <div
                      className="mb-3"
                      data-cy="code-repository-pull-permission"
                    >
                      <span>
                        Pull:{" "}
                        <YesNoBadge
                          value={data?.metadata?.pull_permission ?? false}
                        />
                      </span>
                    </div>

                    <div
                      className="mb-3"
                      data-cy="code-repository-push-permission"
                    >
                      <span>
                        Push:{" "}
                        <YesNoBadge
                          value={data?.metadata?.push_permission ?? false}
                        />
                      </span>
                    </div>

                    <p>
                      Integration:{" "}
                      {!data?.provider?.id ? (
                        "None"
                      ) : (
                        <span>
                          {data?.connection?.status === "connected"
                            ? "connected"
                            : "not connected"}{" "}
                          (
                          <Link
                            to={{
                              pathname: ABSOLUTE_ROUTES.v2.integrations,
                              search,
                            }}
                          >
                            check details
                          </Link>
                          )
                        </span>
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}

function LogInWarning() {
  return (
    <p className="mb-0">
      You need to be logged in to activate integrations and access private
      repositories.
    </p>
  );
}

interface RepositoryCallToActionAlertProps {
  hasWriteAccess: boolean;
  repositoryUrl: string;
}
export function RepositoryCallToActionAlert({
  hasWriteAccess,
  repositoryUrl,
}: RepositoryCallToActionAlertProps) {
  const { pathname, hash } = useLocation();
  const { data, isLoading, error } = useGetRepositoryQuery({
    url: repositoryUrl,
  });

  const { data: userInfo } = useGetUserQueryState();
  const anonymousUser = useMemo(() => {
    return userInfo && !userInfo?.isLoggedIn;
  }, [userInfo]);

  const search = useMemo(() => {
    return `?${new URLSearchParams({
      targetProvider: data?.provider?.id ?? "",
      source: `${pathname}${hash}`,
    }).toString()}`;
  }, [data, pathname, hash]);

  if (isLoading) return null;

  if (error) return <RtkOrNotebooksError error={error} dismissible={false} />;

  if (!data?.metadata?.pull_permission) {
    return (
      <ErrorAlert
        className="mb-0"
        dismissible={false}
        data-cy="code-repository-alert"
      >
        {data?.provider?.id ? (
          <>
            <p className="mb-2">
              Either the repository does not exist, or you do not have access to
              it.
            </p>
            {anonymousUser ? (
              <LogInWarning />
            ) : (
              <>
                <p className="mb-2">
                  If you think you should have access, check your integration{" "}
                  <span className="fst-italic">{data.provider.name}</span>.
                </p>
                <Link
                  className={cx("btn", "btn-primary", "btn-sm")}
                  to={{
                    pathname: ABSOLUTE_ROUTES.v2.integrations,
                    search,
                  }}
                >
                  <Plugin className={cx("bi", "me-1")} />
                  View integration
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <p className={cx(!hasWriteAccess && "mb-0")}>
              The repository URL is invalid or points to a version control
              platform we currently do not support.
              {hasWriteAccess && (
                <>
                  {" "}
                  Please verify the URL and check if the platform is in the
                  currently supported{" "}
                  <Link
                    to={{
                      pathname: ABSOLUTE_ROUTES.v2.integrations,
                      search,
                    }}
                  >
                    <Plugin className={cx("bi", "me-1")} />
                    integrations list.
                  </Link>
                </>
              )}
            </p>

            {hasWriteAccess && (
              <p className="mb-0">
                If you&apos;re certain the URL is correct,{" "}
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`mailto:${RenkuContactEmail}`}
                >
                  <Send className={cx("bi", "me-1")} />
                  contact us
                </a>{" "}
                about adding an integration.
              </p>
            )}
          </>
        )}
      </ErrorAlert>
    );
  }

  if (
    !data?.metadata?.push_permission &&
    !data?.provider?.id &&
    hasWriteAccess
  ) {
    return (
      <WarnAlert
        className="mb-0"
        dismissible={false}
        data-cy="code-repository-alert"
      >
        <p>
          The repository URL is valid. However, we don&apos;t currently support
          this version control platform and you won&apos;t have the credentials
          to push your code.
        </p>

        <p className="mb-0">
          If you want a smooth experience,{" "}
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="mailto:hello@renku.io"
          >
            <Send className={cx("bi", "me-1")} />
            contact us
          </a>{" "}
          about adding an integration.
        </p>
      </WarnAlert>
    );
  }

  if (
    !data?.metadata?.push_permission &&
    data?.provider?.id &&
    data?.connection?.status !== "connected" &&
    hasWriteAccess
  ) {
    return (
      <WarnAlert
        className="mb-0"
        dismissible={false}
        data-cy="code-repository-alert"
      >
        <p className="mb-2">
          You can log in through the integration{" "}
          <span className="fst-italic">{data.provider.name}</span> to enable
          pushing to repositories for which you have permissions.
        </p>
        <Link
          className={cx("btn", "btn-primary", "btn-sm")}
          to={{
            pathname: ABSOLUTE_ROUTES.v2.integrations,
            search,
          }}
        >
          <Plugin className={cx("bi", "me-1")} />
          View integration
        </Link>
      </WarnAlert>
    );
  }

  if (
    !data?.metadata?.push_permission &&
    data?.provider?.id &&
    data?.connection?.status !== "connected" &&
    !hasWriteAccess
  ) {
    return (
      <InfoAlert
        className="mb-0"
        dismissible={false}
        data-cy="code-repository-alert"
        timeout={0}
      >
        <p className="mb-2">
          If you want to enable pushing to repositories for which you have
          permissions, you can log in through the integration{" "}
          <span className="fst-italic">{data.provider.name}</span>.
        </p>
        {anonymousUser ? (
          <LogInWarning />
        ) : (
          <Link
            className={cx("btn", "btn-primary", "btn-sm")}
            to={{
              pathname: ABSOLUTE_ROUTES.v2.integrations,
              search,
            }}
          >
            <Plugin className={cx("bi", "me-1")} />
            View integration
          </Link>
        )}
      </InfoAlert>
    );
  }

  return null;
}

interface YesNoBadgeProps {
  value: boolean;
}
function YesNoBadge({ value }: YesNoBadgeProps) {
  return value ? (
    <RenkuBadge color="success" pill>
      Yes
    </RenkuBadge>
  ) : (
    <RenkuBadge color="danger" pill>
      No
    </RenkuBadge>
  );
}

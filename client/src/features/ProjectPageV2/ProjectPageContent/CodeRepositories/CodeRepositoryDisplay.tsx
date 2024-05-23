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
  ExclamationCircleFill,
  Pencil,
  QuestionCircleFill,
  SlashCircleFill,
  ThreeDotsVertical,
  Trash,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import FieldGroup from "../../../../components/FieldGroups";
import { Loader } from "../../../../components/Loader";
import RenkuFrogIcon from "../../../../components/icons/RenkuIcon";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

import { ErrorAlert } from "../../../../components/Alert";
import dotsDropdownStyles from "../../../../components/buttons/ThreeDots.module.scss";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import connectedServicesApi, {
  useGetProvidersQuery,
  useGetRepositoryMetadataQuery,
} from "../../../connectedServices/connectedServices.api";
import { INTERNAL_GITLAB_PROVIDER_ID } from "../../../connectedServices/connectedServices.constants";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";

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
  const [repositoryUrlUpdated, setRepositoryUrlUpdated] =
    useState(repositoryUrl);
  const [updateProject, { isLoading, isSuccess }] =
    usePatchProjectsByProjectIdMutation();
  const onUpdateCodeRepository = useCallback(
    (newRepositoryUrl: string) => {
      if (
        !newRepositoryUrl ||
        !project.repositories ||
        project.repositories.length === 0
      )
        return;
      const repositories = project.repositories.map((url) =>
        url === repositoryUrl ? newRepositoryUrl : url
      );
      updateProject({
        "If-Match": project.etag ? project.etag : undefined,
        projectId: project.id,
        projectPatch: { repositories },
      });
    },
    [
      project.repositories,
      updateProject,
      project.etag,
      project.id,
      repositoryUrl,
    ]
  );

  useEffect(() => {
    if (isSuccess) toggleModal();
  }, [isSuccess, toggleModal]);

  return (
    <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader toggle={toggleModal}>
        <RenkuFrogIcon className="me-2" size={30} />
        Edit code repository
      </ModalHeader>
      <ModalBody className="py-0">
        <p>Specify a code repository by its URL.</p>
        <Row>
          <Col>
            <FieldGroup
              id="url"
              label="Repository URL"
              value={repositoryUrlUpdated}
              help={"https://github.com/my-repository"}
              isRequired={true}
              onChange={(e) => setRepositoryUrlUpdated(e.target.value)}
            />
          </Col>
        </Row>
        <ModalFooter className="px-0">
          <Button
            color="rk-green"
            className={cx("float-right", "mt-1", "ms-2")}
            data-cy="edit-code-repository-modal-button"
            type="submit"
            onClick={() => onUpdateCodeRepository(repositoryUrlUpdated)}
          >
            {isLoading ? (
              <>
                <Loader className="me-2" inline size={16} />
                Edit code repository
              </>
            ) : (
              <>Edit code repository</>
            )}
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
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
  const [updateProject, { isLoading }] = usePatchProjectsByProjectIdMutation();
  const onDeleteCodeRepository = () => {
    const repositories = project?.repositories
      ? project?.repositories?.filter((repo) => repo !== repositoryUrl)
      : [];
    updateProject({
      "If-Match": project.etag ? project.etag : undefined,
      projectId: project.id,
      projectPatch: { repositories },
    })
      .unwrap()
      .then(() => toggleModal());
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Remove Code Repository
      </ModalHeader>
      <ModalBody className="py-0">
        <Row>
          <Col>
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
            {isLoading ? (
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

interface RepositoryPermissionsProps {
  repositoryUrl: string;
}

function RepositoryPermissions({ repositoryUrl }: RepositoryPermissionsProps) {
  const {
    data: repositoryProviderMatch,
    isLoading,
    error,
  } = useGetRepositoryMetadataQuery({ repositoryUrl });
  useGetProvidersQuery();

  const permissions = useMemo(() => {
    const { pull, push } = repositoryProviderMatch?.repository_metadata
      ?.permissions ?? { pull: false, push: false };
    return { pull, push };
  }, [repositoryProviderMatch?.repository_metadata?.permissions]);

  const canonicalUrlStr = useMemo(
    () => `${repositoryUrl.replace(/.git$/i, "")}`,
    [repositoryUrl]
  );

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((open) => !open);
  }, []);

  const isNotFound = error != null && "status" in error && error.status == 404;

  const commonButtonClasses = [
    "border",
    "rounded-circle",
    "fs-6",
    "lh-1",
    "p-2",
  ];

  const buttonContent = isLoading ? (
    <>
      <Loader className="bi" inline size={16} />
    </>
  ) : error != null ? (
    <ExclamationCircleFill className="bi" />
  ) : permissions.pull && permissions.push ? (
    <CheckCircleFill className="bi" />
  ) : permissions.pull ? (
    <SlashCircleFill className="bi" />
  ) : (
    <XCircleFill className="bi" />
  );

  const buttonClasses = isLoading
    ? ["border-dark-subtle", "bg-light", "text-dark"]
    : error != null
    ? ["border-danger", "bg-danger-subtle", "text-danger"]
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
      >
        {buttonContent}
      </Button>
      <Modal
        size="lg"
        fullscreen="sm"
        isOpen={isDetailsOpen}
        toggle={toggleDetails}
        centered
      >
        <ModalHeader toggle={toggleDetails}>Repository permissions</ModalHeader>
        <ModalBody>
          <Row className="gy-2">
            <Col xs={12}>
              Repository:{" "}
              <a
                href={canonicalUrlStr}
                target="_blank"
                rel="noreferrer noopener"
              >
                {repositoryUrl}
                <BoxArrowUpRight className={cx("bi", "ms-1")} size={16} />
              </a>
            </Col>
            {error != null && (
              <Col xs={12}>
                {isNotFound ? (
                  <ErrorAlert className="mb-0" dismissible={false} timeout={0}>
                    <p className="mb-1">
                      No git provider found for this repository.
                    </p>
                    <p className={cx("mb-0", "fst-italic")}>
                      You may still be able to clone and pull the repository if
                      it is publicly available.
                    </p>
                  </ErrorAlert>
                ) : (
                  <RtkOrNotebooksError error={error} dismissible={false} />
                )}
              </Col>
            )}
            {error == null && !isLoading && !permissions.pull && (
              <Col xs={12}>
                <ErrorAlert className="mb-0" dismissible={false} timeout={0}>
                  <p className="mb-1">
                    This repository does not exist or you do not have access to
                    it.
                  </p>
                </ErrorAlert>
              </Col>
            )}
            <Col xs={12}>
              <h6 className={cx("fs-5", "fw-bold", "mb-0")}>Permissions</h6>
            </Col>
            <Col className="mt-0" xs={12} sm={6}>
              Clone, Pull:{" "}
              {isLoading ? (
                <Loader className="bi" inline size={16} />
              ) : isNotFound ? (
                <UnknownBadge />
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

function UnknownBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "rounded-pill",
        "fs-6",
        "lh-1",
        "p-2",
        "border-dark-subtle",
        "bg-light",
        "text-dark"
      )}
    >
      <QuestionCircleFill className={cx("bi", "me-1")} />
      Unknown
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
  } = connectedServicesApi.endpoints.getRepositoryMetadata.useQueryState({
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

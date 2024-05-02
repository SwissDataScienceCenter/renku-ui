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
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircleFill,
  Clock,
  ThreeDotsVertical,
  Trash,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import {
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
  UncontrolledTooltip,
} from "reactstrap";
import { ExternalLink } from "../../../../components/ExternalLinks.jsx";
import { Loader } from "../../../../components/Loader.tsx";
import { TimeCaption } from "../../../../components/TimeCaption.tsx";
import dotsDropdownStyles from "../../../../components/buttons/ThreeDots.module.scss";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook.ts";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook.ts";
import { GitlabProjectResponse } from "../../../project/GitLab.types.ts";
import { useGetProjectByPathQuery } from "../../../project/projectGitLab.api.ts";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import sessionConfigV2Slice from "../../../sessionsV2/sessionConfigV2.slice.ts";
import RenkuFrogIcon from "../../../../components/icons/RenkuIcon.tsx";

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
              "justify-content-end"
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
    </>
  );
}
interface SessionRepositoryConfigProps {
  project: Project;
  url: string;
  viewMode: "inline-view-mode" | "edit-mode";
}

export function SessionRepositoryConfig({
  url,
  viewMode,
  project,
}: SessionRepositoryConfigProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const canonicalUrl = useMemo(() => `${url.replace(/.git$/i, "")}.git`, [url]);

  const repository = useMemo(
    () => matchRepositoryUrl(canonicalUrl),
    [canonicalUrl]
  );

  const { currentData, isFetching, isError } = useGetProjectByPathQuery(
    repository ? repository : skipToken
  );

  const matchedRepositoryMetadata = useMemo(
    () =>
      currentData != null
        ? matchRepositoryMetadata(canonicalUrl, currentData)
        : null,
    [canonicalUrl, currentData]
  );

  const repositorySupport = useAppSelector(
    ({ sessionConfigV2 }) => sessionConfigV2.repositorySupport[canonicalUrl]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (repositorySupport == null) {
      dispatch(sessionConfigV2Slice.actions.initializeRepository(canonicalUrl));
    }
  }, [canonicalUrl, dispatch, isFetching, repositorySupport]);

  useEffect(() => {
    if (!repository) {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, dispatch, repository]);

  useEffect(() => {
    if (isFetching) {
      dispatch(sessionConfigV2Slice.actions.initializeRepository(canonicalUrl));
    }
  }, [canonicalUrl, dispatch, isFetching]);

  useEffect(() => {
    if (isError) {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, dispatch, isError]);

  useEffect(() => {
    if (currentData == null) {
      return;
    }

    if (matchedRepositoryMetadata) {
      const {
        default_branch: defaultBranch,
        namespace,
        path: projectName,
      } = matchedRepositoryMetadata;
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: true,
          sessionConfiguration: {
            defaultBranch,
            namespace: namespace.full_path,
            projectName,
            repositoryMetadata: matchedRepositoryMetadata,
          },
        })
      );
    } else {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, currentData, dispatch, matchedRepositoryMetadata]);

  const urlDisplay = (
    <div className={cx("d-flex", "align-items-center", "gap-1")}>
      <RenkuFrogIcon className={cx("me-2", "flex-shrink-0")} size={24} />
      <ExternalLink
        url={canonicalUrl}
        title={currentData?.path || canonicalUrl}
        role="text"
        className="text-truncate"
      />
      <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" color="dark" />
    </div>
  );

  const statusDisplay = (
    <>
      <span ref={ref} tabIndex={0}>
        {!repositorySupport || repositorySupport.isLoading ? (
          <Loader className="bi" inline size={16} />
        ) : repositorySupport.supportsSessions ? (
          <div
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "text-truncate"
            )}
          >
            <CheckCircleFill className={cx("bi", "text-success")} />
            Accessible
          </div>
        ) : (
          <div
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "text-truncate"
            )}
          >
            <XCircleFill className={cx("bi", "text-danger")} />
            Error
          </div>
        )}
      </span>
      {repositorySupport && !repositorySupport.isLoading && (
        <UncontrolledTooltip target={ref} placement="top">
          {repositorySupport.supportsSessions ? (
            <>This repository will be mounted in sessions.</>
          ) : (
            <>This repository cannot be mounted in sessions.</>
          )}
        </UncontrolledTooltip>
      )}
    </>
  );
  const creationDateDisplay = (
    <span className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" />
      <TimeCaption
        prefix="Created"
        datetime={currentData?.created_at}
        className="text-truncate"
        enableTooltip={true}
      />
    </span>
  );

  return viewMode === "edit-mode" ? (
    <Row className={cx("mb-4")}>
      <Col xs={10} sm={6} className={cx("text-truncate", "col")}>
        {urlDisplay}
      </Col>
      <Col
        xs={12}
        sm={4}
        className={cx("col-12", "order-3", "order-sm-2", "col-sm")}
      >
        {statusDisplay}
      </Col>
      <Col
        xs={2}
        className={cx("order-2", "order-xs-3", "d-flex", "justify-content-end")}
      >
        <CodeRepositoryActions project={project} url={url} />
      </Col>
      <Col xs={12} className={cx("text-truncate", "order-4")}>
        {creationDateDisplay}
      </Col>
    </Row>
  ) : (
    <Row>
      <Col xs={6} sm={8} className={cx("text-truncate")}>
        {urlDisplay}
      </Col>
      <Col xs={6} sm={4}>
        {statusDisplay}
      </Col>
    </Row>
  );
}

function matchRepositoryUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const trimmedPath = url.pathname
      .replace(/^[/]/gi, "")
      .replace(/.git$/i, "");
    return trimmedPath ? trimmedPath : null;
  } catch (error) {
    return null;
  }
}

function matchRepositoryMetadata(
  canonicalUrl: string,
  data: GitlabProjectResponse
) {
  if (canonicalUrl !== data.http_url_to_repo) {
    return null;
  }
  return data;
}

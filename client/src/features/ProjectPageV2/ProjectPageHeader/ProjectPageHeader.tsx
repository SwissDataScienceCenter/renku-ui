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
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useState } from "react";
import {
  Binoculars,
  PencilSquare,
  ThreeDotsVertical,
  Trash,
} from "react-bootstrap-icons";
import { Link, generatePath } from "react-router-dom-v5-compat";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import {
  EditButtonLink,
  UnderlineArrowLink,
} from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectDeleteConfirmation } from "../../projectsV2/show/ProjectV2EditForm";
import AddSessionLauncherButton from "../../sessionsV2/AddSessionLauncherButton";
import { useGetProjectSessionLaunchersQuery } from "../../sessionsV2/sessionsV2.api";
import { ProjectImageView } from "../ProjectPageContent/ProjectInformation/ProjectInformation";
import AccessGuard from "../utils/AccessGuard";
import useProjectAccess from "../utils/useProjectAccess.hook";

import dotsDropdownStyles from "../../../components/buttons/ThreeDots.module.scss";

interface ProjectActionsProps extends ProjectPageHeaderProps {
  settingsUrl: string;
}
function ProjectActions({ project, settingsUrl }: ProjectActionsProps) {
  const { userRole } = useProjectAccess({ projectId: project.id });
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
            dotsDropdownStyles.threeDots
          )}
        >
          <ThreeDotsVertical className="fs-3" />
        </DropdownToggle>
        <DropdownMenu className={cx("mt-2", "mx-0", "text-start")} end>
          <AccessGuard
            disabled={
              <DropdownItem>
                <Link
                  className={cx(
                    "text-decoration-none",
                    "d-flex",
                    "align-items-center",
                    "gap-2",
                    "justify-content-start"
                  )}
                  to={settingsUrl}
                >
                  <Binoculars /> View project information
                </Link>
              </DropdownItem>
            }
            enabled={
              <DropdownItem>
                <Link
                  className={cx(
                    "text-decoration-none",
                    "d-flex",
                    "align-items-center",
                    "gap-2",
                    "justify-content-start"
                  )}
                  to={settingsUrl}
                >
                  <PencilSquare /> Edit project information
                </Link>
              </DropdownItem>
            }
            minimumRole="editor"
            role={userRole}
          />
          <AccessGuard
            disabled={null}
            enabled={
              <DropdownItem
                className={cx(
                  "d-flex",
                  "align-items-center",
                  "gap-2",
                  "justify-content-start"
                )}
                onClick={toggleDelete}
              >
                <Trash /> Delete this project
              </DropdownItem>
            }
            role={userRole}
          />
        </DropdownMenu>
      </UncontrolledDropdown>
      <ProjectDeleteConfirmation
        isOpen={isDeleteOpen}
        project={project}
        toggle={toggleDelete}
      />
    </>
  );
}

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectSessionLaunchersQuery(
    project.id ? { projectId: project.id } : skipToken
  );
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });

  const addSessionBtn =
    !launchersError &&
    !isLoadingLaunchers &&
    launchers &&
    launchers?.length <= 0 ? (
      <AccessGuard
        disabled={null}
        enabled={<AddSessionLauncherButton styleBtn="iconTextBtn" />}
        minimumRole="editor"
        role={userRole}
      />
    ) : null;

  return (
    <header className={cx("px-4", "px-lg-0")}>
      <Row>
        <Col className="col-12 col-lg-2">
          <div className={cx("d-none", "d-lg-block")}>
            <ProjectImageView />
          </div>
        </Col>
        <Col className="col-12 col-lg-10">
          <Row>
            <Col className="col-12 col-sm-8">
              <div className={cx("")}>
                <h1 className="fw-bold">{project.name}</h1>
              </div>
            </Col>
            <Col className="col-12 col-sm-4">
              <div className={cx("")}>
                <div
                  className={cx(
                    "d-none",
                    "align-items-center",
                    "justify-content-end",
                    "gap-2",
                    "d-sm-flex"
                  )}
                >
                  {addSessionBtn}
                  <div className={cx("d-none", "d-sm-none", "d-md-block")}>
                    <ProjectActions
                      project={project}
                      settingsUrl={settingsUrl}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Col className="col-12">
            <div>
              {project.description?.length ? (
                <p>
                  {project.description}
                  <span className="mx-2">
                    <AccessGuard
                      disabled={null}
                      enabled={
                        <EditButtonLink
                          data-cy="project-description-edit"
                          to={settingsUrl}
                          tooltip="Modify project information"
                        />
                      }
                      minimumRole="editor"
                      role={userRole}
                    />
                  </span>
                </p>
              ) : (
                <UnderlineArrowLink
                  tooltip="Add project description"
                  text="Add description"
                  to={settingsUrl}
                />
              )}
            </div>
          </Col>
          <Col className="d-flex d-sm-none">{addSessionBtn}</Col>
        </Col>
      </Row>
    </header>
  );
}

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

import { UnderlineArrowLink } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectImageView } from "../ProjectPageContent/ProjectInformation/ProjectInformation";
import ProjectDeleteConfirmation from "../settings/ProjectDeleteConfirmation";
import AccessGuard from "../utils/AccessGuard";
import useProjectAccess from "../utils/useProjectAccess.hook";

import dotsDropdownStyles from "../../../components/buttons/ThreeDots.module.scss";

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });

  return (
    <header>
      <Row>
        <Col xs={12} lg={2}>
          <div className={cx("d-none", "d-lg-block")}>
            <ProjectImageView />
          </div>
        </Col>
        <Col xs={12} lg={10}>
          <Row>
            <Col className={cx("d-flex", "justify-content-between")}>
              <h1 data-cy="project-name">{project.name}</h1>
              <div className={cx("align-items-center", "d-flex")}>
                <ProjectActions project={project} settingsUrl={settingsUrl} />
              </div>
            </Col>
          </Row>
          <Col>
            <div>
              {project.description?.length ? (
                <p data-cy="project-description">{project.description}</p>
              ) : (
                <UnderlineArrowLink
                  tooltip="Add project description"
                  text="Add description"
                  to={settingsUrl}
                />
              )}
            </div>
          </Col>
        </Col>
      </Row>
    </header>
  );
}

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
            dotsDropdownStyles.threeDots
          )}
        >
          <ThreeDotsVertical className="fs-3" />
        </DropdownToggle>
        <DropdownMenu end>
          <AccessGuard
            disabled={
              <DropdownItem>
                <Link
                  className={cx("text-decoration-none", "text-reset")}
                  to={settingsUrl}
                >
                  <Binoculars className={cx("me-2", "text-icon")} />
                  View project information
                </Link>
              </DropdownItem>
            }
            enabled={
              <DropdownItem>
                <Link
                  className={cx("text-decoration-none", "text-reset")}
                  to={settingsUrl}
                >
                  <PencilSquare className={cx("me-2", "text-icon")} />
                  Edit project information
                </Link>
              </DropdownItem>
            }
            minimumRole="editor"
            role={userRole}
          />
          <AccessGuard
            disabled={null}
            enabled={
              <DropdownItem onClick={toggleDelete}>
                <Trash className={cx("me-2", "text-icon")} />
                Delete this project
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

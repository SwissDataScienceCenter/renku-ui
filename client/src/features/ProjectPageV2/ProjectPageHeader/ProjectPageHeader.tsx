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
import { PencilSquare, ThreeDotsVertical, Trash } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import {
  EditButtonLink,
  UnderlineArrowLink,
} from "../../../components/buttons/Button.tsx";
import dotsDropdownStyles from "../../../styles/components/_renku_dots_dropmenu.module.scss";
import dropdownMenuStyles from "../../../styles/components/_renku_dropdown_menu.module.scss";
import { Url } from "../../../utils/helpers/url";
import { Project } from "../../projectsV2/api/projectV2.api.ts";
import { ProjectDeleteConfirmation } from "../../projectsV2/show/ProjectV2EditForm.tsx";
import AddSessionLauncherButton from "../../sessionsV2/AddSessionLauncherButton.tsx";
import { useGetProjectSessionLaunchersQuery } from "../../sessionsV2/sessionsV2.api.ts";
import { ProjectImageView } from "../ProjectPageContent/ProjectInformation/ProjectInformation.tsx";
import styles from "./ProjectPageHeader.module.scss";

interface ProjectActionsProps {
  settingsUrl: string;
  project: Project;
}
function ProjectActions({ settingsUrl, project }: ProjectActionsProps) {
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
        <DropdownMenu className={dropdownMenuStyles.DropdownMenu} end>
          <DropdownItem>
            <Link
              className={cx(
                "text-decoration-none",
                "d-flex",
                "align-items-center",
                "gap-2",
                "justify-content-end"
              )}
              to={settingsUrl}
            >
              <PencilSquare /> Edit project information
            </Link>
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "justify-content-end"
            )}
            onClick={toggleDelete}
          >
            <Trash /> Delete this project
          </DropdownItem>
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
  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectSessionLaunchersQuery(
    project.id ? { projectId: project.id } : skipToken
  );
  const settingsUrl = Url.get(Url.pages.projectV2.settings, {
    id: project.id,
  });

  const addSessionBtn =
    !launchersError &&
    !isLoadingLaunchers &&
    launchers &&
    launchers?.length <= 0 ? (
      <AddSessionLauncherButton styleBtn="iconTextBtn" />
    ) : null;

  return (
    <header className={cx(styles.ProjectHeaderContainer)}>
      <div className={cx(styles.HeaderImgContainer, styles.headerImgContainer)}>
        <ProjectImageView />
      </div>
      <div className={cx(styles.HeaderTitleContainer)}>
        <h1 className="fw-bold">{project.name}</h1>
      </div>
      <div className={cx(styles.HeaderBtnContainer)}>
        <div className={styles.HeaderActions}>
          {addSessionBtn}
          <div className={cx("d-none", "d-sm-none", "d-md-block")}>
            <ProjectActions project={project} settingsUrl={settingsUrl} />
          </div>
        </div>
      </div>
      <div className={cx(styles.HeaderDescContainer)}>
        {project.description?.length ? (
          <p>
            {project.description}
            <span className="mx-2">
              <EditButtonLink
                to={settingsUrl}
                title="Modify project information"
              />
            </span>
          </p>
        ) : (
          <UnderlineArrowLink
            title="Add project description"
            text="Add description"
            to={settingsUrl}
          />
        )}
      </div>
    </header>
  );
}

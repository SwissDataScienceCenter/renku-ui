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
import { useCallback, useMemo, useState } from "react";
import {
  GearFill,
  PencilSquare,
  ThreeDotsVertical,
  Trash,
} from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroup,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { NotebookAnnotations } from "../../notebooks/components/session.types";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AccessGuard from "../ProjectPageV2/utils/AccessGuard";
import useProjectAccess from "../ProjectPageV2/utils/useProjectAccess.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";
import { filterSessionsWithCleanedAnnotations } from "../session/sessions.utils";
import AddSessionLauncherButton from "./AddSessionLauncherButton";
import DeleteSessionV2Modal from "./DeleteSessionLauncherModal";
import { SessionItemDisplay } from "./SessionList/SessionItemDisplay";
import { SessionView } from "./SessionView/SessionView";
import UpdateSessionLauncherModal from "./UpdateSessionLauncherModal";
import { useGetProjectSessionLaunchersQuery } from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

import dotsDropdownStyles from "../../components/buttons/ThreeDots.module.scss";
import SessionItem from "./SessionList/SessionItem";

export function getShowSessionUrlByProject(
  project: Project,
  sessionName: string
) {
  return generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
    namespace: project.namespace,
    slug: project.slug,
    session: sessionName,
  });
}

interface SessionsV2Props {
  project: Project;
}
export default function SessionsV2({ project }: SessionsV2Props) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  const projectId = project.id;

  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectSessionLaunchersQuery({ projectId });

  const {
    data: sessions,
    error: sessionsError,
    isLoading: isLoadingSessions,
  } = useGetSessionsQuery();

  const isLoading = isLoadingLaunchers || isLoadingSessions;
  const error = launchersError || sessionsError;

  const orphanSessions = useMemo(
    () =>
      launchers != null && sessions != null
        ? filterSessionsWithCleanedAnnotations<NotebookAnnotations>(
            sessions,
            ({ annotations }) =>
              annotations["renkuVersion"] === "2.0" &&
              annotations["projectId"] === projectId &&
              launchers.every(({ id }) => annotations["launcherId"] !== id)
          )
        : {},
    [launchers, projectId, sessions]
  );

  const loading = isLoading && (
    <div className="text-center">
      <Loader className={cx("me-3", "mt-3")} inline size={16} />
      <span className="fst-italic">Loading sessions</span>
    </div>
  );

  const errorAlert = error && <RtkErrorAlert error={error} />;

  const totalSessions =
    (launchers ? launchers?.length : 0) +
    Object.entries(orphanSessions)?.length;
  return (
    <div className="card">
      <div
        className={cx(
          "align-items-center",
          "card-header",
          "d-flex",
          "justify-content-between"
        )}
        data-cy="sessions-box"
      >
        <div className={cx("align-items-center", "d-flex")}>
          <h4 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
            <GearFill className={cx("me-2", "small", "text-icon")} />
            Sessions
          </h4>
          <Badge>{totalSessions}</Badge>
        </div>
        <AccessGuard
          disabled={null}
          enabled={
            <div className="my-auto">
              <AddSessionLauncherButton
                data-cy="add-session-launcher"
                styleBtn="iconBtn"
              />
            </div>
          }
          minimumRole="editor"
          role={userRole}
        />
      </div>
      <div className="card-body">
        {loading}
        {errorAlert}
        <p className="m-0">
          {totalSessions > 0
            ? "Session launchers are available to everyone who can see the project. Running sessions are only accessible to you."
            : "Define interactive environments in which to do your work and share it  with others."}
        </p>
      </div>

      {totalSessions > 0 && (
        <ListGroup flush>
          {launchers?.map((launcher) => (
            <SessionItemDisplay
              key={`launcher-${launcher.id}`}
              launcher={launcher}
              project={project}
            />
          ))}
          {Object.entries(orphanSessions).map(([key, session]) => (
            <OrphanSession
              key={`orphan-${key}`}
              session={session}
              project={project}
            />
          ))}
        </ListGroup>
      )}
    </div>
  );
}

interface SessionV2ActionsProps {
  launcher: SessionLauncher;
  sessionsLength: number;
}
export function SessionV2Actions({
  launcher,
  sessionsLength,
}: SessionV2ActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
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
          <div data-cy="session-view-menu">
            <ThreeDotsVertical size={24} />
            <span className="visually-hidden">Actions</span>
          </div>
        </DropdownToggle>
        <DropdownMenu className="btn-with-menu-options" end>
          <DropdownItem onClick={toggleUpdate} data-cy="session-view-menu-edit">
            <PencilSquare /> Edit Launcher
          </DropdownItem>
          <DropdownItem
            onClick={toggleDelete}
            data-cy="session-view-menu-delete"
          >
            <Trash /> Delete Launcher
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <UpdateSessionLauncherModal
        isOpen={isUpdateOpen}
        launcher={launcher}
        toggle={toggleUpdate}
      />
      <DeleteSessionV2Modal
        isOpen={isDeleteOpen}
        launcher={launcher}
        toggle={toggleDelete}
        sessionsLength={sessionsLength}
      />
    </>
  );
}

interface OrphanSessionProps {
  session: Session;
  project: Project;
}

function OrphanSession({ session, project }: OrphanSessionProps) {
  const [toggleSessionView, setToggleSessionView] = useState(false);
  const sessions = {
    [session.name]: session,
  };
  const openSessionDetails = () => {
    setToggleSessionView((open) => !open);
  };

  return (
    <>
      <SessionItem
        project={project}
        session={session}
        toggleSessionDetails={openSessionDetails}
      />
      <SessionView
        sessions={sessions}
        project={project}
        setToggleSessionView={openSessionDetails}
        toggleSessionView={toggleSessionView}
      />
    </>
  );
}

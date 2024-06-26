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
  LayoutSidebarInsetReverse,
  PencilSquare,
  ThreeDotsVertical,
  Trash,
} from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { NotebookAnnotations } from "../../notebooks/components/session.types";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import rkIconSessions from "../../styles/icons/sessions.svg";
import AccessGuard from "../ProjectPageV2/utils/AccessGuard";
import useProjectAccess from "../ProjectPageV2/utils/useProjectAccess.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";
import { filterSessionsWithCleanedAnnotations } from "../session/sessions.utils";
import AddSessionLauncherButton from "./AddSessionLauncherButton";
import DeleteSessionV2Modal from "./DeleteSessionLauncherModal";
import {
  SessionBtnBox,
  SessionItemDisplay,
  SessionNameBox,
  SessionStatusBadgeBox,
  SessionStatusLabelBox,
} from "./SessionList/SessionItemDisplay";
import { SessionView } from "./SessionView/SessionView";
import UpdateSessionLauncherModal from "./UpdateSessionLauncherModal";
import ActiveSessionButton from "./components/SessionButton/ActiveSessionButton";
import {
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "./components/SessionStatus/SessionStatus";
import {
  useGetProjectSessionLaunchersQuery,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

import dotsDropdownStyles from "../../components/buttons/ThreeDots.module.scss";
import sessionItemStyles from "./SessionList/SessionItemDisplay.module.scss";

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
  const { error } = useGetSessionEnvironmentsQuery();
  return (
    <div>
      <h3 className="fs-5">Sessions</h3>
      <div>
        <AddSessionLauncherButton styleBtn="iconTextBtn" />
      </div>

      {error && <RtkErrorAlert error={error} />}

      <div className="mt-2">
        <SessionLaunchersListDisplay project={project} />
      </div>
    </div>
  );
}

export function SessionLaunchersListDisplay({ project }: SessionsV2Props) {
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
    <>
      <div
        className={cx("p-3", "d-flex", "justify-content-between")}
        data-cy="sessions-box"
      >
        <div className="fw-bold">
          <img
            src={rkIconSessions}
            className={cx("rk-icon", "rk-icon-lg", "me-2")}
          />
          Sessions ({totalSessions})
        </div>
        <AccessGuard
          disabled={null}
          enabled={
            <AddSessionLauncherButton
              data-cy="add-session-launcher"
              styleBtn="iconBtn"
            />
          }
          minimumRole="editor"
          role={userRole}
        />
      </div>
      {loading}
      {errorAlert}
      <p className={cx("px-3", totalSessions > 0 && "d-none")}>
        Define interactive environments in which to do your work and share it
        with others.
      </p>
      <p className={cx("px-3", totalSessions === 0 && "d-none")}>
        Session launchers are available to everyone who can see the project.
        Running sessions are only accessible to you.
      </p>
      <div className={cx("py-0", "px-0", totalSessions === 0 ? "d-none" : "")}>
        <Row
          className={cx("d-none", "d-xl-flex", "pt-3", "px-0", "m-0", "mb-1")}
        >
          <Col
            xl={3}
            sm={6}
            xs={12}
            className={cx("d-flex", "align-items-center", "px-3")}
          >
            <span
              className={cx(
                "w-100",
                "fst-italic",
                "fs-small",
                "text-light-emphasis",
                "border-0",
                "border-bottom",
                "border-dark-subtle",
                "rk-border-dotted"
              )}
            >
              Session launcher
            </span>
          </Col>
          <Col
            xl={3}
            xs={12}
            className={cx("d-flex", "align-items-center", "px-2")}
          >
            <span
              className={cx(
                "w-100",
                "fst-italic",
                "fs-small",
                "text-light-emphasis",
                "border-0",
                "border-bottom",
                "border-dark-subtle",
                "rk-border-dotted"
              )}
            >
              Session state
            </span>
          </Col>
          <Col
            xl={6}
            xs={12}
            className={cx("d-flex", "align-items-center", "px-2")}
          >
            <span
              className={cx(
                "w-100",
                "fst-italic",
                "fs-small",
                "text-light-emphasis",
                "border-0",
                "border-bottom",
                "border-dark-subtle",
                "rk-border-dotted"
              )}
            >
              Session details
            </span>
          </Col>
        </Row>
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
      </div>
    </>
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
      <Row
        className={cx(
          "px-0",
          "py-4",
          "py-xl-3",
          "m-0",
          sessionItemStyles.ItemDisplaySessionRow
        )}
      >
        <SessionNameBox handler={openSessionDetails}>
          <LayoutSidebarInsetReverse
            className={cx("flex-shrink-0", "me-0")}
            size="20"
          />
          <span
            className={cx(
              "text-truncate",
              "fst-italic",
              sessionItemStyles.ItemDisplaySessionName
            )}
          >
            Orphan session
          </span>
        </SessionNameBox>
        <SessionStatusBadgeBox>
          <SessionStatusV2Label session={session} />
        </SessionStatusBadgeBox>
        <SessionStatusLabelBox>
          <SessionStatusV2Description session={session} />
        </SessionStatusLabelBox>
        <SessionBtnBox>
          <ActiveSessionButton
            session={session}
            showSessionUrl={getShowSessionUrlByProject(project, session.name)}
          />
        </SessionBtnBox>
      </Row>
      <SessionView
        sessions={sessions}
        project={project}
        setToggleSessionView={openSessionDetails}
        toggleSessionView={toggleSessionView}
      />
    </>
  );
}

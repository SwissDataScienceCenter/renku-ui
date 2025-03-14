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
import { Pencil, PlayCircle, Trash } from "react-bootstrap-icons";
import { generatePath } from "react-router-dom-v5-compat";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DropdownItem,
  ListGroup,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { ButtonWithMenuV2 } from "../../components/buttons/Button";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useLocationHash from "../../utils/customHooks/useLocationHash.hook";
import useProjectPermissions from "../ProjectPageV2/utils/useProjectPermissions.hook";
import PermissionsGuard from "../permissionsV2/PermissionsGuard";
import type { Project } from "../projectsV2/api/projectV2.api";
import AddSessionLauncherButton from "./AddSessionLauncherButton";
import DeleteSessionV2Modal from "./DeleteSessionLauncherModal";
import SessionItem from "./SessionList/SessionItem";
import { SessionItemDisplay } from "./SessionList/SessionItemDisplay";
import { SessionView } from "./SessionView/SessionView";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { useGetProjectsByProjectIdSessionLaunchersQuery as useGetProjectSessionLaunchersQuery } from "./api/sessionLaunchersV2.api";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "./api/sessionsV2.api";
import UpdateSessionLauncherModal from "./components/SessionModals/UpdateSessionLauncherModal";
import { SessionV2 } from "./sessionsV2.types";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

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
  const projectId = project.id;

  const permissions = useProjectPermissions({ projectId });

  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectSessionLaunchersQuery({ projectId });

  const {
    data: sessions,
    error: sessionsError,
    isLoading: isLoadingSessions,
  } = useGetSessionsQueryV2();

  const isLoading = isLoadingLaunchers || isLoadingSessions;
  const error = launchersError || sessionsError;

  const orphanSessions = useMemo(
    () =>
      launchers != null && sessions != null
        ? sessions.filter(
            (session) =>
              launchers.every(({ id }) => session.launcher_id !== id) &&
              session.project_id === projectId
          )
        : [],
    [launchers, sessions, projectId]
  );

  const loading = isLoading && (
    <div className="text-center">
      <Loader className={cx("me-3", "mt-3")} inline size={16} />
      <span className="fst-italic">Loading sessions</span>
    </div>
  );

  const errorAlert = error && <RtkErrorAlert error={error} />;

  const totalSessions =
    (launchers ? launchers?.length : 0) + orphanSessions.length;
  return (
    <Card data-cy="sessions-box">
      <CardHeader
        className={cx(
          "align-items-center",
          "d-flex",
          "justify-content-between"
        )}
      >
        <div className={cx("align-items-center", "d-flex")}>
          <h4 className={cx("mb-0", "me-2")}>
            <PlayCircle className={cx("me-1", "bi")} />
            Sessions
          </h4>
          <Badge>{totalSessions}</Badge>
        </div>
        <PermissionsGuard
          disabled={null}
          enabled={
            <div className="my-auto">
              <AddSessionLauncherButton
                data-cy="add-session-launcher"
                styleBtn="iconBtn"
              />
            </div>
          }
          requestedPermission="write"
          userPermissions={permissions}
        />
      </CardHeader>
      <CardBody>
        {errorAlert}
        <p className="text-body-secondary">
          {totalSessions > 0
            ? "Session launchers are available to everyone who can see the project. Running sessions are only accessible to you."
            : "Define interactive environments in which to do your work and share it  with others."}
        </p>
        {loading}
        {totalSessions > 0 && !isLoading && (
          <ListGroup flush>
            {launchers?.map((launcher) => (
              <SessionItemDisplay
                key={`launcher-${launcher.id}`}
                launcher={launcher}
                project={project}
              />
            ))}
            {orphanSessions?.map((session) => (
              <OrphanSession
                key={`orphan-${session.name}`}
                session={session}
                project={project}
              />
            ))}
          </ListGroup>
        )}
      </CardBody>
    </Card>
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
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);

  const defaultAction = (
    <Button
      className="text-nowrap"
      color="outline-primary"
      data-cy="session-view-menu-edit"
      onClick={toggleUpdate}
      size="sm"
    >
      <Pencil className={cx("bi", "me-1")} />
      Edit
    </Button>
  );
  return (
    <>
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
                data-cy="session-view-menu-delete"
                onClick={toggleDelete}
              >
                <Trash className={cx("bi", "me-1")} />
                Delete
              </DropdownItem>
            </ButtonWithMenuV2>
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
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}

interface OrphanSessionProps {
  session: SessionV2;
  project: Project;
}

function OrphanSession({ session, project }: OrphanSessionProps) {
  const [hash, setHash] = useLocationHash();
  const sessionHash = useMemo(
    () => `orphan-session-${session.name}`,
    [session.name]
  );
  const isSessionViewOpen = useMemo(
    () => hash === sessionHash,
    [hash, sessionHash]
  );
  const toggleSessionView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === sessionHash;
      return isOpen ? "" : sessionHash;
    });
  }, [sessionHash, setHash]);

  return (
    <>
      <SessionItem
        project={project}
        session={session}
        toggleSessionDetails={toggleSessionView}
      />
      <SessionView
        id={sessionHash}
        sessions={[session]}
        project={project}
        toggle={toggleSessionView}
        isOpen={isSessionViewOpen}
      />
    </>
  );
}

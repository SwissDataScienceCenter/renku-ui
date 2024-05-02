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
import { useCallback, useMemo, useState } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { generatePath, useParams } from "react-router-dom-v5-compat";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { EnvironmentLogs } from "../../components/Logs";
import { TimeCaption } from "../../components/TimeCaption";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { NotebooksHelper } from "../../notebooks";
import {
  SessionListRowStatus,
  SessionListRowStatusIcon,
} from "../../notebooks/components/SessionListStatus";
import { NotebookAnnotations } from "../../notebooks/components/session.types";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetProjectsByNamespaceAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import type { Project } from "../projectsV2/api/projectV2.api";
import sessionsApi, { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";
import { filterSessionsWithCleanedAnnotations } from "../session/sessions.utils";
import ActiveSessionButton from "./ActiveSessionButton";
import AddSessionLauncherButton from "./AddSessionLauncherButton";
import DeleteSessionV2Modal from "./DeleteSessionLauncherModal";
import SessionConfig from "./SessionConfig";
import StartSessionButton from "./StartSessionButton";
import UpdateSessionLauncherModal from "./UpdateSessionLauncherModal";
import sessionsV2Api, {
  useGetProjectSessionLaunchersQuery,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

interface SessionsV2Props {
  project: Project;
}

export default function SessionsV2({ project }: SessionsV2Props) {
  const { error } = useGetSessionEnvironmentsQuery();

  return (
    <div>
      <SessionConfig project={project} />

      <h3 className="fs-5">Sessions</h3>
      <div>
        <AddSessionLauncherButton styleBtn="iconTextBtn" />
      </div>

      {error && <RtkErrorAlert error={error} />}

      <div className="mt-2">
        <SessionLaunchersListDisplay />
      </div>
    </div>
  );
}

function SessionLaunchersListDisplay() {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: project } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );

  const projectId = project?.id;
  const {
    data: launchers,
    error: launchersError,
    isLoading: isLoadingLaunchers,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);

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

  if (isLoading) {
    return (
      <p>
        <Loader className="bi" inline size={16} />
        Loading sessions...
      </p>
    );
  }

  if (error) {
    return <RtkErrorAlert error={error} />;
  }

  if (
    !launchers ||
    (launchers.length == 0 && Object.keys(orphanSessions).length == 0)
  ) {
    return null;
  }

  return (
    <Container className="px-0" fluid>
      <Row className="gy-4">
        {launchers.map((launcher) => (
          <SessionLauncherDisplay
            key={launcher.id}
            launcher={launcher}
            namespace={namespace ?? ""}
            projectId={projectId ?? ""}
            slug={slug ?? ""}
          />
        ))}
        {Object.entries(orphanSessions).map(([key, session]) => (
          <OrphanSession key={`orphan-${key}`} session={session} />
        ))}
      </Row>
    </Container>
  );
}

interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
  namespace: string;
  projectId: string;
  slug: string;
}

function SessionLauncherDisplay({
  launcher,
  namespace,
  projectId,
  slug,
}: SessionLauncherDisplayProps) {
  const { creation_date, environment_kind, name, default_url, description } =
    launcher;

  const { data: environments, isLoading } =
    sessionsV2Api.endpoints.getSessionEnvironments.useQueryState(
      environment_kind === "global_environment" ? undefined : skipToken
    );
  const environment = useMemo(
    () =>
      launcher.environment_kind === "global_environment" &&
      environments?.find((env) => env.id === launcher.environment_id),
    [environments, launcher]
  );

  const { data: sessions } = sessionsApi.endpoints.getSessions.useQueryState();
  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? filterSessionsWithCleanedAnnotations<NotebookAnnotations>(
            sessions,
            ({ annotations }) =>
              annotations["renkuVersion"] === "2.0" &&
              annotations["projectId"] === projectId &&
              annotations["launcherId"] === launcher.id
          )
        : {},
    [launcher.id, projectId, sessions]
  );
  const filteredSessionsLength = useMemo(
    () => Object.keys(filteredSessions).length,
    [filteredSessions]
  );

  const container_image =
    environment_kind === "global_environment" && environment
      ? environment.container_image
      : environment_kind === "global_environment"
      ? "unknown"
      : launcher.container_image;

  return (
    <Col className={cx("col-12", "col-sm-6")}>
      <Card className="h-100">
        <CardBody className={cx("d-flex", "flex-column")}>
          <CardTitle
            className={cx(
              "d-flex",
              "flex-row",
              "justify-content-between",
              "align-items-center"
            )}
          >
            <h5 className={cx("mb-0", "fs-5")}>
              {isLoading && (
                <Loader className={cx("bi", "me-2")} inline size={20} />
              )}
              {name}
            </h5>
            <SessionV2Actions launcher={launcher} />
          </CardTitle>
          <CardText className="mb-0">
            {description ? description : <i>No description</i>}
          </CardText>
          {environment && (
            <CardText className="mb-0">
              Uses the <b>{environment.name}</b> session environment.
            </CardText>
          )}
          <CardText className="mb-0" tag="div">
            <p className="mb-0">Container image:</p>
            <CommandCopy command={container_image} noMargin />
          </CardText>
          <CardText className="mb-2">
            Default URL:{" "}
            <code>
              {default_url
                ? default_url
                : environment && environment.default_url
                ? environment.default_url
                : "/lab"}
            </code>
          </CardText>
          <CardText>
            <TimeCaption
              datetime={creation_date}
              enableTooltip
              prefix="Created"
            />
          </CardText>
          {filteredSessionsLength > 0 ? (
            <div className="mt-auto">
              <p className="mb-0">
                Active {filteredSessionsLength > 1 ? "sessions" : "session"}
              </p>
              {Object.entries(filteredSessions).map(([key, session]) => (
                <ActiveSessionV2 key={key} session={session} />
              ))}
            </div>
          ) : (
            <div className="mt-auto">
              <StartSessionButton
                launcherId={launcher.id}
                namespace={namespace}
                slug={slug}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
}

interface ActiveSessionV2Props {
  session: Session;
}

function ActiveSessionV2({ session }: ActiveSessionV2Props) {
  const { annotations, image, started, status } = session;

  const cleanAnnotations = useMemo(
    () => NotebooksHelper.cleanAnnotations(annotations) as NotebookAnnotations,
    [annotations]
  );

  const details = { message: session.status.message };

  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );

  const showSessionUrl = generatePath("sessions/show/:session", {
    session: session.name,
  });

  return (
    <div>
      <div
        className={cx(
          "d-flex",
          "flex-row",
          "gap-2",
          "align-items-center",
          "mb-1"
        )}
      >
        <SessionListRowStatusIcon
          annotations={cleanAnnotations}
          details={details}
          image={image}
          status={status.state}
          uid={session.name}
        />
        <SessionListRowStatus
          annotations={cleanAnnotations}
          details={details}
          startTimestamp={started}
          status={status.state}
          uid={session.name}
        />
      </div>

      <ActiveSessionButton session={session} showSessionUrl={showSessionUrl} />
      <EnvironmentLogs
        name={displayModal.targetServer}
        annotations={cleanAnnotations}
      />
    </div>
  );
}

interface SessionV2ActionsProps {
  launcher: SessionLauncher;
}

function SessionV2Actions({ launcher }: SessionV2ActionsProps) {
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
          className={cx("p-2", "rounded-circle")}
          color="outline-rk-green"
        >
          <div className="lh-1">
            <ThreeDotsVertical className="bi" />
            <span className="visually-hidden">Actions</span>
          </div>
        </DropdownToggle>
        <DropdownMenu className="btn-with-menu-options" end>
          <DropdownItem onClick={toggleUpdate}>Edit</DropdownItem>
          <DropdownItem onClick={toggleDelete}>Delete</DropdownItem>
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
      />
    </>
  );
}

interface OrphanSessionProps {
  session: Session;
}

function OrphanSession({ session }: OrphanSessionProps) {
  const { image } = session;

  return (
    <Col className={cx("col-12", "col-sm-6")}>
      <Card className="h-100">
        <CardBody className={cx("d-flex", "flex-column")}>
          <CardTitle
            className={cx(
              "d-flex",
              "flex-row",
              "justify-content-between",
              "align-items-center"
            )}
          >
            <h5 className={cx("mb-0", "fs-5", "fst-italic")}>Orphan session</h5>
          </CardTitle>
          <CardText className="mb-0" tag="div">
            <p className="mb-0">Container image:</p>
            <CommandCopy command={image} noMargin />
          </CardText>
          <div className="mt-auto">
            <ActiveSessionV2 session={session} />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
}

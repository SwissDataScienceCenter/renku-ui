import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Col, ListGroup, Row } from "reactstrap";

import { Loader } from "../../components/Loader";
import { EnvironmentLogs } from "../../components/Logs";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { NotebooksHelper } from "../../notebooks";
import { NotebookAnnotations } from "../../notebooks/components/session.types";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetProjectsByProjectIdQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";
import { filterSessionsWithCleanedAnnotations } from "../session/sessions.utils";
import ActiveSessionButton from "../sessionsV2/components/SessionButton/ActiveSessionButton";
import {
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../sessionsV2/components/SessionStatus/SessionStatus";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

export default function DashboardV2Sessions() {
  const { data: sessions, error, isLoading } = useGetSessionsQuery();

  const v2Sessions = useMemo(
    () =>
      sessions != null
        ? filterSessionsWithCleanedAnnotations<NotebookAnnotations>(
            sessions,
            ({ annotations }) => annotations["renkuVersion"] === "2.0"
          )
        : {},
    [sessions]
  );

  const noSessions = isLoading ? (
    <div className={cx("d-flex", "flex-column", "mx-auto")}>
      <Loader />
      <p className={cx("mx-auto", "my-3")}>Retrieving sessions...</p>
    </div>
  ) : error ? (
    <div>
      <p>Cannot show sessions.</p>
      <RtkErrorAlert error={error} />
    </div>
  ) : !sessions ||
    (Object.keys(sessions).length == 0 &&
      Object.keys(v2Sessions).length == 0) ? (
    <div>No running sessions.</div>
  ) : null;

  if (noSessions) return <div>{noSessions}</div>;

  return (
    <ListGroup flush data-cy="dashboard-session-list">
      {Object.entries(v2Sessions).map(([key, session]) => (
        <DashboardSession key={key} session={session} />
      ))}
    </ListGroup>
  );
}

interface DashboardSessionProps {
  session: Session;
}
function DashboardSession({ session }: DashboardSessionProps) {
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const { image } = session;
  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as NotebookAnnotations;
  const projectId = annotations.projectId;
  const { data: project } = useGetProjectsByProjectIdQuery(
    projectId ? { projectId: projectId } : skipToken
  );

  const projectUrl = project
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      })
    : projectId
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.showById, {
        id: projectId,
      })
    : ABSOLUTE_ROUTES.v2.root;
  const showSessionUrl = project
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
        namespace: project.namespace,
        slug: project.slug,
        session: session.name,
      })
    : ABSOLUTE_ROUTES.v2.root;

  return (
    <Link
      className={cx(
        "d-flex",
        "flex-column",
        "gap-3",
        "link-primary",
        "list-group-item-action",
        "list-group-item",
        "text-body",
        "text-decoration-none"
      )}
      data-cy="list-session"
      to={projectUrl}
    >
      <Row className="g-2">
        <Col className="order-1" xs={12} md={9} lg={10}>
          <div data-cy="list-session-link">
            <h6 className="fw-bold">
              {project
                ? project.namespace + "/" + project.slug
                : projectId ?? "Unknown"}
            </h6>
            <p className="mb-0">
              <b>Container image:</b> {image}
            </p>
          </div>
        </Col>
        <Col className={cx("order-3", "order-md-2")} xs={12} md={3} lg={2}>
          <div className={cx("text-start", "text-md-end")}>
            <ActiveSessionButton
              className="my-auto"
              session={session}
              showSessionUrl={showSessionUrl}
            />
          </div>
        </Col>
        <Col className={cx("order-2", "order-md-3")} xs={12}>
          <Row className={cx("justify-content-between", "gap-2")}>
            <Col xs={12} md="auto">
              <SessionStatusV2Label session={session} />
            </Col>
            <Col xs={12} md="auto">
              <SessionStatusV2Description session={session} />
            </Col>
          </Row>
        </Col>
      </Row>
      <EnvironmentLogs
        name={displayModal.targetServer}
        annotations={annotations}
      />
    </Link>
  );
}

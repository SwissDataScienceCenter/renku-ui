import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Loader } from "../../components/Loader";
import { EnvironmentLogs } from "../../components/Logs";
import { TimeCaption } from "../../components/TimeCaption";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";

import { NotebooksHelper } from "../../notebooks";
import {
  SessionListRowStatus,
  SessionListRowStatusIcon,
} from "../../notebooks/components/SessionListStatus";
import { NotebookAnnotations } from "../../notebooks/components/session.types";

import { useGetProjectsByProjectIdQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { useGetSessionsQuery } from "../session/sessions.api";
import { Session } from "../session/sessions.types";
import { filterSessionsWithCleanedAnnotations } from "../session/sessions.utils";

import ActiveSessionButton from "../sessionsV2/components/SessionButton/ActiveSessionButton";

import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { Url } from "../../utils/helpers/url";

// Required for logs formatting
import "../../notebooks/Notebooks.css";
import styles from "./Dashboard.module.scss";

interface DashboardSessionProps {
  session: Session;
}

function DashboardSession({ session }: DashboardSessionProps) {
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const { image, started, status } = session;
  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as NotebookAnnotations;
  const projectId = annotations.projectId;
  const { data: project } = useGetProjectsByProjectIdQuery(
    projectId ? { projectId: projectId } : skipToken
  );

  const projectUrl = project
    ? Url.get(Url.pages.projectV2.show, {
        namespace: project.namespace,
        slug: project.slug,
      })
    : Url.get(Url.pages.projectV2.showId, {
        id: projectId,
      });
  const showSessionUrl = project
    ? Url.get(Url.pages.projectV2.showSession, {
        namespace: project.namespace,
        slug: project.slug,
        sessionId: session.name,
      })
    : Url.get(Url.pages.projectV2.showSessionId, {
        id: projectId,
        sessionId: session.name,
      });

  const details = { message: session.status.message };

  return (
    <div data-cy="list-session" className={cx(styles.containerSessions, "p-3")}>
      <div
        className={cx(styles.entityTitle, "text-truncate", "cursor-pointer")}
      >
        <Link
          data-cy="list-session-link"
          className="text-decoration-none"
          to={projectUrl}
        >
          <div className={cx("text-truncate")}>
            <span className={cx("card-title", "text-truncate")}>
              {project
                ? project.namespace + "/" + project.slug
                : projectId ?? "Unknown"}
            </span>
          </div>
        </Link>
      </div>
      <div className={cx(styles.entityAction, "mb-3")}>
        <ActiveSessionButton
          session={session}
          showSessionUrl={showSessionUrl}
        />
        <EnvironmentLogs
          name={displayModal.targetServer}
          annotations={annotations}
        />
      </div>
      <div
        className={cx(
          styles.entityDescription,
          "d-none",
          "d-md-block",
          "cursor-pointer"
        )}
      >
        <Link className="text-decoration-none" to={projectUrl}>
          <div className={cx("card-text", "text-rk-dark", "m-0")}>
            <div className="mb-0">
              <b>Container image</b> {image}
            </div>
          </div>
        </Link>
      </div>
      <div
        className={cx(
          styles.sessionIcon,
          "d-none",
          "d-md-flex",
          "align-items-center"
        )}
      >
        <div className="me-2">
          <SessionListRowStatusIcon
            annotations={annotations}
            details={details}
            image={image}
            status={status.state}
            uid={session.name}
          />
        </div>
        <div>
          <SessionListRowStatus
            annotations={annotations}
            details={details}
            startTimestamp={started}
            status={status.state}
            uid={session.name}
          />
        </div>
      </div>
      <div className={cx(styles.sessionTime)}>
        <TimeCaption datetime={session.started} prefix="Started" />
      </div>
    </div>
  );
}

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
  if (isLoading) {
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader className="me-2" />
          <div>Retrieving sessions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <RtkErrorAlert error={error} />;
  }

  if (
    !sessions ||
    (Object.keys(sessions).length == 0 && Object.keys(v2Sessions).length == 0)
  ) {
    return <div>No running sessions.</div>;
  }

  return (
    <div
      data-cy="dashboard-session-list"
      className={cx("d-flex", "flex-column")}
    >
      {Object.entries(v2Sessions).map(([key, session]) => (
        <DashboardSession key={key} session={session} />
      ))}
    </div>
  );
}

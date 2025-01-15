/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ReactNode } from "react";
import Media from "react-media";
import { Link } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";
import { ExternalLink } from "../../../components/ExternalLinks";
import { EnvironmentLogs } from "../../../components/Logs";
import { NotebooksHelper } from "../../../notebooks";
import {
  SessionListRowStatus,
  SessionListRowStatusIcon,
} from "../../../notebooks/components/SessionListStatus";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import Sizes from "../../../utils/constants/Media";
import { simpleHash } from "../../../utils/helpers/HelperFunctions";
import { Url } from "../../../utils/helpers/url";
import { Session, SessionStatusState, Sessions } from "../sessions.types";
import SessionButton from "./SessionButton";
import SessionRowCommitInfo from "./SessionRowCommitInfo";

interface SessionsListProps {
  disableProjectTitle?: boolean;
  noSessionComponent?: ReactNode;
  sessions: Sessions;
}

export default function SessionsList({
  disableProjectTitle,
  noSessionComponent,
  sessions,
}: SessionsListProps) {
  const sessionNames = Object.keys(sessions);

  if (sessionNames.length == 0) {
    return noSessionComponent ?? <p>No currently running sessions.</p>;
  }

  return (
    <Row className="mb-4 gy-4">
      {Object.entries(sessions).map(([sessionName, session]) => (
        <SessionListItem
          key={sessionName}
          disableProjectTitle={disableProjectTitle}
          session={session}
        />
      ))}
    </Row>
  );
}

interface SessionListItemProps {
  disableProjectTitle?: boolean;
  session: Session;
}

function SessionListItem({
  disableProjectTitle,
  session,
}: SessionListItemProps) {
  const renkuAnnotations = Object.entries(session.annotations)
    .filter(([key]) => key.startsWith("renku.io"))
    .reduce(
      (annotations, [key, value]) => ({ ...annotations, [key]: value }),
      {} as Session["annotations"]
    );
  const cleanAnnotations = NotebooksHelper.cleanAnnotations(
    renkuAnnotations
  ) as NotebookAnnotations;
  const status = session.status.state;
  const details = {
    message: session.status.message,
  };
  const hashed = [
    cleanAnnotations["namespace"],
    cleanAnnotations["projectName"],
    cleanAnnotations["branch"],
    cleanAnnotations["commit-sha"],
  ];
  const uid = `uid_${simpleHash(hashed.join(" "))}`;
  const resourceRequests = session.resources.requests;
  const repositoryLinks = {
    branch: `${cleanAnnotations["repository"]}/tree/${cleanAnnotations["branch"]}`,
    commit: `${cleanAnnotations["repository"]}/tree/${cleanAnnotations["commit-sha"]}`,
  };
  const image = session.image;

  const rowProps: SessionRowProps = {
    annotations: cleanAnnotations,
    details,
    disableProjectTitle,
    image,
    name: session.name,
    repositoryLinks,
    resourceRequests,
    startTimestamp: session.started,
    status,
    uid,
  };

  return (
    <Media query={Sizes.md}>
      {(matches) =>
        matches ? (
          <SessionRowFull {...rowProps} />
        ) : (
          <SessionRowCompact {...rowProps} />
        )
      }
    </Media>
  );
}

interface SessionRowProps {
  annotations: NotebookAnnotations;
  details: { message: string | undefined };
  disableProjectTitle?: boolean;
  image: string;
  name: string;
  repositoryLinks: { branch: string; commit: string };
  resourceRequests: Session["resources"]["requests"];
  startTimestamp: string;
  status: Session["status"]["state"];
  uid: string;
}

function SessionRowFull({
  annotations,
  details,
  disableProjectTitle,
  image,
  name,
  repositoryLinks,
  resourceRequests,
  startTimestamp,
  status,
  uid,
}: SessionRowProps) {
  const icon = (
    <div className="align-middle">
      <SessionListRowStatusIcon
        annotations={annotations}
        details={details}
        image={image}
        status={status}
        uid={uid}
      />
    </div>
  );

  const branch = (
    <ExternalLink
      role="text"
      showLinkIcon={true}
      title={annotations["branch"]}
      url={repositoryLinks.branch}
    />
  );

  const commit = (
    <>
      <ExternalLink
        role="text"
        showLinkIcon={true}
        title={`${annotations["commit-sha"]}`.substring(0, 8)}
        url={repositoryLinks.commit}
      />{" "}
      <SessionRowCommitInfo
        commitSha={annotations["commit-sha"]}
        projectId={`${annotations["gitlabProjectId"]}`}
      />
    </>
  );

  const statusOut = (
    <SessionListRowStatus
      annotations={annotations}
      details={details}
      startTimestamp={startTimestamp}
      status={status}
      uid={uid}
    />
  );

  const actions = (
    <span className="mb-auto">
      <SessionButton
        fullPath={`${annotations["namespace"]}/${annotations["projectName"]}`}
        runningSessionName={name}
      />
      <EnvironmentLogs
        annotations={annotations as Record<string, string>}
        name={name}
      />
    </span>
  );

  return (
    <Col
      className={cx(
        "d-flex",
        "flex-row",
        "justify-content-between",
        "bg-white",
        "border-0",
        "border-radius-8",
        "rk-search-result",
        "rk-search-result-100",
        "cursor-auto"
      )}
      data-cy="session-container"
      xs={12}
    >
      <div className={cx("d-flex", "flex-grow-1")}>
        <span className={cx("me-3", !disableProjectTitle && "mt-2")}>
          {icon}
        </span>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "align-items-start",
            "overflow-hidden"
          )}
        >
          {!disableProjectTitle && (
            <div className={cx("project", "d-inline-block", "text-truncate")}>
              <SessionRowProject annotations={annotations} />
            </div>
          )}
          <table>
            <tbody className={cx("gx-4", "text-rk-text")}>
              <tr>
                <td className={cx("text-dark", "fw-bold")}>Branch</td>
                <td className="text-dark">{branch}</td>
              </tr>
              <tr>
                <td className={cx("text-dark", "fw-bold")}>Commit</td>
                <td className="text-dark">{commit}</td>
              </tr>

              <tr>
                <td className={cx("pe-3", "text-dark", "fw-bold")}>
                  Resources
                </td>
                <td className="text-dark">
                  <SessionRowResourceRequests
                    resourceRequests={resourceRequests}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2}>{statusOut}</td>
              </tr>
              <UnsavedWorkWarning
                annotations={annotations}
                status={status}
                wrapper={({ children }) => (
                  <tr>
                    <td
                      className={cx("time-caption", "text-rk-text-light")}
                      colSpan={2}
                    >
                      {children}
                    </td>
                  </tr>
                )}
              />
            </tbody>
          </table>
        </div>
      </div>
      <div>{actions}</div>
    </Col>
  );
}

interface SessionRowProjectProps {
  annotations: Session["annotations"];
}

function SessionRowProject({ annotations }: SessionRowProjectProps) {
  const fullPath = `${annotations["namespace"]}/${annotations["projectName"]}`;
  const data = {
    namespace: annotations["namespace"],
    path: annotations["projectName"],
  };
  const url = Url.get(Url.pages.project, data);

  return (
    <Link to={url} className="title">
      {fullPath}
    </Link>
  );
}

export interface SessionLauncherResources {
  name?: string;
  cpu: number;
  memory: number;
  gpu: number;
  storage: number;
}
interface SessionRowResourceRequestsProps {
  resourceRequests: Session["resources"]["requests"] | SessionLauncherResources;
}

export function SessionRowResourceRequests({
  resourceRequests,
}: SessionRowResourceRequestsProps) {
  if (!resourceRequests) {
    return null;
  }
  const entries = Object.entries(resourceRequests);
  if (entries.length == 0) {
    return null;
  }

  return (
    <div>
      {entries.map(([key, value], index) => (
        <span key={key}>
          <span className="text-nowrap">
            <span className="fw-bold">
              {value} {(key === "memory" || key === "storage") && "GB "}
            </span>
            {key !== "name" && key}
          </span>
          {entries.length - 1 === index ? " " : " | "}
        </span>
      ))}
    </div>
  );
}

function SessionRowCompact({
  annotations,
  details,
  disableProjectTitle,
  image,
  name,
  repositoryLinks,
  resourceRequests,
  startTimestamp,
  status,
  uid,
}: SessionRowProps) {
  const icon = (
    <span>
      <SessionListRowStatusIcon
        annotations={annotations}
        details={details}
        image={image}
        status={status}
        uid={uid}
      />
    </span>
  );

  const branch = (
    <>
      <span className="fw-bold">Branch: </span>
      <ExternalLink
        role="text"
        showLinkIcon={true}
        title={annotations["branch"]}
        url={repositoryLinks.branch}
      />
      <br />
    </>
  );

  const commit = (
    <>
      <span className="fw-bold">Commit: </span>
      <ExternalLink
        role="text"
        showLinkIcon={true}
        title={`${annotations["commit-sha"]}`.substring(0, 8)}
        url={repositoryLinks.commit}
      />{" "}
      <SessionRowCommitInfo
        commitSha={annotations["commit-sha"] as string | undefined}
        projectId={`${annotations["gitlabProjectId"]}`}
      />
      <br />
    </>
  );

  const statusOut = (
    <span>
      <SessionListRowStatus
        annotations={annotations}
        details={details}
        startTimestamp={startTimestamp}
        status={status}
        uid={uid}
      />
    </span>
  );

  const actions = (
    <span>
      <SessionButton
        fullPath={`${annotations["namespace"]}/${annotations["projectName"]}`}
        runningSessionName={name}
      />
      <EnvironmentLogs
        annotations={annotations as Record<string, string>}
        name={name}
      />
    </span>
  );

  return (
    <Col
      className={cx(
        "rk-search-result-compact",
        "bg-white",
        "cursor-auto",
        "border-radius-8",
        "border-0"
      )}
      data-cy="session-container"
    >
      {!disableProjectTitle && (
        <>
          <span className="fw-bold">Project: </span>
          <span>
            <SessionRowProject annotations={annotations} />
          </span>
          <br />
        </>
      )}
      {branch}
      {commit}

      <span className="fw-bold">Resources: </span>
      <span>
        <SessionRowResourceRequests resourceRequests={resourceRequests} />
      </span>
      <br />
      <div className="d-inline-flex">
        {icon} &nbsp; {statusOut}
      </div>
      <UnsavedWorkWarning
        annotations={annotations}
        status={status}
        wrapper={({ children }) => (
          <div className={cx("mt-1", "time-caption", "text-rk-text-light")}>
            {children}
          </div>
        )}
      />
      <div className="mt-1">{actions}</div>
    </Col>
  );
}

interface UnsavedWorkWarningProps {
  annotations: NotebookAnnotations;
  status: SessionStatusState;
  wrapper?: (props: { children?: ReactNode }) => JSX.Element;
}

function UnsavedWorkWarning({
  annotations,
  status,
  wrapper: Wrapper,
}: UnsavedWorkWarningProps) {
  if (status !== "hibernated") {
    return null;
  }

  const hasHibernationInfo = !!annotations["hibernationDate"];
  const hasUnsavedWork =
    !hasHibernationInfo ||
    annotations["hibernationDirty"] ||
    !annotations["hibernationSynchronized"];

  if (!hasUnsavedWork) {
    return null;
  }

  const explanation = !hasHibernationInfo
    ? "uncommitted files and/or unsynced commits"
    : annotations["hibernationDirty"] && !annotations["hibernationSynchronized"]
    ? "uncommitted files and unsynced commits"
    : annotations["hibernationDirty"]
    ? "uncommitted files"
    : "unsynced commits";

  const content = (
    <>
      <FontAwesomeIcon
        className={cx("text-warning", "me-1")}
        icon={faExclamationTriangle}
      />
      You have unsaved work {"("}
      {explanation}
      {")"} in this session
    </>
  );

  return Wrapper ? <Wrapper>{content}</Wrapper> : content;
}

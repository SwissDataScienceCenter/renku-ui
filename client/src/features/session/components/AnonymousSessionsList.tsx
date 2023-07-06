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

import React, { useContext } from "react";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { ErrorAlert, InfoAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import { EnvironmentLogs } from "../../../components/Logs";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { User } from "../../../model/RenkuModels";
import { NotebooksHelper } from "../../../notebooks";
import {
  SessionListRowStatus,
  SessionListRowStatusIcon,
} from "../../../notebooks/components/SessionListStatus";
import AppContext from "../../../utils/context/appContext";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import { simpleHash } from "../../../utils/helpers/HelperFunctions";
import { Url } from "../../../utils/helpers/url";
import { Session, Sessions } from "../session";
import { useGetSessionsQuery } from "../sessionApi";
import SessionButton from "./SessionButton";
import SessionRowCommitInfo from "./SessionRowCommitInfo";

export default function AnonymousSessionsList() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled = !!(
    params as { ANONYMOUS_SESSIONS?: boolean }
  ).ANONYMOUS_SESSIONS;

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <ContainerWrap>
        <AnonymousSessionsDisabledNotice />
      </ContainerWrap>
    );
  }

  return (
    <ContainerWrap>
      <AnonymousSessionsEnabledList />
    </ContainerWrap>
  );
}

function AnonymousSessionsDisabledNotice() {
  const textIntro =
    "This Renkulab deployment does not allow unauthenticated users to start sessions.";
  const textPost = "to use sessions.";
  return (
    <LoginAlert logged={false} textIntro={textIntro} textPost={textPost} />
  );
}

function AnonymousSessionsEnabledList() {
  const { data: sessions, isLoading } = useGetSessionsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (!sessions) {
    return (
      <ErrorAlert>
        <p className="mb-0">Error while fetching sessions.</p>
      </ErrorAlert>
    );
  }

  console.log({ sessions });

  return (
    <>
      <Row className={cx("pt-2", "pb-3")}>
        <Col className={cx("d-flex", "mb-2", "justify-content-between")}>
          <h2 className="sessions-title">Sessions</h2>
        </Col>
      </Row>
      <SessionsList sessions={sessions} />
      <InfoAlert timeout={0}>
        <span>
          You can start a new session from the <i>Sessions</i> tab of a project.
        </span>
      </InfoAlert>
    </>
  );
}

interface SessionsListProps {
  sessions: Sessions;
}

function SessionsList({ sessions }: SessionsListProps) {
  const sessionNames = Object.keys(sessions);

  if (sessionNames.length == 0) {
    return <p>No currently running sessions.</p>;
  }

  return (
    <div className="mb-4">
      {sessionNames.map((sessionName) => (
        <SessionListItem key={sessionName} session={sessions[sessionName]} />
      ))}
    </div>
  );
}

interface SessionListItemProps {
  session: Session;
}

function SessionListItem({ session }: SessionListItemProps) {
  const renkuAnnotations = Object.entries(session.annotations)
    .filter(([key]) => key.startsWith("renku.io"))
    .reduce(
      (annotations, [key, value]) => ({ ...annotations, [key]: value }),
      {} as Session["annotations"]
    );
  const cleanAnnotations = NotebooksHelper.cleanAnnotations(
    renkuAnnotations
  ) as typeof renkuAnnotations;
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
  const startTime = toHumanDateTime({
    datetime: session.started,
    format: "full",
  });
  const repositoryLinks = {
    branch: `${cleanAnnotations["repository"]}/tree/${cleanAnnotations["branch"]}`,
    commit: `${cleanAnnotations["repository"]}/tree/${cleanAnnotations["commit-sha"]}`,
  };
  const image = session.image;

  return (
    <>
      <SessionRowFull
        annotations={cleanAnnotations}
        details={details}
        image={image}
        name={session.name}
        repositoryLinks={repositoryLinks}
        resourceRequests={resourceRequests}
        startTime={startTime}
        status={status}
        uid={uid}
      />
    </>
  );
}

interface SessionRowProps {
  annotations: Session["annotations"];
  details: { message: string };
  image: string;
  name: string;
  repositoryLinks: { branch: string; commit: string };
  resourceRequests: Session["resources"]["requests"];
  startTime: string;
  status: Session["status"]["state"];
  uid: string;
}

function SessionRowFull({
  annotations,
  details,
  image,
  name,
  repositoryLinks,
  resourceRequests,
  startTime,
  status,
  uid,
}: SessionRowProps) {
  const icon = (
    <div className="align-middle">
      <SessionListRowStatusIcon
        annotations={annotations as any}
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
        commitSha={annotations["commit-sha"] as string | undefined}
        projectId={annotations["gitlabProjectId"] as string | undefined}
      />
    </>
  );

  const statusOut = (
    <SessionListRowStatus
      annotations={annotations as any}
      details={details}
      startTime={startTime}
      status={status}
      uid={uid}
    />
  );

  const actions = (
    <span className="mb-auto">
      <SessionButton
        fullPath={`${annotations["namespace"]}/${annotations["projectName"]}`}
        gitUrl={""}
        withActions
      />
      <EnvironmentLogs annotations={annotations as any} name={name} />
    </span>
  );

  return (
    <div
      data-cy="session-container"
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
    >
      <div className={cx("d-flex", "flex-grow-1")}>
        <span className={cx("me-3", "mt-2")}>{icon}</span>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "align-items-start",
            "overflow-hidden"
          )}
        >
          <div className={cx("project", "d-inline-block", "text-truncate")}>
            <SessionRowProject annotations={annotations} />
          </div>
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
            </tbody>
          </table>
        </div>
      </div>
      <div>{actions}</div>
    </div>
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

interface SessionRowResourceRequestsProps {
  resourceRequests: Session["resources"]["requests"];
}

function SessionRowResourceRequests({
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
    <>
      {entries.map(([key, value], index) => (
        <span key={key} className="text-nowrap">
          <span className="fw-bold">{value} </span>
          {key}
          {entries.length - 1 === index ? " " : " | "}
        </span>
      ))}
    </>
  );
}

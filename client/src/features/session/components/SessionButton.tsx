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

import React, { useCallback, useEffect, useState } from "react";
import {
  faExternalLinkAlt,
  faFileAlt,
  faPlay,
  faStop,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { Button, DropdownItem } from "reactstrap";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import { SshDropdown } from "../../../components/ssh/ssh";
import { NotebooksHelper } from "../../../notebooks";
import rkIconStartWithOptions from "../../../styles/icons/start-with-options.svg";
import { Url } from "../../../utils/helpers/url";
import { toggleSessionLogsModal } from "../../display/displaySlice";
import {
  useGetSessionsQuery,
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import { Session } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import SimpleSessionButton from "./SimpleSessionButton";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";
import { Loader } from "../../../components/Loader";
import { User } from "../../../model/RenkuModels";

interface SessionButtonProps {
  className?: string;
  enableCreateSessionLink?: boolean;
  fullPath: string;
  gitUrl?: string;
  runningSessionName?: string;
}

export default function SessionButton({
  className,
  enableCreateSessionLink,
  fullPath,
  gitUrl,
  runningSessionName,
}: SessionButtonProps) {
  const sessionAutostartUrl = Url.get(Url.pages.project.session.autostart, {
    namespace: "",
    path: fullPath,
  });
  const sessionStartUrl = Url.get(Url.pages.project.session.new, {
    namespace: "",
    path: fullPath,
  });

  const { data: sessions, isLoading, isError } = useGetSessionsQuery();

  const runningSession =
    sessions && runningSessionName && runningSessionName in sessions
      ? sessions[runningSessionName]
      : sessions
      ? getRunningSession({ autostartUrl: sessionAutostartUrl, sessions })
      : null;

  if (isLoading) {
    return (
      <Button className={cx("btn-sm", className)} disabled>
        <span>Loading...</span>
      </Button>
    );
  }

  if (!runningSession) {
    const defaultAction = (
      <SimpleSessionButton
        className="session-link-group"
        fullPath={fullPath}
        skip={isError}
      />
    );
    return (
      <ButtonWithMenu
        className={cx("startButton", className)}
        color="rk-green"
        default={defaultAction}
        isPrincipal
        size="sm"
      >
        <DropdownItem>
          <Link className="text-decoration-none" to={sessionStartUrl}>
            <img
              src={rkIconStartWithOptions}
              className="rk-icon rk-icon-md btn-with-menu-margin"
            />
            Start with options
          </Link>
        </DropdownItem>
        {gitUrl && <SshDropdown fullPath={fullPath} gitUrl={gitUrl} />}
        {enableCreateSessionLink && (
          <>
            <DropdownItem divider />
            <DropdownItem>TODO: Create session link</DropdownItem>
          </>
        )}
      </ButtonWithMenu>
    );
  }

  return (
    <SessionActions
      className={className}
      enableCreateSessionLink={enableCreateSessionLink}
      session={runningSession}
    />
  );
}

interface SessionActionsProps {
  className?: string;
  enableCreateSessionLink?: boolean;
  session: Session;
}

function SessionActions({
  className,
  enableCreateSessionLink,
  session,
}: SessionActionsProps) {
  const history = useHistory();

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const dispatch = useDispatch();
  const onToggleLogs = useCallback(() => {
    dispatch(toggleSessionLogsModal({ targetServer: session.name }));
  }, [dispatch, session.name]);

  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as Session["annotations"];
  const showSessionUrl = Url.get(Url.pages.project.session.show, {
    namespace: annotations.namespace,
    path: annotations.projectName,
    server: session.name,
  });

  // Handle resuming session
  const [isResuming, setIsResuming] = useState(false);
  const [resumeSession, { isSuccess: isSuccessResumeSession }] =
    usePatchSessionMutation();
  const onResumeSession = useCallback(() => {
    resumeSession({ sessionName: session.name, state: "running" });
    setIsResuming(true);
  }, [resumeSession, session.name]);
  const { isWaiting: isWaitingForResumedSession } = useWaitForSessionStatus({
    desiredStatus: ["starting", "running"],
    sessionName: session.name,
    skip: !isResuming,
  });
  useEffect(() => {
    if (isSuccessResumeSession && !isWaitingForResumedSession) {
      history.push({ pathname: showSessionUrl });
    }
  }, [
    history,
    isSuccessResumeSession,
    isWaitingForResumedSession,
    showSessionUrl,
  ]);

  // Handle hibernating session
  const [isHibernating, setIsHibernating] = useState(false);
  const [hibernateSession, { isSuccess: isSuccessHibernateSession }] =
    usePatchSessionMutation();
  const onHibernateSession = useCallback(() => {
    hibernateSession({ sessionName: session.name, state: "hibernated" });
    setIsHibernating(true);
  }, [hibernateSession, session.name]);
  const { isWaiting: isWaitingForHibernatedSession } = useWaitForSessionStatus({
    desiredStatus: ["hibernated"],
    sessionName: session.name,
    skip: !isHibernating,
  });
  useEffect(() => {
    if (isSuccessHibernateSession && !isWaitingForHibernatedSession) {
      setIsHibernating(false);
    }
  }, [isSuccessHibernateSession, isWaitingForHibernatedSession]);

  // Handle deleting session
  const [stopSession] = useStopSessionMutation();
  // Optimistically show a session as "stopping" when triggered from the UI
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const onStopSession = useCallback(() => {
    stopSession({ serverName: session.name });
    setIsStopping(true);
  }, [session.name, stopSession]);

  const status = session.status.state;

  const buttonClassName = cx(
    "btn",
    "btn-rk-green",
    "btn-sm",
    "btn-icon-text",
    "start-session-button",
    "session-link-group"
  );

  const defaultAction =
    status === "stopping" || isHibernating || isStopping ? (
      <Button className={buttonClassName} data-cy="stopping-btn" disabled>
        <Loader className="me-2" inline size={16} />
        Stopping
      </Button>
    ) : status === "starting" || status === "running" ? (
      <Link
        className={buttonClassName}
        data-cy="open-session"
        to={{ pathname: showSessionUrl }}
      >
        <img
          className={cx("rk-icon", "rk-icon-md", "me-2")}
          src="/connect.svg"
        />
        Connect
      </Link>
    ) : status === "hibernated" ? (
      <Button
        className={buttonClassName}
        data-cy="resume-session-button"
        disabled={isResuming}
        onClick={onResumeSession}
      >
        {isResuming ? (
          <>
            <Loader className="me-2" inline size={16} />
            Resuming
          </>
        ) : (
          <>
            <FontAwesomeIcon
              className={cx("rk-icon", "rk-icon-md", "me-2")}
              icon={faPlay}
            />
            Resume
          </>
        )}
      </Button>
    ) : (
      <Button
        className={buttonClassName}
        data-cy={logged ? "stop-session-button" : "delete-session-button"}
        onClick={logged ? onHibernateSession : onStopSession}
      >
        <FontAwesomeIcon
          className={cx("rk-icon", "rk-icon-md", "me-2")}
          icon={logged ? faStop : faTrash}
        />
        {logged ? "Stop" : "Delete"}
      </Button>
    );

  const hibernateOrDeleteAction =
    status !== "stopping" &&
    status !== "failed" &&
    status !== "hibernated" &&
    logged ? (
      <>
        <DropdownItem onClick={onHibernateSession}>
          <FontAwesomeIcon
            className={cx("text-rk-green", "fa-w-14", "me-2")}
            fixedWidth
            icon={faStop}
          />
          Stop session
        </DropdownItem>
        <DropdownItem divider />
      </>
    ) : ((status === "failed" || status === "hibernated") && logged) ||
      (status !== "stopping" &&
        status !== "failed" &&
        status !== "hibernated" &&
        !logged) ? (
      <>
        <DropdownItem onClick={onStopSession}>
          <FontAwesomeIcon
            className={cx("text-rk-green", "fa-w-14", "me-2")}
            fixedWidth
            icon={faTrash}
          />
          Delete session
        </DropdownItem>
        <DropdownItem divider />
      </>
    ) : null;

  const openInNewTabAction = (status === "starting" ||
    status === "running") && (
    <DropdownItem href={session.url} target="_blank">
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faExternalLinkAlt}
      />
      Open in new tab
    </DropdownItem>
  );

  const createSessionLinkAction = enableCreateSessionLink && (
    <>
      <DropdownItem divider />
      <DropdownItem>TODO: Create session link</DropdownItem>
    </>
  );

  const logsAction = (
    <DropdownItem data-cy="session-log-button" onClick={onToggleLogs}>
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faFileAlt}
      />
      Get logs
    </DropdownItem>
  );

  return (
    <ButtonWithMenu
      className={cx("sessionsButton", className)}
      color="rk-green"
      default={defaultAction}
      disabled={status === "stopping" || isStopping}
      isPrincipal
      size="sm"
    >
      {hibernateOrDeleteAction}
      {openInNewTabAction}
      {logsAction}
      {createSessionLinkAction}
    </ButtonWithMenu>
  );
}

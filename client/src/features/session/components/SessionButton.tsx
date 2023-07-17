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

import React, { useCallback, useState } from "react";
import {
  faExternalLinkAlt,
  faFileAlt,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, DropdownItem } from "reactstrap";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import { SshDropdown } from "../../../components/ssh/ssh";
import { NotebooksHelper } from "../../../notebooks";
import rkIconStartWithOptions from "../../../styles/icons/start-with-options.svg";
import { Url } from "../../../utils/helpers/url";
import { toggleSessionLogsModal } from "../../display/displaySlice";
import { useGetSessionsQuery, useStopSessionMutation } from "../sessions.api";
import { Session } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import SimpleSessionButton from "./SimpleSessionButton";

interface SessionButtonProps {
  className?: string;
  fullPath: string;
  gitUrl?: string;
  runningSessionName?: string;
}

export default function SessionButton({
  className,
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
      </ButtonWithMenu>
    );
  }

  return <SessionActions className={className} session={runningSession} />;
}

interface SessionActionsProps {
  className?: string;
  session: Session;
}

function SessionActions({ className, session }: SessionActionsProps) {
  const dispatch = useDispatch();
  const onToggleLogs = useCallback(() => {
    dispatch(toggleSessionLogsModal({ targetServer: session.name }));
  }, [dispatch, session.name]);

  const [stopSession] = useStopSessionMutation();
  // Optimistically show a session as "stopping" when triggered from the UI
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const onStopSession = useCallback(() => {
    stopSession({ serverName: session.name });
    setIsStopping(true);
  }, [session.name, stopSession]);

  const status = session.status.state;

  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as Session["annotations"];
  const showSessionUrl = Url.get(Url.pages.project.session.show, {
    namespace: annotations.namespace,
    path: annotations.projectName,
    server: session.name,
  });

  const buttonClassName = cx(
    "btn",
    "btn-rk-green",
    "btn-sm",
    "btn-icon-text",
    "start-session-button",
    "session-link-group"
  );

  // TODO: handle hibernating state

  const defaultAction =
    status === "starting" || status === "running" ? (
      <Link
        className={buttonClassName}
        data-cy="open-session"
        to={{ pathname: showSessionUrl }}
      >
        <div className={cx("d-flex", "gap-2")}>
          <img className={cx("rk-icon", "rk-icon-md")} src="/connect.svg" />{" "}
          Connect
        </div>
      </Link>
    ) : status === "stopping" || isStopping ? (
      <Button className={buttonClassName} data-cy="stopping-btn" disabled>
        Stopping...
      </Button>
    ) : (
      <Button
        className={buttonClassName}
        data-cy="stop-session-button"
        onClick={onStopSession}
      >
        <div className={cx("d-flex", "gap-2")}>
          <FontAwesomeIcon
            className={cx("rk-icon", "rk-icon-md")}
            icon={faStop}
          />{" "}
          Stop
        </div>
      </Button>
    );

  const openInNewTabAction = (status === "starting" ||
    status === "running") && (
    <DropdownItem href={session.url} target="_blank">
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14")}
        fixedWidth
        icon={faExternalLinkAlt}
      />{" "}
      Open in new tab
    </DropdownItem>
  );

  const logsAction = (
    <DropdownItem data-cy="session-log-button" onClick={onToggleLogs}>
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14")}
        fixedWidth
        icon={faFileAlt}
      />{" "}
      Get logs
    </DropdownItem>
  );

  const stopAction = status !== "stopping" && status !== "failed" && (
    <>
      <DropdownItem onClick={onStopSession}>
        <FontAwesomeIcon
          className={cx("text-rk-green", "fa-w-14")}
          fixedWidth
          icon={faStop}
        />{" "}
        Stop
      </DropdownItem>
      <DropdownItem divider />
    </>
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
      {stopAction}
      {openInNewTabAction}
      {logsAction}
    </ButtonWithMenu>
  );
}

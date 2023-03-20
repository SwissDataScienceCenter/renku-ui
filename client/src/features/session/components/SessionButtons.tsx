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

import React, { useEffect, useState } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { Button, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faFileAlt, faStop } from "@fortawesome/free-solid-svg-icons";

import { Url } from "../../../utils/helpers/url";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import { SshDropdown } from "../../../components/ssh/ssh";
import { SessionStatus } from "../../../utils/constants/Notebooks";
import { NotebooksHelper } from "../../../notebooks";
import { Notebook } from "../../../notebooks/components/Session";
import { useStopSessionMutation } from "../../../features/session/sessionApi";
import { getShowSessionURL, getSessionRunning } from "../../../utils/helpers/SessionFunctions";

import rkIconStartWithOptions from "../../../styles/icons/start-with-options.svg";

/**
 * Show session button with dropdown
 * @param {string} fullPath - project full path
 * @param {string} gitUrl - project git URL
 */
interface StartSessionDropdownButtonProps {
  fullPath: string;
  gitUrl: string;
  loading?: boolean;
}
function StartSessionDropdownButton({
  fullPath, gitUrl, loading = false
}: StartSessionDropdownButtonProps) {
  const projectData = { namespace: "", path: fullPath };
  const launchNotebookUrl = Url.get(Url.pages.project.session.new, projectData);

  const defaultAction = (
    <StartSessionButton className="session-link-group" fullPath={fullPath} loading={loading} />
  );
  return (
    <>
      <ButtonWithMenu className="startButton" size="sm" default={defaultAction} color="rk-green" isPrincipal={true}>
        <DropdownItem>
          <Link className="text-decoration-none" to={launchNotebookUrl}>
            <img src={rkIconStartWithOptions} className="rk-icon rk-icon-md btn-with-menu-margin" />
            Start with options
          </Link>
        </DropdownItem>
        <SshDropdown fullPath={fullPath} gitUrl={gitUrl} />
      </ButtonWithMenu>
    </>
  );
}


interface StartSessionButtonProps {
  className?: string;
  fullPath: string;
  loading?: boolean;
  showAsLink?: boolean;
}
function StartSessionButton({
  className, fullPath, loading = false, showAsLink = true
}: StartSessionButtonProps) {
  const projectData = { namespace: "", path: fullPath };
  const sessionAutostartUrl = Url.get(Url.pages.project.session.autostart, projectData);

  const currentSessions = useSelector((state: RootStateOrAny) => state.stateModel.notebooks?.notebooks?.all);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const localSessionRunning = currentSessions ? getSessionRunning(currentSessions, sessionAutostartUrl) as any : false;
  const history = useHistory();

  let content = null;
  if (loading) {
    content = (<span>Loading...</span>);
  }
  else {
    content = !localSessionRunning ?
      (<><FontAwesomeIcon icon={faPlay} /> Start </>) :
      (<div className="d-flex gap-2"><img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect </div>);
  }

  const sessionLink = !localSessionRunning ?
    sessionAutostartUrl :
    localSessionRunning.showSessionURL;

  const localClass = `btn btn-sm btn-rk-green btn-icon-text start-session-button ${className}`;
  if (showAsLink && !loading)
    return (<Link to={sessionLink} className={localClass}>{content}</Link>);
  return (
    <Button disabled={loading} onClick={() => history.push(sessionLink)} className={localClass}>{content}</Button>
  );
}


interface SessionMainButtonProps {
  fullPath: string;
  gitUrl: string
  notebook: Notebook["data"];
  showLogs: Function; // eslint-disable-line @typescript-eslint/ban-types
  stopSessionCallback?: Function; // eslint-disable-line @typescript-eslint/ban-types
}
function SessionButton({
  fullPath, gitUrl, notebook, showLogs, stopSessionCallback = undefined
}: SessionMainButtonProps) {
  const history = useHistory();
  const [stopSession] = useStopSessionMutation();

  const [sessionStatus, setSessionStatus] = useState(notebook?.status?.state ?? "");
  useEffect(() => {
    setSessionStatus(notebook?.status?.state);
  }, [notebook?.status?.state]);

  const cleanAnnotations = NotebooksHelper.cleanAnnotations(notebook.annotations, "renku.io");
  const sessionLink = getShowSessionURL(cleanAnnotations, notebook.name);
  const handleClick = (url: string) => { history.push(url); };

  const stopSessionHandler = (serverName: string) => {
    setSessionStatus(SessionStatus.stopping);
    if (stopSessionCallback !== undefined)
      stopSessionCallback(serverName, SessionStatus.stopping);
    stopSession({ serverName });
  };

  const buttonClass = "btn-rk-green btn-sm btn-icon-text start-session-button session-link-group";
  const buttonIconClass = "rk-icon rk-icon-md";
  const dropdownIconClass = "text-rk-green fa-w-14";

  const connectButton = (
    <Button
      className={buttonClass} onClick={() => handleClick(sessionLink)}>
      <div className="d-flex gap-2">
        <img src="/connect.svg" className={buttonIconClass} /> Connect
      </div>
    </Button>
  );

  const stopButton = (
    <Button
      className={buttonClass} onClick={() => stopSessionHandler(notebook.name)}
      disabled={sessionStatus === "stopping"}>
      <div className="d-flex align-items-center gap-2">
        <FontAwesomeIcon className={buttonIconClass} icon={faStop} /> Stop
      </div>
    </Button>
  );

  const defaultAction = sessionStatus === "starting" || sessionStatus === "running" ?
    connectButton : sessionStatus === "failed" || sessionStatus === "stopping" ? stopButton : null;
  const logsButton = (
    <DropdownItem onClick={() => showLogs(notebook.name)}>
      <FontAwesomeIcon className={dropdownIconClass} icon={faFileAlt} /> Get logs
    </DropdownItem>
  );

  return (
    <ButtonWithMenu
      disabled={sessionStatus === "stopping"}
      className="startButton" size="sm" default={defaultAction} color="rk-green" isPrincipal={true}>
      {sessionStatus === "starting" || sessionStatus === "running" ?
        (<>
          <DropdownItem onClick={() => stopSessionHandler(notebook.name)}>
            <FontAwesomeIcon className={dropdownIconClass} icon={faStop} /> Stop
          </DropdownItem>
          <DropdownItem divider />
          {logsButton}
          <SshDropdown fullPath={fullPath} gitUrl={gitUrl} />
        </>)
        : logsButton
      }
    </ButtonWithMenu>
  );
}

export { SessionButton, StartSessionDropdownButton, StartSessionButton };

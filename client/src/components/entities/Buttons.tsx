/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Entity Buttons.tsx
 *  Entity Button component
 */

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlay, faCog, faTrash, faStopCircle, faFileAlt } from "@fortawesome/free-solid-svg-icons";

import { EntityType } from "./Entities";
import { Button, Funnel, FunnelFill, StopCircle, UncontrolledTooltip } from "../../utils/ts-wrappers";
import { stylesByItemType } from "../../utils/helpers/HelperFunctions";
import { getSessionRunning, getShowSessionURL } from "../../project/Project.present";
import { ButtonWithMenu } from "../buttons/Button";
import { SessionStatus } from "../../utils/constants/Notebooks";
import { Notebook } from "../../notebooks/components/Session";
import { SshDropdown } from "../ssh/ssh";

interface StartSessionLinkProps {
  sessionAutostartUrl: string;
  className?: string;
}
function StartSessionLink({ sessionAutostartUrl, className }: StartSessionLinkProps) {
  const currentSessions = useSelector((state: RootStateOrAny) => state.stateModel.notebooks?.notebooks?.all);
  const localSessionRunning = currentSessions ? getSessionRunning(currentSessions, sessionAutostartUrl) : false;
  const history = useHistory();

  const sessionIcon = !localSessionRunning ?
    <><FontAwesomeIcon icon={faPlay} /> Start </> :
    <div className="d-flex gap-2"><img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect </div>;

  const sessionLink = !localSessionRunning ?
    sessionAutostartUrl : localSessionRunning.showSessionURL;

  const handleClick = (e: React.MouseEvent<HTMLElement>, url: string) => {
    e.preventDefault();
    history.push(url);
  };

  return (
    <Button
      className={`btn btn-rk-green btn-sm btn-icon-text start-session-button ${className}`}
      onClick={(e: React.MouseEvent<HTMLElement>) => handleClick(e, sessionLink)}>
      {sessionIcon}
    </Button>
  );
}

export interface EntityButtonProps {
  type: EntityType;
  slug: string;
}

function EntityButton({ type, slug }: EntityButtonProps) {

  switch (type) {
    case "project":
      return <div className="card-button">
        <StartSessionLink sessionAutostartUrl={`${slug}/sessions/new?autostart=1`} /></div>;
    case "dataset":
      return null; // no defined yet
    default:
      return null;
  }
}

export interface EntityDeleteButtonProps {
  itemType: "project" | "dataset";
  action: Function
}

function EntityDeleteButtonButton({ itemType, action }: EntityDeleteButtonProps) {
  const styles = stylesByItemType(itemType);
  return <>
    <Button id="deleteButton" data-cy="delete-dataset-button"
      onClick={action} className="icon-button btn-rk-white" size="sm">
      <FontAwesomeIcon icon={faTrash} className={styles.colorText} />
    </Button>
    <UncontrolledTooltip key="tooltip-delete-entity" placement="top" target="deleteButton">
      Delete {itemType}
    </UncontrolledTooltip>
  </>;
}

export interface EntityModifyButtonProps {
  url: string;
  itemType: "project" | "dataset";
}
function EntityModifyButton({ url, itemType }: EntityModifyButtonProps) {
  const styles = stylesByItemType(itemType);

  switch (itemType) {
    case "project":
      return (<>
        <Link id="modifyButton" key="modify-button" to={`${url}/settings`}
          className="link-rk-dark text-decoration-none">
          <FontAwesomeIcon icon={faCog} className={styles.colorText} />
        </Link>
        <UncontrolledTooltip key="tooltip-modify-entity" placement="top" target="modifyButton">
          Settings
        </UncontrolledTooltip>
      </>);
    case "dataset":
      return (<>
        <Link id="modifyButton" key="modify-button" to={`${url}/settings`}
          className="link-rk-dark text-decoration-none">
          <FontAwesomeIcon icon={faPen} className={styles.colorText} />
        </Link>
        <UncontrolledTooltip key="tooltip-modify-entity" placement="top" target="modifyButton">
          Modify Dataset
        </UncontrolledTooltip>
      </>);
    default:
      return null;
  }
}

interface FilterButtonProps {
  isOpen: boolean;
  toggle: any;
}
function FilterButton({ isOpen, toggle }: FilterButtonProps) {
  if (isOpen) {
    return (
      <div
        onClick={toggle}
        data-cy="filter-button-hide"
        className="button-filter-box text-rk-green d-flex align-items-center gap-2 cursor-pointer">
        <FunnelFill /> Hide Filters
      </div>);
  }

  return <div
    onClick={toggle}
    data-cy="filter-button-show"
    className="button-filter-box d-flex align-items-center gap-2 cursor-pointer">
    <Funnel /> Show Filters
  </div>;
}

interface SessionMainButtonProps {
  fullPath: string;
  gitUrl: string
  notebook: Notebook["data"];
  sessionStatus: string;
  setSessionStatus: Function;
  setServerLogs: Function;
  stopSession: Function;
}
function SessionButton({
  fullPath, gitUrl, notebook, sessionStatus, setSessionStatus, setServerLogs, stopSession
}: SessionMainButtonProps) {
  const history = useHistory();

  const sessionLink = getShowSessionURL(notebook.annotations, notebook.name);
  const handleClick = (e: React.MouseEvent<HTMLElement>, url: string) => {
    e.preventDefault();
    history.push(url);
  };

  const stopSessionHandler = (e: React.MouseEvent<HTMLElement>, serverName: string) => {
    e.preventDefault();
    setSessionStatus(SessionStatus.stopping);
    stopSession({ serverName });
  };

  const connectButton = (
    <Button
      className="btn btn-rk-green btn-sm btn-icon-text start-session-button session-link-group"
      onClick={(e: React.MouseEvent<HTMLElement>) => handleClick(e, sessionLink)}>
      <div className="d-flex gap-2"><img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect </div>
    </Button>
  );

  const stopButton = (
    <Button
      className="btn btn-rk-green btn-sm btn-icon-text start-session-button session-link-group"
      onClick={(e: React.MouseEvent<HTMLElement>) => stopSessionHandler(e, notebook.name)}
      disabled={sessionStatus === "stopping"}>
      <div className="d-flex align-items-center gap-2"><StopCircle className="text-rk-dark" title="stop"/>
        Stop</div>
    </Button>
  );

  const defaultAction = sessionStatus === "starting" || sessionStatus === "running" ?
    connectButton : sessionStatus === "failed" || sessionStatus === "stopping" ? stopButton : null;
  const logsButton = (
    <DropdownItem onClick={(e: React.MouseEvent<HTMLElement>) => setServerLogs(notebook.name)}>
      <FontAwesomeIcon className="text-rk-green fa-w-14" icon={faFileAlt} /> Get logs
    </DropdownItem>
  );

  return (
    <ButtonWithMenu
      disabled={sessionStatus === "stopping"}
      className="startButton" size="sm" default={defaultAction} color="rk-green" isPrincipal={true}>
      {sessionStatus === "starting" || sessionStatus === "running" ?
        (<>
          <DropdownItem onClick={(e: React.MouseEvent<HTMLElement>) => stopSessionHandler(e, notebook.name)}>
            <FontAwesomeIcon className="text-rk-green" icon={faStopCircle} /> Stop
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

export { EntityButton, EntityModifyButton, EntityDeleteButtonButton, FilterButton, StartSessionLink, SessionButton };

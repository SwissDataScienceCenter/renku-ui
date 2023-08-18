/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React, { Component, Fragment, memo } from "react";
import {
  faExternalLinkAlt,
  faFileAlt,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, DropdownItem } from "reactstrap";
import { ButtonWithMenu } from "../components/buttons/Button";
import LoginAlert from "../components/loginAlert/LoginAlert";
import { SessionStatusStateEnum } from "../features/session/sessions.types";
import {
  CheckNotebookIcon,
  ServerOptionRange,
  mergeEnumOptions,
} from "./NotebookStart.present";
import "./Notebooks.css";

// * Constants and helpers * //
const SESSION_TABS = {
  session: "session",
  commands: "commands",
  logs: "logs",
  docs: "docs",
};

class NotebooksDisabled extends Component {
  render() {
    const textIntro =
      "This Renkulab deployment does not allow unauthenticated users to start sessions.";
    const textPost = "to use sessions.";
    return (
      <LoginAlert
        logged={this.props.logged}
        textIntro={textIntro}
        textPost={textPost}
      />
    );
  }
}

const NotebookServerRowAction = memo((props) => {
  const { status, name, scope } = props;
  const actions = {
    connect: null,
    stop: null,
    logs: null,
  };
  let defaultAction = null;
  actions.logs = (
    <DropdownItem
      data-cy="session-log-button"
      onClick={() => props.toggleLogs(name)}
      color="secondary"
    >
      <FontAwesomeIcon className="text-rk-green" icon={faFileAlt} /> Get logs
    </DropdownItem>
  );

  if (status !== SessionStatusStateEnum.stopping) {
    actions.stop = (
      <Fragment>
        <DropdownItem divider />
        <DropdownItem onClick={() => props.stopNotebook(name)}>
          <FontAwesomeIcon className="text-rk-green" icon={faStop} /> Stop
        </DropdownItem>
      </Fragment>
    );
  }
  if (
    status === SessionStatusStateEnum.running ||
    status === SessionStatusStateEnum.starting
  ) {
    const state = scope?.filePath ? { filePath: scope?.filePath } : undefined;
    defaultAction = (
      <Link
        data-cy="open-session"
        className="btn btn-outline-rk-green"
        to={{ pathname: props.localUrl, state }}
      >
        <div className="d-flex gap-2 text-rk-green">
          <img src="/connectGreen.svg" className="rk-icon rk-icon-md" /> Connect
        </div>
      </Link>
    );
    actions.openExternal = (
      <DropdownItem href={props.url} target="_blank">
        <FontAwesomeIcon className="text-rk-green" icon={faExternalLinkAlt} />{" "}
        Open in new tab
      </DropdownItem>
    );
  } else if (status === SessionStatusStateEnum.stopping) {
    defaultAction = (
      <Button
        data-cy="stopping-btn"
        className="btn-outline-rk-green"
        disabled={true}
      >
        Stopping...
      </Button>
    );
    actions.stop = null;
  } else {
    const classes = { className: "text-nowrap btn-outline-rk-green" };
    defaultAction = (
      <Button
        data-cy="stop-session-button"
        {...classes}
        onClick={() => props.stopNotebook(name)}
      >
        <div className="d-flex gap-2 text-rk-green">
          <FontAwesomeIcon className="m-auto" icon={faStop} /> Stop
        </div>
      </Button>
    );
    actions.stop = null;
  }

  return (
    <ButtonWithMenu
      className="sessionsButton"
      size="sm"
      default={defaultAction}
      color="rk-green"
      disabled={status === SessionStatusStateEnum.stopping}
    >
      {actions.openExternal}
      {actions.logs}
      {actions.stop}
    </ButtonWithMenu>
  );
}, _.isEqual);
NotebookServerRowAction.displayName = "NotebookServerRowAction";

export {
  CheckNotebookIcon,
  NotebooksDisabled,
  SESSION_TABS,
  ServerOptionRange,
  mergeEnumOptions,
};

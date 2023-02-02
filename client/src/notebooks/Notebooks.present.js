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
import Media from "react-media";
import { Link, useHistory } from "react-router-dom";
import {
  Badge, Button, Col, DropdownItem, PopoverBody, PopoverHeader, Row, UncontrolledPopover
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle, faExclamationTriangle, faExternalLinkAlt, faFileAlt,
  faInfoCircle, faPlus, faStopCircle, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

import { NotebooksHelper } from "./index";
import {
  CheckNotebookIcon, StartNotebookServer, mergeEnumOptions, ServerOptionBoolean, ServerOptionEnum,
  ServerOptionRange
} from "./NotebookStart.present";
import { formatBytes, simpleHash } from "../utils/helpers/HelperFunctions";
import Time from "../utils/helpers/Time";
import { Url } from "../utils/helpers/url";
import Sizes from "../utils/constants/Media";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { ButtonWithMenu } from "../utils/components/buttons/Button";
import { TimeCaption } from "../utils/components/TimeCaption";
import { Loader } from "../utils/components/Loader";
import { InfoAlert, } from "../utils/components/Alert";
import { Clipboard } from "../utils/components/Clipboard";
import LoginAlert from "../utils/components/loginAlert/LoginAlert";
import { EnvironmentLogs, SessionLogs as LogsSessionLogs } from "../utils/components/Logs";
import { SessionStatus } from "../utils/constants/Notebooks";

import "./Notebooks.css";


// * Constants and helpers * //
const SESSION_TABS = {
  session: "session",
  commands: "commands",
  logs: "logs",
  docs: "docs"
};

const formatResources = function (resources) {
  if (resources.memory) {
    const memory = !isNaN(resources.memory) ?
      formatBytes(resources.memory) :
      resources.memory;
    return { ...resources, memory };
  }
  return resources;
};

/** Helper function for formatting the resource list */

function formattedResourceList(resources) {
  const resourcesKeys = Object.keys(resources);
  const resourceList = resourcesKeys.map((name, index) => {
    return (<span key={name} className="text-nowrap">
      <span className="fw-bold">{resources[name]} </span>
      {name}{resourcesKeys.length - 1 === index ? " " : " | " }</span>);
  });
  return resourceList;
}

function SessionLogs(props) {
  const { fetchLogs, notebook, tab } = props;
  const { logs } = notebook;
  const sessionName = notebook.data.name;

  if (tab !== SESSION_TABS.logs)
    return null;

  return <LogsSessionLogs fetchLogs={fetchLogs} logs={logs} name={sessionName} />;
}

function SessionJupyter(props) {
  const { notebook, height = "800px", ready } = props;
  const history = useHistory();

  let content = null;
  if (notebook.available) {
    const status = notebook.data.status.state;
    if (status === SessionStatus.running) {
      const locationFilePath = history?.location?.state?.filePath;
      const notebookUrl = locationFilePath ? `${notebook.data.url}/lab/tree/${locationFilePath}` : notebook.data.url;
      content = (
        <iframe id="session-iframe" title="session iframe" src={notebookUrl}
          style={{ display: ready ? "block" : "none" }}
          width="100%" height={height} referrerPolicy="origin"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        />
      );
    }
    else if (status === SessionStatus.stopping) {
      content = (<Loader />);
    }
  }
  return content;
}

class NotebooksDisabled extends Component {
  render() {
    const textIntro = "This Renkulab deployment does not allow unauthenticated users to start sessions.";
    const textPost = "to use sessions.";
    return (<LoginAlert logged={this.props.logged} textIntro={textIntro} textPost={textPost} />);
  }
}

// * Notebooks code * //
class Notebooks extends Component {
  render() {
    const serverNumbers = Object.keys(this.props.notebooks.all).length;
    const loading = this.props.notebooks.fetched ?
      false :
      true;
    const message = this.props.message ?
      (<div>{this.props.message}</div>) :
      null;

    return (
      <Fragment>
        <Row className="pt-2 pb-3">
          <Col className="d-flex mb-2 justify-content-between">
            <NotebooksHeader standalone={this.props.standalone}
              urlNewSession={this.props.urlNewSession}/>
          </Col>
        </Row>
        <NotebookServers
          servers={this.props.notebooks.all}
          standalone={this.props.standalone}
          loading={loading}
          stopNotebook={this.props.handlers.stopNotebook}
          fetchLogs={this.props.handlers.fetchLogs}
          toggleLogs={this.props.handlers.toggleLogs}
          fetchCommit={this.props.handlers.fetchCommit}
          commits={this.props.data.commits}
          logs={this.props.logs}
          scope={this.props.scope}
        />
        <NotebooksPopup
          servers={serverNumbers}
          standalone={this.props.standalone}
          loading={loading}
          urlNewSession={this.props.urlNewSession}
        />
        {serverNumbers ? null : message}
      </Fragment>);
  }
}

class NotebooksHeader extends Component {
  render() {
    if (this.props.standalone)
      return (<h2 className="sessions-title">Sessions</h2>);

    return (<Fragment>
      <h3 className="sessions-title">Sessions</h3>
      <div>
        <Link className="btn btn-outline-rk-green btn-icon-text" role="button" to={this.props.urlNewSession}>
          <FontAwesomeIcon icon={faPlus} />
          New session
        </Link>
      </div>
    </Fragment>);
  }
}

class NotebooksPopup extends Component {
  render() {
    if (this.props.servers || this.props.loading)
      return null;

    let suggestion = (<span>
      You can start a new session from the <i>Sessions</i> tab of a project.
    </span>);
    if (!this.props.standalone) {
      let newOutput = "New";
      if (this.props.urlNewSession) {
        newOutput = (<Link className="btn btn-primary btn-sm" role="button" to={this.props.urlNewSession}>
          New session</Link>);
      }

      suggestion = (<span>
        You can start a new session by clicking on the {newOutput} button on top.
      </span>);
    }

    return (
      <InfoAlert timeout={0}>
        {suggestion}
      </InfoAlert>
    );
  }
}

class NotebookServers extends Component {
  render() {
    if (this.props.loading)
      return <Loader />;

    return (
      <div className="mb-4">
        <NotebookServersList {...this.props} />
      </div>
    );
  }
}

class NotebookServersList extends Component {
  render() {
    const serverNames = Object.keys(this.props.servers);
    if (serverNames.length === 0)
      return (<p>No currently running sessions.</p>);

    const rows = serverNames.map((k, i) => {
      const validAnnotations = Object.keys(this.props.servers[k].annotations)
        .filter(key => key.startsWith("renku.io"))
        .reduce((obj, key) => { obj[key] = this.props.servers[k].annotations[key]; return obj; }, {});
      const resources = this.props.servers[k].resources?.requests;
      const startTime = Time.toIsoTimezoneString(this.props.servers[k].started, "datetime-short");

      return (<NotebookServerRow
        key={i}
        stopNotebook={this.props.stopNotebook}
        fetchLogs={this.props.fetchLogs}
        toggleLogs={this.props.toggleLogs}
        fetchCommit={this.props.fetchCommit}
        commits={this.props.commits}
        logs={this.props.logs}
        scope={this.props.scope}
        standalone={this.props.standalone}
        annotations={validAnnotations}
        resources={resources}
        image={this.props.servers[k].image}
        name={this.props.servers[k].name}
        startTime={startTime}
        status={this.props.servers[k].status}
        url={this.props.servers[k].url}
      />);
    });

    return (
      <Fragment>
        <div className="mb-4">
          {rows}
        </div>
      </Fragment>
    );
  }
}

class NotebookServerRow extends Component {
  render() {
    if (!this.props.annotations)
      return null;

    const annotations = NotebooksHelper.cleanAnnotations(this.props.annotations, "renku.io");
    const status = this.props.status.state;
    const details = {
      message: this.props.status.message
    };
    const uid = "uid_" + simpleHash(annotations["namespace"] + annotations["projectName"]
      + annotations["branch"] + annotations["commit-sha"]);
    const resources = formatResources(this.props.resources);
    const repositoryLinks = {
      branch: `${annotations["repository"]}/tree/${annotations["branch"]}`,
      commit: `${annotations["repository"]}/tree/${annotations["commit-sha"]}`
    };
    const commitDetails = this.props.commits[annotations["commit-sha"]] ?
      this.props.commits[annotations["commit-sha"]] :
      null;
    const image = this.props.image;
    const localUrl = Url.get(Url.pages.project.session.show, {
      namespace: annotations["namespace"],
      path: annotations["projectName"],
      server: this.props.name,
    });

    const showMenu = this.props.showMenu ?? true;

    const newProps = {
      annotations, commitDetails, details, image, localUrl, repositoryLinks, resources, status, uid, showMenu
    };

    return (
      <Media query={Sizes.md}>
        {matches =>
          matches ?
            (<NotebookServerRowFull {...this.props} {...newProps} />) :
            (<NotebookServerRowCompact {...this.props} {...newProps} />)
        }
      </Media>
    );
  }
}

class NotebookServerRowCommitInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    const willOpen = !this.state.isOpen;
    if (willOpen && !this.props.commit)
      this.props.fetchCommit(this.props.name);
    this.setState({ isOpen: willOpen });
  }

  render() {
    const { commit } = this.props;
    const uid = `${this.props.uid}-commit`;

    let content;
    if (!commit || !commit.data || !commit.data.id || (!commit.fetching && !commit.fetched)) {
      content = (<span>Data not available.</span>);
    }
    else if (!commit.fetched && commit.fetching) {
      content = (<span><Loader size="16" inline="true" /> Fetching data...</span>);
    }
    else {
      content = (
        <Fragment>
          <span className="fw-bold">Author:</span> <span>{commit.data.author_name}</span><br />
          <span>
            <span className="fw-bold">Date:</span>
            {" "}<span>{Time.toIsoTimezoneString(commit.data.committed_date, "datetime-short")}</span>
            {" "}<TimeCaption caption="~" endPunctuation=" " time={commit.data.committed_date} />
            <br />
          </span>
          <span className="fw-bold">Message:</span> <span>{commit.data.message}</span><br />
          <span className="fw-bold">Full SHA:</span> <span>{commit.data.id}</span><br />
          <span className="fw-bold me-1">Details:</span>
          <ExternalLink url={commit.data.web_url} title="Open commit in GitLab" role="text" showLinkIcon={true} />
        </Fragment>
      );
    }

    return (
      <span>
        <FontAwesomeIcon id={uid} icon={faInfoCircle}/>
        <UncontrolledPopover target={uid} trigger="legacy" placement="bottom"
          isOpen={this.state.isOpen} toggle={() => this.toggle()}>
          <PopoverHeader>Commit details</PopoverHeader>
          <PopoverBody>{content}</PopoverBody>
        </UncontrolledPopover>
      </span>
    );

  }
}

class NotebookServerRowFull extends Component {
  render() {
    const {
      annotations, details, status, url, uid, resources, repositoryLinks,
      name, commitDetails, fetchCommit, image, showMenu = true
    } = this.props;

    const icon = <div className="align-middle">
      <NotebooksServerRowStatusIcon
        details={details} status={status} uid={uid} image={image} annotations={annotations}
      />
    </div>;

    const project = this.props.standalone ?
      (<NotebookServerRowProject annotations={annotations} />) :
      null;

    const branch = (
      <ExternalLink url={repositoryLinks.branch} title={annotations["branch"]} role="text" showLinkIcon={true} />
    );

    const commit = (
      <Fragment>
        <ExternalLink url={repositoryLinks.commit}
          title={annotations["commit-sha"].substring(0, 8)} role="text" showLinkIcon={true} />
        {" "}<NotebookServerRowCommitInfo uid={uid} name={name} commit={commitDetails} fetchCommit={fetchCommit} />
      </Fragment>
    );

    const resourceList = formattedResourceList(resources);

    const statusOut = <NotebooksServerRowStatus
      details={details} status={status} uid={uid} startTime={this.props.startTime} annotations={annotations}/>;

    const action = showMenu ? (<span className="mb-auto">
      <NotebookServerRowAction
        localUrl={this.props.localUrl}
        name={this.props.name}
        status={status}
        stopNotebook={this.props.stopNotebook}
        toggleLogs={this.props.toggleLogs}
        url={url}
        scope={this.props.scope}
      />
      <EnvironmentLogs
        fetchLogs={this.props.fetchLogs}
        toggleLogs={this.props.toggleLogs}
        logs={this.props.logs}
        name={this.props.name}
        annotations={annotations}
      />
    </span>) : null;

    return (
      <div className="d-flex flex-row bg-white border-0 border-radius-8
        rk-search-result rk-search-result-100 cursor-auto overflow-visible">
        <span className={this.props.standalone ? "me-3 mt-2" : "me-3 mt-1"}>{icon}</span>
        <Col className="d-flex align-items-start flex-column col-10 overflow-hidden">
          <div className="project d-inline-block text-truncate">
            {project}
          </div>
          <table>
            <tbody className="gx-4 text-rk-text">
              <tr>
                <td className="text-dark fw-bold">Branch</td>
                <td className="text-dark">{branch}</td>
              </tr>
              <tr>
                <td className="text-dark fw-bold">Commit</td>
                <td className="text-dark">{commit}</td>
              </tr>
              <tr>
                <td className="pe-3 text-dark fw-bold">Resources</td>
                <td className="text-dark">{resourceList}</td>
              </tr>
              <tr>
                <td colSpan="2">{statusOut}</td>
              </tr>
            </tbody>
          </table>
        </Col>
        <Col className="d-flex align-items-end flex-column flex-shrink-0">
          {action}
        </Col>
      </div>
    );
  }
}

class NotebookServerRowCompact extends Component {
  render() {
    const {
      annotations, commitDetails, details, fetchCommit, image, localUrl, logs, name, repositoryLinks,
      resources, standalone, startTime, status, uid, url, showMenu = true
    } = this.props;

    const icon = <span>
      <NotebooksServerRowStatusIcon
        details={details} status={status} uid={uid} image={image} annotations={annotations}
      />
    </span>;
    const project = standalone ?
      (<Fragment>
        <span className="fw-bold">Project: </span>
        <span><NotebookServerRowProject annotations={annotations} /></span>
        <br />
      </Fragment>) :
      null;
    const branch = (<Fragment>
      <span className="fw-bold">Branch: </span>
      <ExternalLink url={repositoryLinks.branch} title={annotations["branch"]} role="text" showLinkIcon={true} />
      <br />
    </Fragment>);
    const commit = (<Fragment>
      <span className="fw-bold">Commit: </span>
      <ExternalLink url={repositoryLinks.commit}
        title={annotations["commit-sha"].substring(0, 8)} role="text" showLinkIcon={true} />
      {" "}<NotebookServerRowCommitInfo uid={uid} name={name} commit={commitDetails} fetchCommit={fetchCommit}/>
      <br />
    </Fragment>);
    const resourceList = formattedResourceList(resources);
    const resourceObject = (<Fragment>
      <span className="fw-bold">Resources: </span>
      <span>{resourceList}</span>
      <br />
    </Fragment>);
    const statusOut = (<span>
      <NotebooksServerRowStatus
        spaced={true}
        details={details}
        status={status}
        uid={uid}
        startTime={startTime}
        annotations={annotations}
      />
    </span>);
    const action = showMenu ? (<span>
      <NotebookServerRowAction
        localUrl={localUrl}
        name={name}
        status={status}
        stopNotebook={this.props.stopNotebook}
        toggleLogs={this.props.toggleLogs}
        url={url}
      />
      <EnvironmentLogs
        fetchLogs={this.props.fetchLogs}
        toggleLogs={this.props.toggleLogs}
        logs={logs}
        name={name}
        annotations={annotations}
      />
    </span>) : null;

    return (
      <div className="rk-search-result-compact bg-white cursor-auto border-radius-8 border-0">
        {project}
        {branch}
        {commit}
        {resourceObject}
        <div className="d-inline-flex" >
          {icon} &nbsp; {statusOut}
        </div>
        <div className="mt-1">{action}</div>
      </div>
    );
  }
}

export function getStatusObject(status, defaultImage) {
  switch (status) {
    case SessionStatus.running:
      return {
        color: defaultImage ?
          "warning" :
          "success",
        icon: defaultImage ?
          (<FontAwesomeIcon icon={faExclamationTriangle} inverse={true} size="lg" />) :
          (<FontAwesomeIcon icon={faCheckCircle} size="lg" />),
        text: "Running"
      };
    case SessionStatus.starting:
      return {
        color: "warning",
        icon: <Loader size="16" inline="true" />,
        text: "Starting..."
      };
    case SessionStatus.stopping:
      return {
        color: "warning",
        icon: <Loader size="16" inline="true" />,
        text: "Stopping session..."
      };
    case SessionStatus.failed:
      return {
        color: "danger",
        icon: <FontAwesomeIcon icon={faTimesCircle} size="lg" />,
        text: "Error"
      };
    default:
      return {
        color: "danger",
        icon: <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />,
        text: "Unknown"
      };
  }
}

class NotebooksServerRowStatus extends Component {
  render() {
    const { status, details, uid, annotations, startTime } = this.props;
    const data = getStatusObject(status, annotations.default_image_used);
    const textColor = {
      "running": "text-secondary",
      "failed": "text-danger",
      "starting": "text-secondary",
      "stopping": "text-secondary",
    };

    const textStatus = status === SessionStatus.running ? `${data.text} since ${startTime}` : data.text;

    const extraInfo = details.message ?
      (<>
        {" "}<FontAwesomeIcon id={uid} icon={faInfoCircle} />
        <UncontrolledPopover target={uid} trigger="legacy" placement="bottom">
          <PopoverHeader>Kubernetes pod status</PopoverHeader>
          <PopoverBody>
            <span>{details.message}</span><br />
          </PopoverBody>
        </UncontrolledPopover>
      </>) : null;

    return <>
      <span className={`time-caption font-weight-bold ${textColor[status]}`}>
        {textStatus}
        {extraInfo}
      </span>
    </>;
  }
}

class NotebooksServerRowStatusIcon extends Component {
  render() {
    const { status, uid, image, annotations } = this.props;
    const data = getStatusObject(status, annotations.default_image_used);
    const classes = this.props.spaced ?
      "text-nowrap p-1 mb-2" :
      "text-nowrap p-1";
    const id = `${uid}-status`;
    const policy = annotations.default_image_used ?
      (<span><br /><span className="font-weight-bold">Warning:</span> a fallback image was used.</span>) :
      null;

    const popover = !image || status !== SessionStatus.running ?
      null :
      (
        <UncontrolledPopover target={id} trigger="legacy" placement="bottom">
          <PopoverHeader>Details</PopoverHeader>
          <PopoverBody>
            <span className="font-weight-bold">Image source:</span> {image}
            <span className="ms-1"><Clipboard clipboardText={image} /></span>
            {policy}
          </PopoverBody>
        </UncontrolledPopover>
      );

    return (<div>
      <Badge id={id} color={data.color} className={classes}>{data.icon}</Badge>
      {popover}
    </div>);
  }
}

class NotebookServerRowProject extends Component {
  render() {
    const { annotations } = this.props;
    const fullPath = `${annotations["namespace"]}/${annotations["projectName"]}`;
    const data = { namespace: annotations["namespace"], path: annotations["projectName"] };
    const url = Url.get(Url.pages.project, data);
    return (<Link to={url} className="title">{fullPath}</Link>);
  }
}

const NotebookServerRowAction = memo((props) => {
  const { status, name, scope } = props;
  const actions = {
    connect: null,
    stop: null,
    logs: null
  };
  let defaultAction = null;
  actions.logs = (<DropdownItem data-cy="session-log-button" onClick={() => props.toggleLogs(name)} color="secondary">
    <FontAwesomeIcon className="text-rk-green" icon={faFileAlt} /> Get logs
  </DropdownItem>);

  if (status !== SessionStatus.stopping) {
    actions.stop = <Fragment>
      <DropdownItem divider />
      <DropdownItem onClick={() => props.stopNotebook(name)}>
        <FontAwesomeIcon className="text-rk-green" icon={faStopCircle} /> Stop
      </DropdownItem>
    </Fragment>;
  }
  if (status === SessionStatus.running || status === SessionStatus.starting) {
    const state = scope?.filePath ? { filePath: scope?.filePath } : undefined;
    defaultAction = (
      <Link data-cy="open-session" className="btn btn-outline-rk-green" to={{ pathname: props.localUrl, state }}>
        <div className="d-flex gap-2 text-rk-green">
          <img src="/connectGreen.svg" className="rk-icon rk-icon-md" />Connect </div>
      </Link>);
    actions.openExternal = (<DropdownItem href={props.url} target="_blank" >
      <FontAwesomeIcon className="text-rk-green" icon={faExternalLinkAlt} /> Open in new tab
    </DropdownItem>);
  }
  else if (status === SessionStatus.stopping) {
    defaultAction = (
      <Button data-cy="stopping-btn" className="btn btn-outline-rk-green" disabled={true}>
        Stopping...
      </Button>);
    actions.stop = null;
  }
  else {
    const classes = { className: "text-nowrap btn-outline-rk-green" };
    defaultAction = (<Button data-cy="stop-session-button" {...classes} onClick={() => props.stopNotebook(name)}>
      <FontAwesomeIcon className="text-rk-green" icon={faStopCircle} /> Stop</Button>);
    actions.stop = null;
  }

  return (
    <ButtonWithMenu
      className="sessionsButton" size="sm" default={defaultAction} color="rk-green"
      disabled={status === SessionStatus.stopping}>
      {actions.openExternal}
      {actions.logs}
      {actions.stop}
    </ButtonWithMenu>
  );
}, _.isEqual);
NotebookServerRowAction.displayName = "NotebookServerRowAction";

export {
  CheckNotebookIcon, Notebooks, NotebooksDisabled, ServerOptionBoolean, ServerOptionEnum, ServerOptionRange,
  StartNotebookServer, mergeEnumOptions, SessionJupyter, NotebookServerRowFull, NotebookServerRow,
  SESSION_TABS, SessionLogs, NotebookServerRowCommitInfo
};

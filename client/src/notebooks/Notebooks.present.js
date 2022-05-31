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

import React, { Component, Fragment, useState, memo } from "react";
import Media from "react-media";
import { Link, useHistory } from "react-router-dom";
import {
  Alert, Badge, Button, Col, DropdownItem, Nav, NavItem, NavLink, PopoverBody, PopoverHeader, Row, UncontrolledPopover
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook, faCheckCircle, faExclamationTriangle, faExternalLinkAlt, faFileAlt, faHistory,
  faInfoCircle, faQuestionCircle, faStopCircle, faSyncAlt, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

import { NotebooksHelper } from "./index";
import SessionCheatSheet from "./SessionCheatSheet";
import {
  CheckNotebookIcon, StartNotebookServer, mergeEnumOptions, ServerOptionBoolean, ServerOptionEnum,
  ServerOptionRange
} from "./NotebookStart.present";
import { formatBytes, simpleHash } from "../utils/helpers/HelperFunctions";
import Time from "../utils/helpers/Time";
import { Url } from "../utils/helpers/url";
import Sizes from "../utils/constants/Media";
import { Docs } from "../utils/constants/Docs";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { ButtonWithMenu } from "../utils/components/Button";
import { TimeCaption } from "../utils/components/TimeCaption";
import { Loader } from "../utils/components/Loader";
import { InfoAlert, } from "../utils/components/Alert";
import { Clipboard } from "../utils/components/Clipboard";
import { JupyterIcon } from "../utils/components/Icon";
import LoginAlert from "../utils/components/loginAlert/LoginAlert";
import { EnvironmentLogs, LogDownloadButton, LogTabs, useDownloadLogs } from "../utils/components/Logs";
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

// * Jupyter Session code * //
function ShowSession(props) {
  const { filters, handlers, notebook } = props;

  const [tab, setTab] = useState(SESSION_TABS.session);

  const fetchLogs = () => {
    if (!notebook.available)
      return;
    return handlers.fetchLogs(notebook.data.name);
  };

  const urlList = Url.get(Url.pages.project.session, {
    namespace: filters.namespace,
    path: filters.project,
  });

  // redirect immediately if the session fail
  if (props.history && notebook.data?.status?.state === SessionStatus.failed)
    props.history.push(urlList);

  // Always add all sub-components and hide them one by one to preserve the iframe navigation where needed
  return (
    <div className="bg-white">
      <SessionInformation notebook={notebook} stopNotebook={handlers.stopNotebook} urlList={urlList} />
      <div className="d-lg-flex">
        <SessionNavbar fetchLogs={fetchLogs} setTab={setTab} tab={tab} />
        <div className={`border sessions-iframe-border w-100`}>
          <SessionJupyter {...props} tab={tab} urlList={urlList} />
          <SessionLogs {...props} tab={tab} fetchLogs={fetchLogs} />
          <SessionCommands {...props} tab={tab} />
          <SessionDocs {...props} tab={tab} />
        </div>
      </div>
    </div>
  );
}

function SessionInformation(props) {
  const { notebook, stopNotebook, urlList } = props;

  const [stopping, setStopping] = useState(false);

  const stop = async () => {
    setStopping(true);
    // ? no need to handle the error here since we use the notifications at container level
    const success = await stopNotebook(notebook.data.name, urlList);
    if (success !== false)
      return;
    setStopping(false);
  };

  // Unavailable session, no information
  if (!notebook.available)
    return null;

  const annotations = NotebooksHelper.cleanAnnotations(notebook.data.annotations, "renku.io");
  const url = notebook.data.url;
  const resources = formatResources(notebook.data.resources);

  const repositoryLinks = {
    branch: `${annotations["repository"]}/tree/${annotations["branch"]}`,
    commit: `${annotations["repository"]}/tree/${annotations["commit-sha"]}`
  };
  const resourceList = formattedResourceList(resources);

  // Create dropdown menu
  const ready = notebook.data?.status?.state === SessionStatus.running ? true : false;
  const stopContent = (<Fragment><FontAwesomeIcon icon={faStopCircle} /> Stop</Fragment>);
  const stopButton = (<DropdownItem onClick={stop} disabled={stopping}>{stopContent}</DropdownItem>);
  const defaultAction = <ExternalLink color="primary" url={url} disabled={stopping} showLinkIcon={true} title="Open" />;
  const menu = ready ?
    (
      <ButtonWithMenu className="sessionsButton" color="primary" size="sm" default={defaultAction}>
        {stopButton}
      </ButtonWithMenu>
    ) :
    (
      <Button className="sessionsButton" color="primary" size="sm" onClick={stop} disabled={stopping}>
        {stopContent}
      </Button>
    );

  return (
    <div className="d-flex flex-wrap">
      <div className="p-2 p-lg-3 text-nowrap">
        <span className="fw-bold">Branch </span>
        <ExternalLink url={repositoryLinks.branch} title={annotations["branch"]} role="text"
          showLinkIcon={true} />
      </div>
      <div className="p-2 p-lg-3 text-nowrap">
        <span className="fw-bold">Commit </span>
        <ExternalLink url={repositoryLinks.commit} title={annotations["commit-sha"].substring(0, 8)}
          role="text" showLinkIcon={true} />
      </div>
      <div className="p-2 p-lg-3 text-nowrap">
        <span className="fw-bold">Resources </span>
        <span>{resourceList}</span>
      </div>
      <div className="p-2 p-lg-3 text-nowrap">
        <span className="fw-bold">{ ready ? "Running since" : "Started" } </span>
        <TimeCaption noCaption={true} endPunctuation=" " time={notebook.data.started} />
      </div>
      <div className="p-1 p-lg-2 m-auto me-1 me-lg-2">{menu}</div>
    </div>
  );
}

function SessionNavbar(props) {
  const { fetchLogs, tab, setTab } = props;

  const navLinkClassName = (tabId) => tab === tabId ? "text-rk-green" : "text-rk-text cursor-pointer";

  const navItemClassName = "pt-2 pt-lg-3";

  return (
    <div className="border-top">
      <Nav vertical>
        <NavItem className={navItemClassName}>
          <NavLink className={navLinkClassName(SESSION_TABS.session)} onClick={() => setTab(SESSION_TABS.session)}>
            <JupyterIcon svgClass="svg-inline--fa fa-lg" grayscale={tab === SESSION_TABS.session ? false : true} />
          </NavLink>
        </NavItem>
        <NavItem className={navItemClassName}>
          <NavLink className={navLinkClassName(SESSION_TABS.logs)}
            onClick={() => { fetchLogs(); setTab(SESSION_TABS.logs); }} >
            <FontAwesomeIcon size="lg" icon={faHistory} />
          </NavLink>
        </NavItem>
        <NavItem className={navItemClassName}>
          <NavLink className={navLinkClassName(SESSION_TABS.commands)}
            onClick={() => setTab(SESSION_TABS.commands)} >
            <FontAwesomeIcon size="lg" icon={faBook} />
          </NavLink>
        </NavItem>
        <NavItem className={navItemClassName}>
          <NavLink className={navLinkClassName(SESSION_TABS.docs)}
            onClick={() => setTab(SESSION_TABS.docs)} >
            <FontAwesomeIcon size="lg" icon={faQuestionCircle} />
          </NavLink>
        </NavItem>
      </Nav>
    </div>
  );
}

function SessionLogs(props) {
  const { fetchLogs, notebook, tab } = props;
  const { logs } = notebook;
  const sessionName = notebook.data.name;
  const [ downloading, save ] = useDownloadLogs(logs, fetchLogs, sessionName);

  if (tab !== SESSION_TABS.logs)
    return null;

  let body = null;
  if (logs.fetching) {
    body = (<Loader />);
  }
  else {
    if (!logs.fetched) {
      body = (
        <p>
          Logs unavailable. Please{" "}
          <Button color="primary" size="sm" onClick={() => { fetchLogs(); }}>download</Button>
          {" "}them again.
        </p>
      );
    }
    else {
      if (logs.data && typeof logs.data !== "string") {
        body = <LogTabs logs={logs.data}/>;
      }
      else {
        body = (
          <Fragment>
            <p>No logs available for this pod yet.</p>
            <p>
              You can try to{" "}
              <Button color="primary" size="sm" onClick={() => { fetchLogs(); }}>refresh</Button>
              {" "}them after a while.
            </p>
          </Fragment>
        );
      }
    }
  }

  // ? Having a minHeight prevent losing the vertical scroll position.
  // TODO: Revisit after #1219
  return (
    <Fragment>
      <div className="p-2 p-lg-3 text-nowrap">
        <Button key="button" color="secondary" size="sm" style={{ marginRight: 8 }}
          id="session-refresh-logs" onClick={() => fetchLogs()} disabled={logs.fetching} >
          <FontAwesomeIcon icon={faSyncAlt} /> Refresh logs
        </Button>
        <LogDownloadButton logs={logs} downloading={downloading} save={save} size="sm" color="secondary"/>
      </div>
      <div className="p-2 p-lg-3 border-top">
        {body}
      </div>
    </Fragment>
  );
}

function SessionDocs(props) {
  const { tab } = props;

  const invisible = tab !== SESSION_TABS.docs ?
    true :
    false;
  const localClass = invisible ?
    "invisible" :
    "";

  return (
    <iframe id="docs-iframe" title="documentation iframe" src={Docs.READ_THE_DOCS_ROOT} className={localClass}
      width="100%" height="800px" referrerPolicy="origin" sandbox="allow-same-origin allow-scripts"
    />
  );
}

function SessionCommands(props) {
  const { tab, notebook } = props;

  if (tab !== SESSION_TABS.commands)
    return null;

  const annotations = NotebooksHelper.cleanAnnotations(notebook.data.annotations, "renku.io");
  const branch = annotations["branch"];

  // ? Having a minHeight prevent losing the vertical scroll position.
  // TODO: Revisit after #1219
  return (
    <Fragment>
      <div className="p-2 p-lg-3" style={{ minHeight: 800 }}>
        <SessionCheatSheet branch={branch}/>
      </div>
    </Fragment>
  );
}

function SessionJupyter(props) {
  const { filters, notebook, tab, urlList } = props;
  const history = useHistory();
  const invisible = tab !== SESSION_TABS.session ?
    true :
    false;

  let content = null;
  if (notebook.available) {
    const status = notebook.data.status.state;
    if (status === SessionStatus.running) {
      const locationFilePath = history?.location?.state?.filePath;
      const notebookUrl = locationFilePath ? `${notebook.data.url}/lab/tree/${locationFilePath}` : notebook.data.url;

      const localClass = invisible ?
        "invisible position-absolute" : // ? position-absolute prevent showing extra margins
        "";
      content = (
        <iframe id="session-iframe" title="session iframe" src={notebookUrl} className={localClass}
          width="100%" height="800px" referrerPolicy="origin"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        />
      );
    }
    else if (invisible) {
      return null;
    }
    else if (status === SessionStatus.starting || status === SessionStatus.stopping) {
      content = (<Loader />);
    }
  }
  else {
    if (invisible)
      return null;

    const urlNew = Url.get(Url.pages.project.session.new, {
      namespace: filters.namespace,
      path: filters.project,
    });

    content = (
      <div className="p-2 p-lg-3 text-nowrap">
        <p className="mt-2">The session you are trying to open is not available.</p>
        <Alert color="primary">
          <p className="mb-0">
            <FontAwesomeIcon size="lg" icon={faQuestionCircle} />
            {" "}You should either{" "}
            <Link className="btn btn-primary btn-sm" to={urlNew}>start a new session</Link>
            {" "}or{" "}
            <Link className="btn btn-primary btn-sm" to={urlList}>check the running sessions</Link>
            {" "}
          </p>
        </Alert>
      </div>
    );
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
      return (<h2>Sessions</h2>);

    return (<Fragment>
      <h3>Sessions</h3>
      <div>
        <Link className="btn btn-sm btn-secondary" role="button" to={this.props.urlNewSession}>
          <span className="arrow-right pt-2 pb-2">  </span>
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
      const resources = this.props.servers[k].resources;
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

    const newProps = {
      annotations, commitDetails, details, image, localUrl, repositoryLinks, resources, status, uid
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
      annotations, details, status, url, uid, resources, repositoryLinks, name, commitDetails, fetchCommit, image
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

    const action = (<span className="mb-auto">
      <NotebookServerRowAction
        localUrl={this.props.localUrl}
        name={this.props.name}
        status={status}
        stopNotebook={this.props.stopNotebook}
        toggleLogs={this.props.toggleLogs}
        url={url}
      />
      <EnvironmentLogs
        fetchLogs={this.props.fetchLogs}
        toggleLogs={this.props.toggleLogs}
        logs={this.props.logs}
        name={this.props.name}
        annotations={annotations}
      />
    </span>);

    return (
      <div className="d-flex flex-row rk-search-result rk-search-result-100 cursor-auto overflow-visible">
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
      resources, standalone, startTime, status, uid, url
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
    const action = (<span>
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
    </span>);

    return (
      <div className="rk-search-result-compact cursor-auto">
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

function getStatusObject(status, defaultImage) {
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
  const { status, name } = props;
  const actions = {
    connect: null,
    stop: null,
    logs: null
  };
  let defaultAction = null;
  actions.logs = (<DropdownItem data-cy="session-log-button" onClick={() => props.toggleLogs(name)} color="secondary">
    <FontAwesomeIcon icon={faFileAlt} /> Get logs
  </DropdownItem>);

  if (status !== SessionStatus.stopping) {
    actions.stop = <Fragment>
      <DropdownItem divider />
      <DropdownItem onClick={() => props.stopNotebook(name)}>
        <FontAwesomeIcon icon={faStopCircle} /> Stop
      </DropdownItem>
    </Fragment>;
  }
  if (status === SessionStatus.running) {
    defaultAction = (<Link className="btn btn-secondary text-white" to={props.localUrl}>Open</Link>);
    actions.openExternal = (<DropdownItem href={props.url} target="_blank" >
      <FontAwesomeIcon icon={faExternalLinkAlt} /> Open in new tab
    </DropdownItem>);
  }
  else {
    const classes = { color: "secondary", className: "text-nowrap" };
    defaultAction = (<Button {...classes} onClick={() => props.toggleLogs(name)}>Get logs</Button>);
  }

  return (
    <ButtonWithMenu
      data-cy="sessions-button" className="sessionsButton" size="sm" default={defaultAction} color="secondary">
      {actions.openExternal}
      {actions.logs}
      {actions.stop}
    </ButtonWithMenu>
  );
}, _.isEqual);
NotebookServerRowAction.displayName = "NotebookServerRowAction";

export {
  CheckNotebookIcon, Notebooks, NotebooksDisabled, ServerOptionBoolean, ServerOptionEnum, ServerOptionRange,
  ShowSession, StartNotebookServer, mergeEnumOptions
};

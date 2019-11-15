/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React, { Component, Fragment } from 'react';
import Media from 'react-media';
import { Link } from 'react-router-dom';

import { Form, FormGroup, FormText, Label, Input, Button, ButtonGroup, Row, Col, Table } from 'reactstrap';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { UncontrolledTooltip, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import { Badge } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopCircle, faExternalLinkAlt, faInfoCircle, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faCogs, faCog, faEllipsisV, faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle, faFileAlt, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { StatusHelper } from '../model/Model';
import { NotebooksHelper } from './index'
import { simpleHash } from '../utils/HelperFunctions';
import { Loader, InfoAlert, ExternalLink, JupyterIcon, ThrottledTooltip } from '../utils/UIComponents';
import Time from '../utils/Time';
import Sizes from '../utils/Media';

import './Notebooks.css';

// * Notebooks code * //
class Notebooks extends Component {
  render() {
    const serverNumbers = Object.keys(this.props.notebooks.all).length;
    const loading = this.props.notebooks.fetched ?
      false :
      true;

    return <Row>
      <Col>
        <NotebooksTitle standalone={this.props.standalone} />
        <NotebookServers
          servers={this.props.notebooks.all}
          standalone={this.props.standalone}
          loading={loading}
          stopNotebook={this.props.handlers.stopNotebook}
          fetchLogs={this.props.handlers.fetchLogs}
          toggleLogs={this.props.handlers.toggleLogs}
          logs={this.props.logs}
          scope={this.props.scope} />
        <NotebooksPopup
          servers={serverNumbers}
          standalone={this.props.standalone}
          loading={loading}
          urlNewEnvironment={this.props.urlNewEnvironment}
        />
      </Col>
    </Row>
  }
}

class NotebooksTitle extends Component {
  render() {
    if (this.props.standalone)
      return (<h1>Interactive Environments</h1>);
    return (<h3>Interactive Environments</h3>);
  }
}

class NotebooksPopup extends Component {
  render() {
    if (this.props.servers || this.props.loading)
      return null;

    let suggestion = (<span>
      You can start a new interactive environment from the <i>Environments</i> tab of a project.
    </span>);
    if (!this.props.standalone) {
      let newOutput = "New";
      if (this.props.urlNewEnvironment)
        newOutput = (<Link className="btn btn-primary btn-sm" role="button" to={this.props.urlNewEnvironment}>
          New</Link>);

      suggestion = (<span>
        You can start a new interactive environment by clicking on {newOutput} in the side bar.
      </span>);
    }

    return (
      <InfoAlert timeout={0}>
        <FontAwesomeIcon icon={faInfoCircle} /> {suggestion}
      </InfoAlert>
    );
  }
}

class NotebookServers extends Component {
  render() {
    if (this.props.loading) {
      return <Loader />
    }
    return (
      <Row>
        <Col md={12} lg={10} xl={8}>
          <NotebookServersList {...this.props} />
        </Col>
      </Row>
    )
  }
}

class NotebookServersList extends Component {
  render() {
    const serverNames = Object.keys(this.props.servers);
    if (serverNames.length === 0) {
      return (<p>No currently running environments.</p>);
    }
    const rows = serverNames.map((k, i) => {
      const validAnnotations = Object.keys(this.props.servers[k].annotations)
        .filter(key => key.startsWith("renku.io"))
        .reduce((obj, key) => { obj[key] = this.props.servers[k].annotations[key]; return obj; }, {});

      return (<NotebookServerRow
        key={i}
        stopNotebook={this.props.stopNotebook}
        fetchLogs={this.props.fetchLogs}
        toggleLogs={this.props.toggleLogs}
        logs={this.props.logs}
        scope={this.props.scope}
        standalone={this.props.standalone}
        annotations={validAnnotations}
        name={this.props.servers[k].name}
        status={this.props.servers[k].status}
        url={this.props.servers[k].url}
      />);
    });
    return (
      <Table>
        <thead className="thead-light">
          <NotebookServersHeader scope={this.props.scope} standalone={this.props.standalone} />
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
}

class NotebookServersHeader extends Component {
  render() {
    return (
      <Media query={Sizes.md}>
        { matches =>
          matches ? (
            <NotebookServerHeaderFull {...this.props} />
          ) : (
            <NotebookServerHeaderCompact {...this.props} />
          )
        }
      </Media>
    )
  }
}

class NotebookServerHeaderFull extends Component {
  render() {
    const project = this.props.standalone ?
      <th className="align-middle">Project</th> :
      null;

    return (
      <tr>
        <th className="align-middle" style={{ width: "1px" }}></th>
        {project}
        <th className="align-middle">Branch</th>
        <th className="align-middle">Commit</th>
        <th className="align-middle" style={{ width: "1px" }}>Status</th>
        <th className="align-middle" style={{ width: "1px" }}>Action</th>
      </tr>
    );
  }
}

class NotebookServerHeaderCompact extends Component {
  render() {
    return (<tr><th className="align-middle">List</th></tr>);
  }
}

class NotebookServerRow extends Component {
  render() {
    const annotations = NotebooksHelper.cleanAnnotations(this.props.annotations, "renku.io");
    const status = NotebooksHelper.getStatus(this.props.status);
    const details = {
      message: this.props.status.message,
      reason: this.props.status.reason,
      step: this.props.status.step,
    };
    const uid = "uid_" + simpleHash(annotations["namespace"] + annotations["projectName"]
      + annotations["branch"] + annotations["commit-sha"]);
    const newProps = { annotations, status, details, uid };

    return (
      <Media query={Sizes.md}>
        { matches =>
          matches ? (
            <NotebookServerRowFull {...this.props} {...newProps} />
          ) : (
            <NotebookServerRowCompact {...this.props} {...newProps} />
          )
        }
      </Media>
    );
  }
}

class NotebookServerRowFull extends Component {
  render() {
    const { annotations, details, status, url, uid } = this.props;

    const icon = <td className="align-middle">
      <NotebooksServerRowStatusIcon details={details} status={status} uid={uid} />
    </td>;
    const project = this.props.standalone ?
      (<td className="align-middle"><NotebookServerRowProject annotations={this.props.annotations} /></td>) :
      null;
    const branch = (<td className="align-middle">{annotations["branch"]}</td>);
    const commit = (<td className="align-middle">{annotations["commit-sha"].substring(0, 8)}</td>);
    const statusOut = (<td className="align-middle">
      <NotebooksServerRowStatus details={details} status={status} uid={uid} />
    </td>);
    const action = (<td className="align-middle">
      <NotebookServerRowAction
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
    </td>);

    return (
      <tr>
        {icon}
        {project}
        {branch}
        {commit}
        {statusOut}
        {action}
      </tr>
    );
  }
}

class NotebookServerRowCompact extends Component {
  render() {
    const { annotations, details, status, url, uid } = this.props;

    const icon = <span>
      <NotebooksServerRowStatusIcon details={details} status={status} uid={uid} />
    </span>;
    const project = this.props.standalone ?
      (<Fragment>
        <span className="font-weight-bold">Project: </span>
        <span><NotebookServerRowProject annotations={this.props.annotations} /></span>
        <br />
      </Fragment>) :
      null;
    const branch = (<Fragment>
      <span className="font-weight-bold">Branch: </span>
      <span>{annotations["branch"]}</span>
      <br />
    </Fragment>);
    const commit = (<Fragment>
      <span className="font-weight-bold">Commit: </span>
      <span>{annotations["commit-sha"].substring(0, 8)}</span>
      <br />
    </Fragment>);
    const statusOut = (<span>
      <NotebooksServerRowStatus spaced={true} details={details} status={status} uid={uid} />
    </span>);
    const action = (<span>
      <NotebookServerRowAction
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
      <tr>
        <td>
          {project}
          {branch}
          {commit}
          <div className="d-inline-flex" >
            {icon} &nbsp; {statusOut} &nbsp; {action}
          </div>
        </td>
      </tr>
    );
  }
}

function getStatusObject(status) {
  switch (status) {
  case "running":
    return {
      color: "success",
      icon: <FontAwesomeIcon icon={faCheckCircle} size="lg" />,
      text: "Running"
    }
  case "pending":
    return {
      color: "warning",
      icon: <Loader size="16" inline="true" />,
      text: "Pending"
    }
  case "error":
    return {
      color: "danger",
      icon: <FontAwesomeIcon icon={faTimesCircle} size="lg" />,
      text: "Error"
    }
  default:
    return {
      color: "danger",
      icon: <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />,
      text: "Unknown"
    }
  }
}

class NotebooksServerRowStatus extends Component {
  render() {
    const { status, details, uid } = this.props;
    const data = getStatusObject(status);
    const info = status !== "running" ?
      (<span>
        <FontAwesomeIcon id={uid} style={{color: "#5561A6"}} icon={faInfoCircle} />
        <UncontrolledPopover target={uid} trigger="legacy" placement="bottom">
          <PopoverHeader>Kubernetes pod status</PopoverHeader>
          <PopoverBody>
            <span className="font-weight-bold">Step:</span> <span>{details.step}</span><br />
            <span className="font-weight-bold">Reason:</span> <span>{details.reason}</span><br />
            <span className="font-weight-bold">Message:</span> <span>{details.message}</span><br />
          </PopoverBody>
        </UncontrolledPopover>
      </span>) :
      null;

    return <div className="d-inline-flex">{data.text}&nbsp;{info}</div>;
  }
}

class NotebooksServerRowStatusIcon extends Component {
  render() {
    const { status } = this.props;
    const data = getStatusObject(status);
    const classes = this.props.spaced ?
      "text-nowrap p-1 mb-2" :
      "text-nowrap p-1";

    return (<div>
      <Badge color={data.color} className={classes}>{data.icon}</Badge>
    </div>);
  }
}

class NotebookServerRowProject extends Component {
  render() {
    const { annotations } = this.props;
    const url = `${annotations["namespace"]}/${annotations["projectName"]}`;
    return (<Link to={`/projects/${url}`}>{url}</Link>);
  }
}

class NotebookServerRowAction extends Component {
  render() {
    const { status, name } = this.props;
    const actions = {
      connect: null,
      stop: null,
      logs: null
    };
    let defaultAction = null;
    actions.logs = (<DropdownItem onClick={() => this.props.toggleLogs(name)}>
      <FontAwesomeIcon icon={faFileAlt} /> Get logs
    </DropdownItem>);

    if (status === "running") {
      defaultAction = (<ExternalLink url={this.props.url} title="Connect" />);
      actions.connect = (<DropdownItem href={this.props.url} target="_blank">
        <FontAwesomeIcon icon={faExternalLinkAlt} /> Connect
      </DropdownItem>);
      actions.stop = (<DropdownItem onClick={() => this.props.stopNotebook(name)}>
        <FontAwesomeIcon icon={faStopCircle} /> Stop
      </DropdownItem>);
    }
    else {
      const classes = { color: "primary", className: "text-nowrap" };
      defaultAction = (<Button {...classes} onClick={() => this.props.toggleLogs(name)}>Get logs</Button>);
    }

    return (
      <UncontrolledButtonDropdown size="sm">
        {defaultAction}
        <DropdownToggle color="primary" className="alternateToggleStyle">
          <FontAwesomeIcon icon={faEllipsisV} style={{ color: 'white', backgroundColor: "#5561A6" }} />
        </DropdownToggle>
        <DropdownMenu right={true}>
          {actions.connect}
          {actions.stop}
          {actions.logs}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    );
  }
}

/**
 * Simple environment logs container
 *
 * @param {function} fetchLogs - async function to get logs as an array string
 * @param {function} toggleLogs - toggle logs visibility and fetch logs on show
 * @param {object} logs - log object from redux store enhanced with `show` property
 * @param {string} name - server name
 * @param {object} annotations - list of cleaned annotations
 */
class EnvironmentLogs extends Component {
  save() {
    const elem = document.createElement("a");
    const file = new Blob([this.props.logs.data.join("\n")], { type: "text/plain" });
    elem.href = URL.createObjectURL(file);
    elem.download = `Logs_${this.props.name}.txt`;
    document.body.appendChild(elem);
    elem.click();
  }

  render() {
    const { logs, name, toggleLogs, fetchLogs, annotations } = this.props;
    if (!logs.show || logs.show !== name)
      return null;

    let body;
    if (logs.fetching) {
      body = (<Loader />);
    }
    else {
      if (!logs.fetched) {
        body = (<p>Logs unavailable. Please
          <Button color="primary" onClick={() => { fetchLogs(name) }}>download</Button> them again.
        </p>);
      }
      else {
        if (logs.data && logs.data.length) {
          body = (<pre className="small no-overflow wrap-word">{logs.data.join("\n")}</pre>);
        }
        else {
          body = (<div>
            <p>No logs available for this pod yet.</p>
            <p>You can try to <Button color="primary" onClick={() => { fetchLogs(name) }}>Refresh</Button>
              them after a while.</p>
          </div>);
        }
      }
    }

    return (
      <Modal
        isOpen={logs.show ? true : false}
        className="modal-dynamic-width"
        scrollable={true}
        toggle={() => { toggleLogs(name) }}>
        <ModalHeader toggle={() => { toggleLogs(name) }} className="header-multiline">
          Logs
          <br /><small>{annotations["namespace"]}/{annotations["projectName"]}</small>
          <br /><small>{annotations["branch"]}@{annotations["commit-sha"].substring(0, 8)}</small>
        </ModalHeader>
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => { this.save() }}>
            <FontAwesomeIcon icon={faSave} /> Download
          </Button>
          <Button color="primary" onClick={() => { fetchLogs(name) }}>
            <FontAwesomeIcon icon={faRedo} /> Refresh
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

// * StartNotebookServer code * //
class StartNotebookServer extends Component {
  constructor(props) {
    super(props);
    this.state = { ignorePipeline: null };
  }

  setIgnorePipeline(value) {
    this.setState({ ignorePipeline: value });
  }

  render() {
    const { branch, commit } = this.props.filters;
    const { branches } = this.props.data;
    const { pipelines } = this.props;
    const fetching = {
      branches: StatusHelper.isUpdating(branches) ? true : false,
      pipelines: pipelines.fetching,
      commits: this.props.data.fetching
    }
    let show = {};
    show.commits = !fetching.branches && branch.name ? true : false;
    show.pipelines = show.commits && !fetching.commits && commit.id;
    show.options = show.pipelines && pipelines.fetched && (
      pipelines.main.status === "success" || pipelines.main.status === undefined
      || this.state.ignorePipeline
      || this.props.justStarted
    );

    return (
      <Row>
        <Col sm={12} md={10} lg={8}>
          <h3>Start a new interactive environment</h3>
          <Form>
            <StartNotebookBranches {...this.props} />
            {show.commits ? <StartNotebookCommits {...this.props} /> : null}
            {show.pipelines ? <StartNotebookPipelines {...this.props}
              ignorePipeline={this.state.ignorePipeline}
              setIgnorePipeline={this.setIgnorePipeline.bind(this)} /> : null}
            {show.options ? <StartNotebookOptions {...this.props} /> : null}
          </Form>
        </Col>
      </Row>
    )
  }
}

class StartNotebookBranches extends Component {
  render() {
    const { branches } = this.props.data;
    let content;
    if (StatusHelper.isUpdating(branches)) {
      content = (
        <Label>Updating branches... <Loader size="14" inline="true" /></Label>
      )
    }
    else if (branches.length === 0) {
      content = (
        <React.Fragment>
          <Label>A commit is necessary to start an interactive environment.</Label>
          <InfoAlert timeout={0}>
            <p>You can still do one of the following:</p>
            <ul className="mb-0">
              <li>
                <ExternalLink size="sm" url={`${this.props.externalUrl}`} title="Clone the repository" /> locally
                and add a first commit.
              </li>
              <li className="pt-1">
                <Link className="btn btn-primary btn-sm" role="button" to="/project_new">
                  Create a new project
                </Link> from a non-empty template.
              </li>
            </ul>
          </InfoAlert>
        </React.Fragment>
      );
    }
    else {
      if (branches.length === 1) {
        content = (
          <FormGroup>
            <Label>
              Branch (only 1 available)
              <StartNotebookBranchesUpdate {...this.props} />
              <StartNotebookBranchesOptions {...this.props} />
            </Label>
            <Input type="input" disabled={true}
              id="selectBranch" name="selectBranch"
              value={branches[0].name}>
            </Input>
          </FormGroup>
        )
      }
      else {
        const filter = !this.props.filters.includeMergedBranches;
        const filteredBranches = filter ?
          branches.filter(branch => !branch.merged ? branch : null) :
          branches;
        let branchOptions = filteredBranches.map((branch, index) => {
          return <option key={index} value={branch.name}>{branch.name}</option>
        });
        content = (
          <FormGroup>
            <Label>
              Branch
              <StartNotebookBranchesUpdate {...this.props} />
              <StartNotebookBranchesOptions {...this.props} />
            </Label>
            <Input type="select" id="selectBranch" name="selectBranch"
              value={this.props.filters.branch.name ? this.props.filters.branch.name : ""}
              onChange={(event) => { this.props.handlers.setBranch(event.target.value) }}>
              <option disabled hidden></option>
              {branchOptions}
            </Input>
          </FormGroup>
        )
      }
    }
    return (
      <FormGroup>
        {content}
      </FormGroup>
    );
  }
}

class StartNotebookBranchesUpdate extends Component {
  render() {
    return [
      <Button key="button" className="ml-2 p-0" color="link" size="sm"
        id="branchUpdateButton"
        onClick={this.props.handlers.refreshBranches}>
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="branchUpdateButton">
        Refresh branches
      </UncontrolledTooltip>
    ]
  }
}

class StartNotebookBranchesOptions extends Component {
  render() {
    return [
      <Button key="button" className="ml-2 p-0" color="link" size="sm"
        id="branchOptionsButton"
        onClick={() => { }}>
        <FontAwesomeIcon icon={faCogs} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="branchOptionsButton">
        Branch options
      </UncontrolledTooltip>,
      <UncontrolledPopover key="popover" trigger="legacy" placement="top" target="branchOptionsButton">
        <PopoverHeader>Branch options</PopoverHeader>
        <PopoverBody>
          <FormGroup check>
            <Label check>
              <Input type="checkbox" id="myCheckbox"
                checked={this.props.filters.includeMergedBranches}
                onChange={this.props.handlers.toggleMergedBranches} />
              Include merged branches
            </Label>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>
    ]
  }
}

class StartNotebookPipelines extends Component {
  constructor(props) {
    super(props);
    this.state = { justTriggered: false };
  }

  async retriggerPipeline() {
    this.setState({ justTriggered: true });
    await this.props.handlers.retriggerPipeline();
    this.setState({ justTriggered: false });
  }

  render() {
    if (!this.props.pipelines.fetched)
      return (<Label>Checking Docker image status... <Loader size="14" inline="true" /></Label>);
    if (this.state.justTriggered)
      return (<Label>Triggering Docker image build... <Loader size="14" inline="true" /></Label>);

    return (
      <FormGroup>
        <StartNotebookPipelinesBadge {...this.props} />
        <StartNotebookPipelinesContent {...this.props} buildAgain={this.retriggerPipeline.bind(this)} />
      </FormGroup>
    );
  }
}

class StartNotebookPipelinesBadge extends Component {
  render() {
    const pipeline = this.props.pipelines.main;
    let color, text;
    if (pipeline.status === "success") {
      color = "success";
      text = "available";
    }
    else if (pipeline.status === undefined) {
      color = "danger";
      text = "not available";
    }
    else if (pipeline.status === "running" || pipeline.status === "pending") {
      color = "warning";
      text = "building";
    }
    else {
      color = "danger";
      text = "error";
    }

    return (<p>Docker Image <Badge color={color}>{text}</Badge></p>);
  }
}

class StartNotebookPipelinesContent extends Component {
  render() {
    const pipeline = this.props.pipelines.main;
    if (pipeline.status === "success")
      return null;

    let content = null;
    if (pipeline.status === "running" || pipeline.status === "pending") {
      content = (
        <Label>
          <FontAwesomeIcon icon={faCog} spin /> The Docker image for the environment is being built.
          Please wait a moment...
          <FormText color="primary">
            <a href={pipeline.web_url} target="_blank" rel="noreferrer noopener">
              <FontAwesomeIcon icon={faExternalLinkAlt} /> View pipeline in GitLab.
            </a>
          </FormText>
        </Label>
      );
    }
    else if (pipeline.status === "failed" || pipeline.status === "canceled") {
      let actions;
      if (this.props.ignorePipeline || this.props.justStarted) {
        actions = (
          <div>
            <FormText color="text">
              The base image will be used instead. This may work fine, but it may lead to unexpected errors.
            </FormText>
            <FormText color="primary">
              <a href={pipeline.web_url} target="_blank" rel="noreferrer noopener">
                <FontAwesomeIcon icon={faExternalLinkAlt} /> View pipeline in GitLab.
              </a>
            </FormText>
          </div>
        );
      }
      else {
        actions = (
          <div>
            <Button color="primary" size="sm" className="mb-1" id="image_build_again"
              onClick={this.props.buildAgain}>
              <FontAwesomeIcon icon={faRedo} /> Build again
            </Button>
            <UncontrolledPopover trigger="hover" placement="top" target="image_build_again">
              <PopoverBody>Try this if it is the first time you see this error for this commit.</PopoverBody>
            </UncontrolledPopover>
            &nbsp;
            <Button color="primary" size="sm" className="mb-1" id="image_ignore"
              onClick={() => { this.props.setIgnorePipeline(true) }}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Ignore
            </Button>
            <UncontrolledPopover trigger="hover" placement="top" target="image_ignore">
              <PopoverBody>
                The base image will be used instead.
                <br /><FontAwesomeIcon icon={faExclamationTriangle} /> This may work fine, but it may lead
                to unexpected errors.
              </PopoverBody>
            </UncontrolledPopover>
            &nbsp;
            <a className="btn btn-primary btn-sm mb-1" target="_blank" rel="noopener noreferrer"
              href={pipeline.web_url} id="image_check_pipeline">
              <FontAwesomeIcon icon={faExternalLinkAlt} /> View pipeline in GitLab
            </a>
            <UncontrolledPopover trigger="hover" placement="top" target="image_check_pipeline">
              <PopoverBody>Check the GitLab pipeline. For expert users.</PopoverBody>
            </UncontrolledPopover>
          </div>
        );
      }
      content = (
        <div>
          <Label key="message">
            <FontAwesomeIcon icon={faExclamationTriangle} color="red" /> The Docker image build failed.
          </Label>
          {actions}
        </div>
      );
    }
    else if (pipeline.status === undefined) {
      content = (
        <Label>
          <FontAwesomeIcon icon={faExclamationTriangle} /> The base image will be used instead. This may
          work fine, but it may lead to unexpected errors.
        </Label>
      );
    }
    else {
      content = (<Label>Unexpected state, we cannot check the Docker image availability.</Label>);
    }

    return (<div>{content}</div>);
  }
}

class StartNotebookCommits extends Component {
  render() {
    const { commits, fetching } = this.props.data;
    if (fetching)
      return (<Label>Updating commits... <Loader size="14" inline="true" /></Label>);

    const { displayedCommits } = this.props.filters;
    const filteredCommits = displayedCommits && displayedCommits > 0 ?
      commits.slice(0, displayedCommits) :
      commits;
    const commitOptions = filteredCommits.map((commit) => {
      return <option key={commit.id} value={commit.id}>
        {commit.short_id} - {commit.author_name} - {Time.toIsoTimezoneString(commit.committed_date)}
      </option>
    });
    return (
      <FormGroup>
        <Label>
          Commit
          <StartNotebookCommitsUpdate {...this.props} />
          <StartNotebookCommitsOptions {...this.props} />
        </Label>
        <Input type="select" id="selectCommit" name="selectCommit"
          value={this.props.filters.commit.id ? this.props.filters.commit.id : ""}
          onChange={(event) => { this.props.handlers.setCommit(event.target.value)}}>
          <option disabled hidden></option>
          {commitOptions}
        </Input>
      </FormGroup>
    )
  }
}

class StartNotebookCommitsUpdate extends Component {
  render() {
    return [
      <Button key="button" className="ml-2 p-0" color="link" size="sm"
        id="commitUpdateButton"
        onClick={this.props.handlers.refreshCommits}>
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="commitUpdateButton">
        Refresh commits
      </UncontrolledTooltip>
    ]
  }
}

class StartNotebookCommitsOptions extends Component {
  render() {
    return [
      <Button key="button" className="ml-2 p-0" color="link" size="sm"
        id="commitOptionsButton"
        onClick={() => { }}>
        <FontAwesomeIcon icon={faCogs} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="commitOptionsButton">
        Commit options
      </UncontrolledTooltip>,
      <UncontrolledPopover key="popover" trigger="legacy" placement="top" target="commitOptionsButton">
        <PopoverHeader>Commit options</PopoverHeader>
        <PopoverBody>
          <FormGroup>
            <Label>Number of commits to display</Label>
            <Input type="number" min={0} max={100} step={1}
              onChange={(event) => { this.props.handlers.setDisplayedCommits(event.target.value) }}
              value={this.props.filters.displayedCommits} />
            <FormText>1-100, 0 for unlimited</FormText>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>
    ]
  }
}

class StartNotebookOptions extends Component {
  render() {
    const { justStarted } = this.props;
    if (justStarted) {
      return <Label>Starting a new interactive environment... <Loader size="14" inline="true" /></Label>
    }

    const { fetched, options, all } = this.props.notebooks;
    if (!fetched) {
      return (<Label>Verifying available environments... <Loader size="14" inline="true" /></Label>);
    }
    if (Object.keys(options).length === 0) {
      return (<Label>Loading environment parameters... <Loader size="14" inline="true" /></Label>);
    }
    if (Object.keys(all).length === 1) {
      return (<StartNotebookOptionsRunning {...this.props} />);
    }
    else {
      return [
        <StartNotebookServerOptions key="options" {...this.props} />,
        <ServerOptionLaunch key="button" {...this.props} />
      ];
    }
  }
}

class StartNotebookOptionsRunning extends Component {
  render() {
    const { all } = this.props.notebooks;
    const notebook = all[Object.keys(all)[0]];
    const status = NotebooksHelper.getStatus(notebook.status);
    if (status === "running") {
      return (
        <FormGroup>
          <Label>An interactive environment is already running.</Label>
          <br />
          <ExternalLink url={notebook.url} title="Connect" />
        </FormGroup>
      );
    }
    else if (status === "pending") {
      return (
        <FormGroup>
          <Label>An interactive environment for this commit is starting or terminating, please wait...</Label>
        </FormGroup>
      );
    }
    else {
      return (
        <FormGroup>
          <Label>
            An interactive environment is already running but it is currently not available.
            You can get further details from the Environments page.
          </Label>
        </FormGroup>
      );
    }
  }
}

class StartNotebookServerOptions extends Component {
  render() {
    const { options } = this.props.notebooks;
    const selectedOptions = this.props.filters.options;
    const sortedOptionKeys = Object.keys(options)
      .sort((a, b) => parseInt(options[a].order) - parseInt(options[b].order));
    const renderedServerOptions = sortedOptionKeys
      .filter(key => key !== "commitId")
      .map(key => {
        const serverOption = { ...options[key], selected: selectedOptions[key] };
        const onChange = (event, value) => {
          this.props.handlers.setServerOption(key, event, value);
        };

        switch (serverOption.type) {
        case 'enum':
          return <FormGroup key={key} className={serverOption.options.length === 1 ? 'mb-0' : ''}>
            <Label>{serverOption.displayName}</Label>
            <ServerOptionEnum {...serverOption} onChange={onChange} />
          </FormGroup>;

        case 'int':
          return <FormGroup key={key}>
            <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
            <ServerOptionRange step={1} {...serverOption} onChange={onChange} />
          </FormGroup>;

        case 'float':
          return <FormGroup key={key}>
            <Label>{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
            <ServerOptionRange step={0.01} {...serverOption} onChange={onChange} />
          </FormGroup>;

        case 'boolean':
          return <FormGroup key={key} check>
            <ServerOptionBoolean {...serverOption} onChange={onChange} />
            <Label>{`${serverOption.displayName}`}</Label>
          </FormGroup>;

        default:
          return null;
        }
      });
    return renderedServerOptions.length ?
      renderedServerOptions :
      <label>Notebook options not avilable</label>;
  }
}

class ServerOptionEnum extends Component {
  render() {
    const { selected } = this.props;

    if (this.props.options.length === 1)
      return (<label>: {this.props.selected}</label>);

    return (
      <div>
        <ButtonGroup>
          {this.props.options.map((optionName, i) => {
            const color = optionName === selected ? "primary" : "outline-primary";
            return (
              <Button
                color={color}
                key={optionName}
                onClick={event => this.props.onChange(event, optionName)}>{optionName}</Button>
            );
          })}
        </ButtonGroup>
      </div>
    );
  }
}

class ServerOptionBoolean extends Component {
  render() {
    return (
      <Input
        type="checkbox"
        id={this.props.id}
        value={this.props.selected}
        onChange={this.props.onChange}
      />
    );
  }
}

class ServerOptionRange extends Component {
  render() {
    return (
      <Input
        type="range"
        id={this.props.id}
        value={this.props.selected}
        onChange={this.props.onChange}
        min={this.props.range[0]}
        max={this.props.range[1]}
        step={this.props.step}
      />
    );
  }
}

class ServerOptionLaunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      current: {}
    };

    this.checkServer = this.checkServer.bind(this);
    this.toggleModal = this.toggleModal.bind(this)
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  checkServer() {
    const { filters } = this.props;
    const { autosaved } = this.props.data;
    const current = autosaved.filter(c =>
      c.autosave.branch === filters.branch.name && c.autosave.commit === filters.commit.id.substr(0, 7));
    if (current.length > 0) {
      this.setState({ current: current[0] });
      this.toggleModal();
    }
    else {
      this.props.handlers.startServer();
    }
  }

  render() {
    return [
      <Button key="button" color="primary" onClick={this.checkServer}>
        Start environment
      </Button>,
      <AutosavedDataModal key="modal"
        toggleModal={this.toggleModal.bind(this)}
        showModal={this.state.showModal}
        currentBranch={this.state.current}
        {...this.props}
      />
    ];
  }
}

class AutosavedDataModal extends Component {
  render() {
    const url = this.props.currentBranch && this.props.currentBranch.autosave ?
      this.props.currentBranch.autosave.url :
      "#";
    return <div>
      <Modal
        isOpen={this.props.showModal}
        toggle={this.props.toggleModal}>
        <ModalHeader toggle={this.props.toggleModal}>Autosaved data</ModalHeader>
        <ModalBody>
          <p>
            Renku has
            recovered <a href={url} target="_blank" rel="noreferrer noopener">unsaved work</a> for
            the <i>{this.props.filters.branch.name}</i> branch. We will automatically restore this
            content so you do not lose any work.
          </p>
          <p>
            Please refer to
            this <a href="https://renku.readthedocs.io/en/latest/user/autosave.html"
              target="_blank" rel="noreferrer noopener">documentation page</a> to
            get further information.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.props.handlers.startServer}>Launch environment</Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}

// * CheckNotebookIcon code * //
class CheckNotebookIcon extends Component {
  render() {
    const { fetched, notebook } = this.props;
    if (!fetched)
      return (<Loader size="16" inline="true" />);

    let tooltip, link, icon;
    if (notebook) {
      const status = NotebooksHelper.getStatus(notebook.status);
      if (status === "running") {
        tooltip = "Connect to JupyterLab";
        icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" />);
        const url = `${notebook.url}lab/tree/${this.props.filePath}`;
        link = (<a href={url} role="button" target="_blank" rel="noreferrer noopener">{icon}</a>);
      }
      else if (status === "pending") {
        tooltip = "Interactive environment status is changing, please wait...";
        icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" greyscale={true} />);
        link = (<span>{icon}</span>);
      }
      else {
        tooltip = "Check interactive environment status";
        icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" greyscale={true} />);
        link = (<Link to={this.props.launchNotebookUrl}>{icon}</Link>);
      }
    }
    else {
      tooltip = "Start an interactive environment";
      icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" greyscale={true} />);
      link = (<Link to={this.props.launchNotebookUrl}>{icon}</Link>);
    }

    return (
      <React.Fragment>
        <span id="checkNotebookIcon">{link}</span>
        <ThrottledTooltip target="checkNotebookIcon" tooltip={tooltip} />
      </React.Fragment>
    );
  }
}

export { Notebooks, StartNotebookServer, CheckNotebookIcon }

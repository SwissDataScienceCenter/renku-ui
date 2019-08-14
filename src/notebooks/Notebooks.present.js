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

import React, { Component } from 'react';
import Media from 'react-media';
import { Link } from 'react-router-dom';

import { Form, FormGroup, FormText, Label, Input, Button, Row, Col, Table } from 'reactstrap';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { UncontrolledTooltip, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faStopCircle, faExternalLinkAlt, faInfoCircle, faSyncAlt, faCogs } from '@fortawesome/fontawesome-free-solid';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { StatusHelper } from '../model/Model';
import { NotebooksHelper } from './index'
import { Loader, InfoAlert, ExternalLink } from '../utils/UIComponents';
import Time from '../utils/Time';
import Sizes from '../utils/Media';


const Columns = {
  large: {
    default: ["Project", "Commit", "Action"],
    project: ["Branch", "Commit", "Action"]
  },
  compact: {
    default: ["List"],
    project: ["List"],
  }
};

// * Notebooks code * //
class Notebooks extends Component {
  render() {
    const { standalone, loading } = this.props;
    let title, popup = null;
    if (standalone) {
      title = (<h1>Notebooks</h1>);
      if (!loading) {
        const serverNumbers = Object.keys(this.props.notebooks.all).length;
        if (serverNumbers)
          popup = (<NotebooksPopup servers={serverNumbers} />);
      }
    }

    return <Row>
      <Col>
        {title}
        <NotebookServers
          servers={this.props.notebooks.all}
          loading={this.props.notebooks.fetched ? false : true}
          stopNotebook={this.props.handlers.stopNotebook}
          scope={this.props.scope}
        />
        {popup}
      </Col>
    </Row>
  }
}

class NotebooksPopup extends Component {
  render() {
    if (this.props.servers) {
      return null;
    }
    return (
      <InfoAlert timeout={0}>
        <FontAwesomeIcon icon={faInfoCircle} /> You can start a new notebook by navigating to a project page.
        <br />Be sure to have at least Developer privileges, then open the Notebook Servers tab.
      </InfoAlert>
    )
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
      return <p>No server is currently running. You have to start one to connect to Jupyter.</p>
    }
    const rows = serverNames.map((k, i) =>
      <NotebookServerRow
        key={i}
        stopNotebook={this.props.stopNotebook}
        scope={this.props.scope}
        {...this.props.servers[k]}
      />
    )
    return (
      <Table bordered>
        <NotebookServersHeader scope={this.props.scope} />
        <tbody>
          {rows}
        </tbody>
      </Table>
    )
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
    const columns = this.props.scope && this.props.scope.project ?
      Columns.large.project :
      Columns.large.default
    return (
      <thead className="thead-light">
        <tr>
          <th className="align-middle">{columns[0]}</th>
          <th className="align-middle">{columns[1]}</th>
          <th className="align-middle" style={{ width: "1px" }}>{columns[2]}</th>
        </tr>
      </thead>
    )
  }
}

class NotebookServerHeaderCompact extends Component {
  render() {
    const columns = this.props.scope && this.props.scope.project ?
      Columns.compact.project :
      Columns.compact.default
    return (
      <thead className="thead-light">
        <tr>
          <th className="align-middle">{columns[0]}</th>
        </tr>
      </thead>
    )
  }
}

class NotebookServerRow extends Component {
  render() {
    const annotations = NotebooksHelper.cleanAnnotations(this.props.annotations, "renku.io");
    const status = NotebooksHelper.getStatus(this.props.status);

    return (
      <Media query={Sizes.md}>
        { matches =>
          matches ? (
            <NotebookServerRowFull
              {...this.props} status={status} annotations={annotations} />
          ) : (
            <NotebookServerRowCompact
              {...this.props} status={status} annotations={annotations} />
          )
        }
      </Media>
    )
  }
}

class NotebookServerRowFull extends Component {
  render() {
    const { annotations, status, url } = this.props;
    let columns;
    if (this.props.scope && this.props.scope.project) {
      columns = [annotations["branch"], annotations["commit-sha"].substring(0, 8)];
    }
    else {
      const projectLink = <NotebookServerRowProject
        display={`${annotations["namespace"]}/${annotations["projectName"]}`}
        id={annotations["projectId"]}
      />
      columns = [projectLink, `${annotations["branch"]}/${annotations["commit-sha"].substring(0, 8)}`];
    }
    return (
      <tr>
        <td className="align-middle">
          {columns[0]}
        </td>
        <td className="align-middle">
          {columns[1]}
        </td>
        <td className="align-middle">
          <NotebookServerRowAction
            status={status}
            name={this.props.name}
            stopNotebook={this.props.stopNotebook}
            url={url}
          />
        </td>
      </tr>
    )
  }
}

class NotebookServerRowCompact extends Component {
  render() {
    const { annotations, status, scope, url } = this.props;
    let rowsHeader, rows;
    if (scope && scope.project) {
      rowsHeader = Columns.large.project;
      rows = [annotations["branch"], annotations["commit-sha"].substring(0, 8)];
    }
    else {
      rowsHeader = Columns.large.default;
      const projectLink = <NotebookServerRowProject
        display={`${annotations["namespace"]}/${annotations["projectName"]}`}
        id={annotations["projectId"]}
      />
      rows = [projectLink, `${annotations["branch"]}/${annotations["commit-sha"].substring(0, 8)}`];
    }

    return (
      <tr>
        <td>
          <span className="font-weight-bold">{rowsHeader[0]}: </span>
          <br className="d-sm-none" />
          <span>{rows[0]}</span>
          <br />
          <span className="font-weight-bold">{rowsHeader[1]}: </span>
          <br className="d-sm-none" />
          <span>{rows[1]}</span>
          <br />
          <NotebookServerRowAction
            status={status}
            name={this.props.name}
            stopNotebook={this.props.stopNotebook}
            url={url}
            small={true}
          />
        </td>
      </tr>
    )
  }
}

class NotebookServerRowProject extends Component {
  render() {
    return (
      <Link to={`/projects/${this.props.id}`}>
        {this.props.display}
      </Link>
    )
  }
}

class NotebookServerRowAction extends Component {
  render() {
    const { status, name } = this.props;
    let color, statusText, interactive;
    switch (status) {
    case "running":
      color = "success";
      statusText = "Running";
      interactive = true;
      break;
    case "pending":
      color = "warning";
      statusText = "Pending";
      interactive = false;
      break;
    case "error":
      color = "danger";
      statusText = "Error";
      interactive = false;
      break;
    default:
      color = "danger";
      statusText = "Unknown";
      interactive = false;
    }
    const size = this.props.small ? "sm" : "";

    if (interactive) {
      return (
        <UncontrolledButtonDropdown>
          <DropdownToggle caret color={color} disabled={!interactive} size={size}>
            {statusText}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem href={this.props.url} target="_blank">
              <FontAwesomeIcon icon={faExternalLinkAlt} /> Connect
            </DropdownItem>
            <DropdownItem onClick={() => this.props.stopNotebook(name)}>
              <FontAwesomeIcon icon={faStopCircle} /> Stop
            </DropdownItem>
            {/* TODO */}
            {/* <DropdownItem divider /> */}
            {/* <DropdownItem disabled>View Logs</DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      )
    }
    else {
      return (
        <div>
          <Button className="d-flex" color={color} disabled size={size}>
            {statusText}
            <Loader size="14" inline="true" margin="1" />
          </Button>
        </div>
      )
    }
  }
}


// * StartNotebookServer code * //
class StartNotebookServer extends Component {
  render() {
    const { branch, commit } = this.props.filters;
    const { branches } = this.props.data;
    const fetching = {
      branches: StatusHelper.isUpdating(branches) ? true : false,
      commits: this.props.data.fetching
    }
    const show = {
      commits: !fetching.branches && branch.name ? true : false,
      options: !fetching.branches && branch.name && !fetching.commits && commit.id
    }

    return (
      <Row>
        <Col xs={12} sm={10} md={8} lg={6}>
          <h3>Start new JupyterLab server</h3>
          <Form>
            <StartNotebookBranches {...this.props} />
            {show.commits ? <StartNotebookCommits {...this.props} /> : null}
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
    if (StatusHelper.isUpdating(branches) || branches.length === 0) {
      content = (
        <Label>Updating branches... <Loader size="14" inline="true" /></Label>
      )
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
    )
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
        {commit.short_id} - {commit.author_name} - {Time.toISOString(commit.committed_date)}
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
      return <Label>Starting new JupyterLab server... <Loader size="14" inline="true" /></Label>
    }

    const { fetched, options, all } = this.props.notebooks;
    if (!fetched) {
      return (<Label>Verifying running servers... <Loader size="14" inline="true" /></Label>);
    }
    if (Object.keys(options).length === 0) {
      return (<Label>Loading notebooks parameters... <Loader size="14" inline="true" /></Label>);
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
          <Label>A JupyterLab server is already running.</Label>
          <br />
          <ExternalLink url={notebook.url} title="Connect" />
        </FormGroup>
      );
    }
    else if (status === "pending") {
      return (
        <FormGroup>
          <Label>A JupyterLab server for this commit is starting or terminating, please wait...</Label>
        </FormGroup>
      );
    }
    else {
      return (
        <FormGroup>
          <Label>
            A JupyterLab server is already running but it is currently not available.
            You can get further details from the Notebooks page.
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
    const renderedServerOptions = Object.keys(options)
      .filter(key => key !== "commitId")
      .map(key => {
        const serverOption = { ...options[key], selected: selectedOptions[key] };
        const onChange = (event) => {
          this.props.handlers.setServerOption(key, event);
        };

        switch (serverOption.type) {
        case 'enum':
          return <FormGroup key={key}>
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
    return (
      <Input type="select" id={this.props.id} onChange={this.props.onChange}>
        {this.props.options.map((optionName, i) => {
          return <option key={i} value={optionName}>{optionName}</option>
        })}
      </Input>
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
        Launch Server
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
          <Button color="primary" onClick={this.props.handlers.startServer}>Launch Server</Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}

export { Notebooks, StartNotebookServer }

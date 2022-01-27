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

import React, { Component, Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Button, ButtonGroup, Col, Collapse, DropdownItem, Form, FormGroup, FormText, Input, Label,
  Modal, ModalBody, ModalFooter, ModalHeader, PopoverBody, PopoverHeader, Progress,
  Row, Table, UncontrolledPopover, UncontrolledTooltip
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook, faCog, faCogs, faExclamationTriangle,
  faInfoCircle, faLink, faRedo, faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";

import { StatusHelper } from "../model/Model";
import { InfoAlert, SuccessAlert, WarnAlert } from "../utils/components/Alert";
import { ButtonWithMenu } from "../utils/components/Button";
import { Clipboard } from "../utils/components/Clipboard";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { JupyterIcon } from "../utils/components/Icon";
import { Loader } from "../utils/components/Loader";
import { ThrottledTooltip } from "../utils/components/Tooltip";
import { Url } from "../utils/helpers/url";
import Time from "../utils/helpers/Time";
import { NotebooksHelper } from "./index";
import { ObjectStoresConfigurationButton, ObjectStoresConfigurationModal } from "./ObjectStoresConfig.present";

// * StartNotebookServer code * //
function StartNotebookServer(props) {
  const { autosaves, autoStarting, pipelines, message, showObjectStoreModal } = props;
  const { branch, commit } = props.filters;
  const { objectStoresConfiguration } = props.filters;
  const { deleteAutosave, setCommit, setIgnorePipeline, toggleShowAdvanced } = props.handlers;
  const { toggleShowObjectStoresConfigModal } = props.handlers;


  if (autoStarting)
    return (<StartNotebookAutostart {...props} />);

  const fetching = {
    autosaves: autosaves.fetching,
    branches: StatusHelper.isUpdating(props.fetchingBranches) ? true : false,
    pipelines: pipelines.fetching,
    commits: props.data.fetching
  };

  let show = {};
  show.commits = !autosaves.fetching && !fetching.branches && branch.name ? true : false;
  show.pipelines = show.commits && !fetching.commits && commit && commit.id;
  show.options = show.pipelines && pipelines.fetched && autosaves.fetched;

  const messageOutput = message ?
    (<div key="message">{message}</div>) :
    null;
  const disabled = fetching.branches || fetching.commits;
  const s3MountsConfig = props.options.global.cloudstorage?.s3;
  const cloudStorageAvailable = s3MountsConfig?.enabled ?? false;
  const showAdvancedMessage = cloudStorageAvailable ?
    "Do you want to select the branch, commit, or image, or configure cloud storage?" :
    "Do you want to select the branch, commit, or image?";

  const buttonMessage = props.showAdvanced ?
    "Hide advanced settings" :
    showAdvancedMessage;

  const advancedSelection = (
    <Fragment>
      <Collapse isOpen={props.showAdvanced}>
        <AutosavesInfoAlert autosaves={autosaves} autosavesId={props.autosavesCommit}
          currentId={props.filters.commit?.id} deleteAutosave={deleteAutosave} setCommit={setCommit} />
        <StartNotebookBranches {...props} disabled={disabled} />
        {show.commits ? <StartNotebookCommits {...props} disabled={disabled} /> : null}
        {show.pipelines ? <StartNotebookPipelines {...props}
          ignorePipeline={props.ignorePipeline}
          setIgnorePipeline={setIgnorePipeline} /> : null}
        {cloudStorageAvailable ?
          <Fragment>
            <ObjectStoresConfigurationButton
              objectStoresConfiguration={objectStoresConfiguration}
              toggleShowObjectStoresConfigModal={toggleShowObjectStoresConfigModal} />
            <ObjectStoresConfigurationModal
              objectStoresConfiguration={objectStoresConfiguration}
              showObjectStoreModal={showObjectStoreModal}
              toggleShowObjectStoresConfigModal={toggleShowObjectStoresConfigModal}
              setObjectStoresConfiguration={props.handlers.setObjectStoresConfiguration} />
          </Fragment> :
          null
        }
      </Collapse>
      <FormGroup>
        <Button color="link" className="ps-0 pe-0 pt-2 font-italic btn-sm"
          onClick={() => { toggleShowAdvanced(); }}>
          {buttonMessage}
        </Button>
      </FormGroup>
    </Fragment>
  );

  const options = show.options ?
    (<StartNotebookOptions toggleShowAdvanced={toggleShowAdvanced} showAdvanced={props.showAdvanced} {...props} />) :
    null;

  const loader = autosaves.fetching || !show.options ?
    (
      <div>
        <p>Checking sessions status...</p>
        <Loader />
      </div>
    ) :
    null;

  return (
    <Row>
      <Col sm={12} md={10} lg={8}>
        <h3>Start a new session</h3>
        <LaunchErrorAlert autosaves={autosaves} launchError={props.launchError} pipelines={props.pipelines} />
        {messageOutput}
        <Form>
          {advancedSelection}
          {options}
          {loader}
        </Form>
      </Col>
    </Row>
  );
}

function AutosavesInfoAlert({ autosaves, autosavesId, currentId, deleteAutosave, setCommit }) {
  const [deleteOngoing, setDeleteOngoing] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // Return when autosaves data are not available
  if (!autosaves?.fetched || autosaves?.fetching)
    return null;

  // Temporary store data when deleting autosaves to keep track of ongoing actions or failures
  const deleteCurrentAutosave = async () => {
    if (deleteResult != null)
      setDeleteResult(null);
    setDeleteOngoing(true);

    // find the autosave name
    const targetAutosave = autosaves.list.find(a => autosavesId.startsWith(a.commit));
    const deleteOutcome = await deleteAutosave(targetAutosave.name);
    setDeleteResult(deleteOutcome);
    setDeleteOngoing(false);
  };

  // Manage ongoing or recently finished actions
  if (deleteOngoing) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        Deleting the autosave... <Loader size="14" inline="true" />
      </InfoAlert>
    );
  }

  if (deleteResult === true)
    return (<SuccessAlert>Autosave successfully deleted.</SuccessAlert>);

  if (deleteResult === false) {
    return (
      <WarnAlert timeout={0}>
        <p>Could not delete the autosave.</p>
        <p className="mb-0">
          You might{" "}
          <Button size="sm" color="warning" onClick={() => window.location.reload()}>refresh the page</Button>
          {" "}and try again. The autosave may have been deleted in another session.
        </p>
      </WarnAlert>
    );
  }

  // Return when there are no relevant autosaves
  if (!currentId || !autosavesId)
    return null;

  // Show autosaves info
  if (autosavesId === currentId) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p>
          There is unsaved work from your last session which will be restored.
          If you do not wish to keep it, you can{" "}
          <Button color="info" size="sm" onClick={() => deleteCurrentAutosave()}>delete the autosave</Button>.
        </p>
        <p className="mb-0">
          For more options, start a session and look at the session cheatsheet,
          which is available under this icon <FontAwesomeIcon className="cursor-default" icon={faBook} />.
        </p>
      </InfoAlert>
    );
  }
  return (
    <WarnAlert dismissible={false} timeout={0}>
      <p>
        There is unsaved work left from your last session.<br />
        Starting a session on a different commit will discard any unsaved work.
      </p>
      <p className="mb-0">
        You can{" "}
        <Button color="warning" size="sm" onClick={() => setCommit(autosavesId)}>restore the autosave</Button>
        {" "}to start from there instead.
      </p>
    </WarnAlert>
  );
}

function StartNotebookAutostart(props) {
  const { data, notebooks, options, pipelines } = props;
  const fetching = {
    data: data.fetched,
    options: options.fetched,
    pipelines: pipelines.fetched
  };

  // Compute fetching status, but ignore notebooks.fetched since it may be unreliable
  let fetched = Object.keys(fetching).filter(k => fetching[k] ? true : false);
  if (!notebooks.fetched)
    fetched = false;
  const multiplier = Object.keys(fetching).length + 1;
  let progress = fetched.length * 100 / multiplier;
  let message = "Checking project data";
  if (fetching.pipelines)
    message = "Checking GitLab jobs";
  else if (fetching.options)
    message = "Checking RenkuLab status";
  else if (fetching.notebooks)
    message = "Checking existing sessions";
  return (
    <div>
      <h3>Starting session</h3>
      <p>{message}...</p>
      <Progress value={progress} />
    </div>
  );
}

class StartNotebookBranches extends Component {
  render() {
    const { branches } = this.props.data;
    const { disabled } = this.props;
    let content;
    if (StatusHelper.isUpdating(this.props.fetchingBranches)) {
      content = (
        <Label>Updating branches... <Loader size="14" inline="true" /></Label>
      );
    }
    else if (branches.length === 0) {
      content = (
        <React.Fragment>
          <Label>A commit is necessary to start a session.</Label>
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
        );
      }
      else {
        const filter = !this.props.filters.includeMergedBranches;
        const filteredBranches = filter ?
          branches.filter(branch => !branch.merged ? branch : null) :
          branches;
        let branchOptions = filteredBranches.map((branch, index) => {
          return <option key={index} value={branch.name}>{branch.name}</option>;
        });
        content = (
          <FormGroup>
            <Label>
              Branch
              <StartNotebookBranchesUpdate {...this.props} />
              <StartNotebookBranchesOptions {...this.props} />
            </Label>
            <Input type="select" id="selectBranch" name="selectBranch" disabled={disabled}
              value={this.props.filters.branch.name ? this.props.filters.branch.name : ""}
              onChange={(event) => { this.props.handlers.setBranch(event.target.value); }}>
              <option disabled hidden></option>
              {branchOptions}
            </Input>
          </FormGroup>
        );
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
      <Button key="button" className="ms-2 p-0" color="link" size="sm"
        id="branchUpdateButton" disabled={this.props.disabled}
        onClick={this.props.handlers.refreshBranches}>
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="branchUpdateButton">
        Refresh branches
      </UncontrolledTooltip>
    ];
  }
}

class StartNotebookBranchesOptions extends Component {
  render() {
    return [
      <Button key="button" className="ms-2 p-0" color="link" size="sm"
        id="branchOptionsButton" disabled={this.props.disabled}
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
    ];
  }
}

class StartNotebookPipelines extends Component {
  constructor(props) {
    super(props);
    this.state = { justTriggered: false, showInfo: false };
  }

  async reTriggerPipeline() {
    this.setState({ justTriggered: true });
    await this.props.handlers.reTriggerPipeline();
    this.setState({ justTriggered: false });
  }

  async runPipeline() {
    this.setState({ justTriggered: true });
    await this.props.handlers.runPipeline();
    this.setState({ justTriggered: false });
  }

  toggleInfo() {
    this.setState({ showInfo: !this.state.showInfo });
  }

  render() {
    if (!this.props.pipelines.fetched)
      return (<Label>Checking Docker image status... <Loader size="14" inline="true" /></Label>);
    if (this.state.justTriggered)
      return (<Label>Triggering Docker image build... <Loader size="14" inline="true" /></Label>);

    const customImage = this.props.pipelines.type === NotebooksHelper.pipelineTypes.customImage ?
      true :
      false;
    const { showInfo } = this.state;
    let infoButton = null;
    if (customImage) {
      const text = showInfo ?
        "less info" :
        "more info";
      infoButton = (<Button size="sm" onClick={() => { this.toggleInfo(); }} color="link">{text}</Button>);
    }
    return (
      <FormGroup>
        <StartNotebookPipelinesBadge {...this.props} infoButton={infoButton} />
        <Collapse isOpen={!customImage || showInfo}>
          <StartNotebookPipelinesContent {...this.props}
            buildAgain={this.reTriggerPipeline.bind(this)} tryToBuild={this.runPipeline.bind(this)} />
        </Collapse>
      </FormGroup>
    );
  }
}

class StartNotebookPipelinesBadge extends Component {
  render() {
    const pipelineType = this.props.pipelines.type;
    const pipeline = this.props.pipelines.main;
    const { infoButton } = this.props;

    let color, text;
    if (pipelineType === NotebooksHelper.pipelineTypes.logged) {
      if (pipeline.status === "success") {
        color = "success";
        text = "available";
      }
      else if (pipeline.status === undefined) {
        color = "danger";
        text = "not available";
      }
      else if (["running", "pending", "stopping"].includes(pipeline.status)) {
        color = "warning";
        text = "building";
      }
      else {
        color = "danger";
        text = "error";
      }
    }
    else if (pipelineType === NotebooksHelper.pipelineTypes.anonymous) {
      if (pipeline && pipeline.path) {
        color = "success";
        text = "available";
      }
      else {
        color = "danger";
        text = "not available";
      }
    }
    else if (pipelineType === NotebooksHelper.pipelineTypes.customImage) {
      color = "primary";
      text = "pinned";
    }
    else {
      color = "danger";
      text = "error";
    }

    return (<p>Docker Image <Badge color={color}>{text}</Badge>{infoButton}</p>);
  }
}

class StartNotebookPipelinesContent extends Component {
  render() {
    const pipeline = this.props.pipelines.main;
    const pipelineType = this.props.pipelines.type;
    const { pipelineTypes } = NotebooksHelper;

    // customImage
    if (pipelineType === pipelineTypes.customImage) {
      const projectOptions = this.props.options.project;
      if (!projectOptions || !projectOptions.image)
        return null;

      // this style trick makes it appear as the other Label + Input components
      const style = { marginTop: -8 };
      const url = "https://renku.readthedocs.io/en/latest/reference/templates.html?highlight=.dockerignore#renku";
      return (
        <Fragment>
          <Input type="input" disabled={true} id="customImage" style={style} value={projectOptions.image}></Input>
          <FormText>
            <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> This project specifies
            a <ExternalLink role="text" iconSup={true} iconAfter={true} url={url} title="pinned image" />. A
            pinned image has advantages for projects with many forks, but it will not reflect changes
            to the <code>Dockerfile</code> or any project dependency files.
          </FormText>
        </Fragment>
      );
    }

    // anonymous
    if (pipelineType === pipelineTypes.anonymous) {
      if (pipeline && pipeline.path)
        return null;

      return (
        <div>
          <Label>
            <p>
              <FontAwesomeIcon icon={faExclamationTriangle} /> The image for this commit is not currently available.
            </p>
            <p>
              Since building it takes a while, consider waiting a few minutes if the commit is very recent.
              <br />Otherwise, you can either select another commit or <ExternalLink role="text" size="sm"
                title="contact a maintainer" url={`${this.props.externalUrl}/project_members`} /> for
              help.
            </p>
          </Label>
        </div>
      );
    }

    // logged in
    if (pipeline.status === "success")
      return null;

    let content = null;
    if (["running", "pending", "stopping"].includes(pipeline.status)) {
      content = (
        <Label>
          <FontAwesomeIcon icon={faCog} spin /> The Docker image for the session is being built.
          Please wait a moment...
          <br />
          You can use the base image to start a session instead of waiting,{" "}
          but project-specific dependencies will not be available.
          <br />
          <ExternalLink id="image_check_pipeline" role="button" showLinkIcon={true} size="sm"
            title="View pipeline in GitLab" url={pipeline.web_url} />
          <UncontrolledPopover trigger="hover" placement="top" target="image_check_pipeline">
            <PopoverBody>Check the GitLab pipeline. For expert users.</PopoverBody>
          </UncontrolledPopover>
        </Label>
      );
    }
    else if (pipeline.status === "failed" || pipeline.status === "canceled") {
      let actions;
      if (this.props.ignorePipeline || this.props.justStarted) {
        actions = (
          <div>
            <ExternalLink id="image_check_pipeline" role="button" showLinkIcon={true} size="sm"
              title="View pipeline in GitLab" url={pipeline.web_url} />
          </div>
        );
      }
      else {
        actions = (
          <div>
            <Button color="primary" size="sm" id="image_build_again"
              onClick={this.props.buildAgain}>
              <FontAwesomeIcon icon={faRedo} /> Build again
            </Button>
            <UncontrolledPopover trigger="hover" placement="top" target="image_build_again">
              <PopoverBody>Try to build again if it is the first time you see this error on this commit.</PopoverBody>
            </UncontrolledPopover>
            &nbsp;
            <ExternalLink id="image_check_pipeline" role="button" showLinkIcon={true} size="sm"
              title="View pipeline in GitLab" url={pipeline.web_url} />
            <UncontrolledPopover trigger="hover" placement="top" target="image_check_pipeline">
              <PopoverBody>Check the GitLab pipeline. For expert users.</PopoverBody>
            </UncontrolledPopover>
          </div>
        );
      }
      content = (
        <div>
          <Label key="message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" /> The Docker image build failed.
            You can use the base image to start a session, but project-specific dependencies will not be available.
          </Label>
          {actions}
        </div>
      );
    }
    else if (pipeline.status === undefined) {
      content = (
        <div>
          <Label key="message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" /> No Docker image found.
            You can use the base image to start a session, but project-specific dependencies will not be available.
            <br />
            If you are seeing this error for the first time,{" "}
            <Button color="primary" size="sm" id="image_build"
              onClick={this.props.tryToBuild}>
              <FontAwesomeIcon icon={faRedo} /> building the branch image
            </Button>{" "}
            will probably solve the problem.
          </Label>
        </div>
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
    const { commits, fetching, autosaved } = this.props.data;
    if (fetching)
      return (<Label>Updating commits... <Loader size="14" inline="true" /></Label>);

    const { filters, disabled } = this.props;
    const { displayedCommits } = filters;
    const filteredCommits = displayedCommits && displayedCommits > 0 ?
      commits.slice(0, displayedCommits) :
      commits;
    const autosavedCommits = autosaved.map(autosaveObject => autosaveObject.autosave.commit);
    const commitOptions = filteredCommits.map((commit) => {
      const star = autosavedCommits.includes(commit.id.substr(0, 7)) ?
        "*" :
        "";
      return (
        <option key={commit.id} value={commit.id}>
          {commit.short_id}{star} - {commit.author_name} - {Time.toIsoTimezoneString(commit.committed_date)}
        </option>
      );
    });
    let commitComment = null;
    if (filters.commit && filters.commit.id) {
      const autosaveExists = autosavedCommits.includes(filters.commit.id.substr(0, 7)) ?
        true :
        false;
      if (autosaveExists) {
        const url = "https://renku.readthedocs.io/en/latest/user/interactive_stopping_and_saving.html" +
          "#autosave-in-interactive-environments";
        commitComment = (
          <FormText>
            <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> We
            found <ExternalLink url={url} iconSup={true} iconAfter={true} title="unsaved work" role="link" /> for
            this commit.
          </FormText>
        );
      }
    }
    return (
      <FormGroup>
        <Label>
          Commit
          <StartNotebookCommitsUpdate {...this.props} />
          <StartNotebookCommitsOptions {...this.props} />
        </Label>
        <Input type="select" id="selectCommit" name="selectCommit" disabled={disabled}
          value={filters.commit && filters.commit.id ? filters.commit.id : ""}
          onChange={(event) => { this.props.handlers.setCommit(event.target.value); }}>
          <option disabled hidden></option>
          {commitOptions}
        </Input>
        {commitComment}
      </FormGroup>
    );
  }
}

class StartNotebookCommitsUpdate extends Component {
  render() {
    return [
      <Button key="button" className="ms-2 p-0" color="link" size="sm"
        id="commitUpdateButton" disabled={this.props.disabled}
        onClick={this.props.handlers.refreshCommits}>
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip key="tooltip" placement="top" target="commitUpdateButton">
        Refresh commits
      </UncontrolledTooltip>
    ];
  }
}

class StartNotebookCommitsOptions extends Component {
  render() {
    return [
      <Button key="button" className="ms-2 p-0" color="link" size="sm"
        id="commitOptionsButton" disabled={this.props.disabled}
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
              onChange={(event) => { this.props.handlers.setDisplayedCommits(event.target.value); }}
              value={this.props.filters.displayedCommits} />
            <FormText>1-100, 0 for unlimited</FormText>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>
    ];
  }
}

class StartNotebookOptions extends Component {
  render() {
    const { justStarted } = this.props;
    if (justStarted)
      return <Label>Starting a new session... <Loader size="14" inline="true" /></Label>;

    const { all, fetched } = this.props.notebooks;
    const { filters, options } = this.props;
    if (!fetched)
      return (<Label>Verifying available sessions... <Loader size="14" inline="true" /></Label>);

    if (Object.keys(options.global).length === 0 || options.fetching)
      return (<Label>Loading session parameters... <Loader size="14" inline="true" /></Label>);

    if (Object.keys(all).length > 0) {
      const currentCommit = filters.commit?.id;
      const currentNotebook = Object.keys(all).find(k => {
        const annotations = NotebooksHelper.cleanAnnotations(all[k].annotations, "renku.io");
        if (annotations["commit-sha"] === currentCommit)
          return true;
        return false;
      });
      if (currentNotebook)
        return (<StartNotebookOptionsRunning notebook={all[currentNotebook]} />);
    }

    return [
      <StartNotebookServerOptions key="options" {...this.props} />,
      <ServerOptionLaunch key="button" {...this.props} />
    ];

  }
}

function Warning(props) {
  return <div style={{ fontSize: "smaller", paddingTop: "5px" }}>
    <WarnAlert>
      {props.children}
    </WarnAlert>
  </div>;
}

class StartNotebookOptionsRunning extends Component {
  render() {
    const { notebook } = this.props;

    const status = NotebooksHelper.getStatus(notebook.status);
    if (status === "running") {
      const annotations = NotebooksHelper.cleanAnnotations(notebook.annotations, "renku.io");
      const localUrl = Url.get(Url.pages.project.session.show, {
        namespace: annotations["namespace"],
        path: annotations["projectName"],
        server: notebook.name,
      });
      const url = notebook.url;
      return (
        <FormGroup>
          <div className="mb-2">
            <Label>A session is already running.</Label>
          </div>
          <div>
            <Link className="btn btn-secondary" to={localUrl}>Open</Link>{" "}
            <ExternalLink url={url} title="Open in new tab" showLinkIcon={true} />
          </div>
        </FormGroup>
      );
    }
    else if (status === "pending" || status === "stopping") {
      return (
        <FormGroup>
          <Label>A session for this commit is starting or terminating, please wait...</Label>
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <Label>
          A session is already running but it is currently not available.
          You can get further details from the Sessions page.
        </Label>
      </FormGroup>
    );

  }
}

/**
 * Combine the globalOptions and projectOptions to cover all valid options.
 */
function mergeEnumOptions(globalOptions, projectOptions, key) {
  let options = globalOptions[key].options;
  // default_url can extend the existing options, but not the other ones
  if (key === "default_url"
    && Object.keys(projectOptions).indexOf(key) >= 0
    && globalOptions[key].options.indexOf(projectOptions[key]) === -1)
    options = [...globalOptions[key].options, projectOptions[key]];

  return options;
}

class StartNotebookServerOptions extends Component {
  render() {
    const globalOptions = this.props.options.global;
    const projectOptions = this.props.options.project;
    const selectedOptions = this.props.filters.options;
    const { warnings } = this.props.options;
    const sortedOptionKeys = Object.keys(globalOptions)
      .sort((a, b) => parseInt(globalOptions[a].order) - parseInt(globalOptions[b].order));
    const renderedServerOptions = sortedOptionKeys
      .filter(key => key !== "commitId")
      .map(key => {
        // when the project has a default option, ensure it's added to the global options
        const serverOption = {
          ...globalOptions[key],
          id: `option-${key}`,
          selected: selectedOptions[key]
        };

        const onChange = (event, value) => {
          this.props.handlers.setServerOption(key, event, value);
        };
        const warning = warnings.includes(key) ?
          (
            <Warning>
              Cannot set <b>{serverOption.displayName}</b> to
              the project default value <i>{projectOptions[key]}</i> in this Renkulab deployment.
            </Warning>
          ) :
          null;

        let optionContent = null;
        if (serverOption.type === "enum") {
          const options = mergeEnumOptions(globalOptions, projectOptions, key);
          serverOption["options"] = options;
          const separator = options.length === 1 ? null : (<br />);
          optionContent = (<Fragment>
            <Label className="me-2">{serverOption.displayName}</Label>
            {separator}<ServerOptionEnum {...serverOption} onChange={onChange} />
            {warning}
          </Fragment>);
        }
        else if (serverOption.type === "int" || serverOption.type === "float") {
          const step = serverOption.type === "int" ?
            1 :
            0.01;
          optionContent = (<Fragment>
            <Label className="me-2">{`${serverOption.displayName}: ${serverOption.selected}`}</Label>
            <br /><ServerOptionRange step={step} {...serverOption} onChange={onChange} />
          </Fragment>);
        }
        else if (serverOption.type === "boolean") {
          optionContent = (<ServerOptionBoolean {...serverOption} onChange={onChange} />);
        }

        if (!optionContent)
          return null;

        const formContent = (<FormGroup>{optionContent}</FormGroup>);
        const colWidth = key === "default_url" ?
          12 :
          6;

        return (
          <Col key={key} xs={12} md={colWidth}>{formContent}</Col>
        );
      });

    const unmatchedWarnings = warnings.filter(x => !sortedOptionKeys.includes(x));
    let globalWarning = null;
    if (unmatchedWarnings && unmatchedWarnings.length) {
      const language = unmatchedWarnings.length > 1 ?
        { verb: "", plural: "s", aux: "are", article: "" } :
        { verb: "s", plural: "", aux: "is", article: "a " };
      const wrongVariables = unmatchedWarnings.map((w, i) => (
        <span key={i}><i>{w}</i>: <code>{projectOptions[w].toString()}</code><br /></span>
      ));

      globalWarning = (
        <Warning key="globalWarning">
          The project configuration for sessions
          contains {language.article}variable{language.plural} that {language.aux} either
          unknown in this Renkulab deployment or
          contain{language.verb} {language.article}wrong value{language.plural}:
          <br /> { wrongVariables}
        </Warning>
      );
    }

    return renderedServerOptions.length ?
      <Row>{renderedServerOptions.concat(globalWarning)}</Row> :
      <label>Notebook options not available</label>;
  }
}

class ServerOptionEnum extends Component {
  render() {
    const { disabled, selected } = this.props;
    let { options } = this.props;

    if (selected && options && options.length && !options.includes(selected))
      options = options.concat(selected);
    if (options.length === 1)
      return (<Badge color="primary">{this.props.options[0]}</Badge>);

    return (
      <ButtonGroup className="rk-btn-group-light" >
        {options.map((optionName, i) => {
          let color = "rk-white";
          if (optionName === selected) {
            color = this.props.warning != null && this.props.warning === optionName ?
              "danger" :
              "rk-white";
          }
          const size = this.props.size ? this.props.size : null;
          return (
            <Button
              key={optionName} color={color} size={size} disabled={disabled} active={optionName === selected}
              onClick={event => this.props.onChange(event, optionName)}>{optionName}</Button>
          );
        })}
      </ButtonGroup>
    );
  }
}

class ServerOptionBoolean extends Component {
  render() {
    const { disabled } = this.props;
    // The double negation solves an annoying problem happening when checked=undefined
    // https://stackoverflow.com/a/39709700/1303090
    const selected = !!this.props.selected;
    return (<div className="form-check form-switch d-inline-block">
      <Input type="switch" id={this.props.id} label={this.props.displayName} disabled={disabled}
        checked={selected} onChange={this.props.onChange} className="form-check-input rounded-pill"/>
      <Label check htmlFor={this.props.id}>{this.props.displayName}</Label>
    </div>
    );
  }
}

class ServerOptionRange extends Component {
  render() {
    const { disabled } = this.props;
    return (
      <Input
        type="range"
        id={this.props.id}
        value={this.props.selected}
        onChange={this.props.onChange}
        min={this.props.range[0]}
        max={this.props.range[1]}
        step={this.props.step}
        disabled={disabled}
      />
    );
  }
}

function LaunchErrorBackendAlert({ launchError }) {
  return <WarnAlert>
    The attempt to start a session failed with the following error:
    <div><code>{launchError}</code></div>
    This could be an intermittent issue, so you should try a second time,
    and the session will hopefully start. If the problem persists, you can {" "}
    <Link to="/help">contact us for assistance</Link>.
  </WarnAlert>;
}

function LaunchErrorFrontendAlert({ launchError, pipelines }) {
  const pipeline = pipelines.main;
  if (launchError.pipelineError && pipeline && (pipeline.path || pipeline.status === "success"))
    return null;
  return <WarnAlert>
    {launchError.errorMessage}
  </WarnAlert>;
}

function AutosavesErrorAlert({ autosaves }) {
  if (autosaves.error == null)
    return null;
  return <WarnAlert>
    <p>Autosaves are currently unavailable.</p>
    <p className="mb-0">If you recently worked on the project, any previous unsaved work cannot be recovered.</p>
  </WarnAlert>;
}

function LaunchErrorAlert({ autosaves, launchError, pipelines }) {
  let launchErrorElement = null;
  if (launchError != null) {
    if (launchError.frontendError === true)
      launchErrorElement = (<LaunchErrorFrontendAlert launchError={launchError} pipelines={pipelines} />);
    else
      launchErrorElement = (<LaunchErrorBackendAlert launchError={launchError} />);
  }

  let autosavesErrorElement = null;
  if (autosaves.error != null)
    autosavesErrorElement = (<AutosavesErrorAlert autosaves={autosaves} />);
  return (<Fragment>
    {launchErrorElement}
    {autosavesErrorElement}
  </Fragment>);
}

class ServerOptionLaunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      current: {},
      showShareLinkModal: false,
    };

    this.checkServer = this.checkServer.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleShareLinkModal = this.toggleShareLinkModal.bind(this);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }
  toggleShareLinkModal() {
    this.setState({ showShareLinkModal: !this.state.showShareLinkModal });
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
    const { warnings } = this.props.options;
    const globalNotification = (warnings.length < 1) ?
      null :
      <Warning key="globalNotification">
        The session cannot be configured exactly as requested for this project.
        You can still start one, but some things may not work correctly.
      </Warning>;

    const hasImage = NotebooksHelper.checkPipelineAvailability(this.props.pipelines);
    const createLink = (
      <DropdownItem onClick={this.toggleShareLinkModal}><FontAwesomeIcon icon={faLink} /> Create link</DropdownItem>
    );
    const startButton = <Button key="start-session" color="primary" disabled={!hasImage} onClick={this.checkServer}>
      Start session
    </Button>;
    const startButtonWithMenu = <ButtonWithMenu key="button-menu" color="primary" default={startButton} direction="up">
      {createLink}
    </ButtonWithMenu>;

    const imageStatusAlert = !hasImage ? <div key="noImageAvailableWarning" className="pb-2">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning"/>{" "}
      The image for this commit is not available.{" "}
      {this.props.showAdvanced ?
        <span>See the <b>Docker Image</b> section for details.</span>
        : <Button color="link" className="ps-0 pe-0 font-italic"
          onClick={() => { this.props.toggleShowAdvanced(true); }}>
          Click here for more info.
        </Button>
      }

    </div>
      : null;

    const startBaseButton = (hasImage) ?
      null :
      <Button key="start-base" color="primary" onClick={this.checkServer}>
        Start with base image
      </Button>;


    return [
      imageStatusAlert,
      startBaseButton,
      " ",
      startButtonWithMenu,
      <AutosavedDataModal key="modal"
        toggleModal={this.toggleModal.bind(this)}
        showModal={this.state.showModal}
        currentBranch={this.state.current}
        {...this.props}
      />,
      <ShareLinkSessionModal key="shareLinkModal"
        toggleModal={this.toggleShareLinkModal.bind(this)} showModal={this.state.showShareLinkModal}
        {...this.props}
      />,
      globalNotification
    ];
  }
}

class AutosavedDataModal extends Component {
  render() {
    const url = this.props.currentBranch && this.props.currentBranch.autosave ?
      this.props.currentBranch.autosave.url :
      "#";
    const autosavedLink = (
      <ExternalLink role="text" iconSup={true} iconAfter={true} url={url} title="unsaved work" />
    );
    const docsLink = (
      <ExternalLink
        role="text" iconSup={true} iconAfter={true} title="documentation"
        url="https://renku.readthedocs.io/en/latest/user/autosave.html"
      />
    );
    const command = `git reset --hard ${this.props.filters.commit.short_id} && git clean -f -d`;
    return (
      <div>
        <Modal
          isOpen={this.props.showModal}
          toggle={this.props.toggleModal}>
          <ModalHeader toggle={this.props.toggleModal}>Unsaved work</ModalHeader>
          <ModalBody>
            <p>
              Renku has recovered {autosavedLink} for the <i>{this.props.filters.branch.name}</i> branch.
              We will automatically restore this content so you do not lose any work.
            </p>
            <p>
              If you do not need it, you can discard this work with the following command:
              <br />
              <code>{command}<Clipboard clipboardText={command} /></code>
            </p>
            <p>Please refer to this {docsLink} to get further information.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.props.handlers.startServer}>Launch session</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

// * CheckNotebookIcon code * //
class CheckNotebookIcon extends Component {
  render() {
    const { fetched, notebook, location } = this.props;
    const loader = (<span className="ms-2 pb-1"><Loader size="19" inline="true" /></span>);
    if (!fetched)
      return loader;

    let tooltip, link, icon, aligner = null;
    if (notebook) {
      const status = NotebooksHelper.getStatus(notebook.status);
      if (status === "running") {
        tooltip = "Connect to JupyterLab";
        icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" />);
        const url = `${notebook.url}/lab/tree/${this.props.filePath}`;
        link = (<a href={url} role="button" target="_blank" rel="noreferrer noopener">{icon}</a>);
      }
      else if (status === "pending" || status === "stopping") {
        tooltip = status === "stopping" ?
          "The session is stopping, please wait..." :
          "The session is starting, please wait...";
        aligner = "pb-1";
        link = loader;
      }
      else {
        tooltip = "Check session status";
        icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" grayscale={true} />);
        link = (<Link to={this.props.launchNotebookUrl}>{icon}</Link>);
      }
    }
    else {
      const successUrl = location ?
        location.pathname :
        null;
      const target = {
        pathname: this.props.launchNotebookUrl,
        state: { successUrl }
      };
      tooltip = "Start a session";
      icon = (<JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" grayscale={true} />);
      link = (<Link to={target}>{icon}</Link>);
    }

    return (
      <React.Fragment>
        <span id="checkNotebookIcon" className={aligner}>{link}</span>
        <ThrottledTooltip target="checkNotebookIcon" tooltip={tooltip} />
      </React.Fragment>
    );
  }
}

const ShareLinkSessionModal = (props) => {
  const [includeBranch, setIncludeBranch] = useState(false);
  const [includeCommit, setIncludeCommit] = useState(false);
  const [url, setUrl] = useState("");
  const data = {
    namespace: props.filters?.namespace,
    path: props.filters?.project,
    branch: props.filters.branch.name,
    commit: props.filters.commit.id,
  };

  useEffect(() => {
    if (!data.namespace || !data.path)
      return;
    let urlSession = Url.get(Url.pages.project.session.autostart, data, true);
    urlSession = includeCommit ? `${urlSession}&commit=${data.commit}` : urlSession;
    urlSession = includeBranch ? `${urlSession}&branch=${data.branch}` : urlSession;
    setUrl(urlSession);
  }, [ includeCommit, includeBranch, data ]);

  const setCommit = (checked) => {
    setIncludeCommit(checked);
    if (checked)
      setIncludeBranch(checked);
  };
  const setBranch = (checked) => {
    setIncludeBranch(checked);
    if (!checked)
      setIncludeCommit(checked);
  };

  return (
    <Modal isOpen={props.showModal} toggle={props.toggleModal}>
      <ModalHeader toggle={props.toggleModal}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Form className="mb-3">
              <FormGroup key="link-branch" check>
                <Label check>
                  <Input type="checkbox" checked={includeBranch}
                    onChange={e => setBranch(e.target.checked)}/> Branch
                </Label>
              </FormGroup>
              <FormGroup key="link-commit" check>
                <Label check>
                  <Input type="checkbox" checked={includeCommit}
                    onChange={e => setCommit(e.target.checked)}/> Commit
                </Label>
              </FormGroup>
              <FormText>
                <FontAwesomeIcon id="commit-info" icon={faInfoCircle} />
                &nbsp;The commit requires including also the branch
              </FormText>
            </Form>

            <Table size="sm">
              <tbody>
                <tr className="border-bottom">
                  <th scope="row">URL</th>
                  <td style={{ wordBreak: "break-all" }}>{url}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={url} /></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export {
  CheckNotebookIcon, StartNotebookServer, mergeEnumOptions, ServerOptionBoolean, ServerOptionEnum, ServerOptionRange
};

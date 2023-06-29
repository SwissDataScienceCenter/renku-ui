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

import React, { Component, Fragment, useEffect, useState } from "react";
import {
  faBook,
  faCog,
  faCogs,
  faExclamationTriangle,
  faInfoCircle,
  faLink,
  faRedo,
  faSyncAlt,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Badge,
  Button,
  Col,
  Collapse,
  DropdownItem,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PopoverBody,
  PopoverHeader,
  Row,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";
import {
  ErrorAlert,
  InfoAlert,
  SuccessAlert,
  WarnAlert,
} from "../components/Alert";
import { ExternalLink } from "../components/ExternalLinks";
import { JupyterIcon } from "../components/Icon";
import { Loader } from "../components/Loader";
import { ThrottledTooltip } from "../components/Tooltip";
import { ButtonWithMenu } from "../components/buttons/Button";
import CommitSelector from "../components/commitSelector/CommitSelector";
import { ShareLinkSessionModal } from "../components/shareLinkSession/ShareLinkSession";
import { Docs } from "../utils/constants/Docs";
import { SessionStatus } from "../utils/constants/Notebooks";
import { sleep } from "../utils/helpers/HelperFunctions";
import { Url } from "../utils/helpers/url";
import {
  ObjectStoresConfigurationButton,
  ObjectStoresConfigurationModal,
} from "./ObjectStoresConfig.present";
import EnvironmentVariables from "./components/EnviromentVariables";
import LaunchErrorAlert from "./components/LaunchErrorAlert";
import {
  StartNotebookServerOptions,
  ServerOptionBoolean,
  ServerOptionEnum,
} from "./components/StartNotebookServerOptions";
import {
  StartNotebookAutostartLoader,
  StartNotebookLoader,
} from "./components/StartSessionLoader";
import { NotebooksHelper } from "./index";
import { CommandCopy } from "../components/commandCopy/CommandCopy";

function ProjectSessionLockAlert({ lockStatus }) {
  if (lockStatus == null) return null;
  const isLocked = lockStatus.locked;
  if (!isLocked) return null;

  return (
    <WarnAlert>
      <FontAwesomeIcon icon={faUserClock} />{" "}
      <i>
        Project is being modified. You can start a session, but to avoid{" "}
        conflicts you should not push any changes.
      </i>
    </WarnAlert>
  );
}

function SessionStartSidebar(props) {
  return (
    <>
      <h2>Start session</h2>
      <p>
        On the project
        <br />
        <b className="text-break">{props.pathWithNamespace}</b>
      </p>
      <ProjectSessionLockAlert lockStatus={props.lockStatus} />

      <div className="d-none d-md-block">
        <p>
          A session gives you an environment with resources for doing work. The
          exact details of the available tools depends on the project.
        </p>

        <p>
          The resource settings have been set to the project defaults, but you
          can alter them if you wish.
        </p>
      </div>
    </>
  );
}

function StartNotebookAdvancedOptions(props) {
  const { autosaves, showObjectStoreModal, justStarted } = props;
  if (justStarted) return null;
  const { objectStoresConfiguration } = props.filters;
  const {
    deleteAutosave,
    setCommit,
    setIgnorePipeline,
    toggleShowObjectStoresConfigModal,
  } = props.handlers;
  const s3MountsConfig = props.options.global.cloudstorage?.s3;
  const cloudStorageAvailable = s3MountsConfig?.enabled ?? false;
  return (
    <>
      <div className="field-group">
        <StartNotebookPipelines
          {...props}
          ignorePipeline={props.ignorePipeline}
          setIgnorePipeline={setIgnorePipeline}
        />
      </div>
      <div className="field-group">
        <AutosavesInfoAlert
          autosaves={autosaves}
          autosavesId={props.autosavesCommit}
          autosavesWrong={props.autosavesWrong}
          currentId={props.filters.commit?.id}
          deleteAutosave={deleteAutosave}
          setCommit={setCommit}
        />
      </div>
      <div className="field-group">
        <StartNotebookBranches {...props} disabled={props.disabled} />
      </div>
      <div className="field-group">
        <StartNotebookCommits {...props} disabled={props.disabled} />
      </div>
      {cloudStorageAvailable ? (
        <div className="field-group">
          <ObjectStoresConfigurationButton
            objectStoresConfiguration={objectStoresConfiguration}
            toggleShowObjectStoresConfigModal={
              toggleShowObjectStoresConfigModal
            }
          />
          <ObjectStoresConfigurationModal
            objectStoresConfiguration={objectStoresConfiguration}
            showObjectStoreModal={showObjectStoreModal}
            toggleShowObjectStoresConfigModal={
              toggleShowObjectStoresConfigModal
            }
            setObjectStoresConfiguration={
              props.handlers.setObjectStoresConfiguration
            }
          />
        </div>
      ) : null}
    </>
  );
}

// * StartNotebookServer code * //
function StartNotebookServer(props) {
  const {
    autosaves,
    autoStarting,
    ci,
    message,
    defaultBackButton,
    justStarted,
  } = props;
  const { branch, commit, namespace, project } = props.filters;
  const location = useLocation();

  const sessionClass = useSelector(
    (state) => state.startSessionOptions.sessionClass
  );
  const hasSessionClass = sessionClass !== 0;

  const [showShareLinkModal, setShowShareLinkModal] = useState(
    location?.state?.showShareLinkModal ?? false
  );
  const environmentVariables = useSelector(
    (state) => state.stateModel.notebooks.filters?.environment_variables
  );
  const setNotebookEnvVariables = (variables) => {
    props.handlers.setNotebookEnvVariables(variables);
  };
  useEffect(() => {
    return () => {
      if (props.handlers.resetNotebookList) props.handlers.resetNotebookList();
    };
  }, []); //eslint-disable-line

  const toggleShareLinkModal = () => setShowShareLinkModal(!showShareLinkModal);

  // Show fetching status when auto-starting
  if (autoStarting) return <StartNotebookAutostartLoader {...props} />;

  // show loader when is starting a session
  if (justStarted) return <StartNotebookLoader backUrl={defaultBackButton} />;

  const ciStatus = NotebooksHelper.checkCiStatus(ci);
  const fetching = {
    autosaves: autosaves.fetching,
    branches: props.fetchingBranches || props.delays.branch,
    commits: props.data.fetching || props.delays.commit,
    ci: ciStatus.ongoing,
  };

  let show = {};
  show.commits =
    !autosaves.fetching && !fetching.branches && branch.name ? true : false;
  show.ci = show.commits && !fetching.commits && commit && commit.id;
  show.options = show.ci && !fetching.ci && autosaves.fetched;

  const messageOutput = message ? <div key="message">{message}</div> : null;
  const disabled = fetching.branches || fetching.commits;

  const options = show.options ? (
    <StartNotebookOptions
      notebookFilePath={location?.state?.filePath}
      toggleShareLinkModal={toggleShareLinkModal}
      showShareLinkModal={showShareLinkModal}
      setEnvironmentVariables={setNotebookEnvVariables}
      environmentVariables={environmentVariables}
      hasSessionClass={hasSessionClass}
      {...props}
    />
  ) : null;

  const loader =
    autosaves.fetching || !show.options ? (
      <div>
        <p>Checking sessions status...</p>
        <Loader />
      </div>
    ) : null;

  const pathWithNamespace = `${namespace}/${project}`;

  return (
    <>
      {defaultBackButton}
      <Row>
        <LaunchErrorAlert
          autosaves={props.autosaves}
          launchError={props.launchError}
          ci={props.ci}
        />
        <Col sm={12} md={3} lg={4}>
          <SessionStartSidebar
            autosaves={autosaves}
            ci={props.ci}
            launchError={props.launchError}
            lockStatus={props.lockStatus}
            pathWithNamespace={pathWithNamespace}
          />
        </Col>
        <Col sm={12} md={9} lg={8}>
          <Form className="form-rk-green">
            {messageOutput}
            <StartNotebookAdvancedOptions
              {...props}
              disabled={disabled}
              show={show}
            />
            {options}
            {loader}
          </Form>
        </Col>
      </Row>
    </>
  );
}

function AutosavesInfoAlert({
  autosaves,
  autosavesId,
  autosavesWrong,
  currentId,
  deleteAutosave,
  setCommit,
}) {
  const [deleteOngoing, setDeleteOngoing] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // Return when autosaves data are not available
  if (!autosaves?.fetched || autosaves?.fetching) return null;

  // Temporary store data when deleting autosaves to keep track of ongoing actions or failures
  const deleteCurrentAutosave = async () => {
    if (deleteResult != null) setDeleteResult(null);
    setDeleteOngoing(true);

    // find the autosave name
    const targetAutosave = autosaves.list.find((a) =>
      autosavesId.startsWith(a.commit)
    );
    const deleteOutcome = await deleteAutosave(targetAutosave.name);
    setDeleteResult(deleteOutcome);
    setDeleteOngoing(false);
  };

  // Manage ongoing or recently finished actions
  if (deleteOngoing) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        Deleting the autosave... <Loader size={14} inline />
      </InfoAlert>
    );
  }

  if (deleteResult === true)
    return <SuccessAlert>Autosave successfully deleted.</SuccessAlert>;

  if (deleteResult === false) {
    return (
      <WarnAlert timeout={0}>
        <p>Could not delete the autosave.</p>
        <p className="mb-0">
          You might{" "}
          <Button
            size="sm"
            color="warning"
            onClick={() => window.location.reload()}
          >
            refresh the page
          </Button>{" "}
          and try again. The autosave may have been deleted in another session.
        </p>
      </WarnAlert>
    );
  }

  if (autosavesWrong) {
    return (
      <WarnAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          There might be unsaved work left from your last session, but data is
          corrupted and restoring it is not possible.
          <br />
          The latest commit was picked instead.
        </p>
      </WarnAlert>
    );
  }

  // Return when there are no relevant autosaves
  if (!currentId || !autosavesId) return null;

  // Show autosaves info
  if (autosavesId === currentId) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p>
          There is unsaved work from your last session which will be restored.
          If you do not wish to keep it, you can{" "}
          <Button
            color="info"
            size="sm"
            onClick={() => deleteCurrentAutosave()}
          >
            delete the autosave
          </Button>
          .
        </p>
        <p className="mb-0">
          For more options, start a session and look at the session cheatsheet,
          which is available under this icon{" "}
          <FontAwesomeIcon className="cursor-default" icon={faBook} />.
        </p>
      </InfoAlert>
    );
  }
  return (
    <WarnAlert dismissible={false} timeout={0}>
      <p>
        There is unsaved work left from your last session.
        <br />
        Starting a session on a different commit will discard any unsaved work.
      </p>
      <p className="mb-0">
        You can{" "}
        <Button
          color="warning"
          size="sm"
          onClick={() => setCommit(autosavesId)}
        >
          restore the autosave
        </Button>{" "}
        to start from there instead.
      </p>
    </WarnAlert>
  );
}

class StartNotebookBranches extends Component {
  render() {
    const { branches } = this.props.data;
    const { disabled } = this.props;
    let content;
    if (this.props.fetchingBranches || this.props.delays.branch) {
      content = (
        <Label>
          Updating branches... <Loader size={14} inline />
        </Label>
      );
    } else if (branches.length === 0) {
      content = (
        <FormGroup>
          <Label>A commit is necessary to start a session.</Label>
          <InfoAlert timeout={0}>
            <p>You can still do one of the following:</p>
            <ul className="mb-0">
              <li>
                <ExternalLink
                  size="sm"
                  url={`${this.props.externalUrl}`}
                  title="Clone the repository"
                />{" "}
                locally and add a first commit.
              </li>
              <li className="pt-1">
                <Link
                  className="btn btn-primary btn-sm"
                  role="button"
                  to="/project_new"
                >
                  Create a new project
                </Link>{" "}
                from a non-empty template.
              </li>
            </ul>
          </InfoAlert>
        </FormGroup>
      );
    } else {
      if (branches.length === 1) {
        content = (
          <FormGroup>
            <Label>
              Branch (only 1 available)
              <StartNotebookBranchesUpdate {...this.props} />
              <StartNotebookBranchesOptions {...this.props} />
            </Label>
            <Input
              type="input"
              disabled={true}
              id="selectBranch"
              name="selectBranch"
              value={branches[0].name}
            ></Input>
          </FormGroup>
        );
      } else {
        const filter = !this.props.filters.includeMergedBranches;
        const filteredBranches = filter
          ? branches.filter((branch) => (!branch.merged ? branch : null))
          : branches;
        let branchOptions = filteredBranches.map((branch, index) => {
          return (
            <option key={index} value={branch.name}>
              {branch.name}
            </option>
          );
        });
        content = (
          <FormGroup>
            <Label>
              Branch
              <StartNotebookBranchesUpdate {...this.props} />
              <StartNotebookBranchesOptions {...this.props} />
            </Label>
            <Input
              type="select"
              id="selectBranch"
              name="selectBranch"
              disabled={disabled}
              value={
                this.props.filters.branch.name
                  ? this.props.filters.branch.name
                  : ""
              }
              onChange={(event) => {
                this.props.handlers.setBranch(event.target.value);
              }}
            >
              <option disabled hidden></option>
              {branchOptions}
            </Input>
          </FormGroup>
        );
      }
    }
    return <FormGroup>{content}</FormGroup>;
  }
}

class StartNotebookBranchesUpdate extends Component {
  render() {
    return [
      <Button
        key="button"
        className="ms-2 p-0"
        color="link"
        size="sm"
        id="branchUpdateButton"
        disabled={this.props.disabled}
        onClick={this.props.handlers.refreshBranches}
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target="branchUpdateButton"
      >
        Refresh branches
      </UncontrolledTooltip>,
    ];
  }
}

class StartNotebookBranchesOptions extends Component {
  render() {
    return [
      <Button
        key="button"
        className="ms-2 p-0"
        color="link"
        size="sm"
        id="branchOptionsButton"
        disabled={this.props.disabled}
        onClick={() => {
          // eslint-disable-line @typescript-eslint/no-empty-function
        }}
      >
        <FontAwesomeIcon icon={faCogs} />
      </Button>,
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target="branchOptionsButton"
      >
        Branch options
      </UncontrolledTooltip>,
      <UncontrolledPopover
        key="popover"
        trigger="legacy"
        placement="top"
        target="branchOptionsButton"
      >
        <PopoverHeader>Branch options</PopoverHeader>
        <PopoverBody>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                id="myCheckbox"
                checked={this.props.filters.includeMergedBranches}
                onChange={this.props.handlers.toggleMergedBranches}
              />
              Include merged branches
            </Label>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>,
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
    await sleep(5);
    this.setState({ justTriggered: false });
  }

  async runPipeline() {
    this.setState({ justTriggered: true });
    await this.props.handlers.runPipeline();
    await sleep(5);
    this.setState({ justTriggered: false });
  }

  toggleInfo() {
    this.setState({ showInfo: !this.state.showInfo });
  }

  render() {
    const { ci } = this.props;
    const { showInfo } = this.state;
    const ciStatus = NotebooksHelper.checkCiStatus(ci);

    if (ciStatus.ongoing !== false)
      return (
        <Label>
          Checking Docker image status... <Loader size={14} inline />
        </Label>
      );
    if (this.state.justTriggered)
      return (
        <Label>
          Triggering Docker image build... <Loader size={14} inline />
        </Label>
      );

    const customImage =
      ci.type === NotebooksHelper.ciTypes.pinned ? true : false;
    let infoButton = null;
    if (customImage) {
      const text = showInfo ? "less info" : "more info";
      infoButton = (
        <Button
          size="sm"
          onClick={() => {
            this.toggleInfo();
          }}
          color="link"
        >
          {text}
        </Button>
      );
    }
    return (
      <FormGroup>
        <StartNotebookPipelinesBadge {...this.props} infoButton={infoButton} />
        <Collapse isOpen={!customImage || showInfo}>
          <StartNotebookPipelinesContent
            {...this.props}
            justTriggered={this.state.justTriggered}
            buildAgain={this.reTriggerPipeline.bind(this)}
            tryToBuild={this.runPipeline.bind(this)}
          />
        </Collapse>
      </FormGroup>
    );
  }
}

class StartNotebookPipelinesBadge extends Component {
  render() {
    const { ci, infoButton } = this.props;
    const ciStatus = NotebooksHelper.checkCiStatus(ci);

    let color, text;
    if (
      ci.type === NotebooksHelper.ciTypes.logged ||
      ci.type === NotebooksHelper.ciTypes.owner
    ) {
      if (ciStatus.available) {
        color = "success";
        text = "available";
      } else if (
        ciStatus.stage === NotebooksHelper.ciStages.jobs &&
        NotebooksHelper.getCiJobStatus(ci.jobs?.target) ===
          NotebooksHelper.ciStatuses.running
      ) {
        color = "warning";
        text = "building";
      } else if (!ciStatus.available && !ciStatus.ongoing) {
        color = "danger";
        text = "not available";
      } else {
        color = "danger";
        text = "error";
      }
    } else if (ci.type === NotebooksHelper.ciTypes.anonymous) {
      if (ciStatus.available) {
        color = "success";
        text = "available";
      } else {
        color = "danger";
        text = "not available";
      }
    } else if (ci.type === NotebooksHelper.ciTypes.pinned) {
      if (ciStatus.available) {
        color = "success";
        text = "pinned available";
      } else {
        color = "danger";
        text = "pinned not available";
      }
    } else {
      color = "danger";
      text = "error";
    }

    return (
      <p>
        Docker Image <Badge color={color}>{text}</Badge>
        {infoButton}
      </p>
    );
  }
}

class StartNotebookPipelinesContent extends Component {
  render() {
    const { ci } = this.props;
    const ciStatus = NotebooksHelper.checkCiStatus(ci);

    // error
    if (ciStatus.error) {
      return (
        <ErrorAlert>
          <p>An error occurred while checking the Image availability.</p>
          <code className="mb-0">{ciStatus.error}.</code>
        </ErrorAlert>
      );
    }

    // custom image
    if (ci.type === NotebooksHelper.ciTypes.pinned) {
      const projectOptions = this.props.options.project;
      if (!projectOptions || !projectOptions.image) return null;

      // this style trick makes it appear as the other Label + Input components
      const style = { marginTop: -8 };
      const url = Docs.rtdReferencePage("templates.html#pin-a-docker-image");

      const pinnedImagesDoc = (
        <ExternalLink
          role="text"
          iconSup={true}
          iconAfter={true}
          url={url}
          title="pinned image"
        />
      );
      if (ciStatus.available) {
        return (
          <Fragment>
            <Input
              type="input"
              disabled={true}
              id="customImage"
              style={style}
              value={projectOptions.image}
            ></Input>
            <FormText>
              <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} />{" "}
              This project specifies a {pinnedImagesDoc}. A pinned image has
              advantages for projects with many forks, but it will not reflect
              changes to the <code>Dockerfile</code> or any project dependency
              files.
            </FormText>
          </Fragment>
        );
      }
      return (
        <Fragment>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-danger"
          />{" "}
          Pinned Docker image not found. Since this project specifies a{" "}
          {pinnedImagesDoc}, it is unlikely to work with a base image.
        </Fragment>
      );
    }

    // anonymous
    if (ci.type === NotebooksHelper.ciTypes.anonymous) {
      if (ciStatus.available) return null;

      return (
        <div>
          <Label>
            <p>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-danger"
              />{" "}
              The image for this commit is not currently available.
            </p>
            <p className="mb-0">
              Since building it takes a while, consider waiting a few minutes if
              the commit is very recent.
              <br />
              Otherwise, you can either select another commit or{" "}
              <ExternalLink
                role="text"
                size="sm"
                title="contact a maintainer"
                url={`${this.props.externalUrl}/-/project_members`}
              />{" "}
              for help.
            </p>
          </Label>
        </div>
      );
    }

    // logged in
    if (!ciStatus.ongoing && ciStatus.available) return null;

    const { ciStages, ciStatuses, getCiJobStatus } = NotebooksHelper;
    let content = null;
    const owner = ci.type === NotebooksHelper.ciTypes.owner;

    // Job to make the image is still running
    if (
      ciStatus.stage === ciStages.jobs &&
      getCiJobStatus(ci.jobs?.target) === ciStatuses.running
    ) {
      content = (
        <Label>
          <FontAwesomeIcon icon={faCog} spin /> The Docker image for the session
          is being built. Please wait a moment...
          <br />
          You can use the base image to start a session instead of waiting, but
          project-specific dependencies will not be available.
          <br />
          <ExternalLink
            id="image_check_pipeline"
            role="button"
            showLinkIcon={true}
            size="sm"
            title="View pipeline in GitLab"
            url={ci.jobs?.target?.web_url}
          />
          <UncontrolledPopover
            trigger="hover"
            placement="top"
            target="image_check_pipeline"
          >
            <PopoverBody>
              Check the GitLab pipeline. For expert users.
            </PopoverBody>
          </UncontrolledPopover>
        </Label>
      );
    } else if (
      ciStatus.stage === ciStages.jobs &&
      getCiJobStatus(ci.jobs?.target) === ciStatuses.failure
    ) {
      let actions;
      if (this.props.ignorePipeline || this.props.justStarted) {
        actions = (
          <div>
            <ExternalLink
              id="image_check_pipeline"
              role="button"
              showLinkIcon={true}
              size="sm"
              title="View pipeline in GitLab"
              url={ci.jobs?.target?.web_url}
            />
          </div>
        );
      } else {
        const buildAgain = owner ? (
          <Fragment>
            <Button
              color="primary"
              size="sm"
              id="image_build_again"
              onClick={this.props.buildAgain}
            >
              <FontAwesomeIcon icon={faRedo} /> Build again
            </Button>
            <UncontrolledPopover
              trigger="hover"
              placement="top"
              target="image_build_again"
            >
              <PopoverBody>
                Try to build again if it is the first time you see this error on
                this commit.
              </PopoverBody>
            </UncontrolledPopover>
            &nbsp;
          </Fragment>
        ) : null;
        actions = (
          <div>
            {buildAgain}
            <ExternalLink
              id="image_check_pipeline"
              role="button"
              showLinkIcon={true}
              size="sm"
              title="View pipeline in GitLab"
              url={ci.jobs?.target?.web_url}
            />
            <UncontrolledPopover
              trigger="hover"
              placement="top"
              target="image_check_pipeline"
            >
              <PopoverBody>
                Check the GitLab pipeline. For expert users.
              </PopoverBody>
            </UncontrolledPopover>
          </div>
        );
      }
      content = (
        <div>
          <Label key="message">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger"
            />{" "}
            The Docker image build failed. You can use the base image to start a
            session, but project-specific dependencies will not be available.
          </Label>
          {actions}
        </div>
      );
    } else if (
      (ciStatus.stage === ciStages.pipelines &&
        !ciStatus.ongoing &&
        !ciStatus.available) ||
      (ciStatus.stage === ciStages.jobs &&
        getCiJobStatus(ci.jobs?.target) === ciStatuses.wrong) ||
      (ciStatus.stage === ciStages.image && !ci.available) ||
      (ciStatus.stage === ciStages.looping && !ci.available)
    ) {
      const tryBuild = owner ? (
        <Fragment>
          <br />
          If you are seeing this error for the first time,{" "}
          <Button
            color="primary"
            size="sm"
            id="image_build"
            onClick={this.props.tryToBuild}
          >
            <FontAwesomeIcon icon={faRedo} /> building the branch image
          </Button>{" "}
          will probably solve the problem.
        </Fragment>
      ) : null;
      content = (
        <div>
          <Label key="message">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger"
            />{" "}
            No Docker image found. You can use the base image to start a
            session, but project-specific dependencies will not be available.
            {tryBuild}
          </Label>
        </div>
      );
    } else {
      content = (
        <Label>
          Unexpected state, we cannot check the Docker image availability.
        </Label>
      );
    }

    return <div>{content}</div>;
  }
}

class StartNotebookCommits extends Component {
  render() {
    const { commits, fetching, autosaved } = this.props.data;
    const { delays, filters } = this.props;

    if (fetching)
      return (
        <FormGroup>
          <Label>
            Updating commits... <Loader size={14} inline />
          </Label>
        </FormGroup>
      );
    if (delays.commit)
      return (
        <FormGroup>
          <Label>
            Verifying commit autosaves... <Loader size={14} inline />
          </Label>
        </FormGroup>
      );

    const filteredCommits =
      filters.displayedCommits && filters.displayedCommits > 0
        ? commits.slice(0, filters.displayedCommits)
        : commits;
    const autosavedCommits = autosaved.map(
      (autosaveObject) => autosaveObject.autosave.commit
    );
    let commitComment = null;
    if (filters.commit && filters.commit.id) {
      const autosaveExists = autosavedCommits.includes(
        filters.commit.id.substr(0, 7)
      )
        ? true
        : false;
      if (autosaveExists) {
        const url = Docs.rtdHowToGuide(
          "renkulab/session-stopping-and-saving.html#autosave-in-sessions"
        );
        commitComment = (
          <FormText>
            <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> We
            found{" "}
            <ExternalLink
              url={url}
              iconSup={true}
              iconAfter={true}
              title="unsaved work"
              role="link"
            />{" "}
            for this commit.
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
        <CommitSelector
          commits={filteredCommits}
          disabled={this.props.disabled}
          onChange={(commitId) => {
            this.props.handlers.setCommit(commitId);
          }}
        />
        {commitComment}
      </FormGroup>
    );
  }
}

class StartNotebookCommitsUpdate extends Component {
  render() {
    return [
      <Button
        key="button"
        className="ms-2 p-0"
        color="link"
        size="sm"
        id="commitUpdateButton"
        disabled={this.props.disabled}
        onClick={this.props.handlers.refreshCommits}
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>,
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target="commitUpdateButton"
      >
        Refresh commits
      </UncontrolledTooltip>,
    ];
  }
}

class StartNotebookCommitsOptions extends Component {
  render() {
    return [
      <Button
        key="button"
        className="ms-2 p-0"
        color="link"
        size="sm"
        id="commitOptionsButton"
        disabled={this.props.disabled}
        onClick={() => {
          // eslint-disable-line @typescript-eslint/no-empty-function
        }}
      >
        <FontAwesomeIcon icon={faCogs} />
      </Button>,
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target="commitOptionsButton"
      >
        Commit options
      </UncontrolledTooltip>,
      <UncontrolledPopover
        key="popover"
        trigger="legacy"
        placement="top"
        target="commitOptionsButton"
      >
        <PopoverHeader>Commit options</PopoverHeader>
        <PopoverBody>
          <FormGroup>
            <Label>Number of commits to display</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              onChange={(event) => {
                this.props.handlers.setDisplayedCommits(event.target.value);
              }}
              value={this.props.filters.displayedCommits}
            />
            <FormText>1-100, 0 for unlimited</FormText>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>,
    ];
  }
}

function StartNotebookOptions(props) {
  const { justStarted, environmentVariables, setEnvironmentVariables } = props;

  if (justStarted)
    return (
      <Label>
        Starting a new session... <Loader size={14} inline />
      </Label>
    );

  const { all, fetched } = props.notebooks;
  const { filters } = props;
  if (!fetched) {
    return (
      <Label>
        Verifying available sessions... <Loader size={14} inline />
      </Label>
    );
  }

  if (Object.keys(all).length > 0) {
    const currentCommit = filters.commit?.id;
    const currentNotebook = Object.keys(all).find((k) => {
      const annotations = NotebooksHelper.cleanAnnotations(all[k].annotations);
      if (annotations["commit-sha"] === currentCommit) return true;
      return false;
    });
    if (currentNotebook) {
      return (
        <>
          <StartNotebookOptionsRunning
            key="notebook-options-running"
            notebook={all[currentNotebook]}
          />
          <ShareLinkSessionModal
            key="shareLinkModal"
            toggleModal={props.toggleShareLinkModal}
            showModal={props.showShareLinkModal}
            notebookFilePath={props.notebookFilePath}
            {...props}
          />
        </>
      );
    }
  }

  return (
    <>
      <StartNotebookServerOptions branch={filters.branch} />
      <EnvironmentVariables
        key="envVariables"
        environmentVariables={environmentVariables}
        setEnvironmentVariables={setEnvironmentVariables}
      />
      <ServerOptionLaunch key="button" {...props} />
      <ShareLinkSessionModal
        key="shareLinkModal"
        toggleModal={props.toggleShareLinkModal}
        showModal={props.showShareLinkModal}
        {...props}
      />
    </>
  );
}

function Warning(props) {
  return (
    <div style={{ fontSize: "smaller", paddingTop: "5px" }}>
      <WarnAlert>{props.children}</WarnAlert>
    </div>
  );
}

class StartNotebookOptionsRunning extends Component {
  render() {
    const { notebook } = this.props;

    const status = notebook.status?.state;
    if (status === SessionStatus.running) {
      const annotations = NotebooksHelper.cleanAnnotations(
        notebook.annotations
      );
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
            <Link className="btn btn-secondary" to={localUrl}>
              Open
            </Link>{" "}
            <ExternalLink
              className="btn-outline-rk-green"
              url={url}
              title="Open in new tab"
              showLinkIcon={true}
            />
          </div>
        </FormGroup>
      );
    } else if (
      status === SessionStatus.starting ||
      status === SessionStatus.stopping
    ) {
      return (
        <FormGroup>
          <Label>
            A session for this commit is starting or terminating, please wait...
          </Label>
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <Label>
          A session is already running but it is currently not available. You
          can get further details from the Sessions page.
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
  if (
    key === "default_url" &&
    Object.keys(projectOptions).indexOf(key) >= 0 &&
    globalOptions[key].options.indexOf(projectOptions[key]) === -1
  )
    options = [...globalOptions[key].options, projectOptions[key]];

  return options;
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

class ServerOptionLaunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      current: {},
    };

    this.checkServer = this.checkServer.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  checkServer(forceBaseImage = false) {
    const { filters } = this.props;
    const { autosaved } = this.props.data;
    const selectedBranchName = filters.branch.name;
    const selectedCommitShort = filters.commit.id.substr(0, 7);
    const current = autosaved.filter(
      (c) =>
        c.autosave.branch === selectedBranchName &&
        c.autosave.commit === selectedCommitShort
    );
    if (current.length > 0) {
      this.setState({ current: current[0] });
      this.toggleModal();
    } else {
      this.props.handlers.startServer(forceBaseImage);
    }
  }

  render() {
    const { ci } = this.props;
    const { warnings } = this.props.options;

    const ciStatus = NotebooksHelper.checkCiStatus(ci);
    const globalNotification =
      warnings.length < 1 ? null : (
        <Warning key="globalNotification">
          The session cannot be configured exactly as requested for this
          project. You can still start one, but some things may not work
          correctly.
        </Warning>
      );

    const hasImage = ciStatus.available;
    const disabled = !hasImage || !this.props.hasSessionClass;
    const createLink = (
      <DropdownItem onClick={this.props.toggleShareLinkModal}>
        <FontAwesomeIcon className="text-rk-green" icon={faLink} /> Create link
      </DropdownItem>
    );
    const startButton = (
      <Button
        key="start-session"
        color="rk-green"
        disabled={disabled}
        onClick={() => this.checkServer(false)}
      >
        Start session
      </Button>
    );
    const startButtonWithMenu = (
      <ButtonWithMenu
        key="button-menu"
        color="rk-green"
        default={startButton}
        direction="up"
        isPrincipal={true}
      >
        {createLink}
      </ButtonWithMenu>
    );

    const imageStatusAlert = !hasImage ? (
      <div key="noImageAvailableWarning" className="pb-2">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-warning"
        />{" "}
        The image for this commit is not available.{" "}
        <span>
          See the <b>Docker Image</b> section for details.
        </span>
      </div>
    ) : null;

    const startBaseButton = hasImage ? null : (
      <Button
        key="start-base"
        color="primary"
        onClick={() => this.checkServer(true)}
      >
        Start with base image
      </Button>
    );

    return (
      <div>
        {imageStatusAlert}
        <div className="d-flex flex-row-reverse">
          <div>{startButtonWithMenu}</div>
          <div>{startBaseButton} &nbsp;</div>
        </div>
        <AutosavedDataModal
          key="modal"
          toggleModal={this.toggleModal.bind(this)}
          showModal={this.state.showModal}
          currentBranch={this.state.current}
          {...this.props}
        />
        {globalNotification}
      </div>
    );
  }
}

class AutosavedDataModal extends Component {
  render() {
    const url =
      this.props.currentBranch && this.props.currentBranch.autosave
        ? this.props.currentBranch.autosave.url
        : "#";
    const autosavedLink = (
      <ExternalLink
        role="text"
        iconSup={true}
        iconAfter={true}
        url={url}
        title="unsaved work"
      />
    );
    const docsLink = (
      <ExternalLink
        role="text"
        iconSup={true}
        iconAfter={true}
        title="documentation"
        url={Docs.rtdHowToGuide(
          "renkulab/session-stopping-and-saving.html#autosave-in-sessions"
        )}
      />
    );
    const command = `git reset --hard ${this.props.filters.commit.short_id} && git clean -f -d`;
    return (
      <div>
        <Modal isOpen={this.props.showModal} toggle={this.props.toggleModal}>
          <ModalHeader toggle={this.props.toggleModal}>
            Unsaved work
          </ModalHeader>
          <ModalBody>
            <p>
              Renku has recovered {autosavedLink} for the{" "}
              <i>{this.props.filters.branch.name}</i> branch. We will
              automatically restore this content so you do not lose any work.
            </p>
            <p>
              If you do not need it, you can discard this work with the
              following command:
              <br />
              <CommandCopy command={command} />
            </p>
            <p>Please refer to this {docsLink} to get further information.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="btn-rk-green"
              onClick={() => this.props.handlers.startServer(false)}
            >
              Launch session
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

// * CheckNotebookIcon code * //
const CheckNotebookIcon = ({
  fetched,
  notebook,
  location,
  filePath,
  launchNotebookUrl,
}) => {
  const loader = (
    <span className="ms-2 pb-1">
      <Loader size={19} inline />
    </span>
  );
  if (!fetched) return loader;

  let tooltip,
    link,
    icon,
    aligner = null;
  if (notebook) {
    const status = notebook.status?.state;
    if (status === SessionStatus.running) {
      const annotations = NotebooksHelper.cleanAnnotations(
        notebook.annotations
      );
      const sessionUrl = Url.get(Url.pages.project.session.show, {
        namespace: annotations["namespace"],
        path: annotations["projectName"],
        server: notebook.name,
      });
      const state = { from: location.pathname, filePath };
      tooltip = "Connect to JupyterLab";
      icon = <JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" />;
      link = <Link to={{ pathname: sessionUrl, state }}>{icon}</Link>;
    } else if (
      status === SessionStatus.starting ||
      status === SessionStatus.stopping
    ) {
      tooltip =
        status === SessionStatus.stopping
          ? "The session is stopping, please wait..."
          : "The session is starting, please wait...";
      aligner = "pb-1";
      link = loader;
    } else {
      tooltip = "Check session status";
      icon = (
        <JupyterIcon
          svgClass="svg-inline--fa fa-w-16 icon-link"
          grayscale={true}
        />
      );
      link = <Link to={launchNotebookUrl}>{icon}</Link>;
    }
  } else {
    const successUrl = location ? location.pathname : null;
    const target = {
      pathname: launchNotebookUrl,
      search: "?autostart=1&notebook=" + encodeURIComponent(filePath),
      state: { successUrl },
    };
    tooltip = "Start a session";
    icon = (
      <JupyterIcon
        svgClass="svg-inline--fa fa-w-16 icon-link"
        grayscale={true}
      />
    );
    link = <Link to={target}>{icon}</Link>;
  }

  return (
    <>
      <span
        id="checkNotebookIcon"
        className={aligner}
        data-cy="check-notebook-icon"
      >
        {link}
      </span>
      <ThrottledTooltip target="checkNotebookIcon" tooltip={tooltip} />
    </>
  );
};

export {
  CheckNotebookIcon,
  StartNotebookServer,
  mergeEnumOptions,
  ServerOptionBoolean,
  ServerOptionEnum,
  ServerOptionRange,
};

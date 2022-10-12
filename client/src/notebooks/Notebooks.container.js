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

import React, { Component } from "react";
import { connect } from "react-redux";
import qs from "query-string";

import { ACCESS_LEVELS } from "../api-client";
import { NotebooksCoordinator, NotebooksHelper } from "./Notebooks.state";
import {
  StartNotebookServer as StartNotebookServerPresent, NotebooksDisabled, Notebooks as NotebooksPresent,
  CheckNotebookIcon,
} from "./Notebooks.present";
import { StatusHelper } from "../model/Model";
import { Url } from "../utils/helpers/url";
import { sleep } from "../utils/helpers/HelperFunctions";
import ShowSessionFullscreen from "./components/SessionFullScreen";


/**
 * This component is needed to map properties from the redux store and keep local states cleared by the
 * mapping function. We can remove it when we switch to the useSelector hook

 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {boolean} blockAnonymous - When true, block non logged in users
 * @param {Object} scope - object containing filtering parameters
 * @param {string} scope.namespace - full path of the reference namespace
 * @param {string} scope.project - path of the reference project
 * @param {string} scope.defaultBranch - default branch of the project
 * @param {Object} notifications - Notifications object
 * @param {Object} [location] - react location object
 * @param {Object} [history] - react history object
 */

function mapSessionStateToProps(state, ownProps) {
  const metadata = state.stateModel.project.metadata;
  const notebooks = state.stateModel.notebooks.notebooks;
  const available = !!notebooks.all[ownProps.target];
  const notebook = {
    available,
    fetched: notebooks.fetched,
    fetching: notebooks.fetching,
    data: available ?
      notebooks.all[ownProps.target] :
      {},
    logs: state.stateModel.notebooks.logs
  };
  return {
    accessLevel: metadata.accessLevel,
    handlers: ownProps.handlers,
    target: ownProps.target,
    filters: state.stateModel.notebooks.filters,
    notebook
  };
}

const ShowSessionMapped = connect(mapSessionStateToProps)(ShowSessionFullscreen);
class ShowSession extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);
    this.coordinator.reset();
    this.notifications = props.notifications;
    this.target = props.match.params.server;
    this.userLogged = this.userModel.get("logged");

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope, true);

    this.handlers = {
      stopNotebook: this.stopNotebook.bind(this),
      fetchLogs: this.fetchLogs.bind(this),
    };
  }

  componentDidMount() {
    if (!this.props.blockAnonymous)
      this.coordinator.startNotebookPolling();
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
  }

  async stopNotebook(serverName, redirectLocation = null) {
    try {
      await this.coordinator.stopNotebook(serverName, false);
      // redirect immediately
      if (this.props.history && redirectLocation)
        this.props.history.push(redirectLocation);
    }
    catch (error) {
      // add notification
      this.notifications.addError(
        this.notifications.Topics.SESSION_START,
        "Unable to stop the current session.", null, null, null,
        `Error message: "${error.message}"`);
      return false;
    }
  }

  async fetchLogs(serverName, full = false) {
    if (!serverName)
      return;
    return this.coordinator.fetchLogs(serverName, full);
  }

  render() {
    if (this.props.blockAnonymous && !this.userLogged)
      return <NotebooksDisabled logged={this.userLogged} />;
    return (
      <ShowSessionMapped
        isLogged={this.userLogged}
        target={this.target}
        handlers={this.handlers}
        store={this.model.reduxStore}
        history={this.props.history}
        urlBack={this.props.notebookServersUrl}
        projectName={this.props.projectName}
      />
    );
  }
}

function mapSessionListStateToProps(state, ownProps) {
  return {
    handlers: ownProps.handlers,
    ...state.stateModel.notebooks,
    logs: { ...state.stateModel.notebooks.logs, show: ownProps.showingLogs }
  };
}

const VisibleNotebooks = connect(mapSessionListStateToProps)(NotebooksPresent);

/**
 * Display the list of Notebook servers
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {boolean} standalone - Indicates whether it's displayed as standalone
 * @param {boolean} blockAnonymous - When true, block non logged in users
 * @param {Object} [location] - react location object
 * @param {string} [urlNewSession] - url to "new session" page
 * @param {Object} [scope] - object containing filtering parameters
 * @param {string} [scope.namespace] - full path of the reference namespace
 * @param {string} [scope.project] - path of the reference project
 * @param {string} [scope.branch] - branch name
 * @param {string} [scope.defaultBranch] - default branch name of the project
 * @param {string} [scope.commit] - commit full id
 * @param {string} [message] - provide a useful information or warning message
 */
class Notebooks extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);
    // temporarily reset data since notebooks model was not designed to be static
    this.coordinator.reset();
    this.userLogged = this.userModel.get("logged");

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope, true);


    this.state = {
      showingLogs: false
    };

    this.handlers = {
      stopNotebook: this.stopNotebook.bind(this),
      fetchLogs: this.fetchLogs.bind(this),
      toggleLogs: this.toggleLogs.bind(this),
      fetchCommit: this.fetchCommit.bind(this)
    };
  }

  componentDidMount() {
    if (!this.props.blockAnonymous)
      this.coordinator.startNotebookPolling();
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
  }

  // TODO: add info notification here
  stopNotebook(serverName, force) {
    this.coordinator.stopNotebook(serverName, force);
  }

  async fetchLogs(serverName, full = false) {
    if (!serverName)
      return;
    return this.coordinator.fetchLogs(serverName, full);
  }

  async fetchCommit(serverName) {
    if (!serverName)
      return;
    return this.coordinator.fetchCommit(serverName);
  }

  toggleLogs(serverName) {
    let nextState;
    if (this.state.showingLogs !== serverName)
      nextState = serverName;
    else
      nextState = false;
    this.setState({ showingLogs: nextState });

    if (nextState)
      this.fetchLogs(serverName);
  }

  render() {
    if (this.props.blockAnonymous && !this.userLogged)
      return <NotebooksDisabled logged={this.userLogged} />;

    const filePath = this.coordinator?.model?.get("filters.filePath");
    const scope = { ...this.props.scope, filePath };

    return <VisibleNotebooks
      handlers={this.handlers}
      showingLogs={this.state.showingLogs}
      message={this.props.message}
      scope={scope}
      store={this.model.reduxStore}
      standalone={this.props.standalone ? this.props.standalone : false}
      urlNewSession={this.props.urlNewSession}
      user={this.props.user}
    />;
  }
}

/**
 * Displays a start page for new JupyterLab servers.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {Object[]} branches - Branches as returned by gitlab "/branches" API - no autosaved branches
 * @param {Object[]} commits - Commits as stored in the redux store
 * @param {Object[]} autosaved - Autosaved branches
 * @param {function} refreshBranches - Function to invoke to refresh the list of branches
 * @param {Object} scope - object containing filtering parameters
 * @param {string} scope.namespace - full path of the reference namespace
 * @param {string} scope.project - path of the reference project
 * @param {string} externalUrl - GitLab repository url
 * @param {boolean} blockAnonymous - When true, block non logged in users
 * @param {Object} notifications - Notifications object
 * @param {Object} location - react location object. Use location.state.successUrl to indicate the
 *     redirect url to be used when a notebook is successfully started
 * @param {Object} user - user object
 * @param {number} accessLevel - project access level
 * @param {Object} [history] - mandatory if successUrl is provided
 * @param {string} [message] - provide a useful information or warning message
 */
class StartNotebookServer extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);
    this.notifications = props.notifications;
    this.userLogged = this.userModel.get("logged");

    // reset data since notebooks model was not designed to be static
    this.coordinator.reset();

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope);

    // Check auto start mode
    const currentSearch = qs.parse(props.location.search);
    this.autostart = !!(currentSearch && currentSearch["autostart"] && currentSearch["autostart"] === "1");
    this.customBranch = currentSearch && this.autostart && currentSearch["branch"] ?
      currentSearch["branch"] :
      null;
    this.customCommit = currentSearch && this.autostart && currentSearch["commit"] ?
      currentSearch["commit"] :
      null;
    this.customNotebookFilePath = currentSearch && this.autostart && currentSearch["notebook"] ?
      currentSearch["notebook"] :
      null;
    this.state = {
      autosavesCommit: false,
      autostartReady: false,
      autostartTried: false,
      first: true,
      ignorePipeline: null,
      launchError: null,
      showObjectStoreModal: false,
      starting: false,
      commitDelay: false, // used in setCommitWhenReady
      branchDelay: false, // used in setBranchWhenReady
      showShareLinkModal: props.location?.state?.showShareLinkModal,
      filePath: props.location?.state?.filePath,
    };

    this.handlers = {
      deleteAutosave: this.deleteAutosave.bind(this),
      refreshBranches: this.refreshBranches.bind(this),
      refreshCommits: this.refreshCommits.bind(this),
      reTriggerPipeline: this.reTriggerPipeline.bind(this),
      runPipeline: this.runPipeline.bind(this),
      setBranch: this.selectBranch.bind(this),
      setCommit: this.selectCommit.bind(this),
      setIgnorePipeline: this.setIgnorePipeline.bind(this),
      setDisplayedCommits: this.setDisplayedCommits.bind(this),
      setServerOption: this.setServerOptionFromEvent.bind(this),
      startServer: this.startServer.bind(this),
      setObjectStoresConfiguration: this.setObjectStoresConfiguration.bind(this),
      toggleMergedBranches: this.toggleMergedBranches.bind(this),
      toggleShowObjectStoresConfigModal: this.toggleShowObjectStoresConfigModal.bind(this)
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    if (!this.props.blockAnonymous) {
      if (!this.autostart)
        this.coordinator.startNotebookPolling();
      this.coordinator.fetchAutosaves();
      this.selectNotebookFilePath(this.customNotebookFilePath);
      this.refreshBranches();
    }
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
    this.coordinator.stopCiPolling();
    this._isMounted = false;
  }

  async componentDidUpdate(previousProps) {
    // TODO: temporary fix to prevent issue with component rerendered multiple times at the first url load
    if (this.state.first &&
      StatusHelper.isUpdating(previousProps.fetchingBranches) &&
      !StatusHelper.isUpdating(this.props.fetchingBranches)) {
      this.setState({ first: false });
      if (this._isMounted)
        this.refreshBranches().then(r => this.selectBranchWhenReady());
    }
  }

  toggleShowObjectStoresConfigModal() {
    this.setState({ showObjectStoreModal: !this.state.showObjectStoreModal });
  }

  setIgnorePipeline(value) {
    this.setState({ ignorePipeline: value });
  }

  setErrorInAutostart() {
    this.autostart = false;
    this.setState({
      starting: false,
      launchError: {
        frontendError: true,
        pipelineError: false,
        errorMessage: `The session could not be started because the commit or the branch name was not found.`
      },
    });
    this.coordinator.startNotebookPolling();
  }

  async refreshBranches() {
    if (this._isMounted) {
      if (StatusHelper.isUpdating(this.props.fetchingBranches))
        return;
      await this.props.refreshBranches();
      if (this.state.first)
        this.selectBranchWhenReady();
    }
  }

  async selectBranchWhenReady() {
    // Select branch only when autosaves data are available
    if (this._isMounted) {
      const autosavesAvailable = this.model.get("autosaves.fetched");
      if (this.props.branches.fetching || !autosavesAvailable) {
        this.setState({ branchDelay: true });
        setTimeout(() => { this.selectBranchWhenReady(); }, 500);
      }
      else {
        this.setState({ branchDelay: false });
        this.selectBranch(this.customBranch);
      }
    }
  }

  selectNotebookFilePath(notebookFilePath) {
    if (!notebookFilePath)
      return;
    this.coordinator.setNotebookFilePath(notebookFilePath);
  }

  async selectBranch(branchName) {
    if (this._isMounted) {
      // get the useful branchName
      let autoBranchName = false;
      if (!branchName) {
        const oldBranch = this.model.get("filters.branch");
        if (oldBranch && oldBranch.branchName)
          branchName = oldBranch.branchName;
        else
          branchName = this.model.get("filters.defaultBranch");

        autoBranchName = true;
      }

      // get the proper branch
      let branchToSet = {};
      const { branches } = this.props;

      const branch = branches.filter(branch => branch.name === branchName);

      if (branch.length === 1) {
        branchToSet = branch[0];
      }
      else if (autoBranchName && branches?.length) {
        branchToSet = branches[0];
      }
      else if (this.customBranch || this.customCommit) {
        // set the error and get the first branch anyway
        branchToSet = branches[0];
        this.setErrorInAutostart();
      }

      this.coordinator.setBranch(branchToSet);
      this.setState({ autosavesCommit: false });
      if (!branchToSet)
        this.coordinator.setCommit({});
      else
        this.refreshCommits();
    }
  }

  async refreshCommits() {
    if (this._isMounted) {
      const branch = this.model.get("filters.branch");
      await this.props.refreshCommits({ branch: branch.name });
      this.selectCommitWhenReady();
    }
  }

  async selectCommitWhenReady() {
    // Ugly workaround to prevent stalling when commits.fetch was invoked somewhere else
    if (this._isMounted) {
      // check also if notebooks have been fetched, to be sure running sessions are not ignored
      const notebooks = this.model.get("notebooks");
      let delay = false;
      // if (this.props.commits.fetching || !notebooks.fetched)
      if (this.props.commits.fetching) {
        delay = 500;
      }
      else if (!notebooks.fetched) {
        if (notebooks.fetching) {
          delay = 500;
        }
        else {
          // this may happen with autostart
          this.coordinator.startNotebookPolling();
          delay = 2000;
        }
      }

      if (delay) {
        this.setState({ commitDelay: true });
        setTimeout(() => { this.selectCommitWhenReady(); }, delay);
      }
      else {
        this.setState({ commitDelay: false });
        this.selectCommit(this.customCommit);
      }
    }
  }

  async selectCommit(commitId) {
    if (this._isMounted) {
      // filter the list of commits according to the constraints
      const maximum = this.model.get("filters.displayedCommits");
      const commits = maximum && parseInt(maximum) > 0 ?
        this.props.commits.list.slice(0, maximum) :
        this.props.commits.list;
      let commit = commits[0];

      // find the proper commit or return
      if (commitId) {
        const filteredCommits = commits.filter(commit => commit.id === commitId);
        if (filteredCommits.length === 1)
          commit = filteredCommits[0];
        else if (commitId === "latest")
          commit = commits[0];
        else if (this.customBranch || this.customCommit)
          this.setErrorInAutostart();
        else
          return;
      }
      else {
        // check if there is an autosave for this branch, and find the corresponding commit
        const autosaves = this.model.get("autosaves");
        const branch = this.model.get("filters.branch");
        let autosaveFound = false;
        if (branch.name && autosaves.fetched && !autosaves.error && autosaves.list?.length) {
          const autosave = autosaves.list.find(a => a.branch === branch.name);
          if (autosave) {
            const autosaveCommit = commits.find(commit => commit.id.startsWith(autosave.commit));
            commit = autosaveCommit;
            autosaveFound = true;
            if (autosaveCommit && this.state.autosavesCommit !== autosaveCommit?.id)
              this.setState({ autosavesCommit: autosaveCommit.id });
          }
        }

        // set a running session if any is active and valid
        if (!autosaveFound) {
          // verify data and sessions
          const notebooks = this.model.get("notebooks");
          const anyNotebook = notebooks?.all && Object.keys(notebooks.all).length ? true : false;
          const validNotebooks = branch.name && notebooks.lastParameters.includes(branch.name) ? true : false;
          if (anyNotebook && validNotebooks) {
            // get the first session with a valid commit -- that should almost always be the case for running sessions
            Object.keys(notebooks.all).find(k => {
              const annotations = NotebooksHelper.cleanAnnotations(notebooks.all[k].annotations, "renku.io");
              const targetCommit = commits.find(commit => commit.id === annotations["commit-sha"]);
              if (targetCommit) {
                commit = targetCommit;
                return true;
              }
              return false;
            });
          }
        }

        // check if the current commit needs to be updated
        const oldCommit = this.model.get("filters.commit");
        if (oldCommit && oldCommit.id && oldCommit.id === commit.id)
          return;
      }

      this.coordinator.setCommit(commit);
      this.refreshPipelines();
    }
  }

  async refreshPipelines(force = false) {
    if (this._isMounted) {
      const { accessLevel, user } = this.props;
      await this.coordinator.fetchNotebookOptions(); // TODO: this should not be here
      const callback = () => { };
      const owner = accessLevel >= ACCESS_LEVELS.DEVELOPER;
      await this.coordinator.fetchOrPollCi(force, user.logged, owner, callback);
      this.triggerAutoStart();
    }
  }

  async reTriggerPipeline() {
    const projectPathWithNamespace = `${encodeURIComponent(this.props.scope.namespace)}%2F${this.props.scope.project}`;
    const pipeline = this.model.get("ci.pipelines.target");
    if (pipeline?.id) {
      await this.props.client.retryPipeline(projectPathWithNamespace, pipeline.id);
      return this.refreshPipelines();
    }
  }

  async runPipeline() {
    const projectPathWithNamespace = `${encodeURIComponent(this.props.scope.namespace)}%2F${this.props.scope.project}`;
    const branch = this.model.get("filters.branch");
    const reference = branch?.name ?
      branch.name :
      null;
    if (reference) {
      try {
        await this.props.client.runPipeline(projectPathWithNamespace, reference);
      }
      catch {
        // ? Swallow exceptions that may happen when not working on the latest branch's commit after multiple clicks
      }
      sleep(NotebooksHelper.pollingInterval + 1); // ? This is bad, but it prevents flashing a wrong status
    }
  }

  async triggerAutoStart() {
    if (this._isMounted) {
      if (this.autostart && !this.state.autostartReady && !this.state.autostartTried) {
        const data = this.model.get();
        const ciStatus = NotebooksHelper.checkCiStatus(data.ci);
        const fetched = data.notebooks.fetched && data.options.fetched && !ciStatus.ongoing;
        if (fetched) {
          // start when the image is available
          if (ciStatus.available) {
            this.setState({ autostartReady: true });
            this.startServer();
          }
          else {
            let errorMessage;

            // image is building through the job
            if (
              ciStatus.stage === NotebooksHelper.ciStages.jobs &&
              NotebooksHelper.getCiJobStatus(data.ci.jobs?.target) === NotebooksHelper.ciStatuses.running
            ) {
              errorMessage = "The session could not start because the image is still building. " +
                "Please wait for the build to finish, or start the session with the base image";
            }
            // images is not available
            else if (!ciStatus.available) {
              errorMessage = "The session could not start because no image is available. " +
                "Please select a different commit or start the session with the base image.";
            }
            // it's probably lost in some short-living temporary state before assessing the image is not available
            else {
              errorMessage = "The session could not start. If it's the first time you see this message, " +
                "please wait a few minutes and try to refresh the page.";
            }

            this.setState({
              autostartReady: true,
              autostartTried: true,
              launchError: { frontendError: true, pipelineError: true, errorMessage },
              starting: false
            });
          }
        }
        else {
          setTimeout(() => { this.triggerAutoStart(); }, 1000);
        }
      }
    }
  }

  setServerOptionFromEvent(option, event, providedValue = null) {
    const target = event.target.type.toLowerCase();
    let value = providedValue;
    if (!providedValue && providedValue !== 0) {
      if (target === "button")
        value = event.target.textContent;

      else if (target === "checkbox")
        value = event.target.checked;

      else
        value = event.target.value;

    }

    this.coordinator.setNotebookOptions(option, value);
  }

  async deleteAutosave(autosave) {
    if (this._isMounted) {
      const result = await this.coordinator.deleteAutosave(autosave);
      // refresh autosaves only when no error was triggered
      if (result) {
        await this.coordinator.fetchAutosaves();
        this.selectCommit("latest");
      }
      return result;
    }
  }


  setObjectStoresConfiguration(value) {
    this.coordinator.setObjectStoresConfiguration(value);
  }

  internalStartServer() {
    // The core internal logic extracted here for re-use
    const { location, history } = this.props;
    return this.coordinator.startServer().then((data) => {
      this.setState({ "starting": false });
      // redirect user when necessary
      if (!history || !location)
        return;
      if (location.state && location.state.successUrl && history.location.pathname === location.pathname) {
        if (this.autostart && !this.state.autostartTried) {
          // Derive the local Url and connect to the notebook
          const annotations = NotebooksHelper.cleanAnnotations(data.annotations, "renku.io");
          const localUrl = Url.get(Url.pages.project.session.show, {
            namespace: annotations["namespace"],
            path: annotations["projectName"],
            server: data.name,
          });
          const state = { filePath: this.customNotebookFilePath };

          // ? Start with a short delay to prevent missing server information from "GET /servers" API
          setTimeout(() => {
            this.setState({ autostartTried: true });
            history.push({ pathname: localUrl, search: "", state });
          }, 3000);
        }
        else {
          history.push(location.state.successUrl);
        }
      }
    });
  }

  startServer() {
    //* Data from notebooks/servers endpoint needs some time to update properly.
    //* To avoid flickering UI, just set a temporary state and display a loading wheel.
    this.setState({ "starting": true, launchError: null });
    this.internalStartServer().catch((error) => {
      if (error.cause && error.cause.response && error.cause.response.status) {
        if (error.cause.response.status === 500) {
          // Some failures just go away. Try again to see if it works the second time.
          setTimeout(() => {
            this.internalStartServer().catch((error) => {
              this.handleNotebookStartError(error);
            });
          }, 3000);
        }
        else { this.handleNotebookStartError(error); }
      }
      else { this.handleNotebookStartError(error); }
    });
  }

  handleNotebookStartError(error) {
    // crafting notification
    const fullError = `An error occurred when trying to start a new session.
              Error message: "${error.message}", Stack trace: "${error.stack}"`;
    this.notifications.addError(
      this.notifications.Topics.SESSION_START,
      "Unable to start the session.",
      this.props.location.pathname, "Try again",
      null, // always toast
      fullError);
    this.setState({ "starting": false, launchError: error.message });
    if (this.autostart && !this.state.autostartTried)
      this.setState({ autostartTried: true });
  }

  toggleMergedBranches() {
    const currentSetting = this.model.get("filters.includeMergedBranches");
    this.coordinator.setMergedBranches(!currentSetting);
    this.selectBranch(this.customBranch);
  }

  setDisplayedCommits(number) {
    this.coordinator.setDisplayedCommits(number);
    this.selectCommit(this.customCommit);
  }

  filterAutosavedBranches(branches, username) {
    if (!username || !branches)
      return [];
    return branches.filter(branch => branch.autosave.username === username);
  }

  propsToChildProps() {
    const username = this.props.user.logged ?
      this.props.user.data.username :
      null;
    const ownAutosaved = this.filterAutosavedBranches([...this.props.autosaved], username);
    const augmentedState = {
      ...this.props.notebooks,
      data: {
        autosaved: ownAutosaved,
        branches: this.props.branches,
        commits: this.props.commits.list,
        fetched: this.props.commits.fetched,
        fetching: this.props.commits.fetching,
      },
      delays: {
        branch: this.state.branchDelay,
        commit: this.state.commitDelay
      },
      externalUrl: this.props.externalUrl,
      fetchingBranches: StatusHelper.isUpdating(this.props.fetchingBranches),
      showObjectStoreModal: this.state.showObjectStoreModal
    };
    return {
      handlers: this.handlers,
      ...augmentedState
    };
  }

  render() {
    if (this.props.blockAnonymous && !this.userLogged)
      return <NotebooksDisabled logged={this.userLogged} />;

    return <StartNotebookServerPresent
      autoStarting={this.autostart && !this.state.autostartTried}
      autosavesCommit={this.state.autosavesCommit}
      ignorePipeline={this.state.ignorePipeline}
      inherited={this.props}
      justStarted={this.state.starting}
      launchError={this.state.launchError}
      lockStatus={this.props.lockStatus}
      message={this.props.message}
      {...this.propsToChildProps()}
    />;
  }
}

function mapNotebookStatusStateToProps(state, ownProps) {
  const subState = state.stateModel.notebooks;

  const notebookKeys = Object.keys(subState.notebooks.all);
  const notebook = notebookKeys.length > 0 ?
    subState.notebooks.all[notebookKeys] :
    null;

  return {
    fetched: subState.notebooks.fetched,
    fetching: subState.notebooks.fetching,
    notebook
  };
}

const VisibleNotebookIcon = connect(mapNotebookStatusStateToProps)(CheckNotebookIcon);

/**
 * Display the connect to Jupyter icon
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {string} filePath - relative path of the target notebook file
 * @param {string} launchNotebookUrl - launch notebook url
 * @param {Object} scope - object containing filtering parameters
 * @param {string} scope.namespace - full path of the reference namespace
 * @param {string} scope.project - path of the reference project
 * @param {string} scope.branch - branch name
 * @param {string} scope.defaultBranch - default branch of the project
 * @param {string} scope.commit - commit full id or "latest"
 * @param {Object} [location] - react location object
 * @param {number} [pollingInterval] - polling timeout interval in seconds
 */
class CheckNotebookStatus extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);

    // temporarily reset data since notebooks model was not designed to be static
    this.coordinator.reset();

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope);

  }

  async componentDidMount() {
    let { scope } = this.props;
    if (!scope.branch)
      return;
    this.coordinator.setNotebookFilters(scope);

    const pollingInterval = this.props.pollingInterval ?
      parseInt(this.props.pollingInterval) * 1000 :
      5000;

    this.coordinator.startNotebookPolling(pollingInterval);
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
  }

  mapStateToProps(state, ownProps) {
    const subState = state.stateModel.notebooks;

    const notebookKeys = Object.keys(subState.notebooks.all);
    const notebook = notebookKeys.length > 0 ?
      subState.notebooks.all[notebookKeys] :
      null;

    return {
      fetched: subState.notebooks.fetched,
      fetching: subState.notebooks.fetching,
      notebook
    };
  }

  render() {
    return (<VisibleNotebookIcon store={this.model.reduxStore} {...this.props} />);
  }
}


export { CheckNotebookStatus, Notebooks, ShowSession, StartNotebookServer };

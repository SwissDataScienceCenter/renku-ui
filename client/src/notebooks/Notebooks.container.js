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

import { NotebooksCoordinator, NotebooksHelper } from "./Notebooks.state";
import {
  StartNotebookServer as StartNotebookServerPresent, NotebooksDisabled, Notebooks as NotebooksPresent,
  CheckNotebookIcon, ShowSession as ShowSessionPresent
} from "./Notebooks.present";
import { StatusHelper } from "../model/Model";
import { ProjectCoordinator } from "../project";
import { Url } from "../utils/url";


/**
 * This component is needed to map properties from the redux store and keep local states cleared by the
 * mapping function. We can remove it when we switch to the useSelector hook

 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {boolean} blockAnonymous - When true, block non logged in users
 * @param {Object} scope - object containing filtering parameters
 * @param {string} scope.namespace - full path of the reference namespace
 * @param {string} scope.project - path of the reference project
 * @param {Object} notifications - Notifications object
 * @param {Object} [location] - react location object
 * @param {Object} [history] - react history object
 */
class ShowSession extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);
    this.coordinator.reset();
    this.notifications = props.notifications;
    this.target = props.match.params.server;

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

  mapStateToProps(state, ownProps) {
    const notebooks = state.notebooks.notebooks;
    const available = notebooks.all[this.target] ?
      true :
      false;
    const notebook = {
      available,
      fetched: notebooks.fetched,
      fetching: notebooks.fetching,
      data: available ?
        notebooks.all[this.target] :
        {},
      logs: state.notebooks.logs
    };
    return {
      handlers: this.handlers,
      target: this.target,
      filters: state.notebooks.filters,
      notebook
    };
  }


  render() {
    if (this.props.blockAnonymous)
      return <NotebooksDisabled location={this.props.location} />;

    const ShowSessionMapped = connect(this.mapStateToProps.bind(this))(ShowSessionPresent);
    return (
      <ShowSessionMapped
        store={this.model.reduxStore}
      />
    );
  }
}

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

  mapStateToProps(state, ownProps) {
    return {
      handlers: this.handlers,
      ...state.notebooks,
      logs: { ...state.notebooks.logs, show: this.state.showingLogs }
    };
  }

  render() {
    if (this.props.blockAnonymous)
      return <NotebooksDisabled location={this.props.location} />;

    const VisibleNotebooks = connect(this.mapStateToProps.bind(this))(NotebooksPresent);

    return <VisibleNotebooks
      store={this.model.reduxStore}
      user={this.props.user}
      standalone={this.props.standalone ? this.props.standalone : false}
      scope={this.props.scope}
      message={this.props.message}
      urlNewSession={this.props.urlNewSession}
    />;
  }
}

/**
 * Displays a start page for new JupyterLab servers.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {Object[]} branches - Branches as returned by gitlab "/branches" API - no autosaved branches
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
 * @param {Object} [history] - mandatory if successUrl is provided
 * @param {string} [message] - provide a useful information or warning message
 */
class StartNotebookServer extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(props.client, this.model, this.userModel);
    // TODO: this should go away when moving all project content to projectCoordinator
    this.projectModel = props.model.subModel("project");
    this.projectCoordinator = new ProjectCoordinator(props.client, this.projectModel, props.notifications);
    this.notifications = props.notifications;
    // temporarily reset data since notebooks model was not designed to be static
    this.coordinator.reset();

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope);

    // Check auto start mode
    const currentSearch = qs.parse(props.location.search);
    this.autostart = currentSearch && currentSearch["autostart"] && currentSearch["autostart"] === "1" ?
      true :
      false;
    this.state = {
      autostartReady: false,
      autostartTried: false
    };

    this.handlers = {
      refreshBranches: this.refreshBranches.bind(this),
      refreshCommits: this.refreshCommits.bind(this),
      reTriggerPipeline: this.reTriggerPipeline.bind(this),
      setBranch: this.selectBranch.bind(this),
      setCommit: this.selectCommit.bind(this),
      toggleMergedBranches: this.toggleMergedBranches.bind(this),
      setDisplayedCommits: this.setDisplayedCommits.bind(this),
      setServerOption: this.setServerOptionFromEvent.bind(this),
      startServer: this.startServer.bind(this)
    };

    this.state = {
      first: true,
      starting: false,
      launchError: null
    };
  }

  componentDidMount() {
    this._isMounted = true;
    if (!this.props.blockAnonymous) {
      this.coordinator.startNotebookPolling();
      this.refreshBranches();
    }
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
    this.coordinator.stopPipelinePolling();
    this._isMounted = false;
  }

  componentDidUpdate(previousProps) {
    // TODO: temporary fix to prevent issue with component rerendered multiple times at the first url load
    if (this.state.first &&
      StatusHelper.isUpdating(previousProps.branches) &&
      !StatusHelper.isUpdating(this.props.branches)) {
      this.setState({ first: false });
      if (this._isMounted)
        this.selectBranch();

    }
  }

  async refreshBranches() {
    if (this._isMounted) {
      if (StatusHelper.isUpdating(this.props.branches))
        return;
      await this.props.refreshBranches();
      if (this._isMounted && this.state.first)
        this.selectBranch();

    }
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
          branchName = "master";

        autoBranchName = true;
      }

      // get the proper branch and set it
      const { branches } = this.props;
      const branch = branches.filter(branch => branch.name === branchName);
      if (branch.length === 1) {
        this.coordinator.setBranch(branch[0]);
        this.refreshCommits();
      }
      else {
        if (autoBranchName && branches && branches.length) {
          this.coordinator.setBranch(branches[0]);
          this.refreshCommits();
        }
        else {
          this.coordinator.setBranch({});
          this.coordinator.setCommit({});
        }
      }
    }
  }

  async refreshCommits() {
    if (this._isMounted) {
      if (!this.projectModel.get("commits.fetching")) {
        const branch = this.model.get("filters.branch");
        await this.projectCoordinator.fetchCommits({ branch: branch.name });
      }
      this.selectCommitWhenReady();
    }
  }

  // TODO: ugly workaround until branches and commits will be unified in projectCoordinator
  async selectCommitWhenReady() {
    if (this._isMounted) {
      if (this.projectModel.get("commits.fetching"))
        setTimeout(() => { this.selectCommitWhenReady(); }, 100);
      else
        this.selectCommit();
    }
  }

  async selectCommit(commitId) {
    if (this._isMounted) {
      // filter the list of commits according to the constraints
      const maximum = this.model.get("filters.displayedCommits");
      const commits = maximum && parseInt(maximum) > 0 ?
        this.projectModel.get("commits.list").slice(0, maximum) :
        this.projectModel.get("commits.list");
      let commit = commits[0];

      // find the proper commit or return
      if (commitId) {
        const filteredCommits = commits.filter(commit => commit.id === commitId);
        if (filteredCommits.length !== 1)
          return;
        commit = filteredCommits[0];
      }
      else {
        const oldCommit = this.model.get("filters.commit");
        if (oldCommit && oldCommit.id && oldCommit.id === commit.id)
          return;
      }

      this.coordinator.setCommit(commit);
      this.refreshPipelines();
    }
  }

  async refreshPipelines() {
    if (this._isMounted) {
      await this.coordinator.fetchNotebookOptions();
      await this.coordinator.startPipelinePolling();
      this.triggerAutoStart();
    }
  }

  async reTriggerPipeline() {
    const projectPathWithNamespace = `${encodeURIComponent(this.props.scope.namespace)}%2F${this.props.scope.project}`;
    const pipelineId = this.model.get("pipelines.main.id");
    await this.props.client.retryPipeline(projectPathWithNamespace, pipelineId);
    return this.refreshPipelines();
  }

  async triggerAutoStart() {
    if (this._isMounted) {
      if (this.autostart && !this.state.autostartReady && !this.state.autostartTried) {
        const data = this.model.get();
        const fetched = data.notebooks.fetched && data.options.fetched && data.pipelines.fetched;
        if (fetched) {
          const mainPipeline = data.pipelines.main;
          if (data.pipelines.type === NotebooksHelper.pipelineTypes.customImage ||
              (mainPipeline && mainPipeline.status === "success")) {
            this.setState({ autostartReady: true });
            this.startServer();
          }
          else if (mainPipeline && (mainPipeline.status === "running" || mainPipeline.status === "pending")) {
            this.setState({
              autostartReady: true,
              autostartTried: true,
              launchError: {
                frontendError: true,
                errorMessage: `The session could not start because the image is still building.
                Please wait for the build to finish, or start the session with the base image.`
              },
              starting: false });
          }
          else {
            this.setState({
              autostartReady: true,
              autostartTried: true,
              launchError: {
                frontendError: true,
                errorMessage: `The session could not start because no image is available.
                Please select a different commit or start the session with the base image.`
              },
              starting: false });
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
    if (!providedValue != null) {
      if (target === "button")
        value = event.target.textContent;

      else if (target === "checkbox")
        value = event.target.checked;

      else
        value = event.target.value;

    }

    this.coordinator.setNotebookOptions(option, value);
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

          // ? Start with a short delay to prevent missing server information from "GET /servers" API
          setTimeout(() => {
            this.setState({ autostartTried: true });
            history.push({ pathname: localUrl, search: "" });
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
      // Some failures just go away. Try again to see if it works the second time.
      setTimeout(() => {
        this.internalStartServer().catch((error) => {
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
        });
      }, 3000);
    });
  }

  toggleMergedBranches() {
    const currentSetting = this.model.get("filters.includeMergedBranches");
    this.coordinator.setMergedBranches(!currentSetting);
    this.selectBranch();
  }

  setDisplayedCommits(number) {
    this.coordinator.setDisplayedCommits(number);
    this.selectCommit();
  }

  filterAutosavedBranches(branches, username) {
    if (!username || !branches)
      return [];
    return branches.filter(branch => branch.autosave.username === username);
  }

  mapStateToProps(state, ownProps) {
    const username = state.user.logged ?
      state.user.data.username :
      null;
    const ownAutosaved = this.filterAutosavedBranches([...ownProps.inherited.autosaved], username);
    const augmentedState = {
      ...state.notebooks,
      data: {
        fetched: state.project.commits.fetched,
        fetching: state.project.commits.fetching,
        commits: state.project.commits.list,
        branches: ownProps.inherited.branches,
        autosaved: ownAutosaved
      },
      externalUrl: ownProps.inherited.externalUrl
    };
    return {
      handlers: this.handlers,
      store: ownProps.store, // adds store and other props manually added to <ConnectedStartNotebookServer />
      ...augmentedState
    };
  }

  render() {
    if (this.props.blockAnonymous)
      return <NotebooksDisabled location={this.props.location} />;

    const ConnectedStartNotebookServer = connect(this.mapStateToProps.bind(this))(StartNotebookServerPresent);

    return <ConnectedStartNotebookServer
      store={this.model.reduxStore}
      inherited={this.props}
      message={this.props.message}
      justStarted={this.state.starting}
      autoStarting={this.autostart && !this.state.autostartTried}
      launchError={this.state.launchError}
    />;
  }
}

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
    // TODO: this should go away when moving all project content to projectCoordinator
    this.projectCoordinator = new ProjectCoordinator(props.client, props.model.subModel("project"));
    // temporarily reset data since notebooks model was not designed to be static
    this.coordinator.reset();

    if (props.scope)
      this.coordinator.setNotebookFilters(props.scope);

  }

  async componentDidMount() {
    // ! temporary -- ignore missing branch and get "latest" commit
    let { scope } = this.props;
    if (!scope.branch || !scope.commit)
      return;
    if (scope.commit === "latest") {
      let commits = await this.projectCoordinator.fetchCommits();
      scope.commit = commits[0];
      this.coordinator.setNotebookFilters(scope);
    }

    const pollingInterval = this.props.pollingInterval ?
      parseInt(this.props.pollingInterval) * 1000 :
      5000;

    this.coordinator.startNotebookPolling(pollingInterval);
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
  }

  mapStateToProps(state, ownProps) {
    const subState = state.notebooks;

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
    const VisibleNotebookIcon = connect(this.mapStateToProps.bind(this))(CheckNotebookIcon);

    return (<VisibleNotebookIcon store={this.model.reduxStore} {...this.props} />);
  }
}

export { CheckNotebookStatus, Notebooks, ShowSession, StartNotebookServer };

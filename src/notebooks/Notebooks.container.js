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
import { connect } from 'react-redux'

import { NotebookServers } from './Notebooks.present';
import { StartNotebookServer as StartNotebookServerPresent } from './Notebooks.present';

import NotebooksModel from './Notebooks.state';
import { Notebooks as NotebooksPresent } from './Notebooks.present';
import { StatusHelper } from '../model/Model'

/**
 * Displays a start page for new Jupiterlab servers.
 * 
 * @param {Object[]} branches   Branches as returned by gitlab "/branches" API - no autosaved branches
 * @param {Object[]} autosaved   Autosaved branches
 * @param {function} refreshBranches   Function to invoke to refresh the list of branches
 * @param {number} projectId   id of the reference project
 * @param {number} projectPath   path of the reference project
 * @param {Object} client   api-client used to query the gateway
 * @param {string} successUrl  Optional: url to redirect when then notebook is succesfully started
 * @param {Object} history  Optional: used with successUrl to properly set the new url without reloading the page
 */
class StartNotebookServer extends Component {
  constructor(props) {
    super(props);
    this.model = new NotebooksModel(props.client);

    this.handlers = {
      refreshBranches: this.refreshBranches.bind(this),
      refreshCommits: this.refreshCommits.bind(this),
      setBranch: this.setBranchFromName.bind(this),
      setCommit: this.setCommitFromId.bind(this),
      toggleMergedBranches: this.toggleMergedBranches.bind(this),
      setDisplayedCommits: this.setDisplayedCommits.bind(this),
      setServerOption: this.setServerOptionFromEvent.bind(this),
      startServer: this.startServer.bind(this)
    }

    this.state = { 
      first: true,
      startring: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.startNotebookPolling();
    this.refreshBranches();
  }

  componentWillUnmount() {
    this.stopNotebookPolling();
    this._isMounted = false;
  }

  componentDidUpdate(previousProps) {
    // TODO: this is a temporary fix, remove it once the component won't be
    // rerendered multiple times at the first url load
    if (this.state.first &&
        StatusHelper.isUpdating(previousProps.branches) &&
        !StatusHelper.isUpdating(this.props.branches)) {
      this.autoselectBranch(this.props.branches);
      this.setState({ first: false });
    }
  }

  refreshBranches() {
    const { branches } = this.props;
    if (StatusHelper.isUpdating(branches)) return;
    this.props.refreshBranches().then((branches) => {
      this.autoselectBranch(branches);
    });
  }

  setBranch(branch) {
    const oldBranch = this.model.get("filters.branch");
    if (!branch.name || branch.name === oldBranch.name)
      return;
    this.model.setBranch(branch);
    this.refreshCommits(branch);
  } 
  
  setBranchFromName(eventOrName) {
    const { branches } = this.props;
    const branchName = eventOrName.target ?
      eventOrName.target.value :
      eventOrName;
    for (let branchCurrent of branches) {
      if (branchName === branchCurrent.name) {
        this.setBranch(branchCurrent);
      }
    }
  }

  validateBranch(updatedBranches, updatedBranch) {
    const branch = updatedBranch ?
      updatedBranch :
      this.model.get("filters.branch");
    if (branch.name === undefined)
      return true;
    
    const branches = updatedBranches ?
      updatedBranches :
      this.props.branches;
    const filterBranches = !this.model.get("filters.includeMergedBranches");
    const filteredBranches = filterBranches ?
      branches.filter(branch => !branch.merged ? branch : null ) :
      branches;
    for (let branchCurrent of filteredBranches) {
      if (branch.name === branchCurrent.name) {
        return true;
      }
    }

    this.setBranch({});
    this.setCommit({});
    return false;
  }

  autoselectBranch(branches, defaultBranch = "master") {
    if (this._isMounted) {
      const branch = this.model.get("filters.branch");
      if (!branch.name) {
        const autoSelect = branches.filter(branch => branch.name === defaultBranch);
        if (autoSelect.length !== 1) return; // improve this logic if necessary when defaultBranch will be dynamic
        this.setBranch(autoSelect[0]);
      }
      else {
        this.validateBranch(branches);
      }
    }
  }

  refreshCommits(updatedBranch) {
    const commits = this.model.get("data.commits");
    if (StatusHelper.isUpdating(commits)) return;
    const { projectId } = this.props;
    const branch = updatedBranch && typeof updatedBranch === "string" ?
      updatedBranch :
      this.model.get("filters.branch");
    this.model.fetchCommits(projectId, branch.name).then((commits) => {
      this.autoselectCommit(commits);
    });
  }

  setCommit(commit) {
    const oldCommit = this.model.get("filters.commit");
    if (commit.id === oldCommit.id) {
      return;
    }
    this.model.setCommit(commit);
    this.model.verifyIfRunning(this.props.projectId, this.props.projectPath);
  }

  setCommitFromId(eventOrId) {
    const commits = this.model.get("data.commits");
    const commitId = eventOrId.target ?
      eventOrId.target.value :
      eventOrId;
    for (let commitCurrent of commits) {
      if (commitId === commitCurrent.id) {
        this.setCommit(commitCurrent);
      }
    }
  }

  validateCommit(updatedCommits, updatedCommit) {
    const commit = updatedCommit ?
      updatedCommit :
      this.model.get("filters.commit");
    if (commit.id === undefined) {
      return true;
    }

    const commits = updatedCommits ?
      updatedCommits :
      this.model.get("data.commits");

    const maxCommits = this.model.get("filters.displayedCommits");
    const filteredCommits = maxCommits && maxCommits > 0 ?
      commits.slice(0, maxCommits) :
      commits;
    for (let commitCurrent of filteredCommits) {
      if (commit.id === commitCurrent.id) {
        // necessary for istant refresh in the UI
        this.model.verifyIfRunning(this.props.projectId, this.props.projectPath);
        return true;
      }
    }

    this.setCommit({});
    return false;
  }

  autoselectCommit(commits, defaultCommit = 0) {
    if (this._isMounted) {
      if (this._isMounted) {
        const commit = this.model.get("filters.commit");
        if (!commit.id) {
          const autoSelect = commits[defaultCommit];
          if (!autoSelect) return; // improve this logic if "latest" won't be the default anymore
          this.setCommit(autoSelect);
        }
        else {
          this.validateCommit(commits);
        }
      }
    }
  }

  setServerOptionFromEvent(option, event) {
    const value = event.target.checked !== undefined ?
      event.target.checked:
      event.target.value;
    this.model.setNotebookOptions(option, value);
  }

  startServer() {
    // Data from notebooks/servers endpoint needs some time to update propery.
    // To avoid flickering UI, just set a temporary state and display a loading wheel.
    // TODO: change this when the notebook service will be updated.
    const { successUrl } = this.props;
    if (!successUrl) {
      this.model.startServer(this.props.projectPath);
    }
    else {
      this.setState({ "starting": true });
      this.model.startServer(this.props.projectPath).then((data) => {
        this.props.history.push(successUrl);
      });
    }
  }

  toggleMergedBranches(event) {
    const currentSetting = this.model.get("filters.includeMergedBranches");
    this.model.setMergedBranches(!currentSetting);
    this.validateBranch();
  }

  setDisplayedCommits(event) {
    this.model.setDisplayedCommits(event.target.value);
    this.validateCommit();
  }

  startNotebookPolling() {
    this.model.startNotebookPolling(this.props.projectId, this.props.projectPath, true);
  }

  stopNotebookPolling() {
    this.model.stopNotebookPolling();
  }
  
  mapStateToProps(state, ownProps) {
    const augmentedState = { ...state,
      data: {...state.data,
        branches: ownProps.inherited.branches,
        autosaved: ownProps.inherited.autosaved
      }
    };
    return {
      handlers: this.handlers,
      store: ownProps.store, // adds store and other props manually added to <ConnectedStartNotebookServer />
      ...augmentedState
    }
  }

  render() {
    const ConnectedStartNotebookServer = connect(this.mapStateToProps.bind(this))(StartNotebookServerPresent);

    return <ConnectedStartNotebookServer
      store={this.model.reduxStore}
      inherited={this.props} // need to espose them for mapStateToProps, but don't whan to pollute props
      projectId={this.props.projectId}
      projectPath={this.props.projectPath}
      justStarted={this.state.starting}
    />;
  }
}

/**
 * @param {Object} client   api-client used to query the gateway
 * @param {boolean} standalone   Indicates whether it's displayed as standalone
 * @param {number} projectId   Optional, used to focus on a single project
 */
class Notebooks extends Component {
  constructor(props) {
    super(props);
    this.model = new NotebooksModel(props.client);

    this.handlers = {
      onStopNotebook: this.onStopNotebook.bind(this)
    }
  }

  componentDidMount() {
    this.startNotebookPolling();
  }

  componentWillUnmount() {
    this.stopNotebookPolling();
  }

  startNotebookPolling() {
    this.model.startNotebookPolling(this.props.projectId);
  }
  stopNotebookPolling() {
    this.model.stopNotebookPolling();
  }
  onStopNotebook(serverName){
    return this.model.stopNotebook(serverName);
  }

  mapStateToProps(state, ownProps) {
    return {
      handlers: this.handlers,
      ...state
    }
  }

  render() {
    const VisibleNotebooks = connect(this.mapStateToProps.bind(this))(NotebooksPresent);

    return <VisibleNotebooks
      store={this.model.reduxStore}
      user={this.props.user}
      standalone={this.props.standalone ? this.props.standalone : false}
      projectId={this.props.projectId}
    />
  }
}


export { NotebookServers, Notebooks, StartNotebookServer };

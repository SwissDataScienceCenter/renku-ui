/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Notebooks.state.js
 *  Redux-based state-management code.
 */

import { Schema, StateKind, StateModel } from '../model/Model';
import { cleanAnnotations } from '../api-client/notebook-servers';

const notebooksSchema = new Schema({
  notebooks: {
    schema: {
      polling: {initial: null},
      all: {initial: {}},
      status: {initial: null},
      url: {initial: null},
      fetching: {initial:false}
    }
  },
  filters: {
    schema: {
      branch: {initial: {}},
      commit: {initial: {}},
      includeMergedBranches: {initial:false},
      displayedCommits: {initial:10},
      displayCommitAuthor: {initial:true},
      displayCommitTimestamp: {initial:true}
    }
  },
  data: {
    schema: {
      commits: {initial:[]}, // is this the proper place? should this logic moved to Project?
      error: {initial:null},
      notebookOptions: {initial:{}},
      selectedOptions: {initial:{}}
    }
  }
});

const POLLING_INTERVAL = 3000;

class NotebooksModel extends StateModel {
  constructor(client) {
    super(notebooksSchema, StateKind.REDUX);
    this.client = client;
  }

  setMergedBranches(value) {
    this.set('filters.includeMergedBranches', value);
  }

  setDisplayedCommits(value) {
    this.set('filters.displayedCommits', value);
  }

  setBranch(branch) {
    this.set('filters.branch', branch);
  }

  setCommit(commit) {
    this.set('filters.commit', commit);
  }

  async fetchCommits(projectId, branchName) {
    if (branchName == null) {
      this.set('data.commits', []);
      return [];
    }
    else {
      this.setUpdating({data: {commits: true}});
      return this.client.getCommits(projectId, branchName)
        .then(resp => {
          this.set('data.commits', resp.data);
          return resp.data;
        });
    }
  }

  fetchNotebooks(first, projectId) {
    const fetching = this.get('notebooks.fetching');
    if (fetching) return;
    this.set('notebooks.fetching', true);

    if (first) {
      this.setUpdating({notebooks: {all: true}});
    }
    return this.client.getNotebookServers(projectId)
      .then(resp => {
        this.set('notebooks.fetching', false);
        this.set('notebooks.all', resp.data);
        return resp.data;
      })
      .catch(error => {
        this.set('notebooks.fetching', false);
      });
  }

  verifyIfRunning(projectId, projectPath, servers) {
    const notebooks = servers ?
      servers :
      this.get('notebooks.all');
    const branch = this.get('filters.branch');
    const commit = this.get('filters.commit');
    for (let notebookName of Object.keys(notebooks)) { 
      const notebook = notebooks[notebookName];
      const annotations = cleanAnnotations(notebook["annotations"], "renku.io");
      if (parseInt(annotations.projectId) !== projectId) continue;
      if (annotations["branch"] === branch.name && annotations["commit-sha"] === commit.id) {
        this.setObject({ notebooks: {
          status: notebook.status.ready ?
            "running" :
            notebook.status.step === "Unschedulable" ?
              "error" :
              "pending",
          url: notebook.url
        }});
        return true;
      }
    }
    this.setObject({notebooks: {
      status: false,
      url: null
    }});

    // fetch notebook options
    this.fetchNotebookOptions(projectPath, commit.id);
    return false;
  }

  notebookPollingIteration(projectId, projectPath, first, checkRunning) {
    const fetchPromise = this.fetchNotebooks(first, projectId);
    if (checkRunning) {
      return fetchPromise.then((servers) => {
        return this.verifyIfRunning(projectId, projectPath, servers);
      });
    }
    else {
      return fetchPromise;
    }
  }

  startNotebookPolling(projectId, projectPath, checkRunning) {
    if (projectId) {
      this.setObject({notebooks: {
        status: false,
        url: null
      }});
    }
    const oldPoller = this.get('notebooks.polling');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        this.notebookPollingIteration(projectId, projectPath, false, checkRunning);
      }, POLLING_INTERVAL);
      this.set('notebooks.polling', newPoller);

      // fetch immediatly
      this.notebookPollingIteration(projectId, projectPath, true, checkRunning);
    }
  }

  fetchNotebookOptions(projectPath, commitId) {
    const oldData = this.get('data.notebookOptions');
    if (oldData.commitId === commitId)
      return;
    this.set('data.notebookOptions', {});
    return this.client.getNotebookServerOptions(projectPath, commitId).then((resp)=> {
      const notebookOptions = { ...resp, commitId };
      let selectedOptions = {};
      Object.keys(resp).forEach(option => { 
        selectedOptions[option] = resp[option].default;
      })
      const options = {
        data: {
          notebookOptions,
          selectedOptions
        }
      };
      this.setObject(options);
      return options;
    });
  }

  setNotebookOptions(option, value) {
    this.set(`data.selectedOptions.${option}`, value);
  }

  startServer(projectPath, branchName, commitId) {
    const options = {
      serverOptions: this.get('data.selectedOptions')
    };
    let branch = branchName;
    if (!branchName) {
      const selctedBranch = this.get('filters.branch');
      if (selctedBranch.name) {
        branch = selctedBranch.name;
      }
      else {
        branch = "master";
      }
    }
    let commit = commitId;
    if (!commitId) {
      const selctedCommit = this.get('filters.commit');
      if (selctedCommit.id) {
        commit = selctedCommit.id;
      }
      else {
        commit = "latest";
      }
    }

    this.set('notebooks.status', 'pending');
    return this.client.startNotebook(projectPath, branch, commit, options);  
  }

  stopNotebookPolling() {
    const poller = this.get('notebooks.polling');
    if (poller) {
      this.set('notebooks.polling', null);
      clearTimeout(poller);
    }
  }

  stopNotebook(serverName) {
    // manually set the state instead of waiting for the promise to resolve
    const updatedState = { notebooks: { all: { [serverName]: { status: { ready: false } } } } };
    this.setObject(updatedState);
    return this.client.stopNotebookServer(serverName);
  }
}

export default NotebooksModel;

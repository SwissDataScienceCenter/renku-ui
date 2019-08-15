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
import { StatusHelper } from '../model/Model'

const notebooksSchema = new Schema({
  notebooks: {
    schema: {
      polling: {initial: null},
      all: {initial: {}},
      status: {initial: null},
      url: {initial: null},
      fetching: {initial:false},
      discard: {initial: false}
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
        if (!this.get('notebooks.discard')) {
          this.set('notebooks.all', resp.data);
        }
        return resp.data;
      })
      .catch(error => {
        this.set('notebooks.fetching', false);
      });
  }

  verifyIfRunning(projectId, projectSlug, servers) {
    const notebooks = servers ?
      servers :
      this.get('notebooks.all');
    if (StatusHelper.isUpdating(notebooks)) return;
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
    this.fetchNotebookOptions(projectSlug, commit.id);
    return false;
  }

  notebookPollingIteration(projectId, projectSlug, first, checkRunning) {
    const fetchPromise = this.fetchNotebooks(first, projectId);
    if (!fetchPromise) return;
    if (checkRunning) {
      return fetchPromise.then((servers) => {
        return this.verifyIfRunning(projectId, projectSlug, servers);
      });
    }
    else {
      return fetchPromise;
    }
  }

  startNotebookPolling(projectId, projectSlug, checkRunning) {
    if (projectId) {
      this.setObject({notebooks: {
        status: false,
        url: null
      }});
    }
    const oldPoller = this.get('notebooks.polling');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        this.notebookPollingIteration(projectId, projectSlug, false, checkRunning);
      }, POLLING_INTERVAL);
      this.set('notebooks.polling', newPoller);

      // fetch immediatly
      this.notebookPollingIteration(projectId, projectSlug, true, checkRunning);
    }
  }

  fetchNotebookOptions() {
    const oldData = this.get('data.notebookOptions');
    if (Object.keys(oldData).length !== 0)
      return;
    this.set('data.notebookOptions', {});
    return this.client.getNotebookServerOptions().then((notebookOptions)=> {
      let selectedOptions = {};
      Object.keys(notebookOptions).forEach(option => { 
        selectedOptions[option] = notebookOptions[option].default;
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

  startServer(namespacePath, projectPath, branchName, commitId) {
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
    return this.client.startNotebook(namespacePath, projectPath, branch, commit, options);  
  }

  stopNotebookPolling() {
    const poller = this.get('notebooks.polling');
    if (poller) {
      this.set('notebooks.polling', null);
      clearTimeout(poller);
    }
  }

  stopNotebook(serverName) {
    // manually set the state and temporarily throw away servers data until the promise resolves
    const updatedState = { notebooks: {
      discard: true,
      all: { [serverName]: { status: { ready: false } } } }
    };
    this.setObject(updatedState);
    return this.client.stopNotebookServer(serverName)
      .then(response => {
        this.set('notebooks.discard', false);
        return response;
      })
      .catch(error => {
        this.set('notebooks.discard', false);
        throw error;
      });
  }
}

export default NotebooksModel;


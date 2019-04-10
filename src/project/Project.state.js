/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  Project.state.js
 *  Redux-based state-management code.
 */

import { UserState } from '../app-state';
import { API_ERRORS } from '../api-client';
import { StateModel} from '../model/Model';
import { projectSchema } from '../model/RenkuModels';
import { SpecialPropVal } from '../model/Model'



class ProjectModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(projectSchema, stateBinding, stateHolder, initialState)
  }

  stopCheckingWebhook() {
    this.set('webhook.stop', true);
  }

  fetchGraphWebhook(client, id, user) {
    if (user == null) {
      this.set('webhook.possible', false);
    }
    const userIsOwner = this.get('core.owner.id') === user.id;
    this.set('webhook.possible', userIsOwner);
    if (userIsOwner) {
      this.fetchGraphWebhookStatus(client, id);
    }
  }

  fetchGraphWebhookStatus(client, id) {
    this.set('webhook.created', false);
    this.setUpdating({webhook: {status: true}});
    return client.checkGraphWebhook(id)
      .then((resp) => {
        this.set('webhook.status', resp);
      })
      .catch((err) => {
        this.set('webhook.status', err);
      });
  }

  createGraphWebhook(client, id) {
    this.setUpdating({webhook: {created: true}});
    return client.createGraphWebhook(id)
      .then((resp) => {
        this.set('webhook.created', resp);
      })
      .catch((err) => {
        this.set('webhook.created', err);
      });
  }

  // TODO: Do we really want to re-fetch the entire project on every change?
  fetchProject(client, id) {
    this.setUpdating({core: {available: true}});
    return client.getProject(id, {statistics:true})
      .then(resp => resp.data)
      .then(d => {
        const updatedState = {
          core: { ...d.metadata.core, available: true },
          system: d.metadata.system,
          visibility: d.metadata.visibility,
          statistics: d.metadata.statistics
        };
        this.setObject(updatedState);
        this.fetchNotebookServerUrl(client, id, updatedState);
        return d;
      })
      .catch(err => {
        if (err.case === API_ERRORS.notFoundError) {
          this.set('core.available', false);
        }
        else throw err;
      });
  }

  fetchProjectFilesTree(client, id) {
    const oldTree = this.get('filesTree');
    if(oldTree === null || oldTree === undefined){
      this.setUpdating({transient:{requests:{filesTree: true}}});
      return client.getProjectFilesTree(id)
        .then(resp => resp)
        .then(d => {
          const updatedState = { filesTree: d, transient:{requests:{filesTree: false}} };
          this.setObject(updatedState);
          this.set('filesTree', d);
          return d;
        });
    } else {
      return oldTree;
    }
  }

  setPojectOpenFolder(filePath){
    this.setUpdating({transient:{requests:{filesTree: true}}});
    let filesTree = this.get('filesTree');
    filesTree.hash[filePath].childrenOpen = ! filesTree.hash[filePath].childrenOpen;
    this.set('filesTree',filesTree);
    this.setObject({transient:{requests:{filesTree: false}}});
  }

  startNotebookServersPolling(client) {
    const oldPoller = this.get('notebooks.polling');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        return this.fetchNotebookServers(client);
      }, 3000);
      this.set('notebooks.polling', newPoller);

      // invoke immediatly the first time
      return this.fetchNotebookServers(client, true);
    }
  }

  stopNotebookServersPolling() {
    const poller = this.get('notebooks.polling');
    if (poller) {
      this.set('notebooks.polling', null);
      clearTimeout(poller);
    }
  }

  fetchNotebookServers(client, first) {
    if (first) {
      this.setUpdating({notebooks: {all: true}});
    }
    return client.getNotebookServers() // FILTER: I need the projectId, not the name...
      .then(resp => {
        // TODO: filter for current project
        this.set('notebooks.all', resp.data);
      });
  }

  stopNotebookServer(client, serverName) {
    const promise = client.stopNotebookServer(serverName);
    // do not wait to resolve the promise, it takes a few seconds but the server states change much faster
    this.fetchNotebookServers(client);
    return promise;
  }

  fetchNotebookServerUrl(client, id, projectState) {
    client.getNotebookServerUrl(id, projectState.core.path_with_namespace)
      .then(urls => {
        this.set('core.notebookServerUrl', urls.notebookServerUrl);
        this.set('core.notebookServerAPI', urls.notebookServerAPI);
      });
  }

  fetchModifiedFiles(client, id) {
    client.getModifiedFiles(id)
      .then(d => {
        this.set('files.modifiedFiles', d)
      })
  }

  fetchMergeRequests(client, id) {
    this.setUpdating({system: {merge_requests: true}});
    client.getMergeRequests(id)
      .then(resp => resp.data)
      .then(d => {
        this.set('system.merge_requests', d)
      })
  }

  fetchBranches(client, id) {
    this.setUpdating({system: {branches: true}});
    client.getBranches(id)
      .then(resp => resp.data)
      .then(d => {
        this.set('system.branches', d)
      })
  }

  fetchReadme(client, id) {
    // Do not fetch if a fetch is in progress
    if (this.get('transient.requests.readme') === SpecialPropVal.UPDATING) return;

    this.setUpdating({transient:{requests:{readme: true}}});
    client.getProjectReadme(id)
      .then(d => this.set('data.readme.text', d.text))
      .catch(error => {
        if (error.case === API_ERRORS.notFoundError) {
          this.set('data.readme.text', 'No readme file found.')
        }
      })
      .finally(() => this.set('transient.requests.readme', false))
  }

  setTags(client, id, name, tags) {
    this.setUpdating({system: {tag_list: [true]}});
    client.setTags(id, name, tags).then(() => {
      this.fetchProject(client, id);
    })
  }

  setDescription(client, id, name, description) {
    this.setUpdating({core: {description: true}});
    client.setDescription(id, name, description).then(() => {
      this.fetchProject(client, id);
    })
  }

  star(client, id, userStateDispatch, starred) {
    client.starProject(id, starred).then(() => {
      // TODO: Bad naming here - will be resolved once the user state is re-implemented.
      this.fetchProject(client, id).then(p => userStateDispatch(UserState.star(p.metadata.core)))

    })
  }

  fetchCIJobs(client, id) {
    this.setUpdating({system: {ci_jobs: true}});
    client.getJobs(id)
      .then(resp => resp.data)
      .then((d) => {
        this.set('system.ci_jobs', d)
      })
      .catch((error) => this.set('system.ci_jobs', []));
  }
}

export { ProjectModel };

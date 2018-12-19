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
import { Schema, StateKind, SpecialPropVal } from '../model/Model'

const projectPageItemSchema = new Schema({
  title: {initial: '', mandatory: true},
  path: {initial: '', mandatory: true},
  description: {initial: '', mandatory: true}
});

const projectsPageSchema = new Schema({
  projects: {initial: [], schema: [{projectPageItemSchema}]}
});

const projectListSchema = new Schema({
  loading: {initial: false},
  totalItems: {mandatory: true},
  currentPage: {mandatory: true},
  perPage: {mandatory: true},
  pages: {initial: [], schema: [{projectsPageSchema}]}
});

class ProjectListModel extends StateModel {
  constructor(client) {
    super(projectListSchema, StateKind.REDUX)
    this.client = client
  }

  setPage(newPageNumber) {
    this.set('currentPage', newPageNumber);
    // We always relaod the current page on page change.
    this.getPageData(newPageNumber, this.get('perPage'));
  }

  // TODO: For a smoother experience we could always preload the next page
  //       in advance.
  getPageData(pageNumber, perPage) {
    this.set('loading', true);
    this.client.getProjects({page: pageNumber, per_page: perPage})
      .then(response => {
        const pagination = response.pagination;
        this.set('currentPage', pagination.currentPage);
        this.set('totalItems', pagination.totalItems);
        this.set(`pages.${pagination.currentPage}`, {
          projects: response.data,
        });
        this.set('loading', false);
      });
  }
}

class ProjectModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(projectSchema, stateBinding, stateHolder, initialState)
  }

  // TODO: Do we really want to re-fetch the entire project on every change?
  fetchProject(client, id) {
    return client.getProject(id, {notebooks:true, data:true})
      .then(resp => resp.data)
      .then(d => {
        const updatedState = {
          core: d.metadata.core,
          system: d.metadata.system,
          visibility: d.metadata.visibility,
        };
        this.setObject(updatedState);
        this.fetchNotebookServerUrl(client, id, updatedState);
        return d;
      })
  }

  fetchProjectFiles(client, id) {
    this.setUpdating({transient:{requests:{files: true}}});
    return client.getProjectFiles(id)
      .then(resp => resp)
      .then(d => {
        const updatedState = { files: d, transient:{requests:{files: false}} };
        this.setObject(updatedState);
        return d;
      })
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

export { ProjectModel, ProjectListModel };

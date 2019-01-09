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
 *  ProjectList.state.js
 *  Redux-based state-management code.
 */



import { Schema, StateKind, StateModel} from '../../model/Model';

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
    return this.getPageData(newPageNumber, this.get('perPage'));
  }

  // TODO: For a smoother experience we could always preload the next page
  //       in advance.
  getPageData(pageNumber, perPage) {
    this.set('loading', true);
    return this.client.getProjects({page: pageNumber, per_page: perPage})
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

export default ProjectListModel;

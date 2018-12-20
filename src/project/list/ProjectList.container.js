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

import ProjectList from './ProjectList.present'

import { ProjectListModel } from '../Project.state'

import qs from 'query-string';

class List extends Component {
  constructor(props) {
    super(props);
    this.projectPages = new ProjectListModel(props.client);
    this.perPage = this.props.perPage || 10;

    // Register listener for route changes (back/forward buttons)
    this.props.history.listen(location => {
      this.onPageChange(this.getPageNumber(location));
    });


  }

  // TODO: Replace this by URLs which are passed down from the app level.
  urlMap() {
    return {
      projectsUrl: '/projects',
      projectNewUrl: '/project_new'
    }
  }

  componentDidMount() {
    this.projectPages.set('perPage', this.perPage);
    this.projectPages.setPage(this.getPageNumber(this.props.location));
  }

  getPageNumber(location) {
    return parseInt(qs.parse(location.search).page, 10) || 1;
  }

  setPageInUrl(newPageNumber) {
    const projectsUrl = this.urlMap().projectsUrl
    this.props.history.push(`${projectsUrl}?page=${newPageNumber}`)
  }

  onPageChange(newPageNumber) {
    this.projectPages.setPage(newPageNumber);
  }

  mapStateToProps(state, ownProps) {
    const currentPage = this.projectPages.get('currentPage');
    return {
      user: ownProps.user,
      loading: this.projectPages.get('loading'),
      page: this.projectPages.get('pages')[currentPage] || {projects: []},
      currentPage: this.projectPages.get('currentPage'),
      totalItems: this.projectPages.get('totalItems'),
      perPage: this.projectPages.get('perPage'),
      onPageChange: this.setPageInUrl.bind(this),
    }
  }

  render() {
    const VisibleProjectList =
      connect(this.mapStateToProps.bind(this))(ProjectList);

    return <VisibleProjectList
      store={this.projectPages.reduxStore}
      user={this.props.user}
      urlMap={this.urlMap()}
    />
  }
}

export default List;

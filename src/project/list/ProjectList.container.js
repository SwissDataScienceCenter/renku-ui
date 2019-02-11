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

import ProjectListModel from './ProjectList.state'
import State from './ProjectList.state'
import Present from './ProjectList.present'

import qs from 'query-string';

class Starred extends Component {
  render() {
    const user = this.props.user;
    const projects = (user) ? user.starredProjects : [];
    return <Present.Starred urlMap={this.props.urlMap} projects={projects}  />
  }
}

class List extends Component {
  constructor(props) {
    super(props);
    this.model = new ProjectListModel(props.client);
    this.perPage = this.props.perPage || 10;

    // Register listener for route changes (back/forward buttons)
    this.props.history.listen(location => {
      const {query, pageNumber} = this.getUrlSearchParameters(location);
      this.onUrlParametersChange(query, pageNumber);
    });

    this.handlers = {
      onSearchQueryChange: this.onSearchQueryChange.bind(this),
      onSearchSubmit: this.onSearchSubmit.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
      onStarred: this.onStarred.bind(this),
      onMember: this.onMember.bind(this),
      onExplore: this.onExplore.bind(this)
    };

  }

  onStarred(){
    this.model.setSelected('starred');
  }

  onMember(){
    this.model.setSelected('your_projects');
  }

  onExplore(){
    this.model.setSelected('explore');
  }

  // TODO: Replace this by URLs which are passed down from the app level.
  urlMap() {
    return {
      projectsUrl: '/projects',
      projectNewUrl: '/project_new'
    }
  }

  urlFromQueryAndPageNumber(query, pageNumber) {
    const projectsUrl = this.urlMap().projectsUrl
    return `${projectsUrl}/?q=${query}&page=${pageNumber}`
  }

  componentDidMount() {
    this.model.set('perPage', this.perPage);
    const {query, pageNumber} = this.getUrlSearchParameters(this.props.location);
    this.model.setQuery(query);
    // Automatically search if the query is not empty
    if (this.model.get('query') !== '')
      this.model.setPage(pageNumber);

    this.model.setSelected('your_projects');
  }

  getUrlSearchParameters(location) {
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1
    const query = qs.parse(location.search).q || '';
    return {query, pageNumber};
  }

  onUrlParametersChange(query, pageNumber) {
    this.model.setQueryAndPageNumber(query, pageNumber);
  }

  onPaginationPageChange(newPageNumber) {
    this.props.history.push(this.urlFromQueryAndPageNumber(this.model.get('query'), newPageNumber))
  }

  onSearchQueryChange(e) {
    this.model.setQuery(e.target.value);
  }

  onSearchSubmit(e) {
    e.preventDefault();
    this.props.history.push(this.urlFromQueryAndPageNumber(this.model.get('query'), 1))
  }

  mapStateToProps(state, ownProps) {
    const currentPage = this.model.get('currentPage');
    return {
      user: ownProps.user,
      searchQuery: this.model.get('query'),
      loading: this.model.get('loading'),
      page: this.model.get('pages')[currentPage] || {projects: []},
      currentPage: this.model.get('currentPage'),
      totalItems: this.model.get('totalItems'),
      perPage: this.model.get('perPage'),
      onPageChange: this.handlers.onPaginationPageChange,
      selected: this.model.get('selected')
    }
  }

  render() {
    const VisibleProjectList =
      connect(this.mapStateToProps.bind(this))(ProjectList);

    return <VisibleProjectList
      store={this.model.reduxStore}
      user={this.props.user}
      handlers={this.handlers}
      urlMap={this.urlMap()}
    />
  }
}

export default List;

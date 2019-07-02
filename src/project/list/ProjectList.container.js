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
import qs from 'query-string';

const orderByValuesMap = {
  NAME: 'name',
  CREATIONDATE: 'created_at',
  UPDATEDDATE: 'last_activity_at'
};

class List extends Component {
  constructor(props) {
    super(props);
    this.model = new ProjectListModel(props.client);
    this.perPage = this.props.perPage || 10;

    this.handlers = {
      onSearchQueryChange: this.onSearchQueryChange.bind(this),
      onSearchSubmit: this.onSearchSubmit.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
      onOrderByDropdownToogle: this.onOrderByDropdownToogle.bind(this),
      changeSearchDropdownOrder: this.changeSearchDropdownOrder.bind(this),
      toogleSearchSorting: this.toogleSearchSorting.bind(this) 
    };
  }

  componentDidMount() {
    this.model.set('perPage', this.perPage);
    const {query, pageNumber, pathName, orderBy, orderSearchAsc} = this.getUrlSearchParameters(this.props.location);
    this.model.setQuery(query);
    this.model.setPathName(pathName);
    this.model.setPage(pageNumber);
    this.model.setOrderDropdownOpen(false);
    this.model.setOrderBy(orderBy);
    this.model.setOrderSearchAsc(orderSearchAsc);
    // save listener to remove it when unmounting the component
    // TODO: this could be removed if onPaginationPageChange/this.props.history.push worked
    //    also when only the search part changed
    const listener = this.props.history.listen(location => {
      const {query, pageNumber, pathName, orderBy, orderSearchAsc} = this.getUrlSearchParameters(location);
      this.onUrlParametersChange(query, pageNumber, pathName, orderBy, orderSearchAsc);
    });
    this.setState({listener});
  }

  componentWillUnmount() {
    const { listener } = this.state;
    if (listener) {
      listener();
    }
  }

  // TODO: Replace this by URLs which are passed down from the app level.
  urlMap() {
    return {
      projectsUrl: '/projects',
      projectsSearchUrl: '/projects/search',
      projectNewUrl: '/project_new',
      starred:'/projects/starred',
      yourProjects:'/projects/your_projects'
    }
  }

  urlFromQueryAndPageNumber(query, pageNumber , pathName, orderBy, orderSearchAsc) {
    return `${pathName}?q=${query}&page=${pageNumber}&orderBy=${orderBy}&orderSearchAsc=${orderSearchAsc}`
  }

  getUrlSearchParameters(location) {
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1
    const query = qs.parse(location.search).q || '';
    const orderBy = qs.parse(location.search).orderBy || orderByValuesMap.UPDATEDDATE;
    const orderSearchAsc = qs.parse(location.search).orderSearchAsc === "true" ? true : false;
    const pathName = location.pathname.endsWith('/') ?
      location.pathname.substring(0,location.pathname.length-1) :
      location.pathname;
    return {query, pageNumber, pathName, orderBy, orderSearchAsc};
  }

  onUrlParametersChange(query, pageNumber, pathName, orderBy, orderSearchAsc) {
    // workaround to prevent the listener of "this.props.history.listen" to trigger in the wrong path
    // INFO: check if the path matches [/projects$, /projects/$, /projects?*, /projects/\D*]
    const regExp = /\/projects($|\/$|(\/|\?)\D+.*)$/;
    if (!regExp.test(pathName)) {
      return;
    }
    this.model.setQueryPageNumberAndPath(query, pageNumber,pathName, orderBy, orderSearchAsc);
  }

  onPaginationPageChange(newPageNumber) {
    const query = this.model.get('query');
    const pathName = this.model.get('pathName');
    const orderBy= this.model.get('orderBy');
    const orderSearchAsc= this.model.get('orderSearchAsc');
    const newUrl = this.urlFromQueryAndPageNumber(query, newPageNumber, pathName, orderBy, orderSearchAsc);
    this.props.history.push(newUrl);
  }

  onOrderByDropdownToogle() {
    this.model.setOrderDropdownOpen(!this.model.get('orderByDropdownOpen'));
  }

  changeSearchDropdownOrder(e){
    this.model.setOrderBy(e.target.value);
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get('query'),
        1,
        this.model.get('pathName'),
        this.model.get('orderBy'),
        this.model.get('orderSearchAsc')
      )
    )
  }

  toogleSearchSorting(){
    this.model.setOrderSearchAsc(!this.model.get('orderSearchAsc'));
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get('query'),
        1,
        this.model.get('pathName'),
        this.model.get('orderBy'),
        this.model.get('orderSearchAsc')
      )
    )
  }

  onSearchQueryChange(e) {
    this.model.setQuery(e.target.value);
  }

  onSearchSubmit(e) {
    e.preventDefault();
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get('query'),
        1,
        this.model.get('pathName'),
        this.model.get('orderBy'),
        this.model.get('orderSearchAsc')
      )
    )
  }

  mapStateToProps(state, ownProps) {
    const currentPage = this.model.get('currentPage');
    return {
      user: ownProps.user,
      searchQuery: this.model.get('query'),
      orderBy: this.model.get('orderBy'),
      orderByDropdownOpen: this.model.get('orderByDropdownOpen'),
      orderSearchAsc: this.model.get('orderSearchAsc'),
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
      orderByValuesMap={orderByValuesMap}
    />
  }
}

export default List;

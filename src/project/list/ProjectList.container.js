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
import { connect } from 'react-redux';
import qs from 'query-string';

import ProjectList from './ProjectList.present';
import ProjectListModel from './ProjectList.state';
import { Loader } from '../../utils/UIComponents';

const orderByValuesMap = {
  NAME: 'name',
  CREATIONDATE: 'created_at',
  UPDATEDDATE: 'last_activity_at'
};

const searchInValuesMap = {
  PROJECTNAME: 'projects',
  USERNAME: 'users',
  GROUPNAME: 'groups'
};

const searchScopesValuesMap = {
  MEMBERSHIP: 'membership',
  STARRED: 'starred'
};

const urlMap = {
  projectsUrl: '/projects',
  projectsSearchUrl: '/projects/search',
  projectNewUrl: '/project_new',
  starred: '/projects/starred',
  yourProjects: '/projects/your_projects'
}

class List extends Component {
  render() {
    const user = this.props.user; // TODO: change to user
    return user.fetched ?
      <AvailableUserList {...this.props} /> :
      <div>
        <h1>Projects</h1>
        <Loader />
      </div>
  }
}

class AvailableUserList extends Component {
  constructor(props) {
    super(props);
    this.model = new ProjectListModel(props.client);
    this.perPage = this.props.perPage || 10;

    this.handlers = {
      onSearchQueryChange: this.onSearchQueryChange.bind(this),
      onSearchSubmit: this.onSearchSubmit.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
      onOrderByDropdownToogle: this.onOrderByDropdownToogle.bind(this),
      onSearchInDropdownToogle: this.onSearchInDropdownToogle.bind(this),
      changeSearchDropdownOrder: this.changeSearchDropdownOrder.bind(this),
      changeSearchDropdownFilter: this.changeSearchDropdownFilter.bind(this),
      changeSelectedUserOrGroup: this.changeSelectedUserOrGroup.bind(this),
      toogleSearchSorting: this.toogleSearchSorting.bind(this)
    };
  }

  componentDidMount() {
    this.model.set('perPage', this.perPage);
    const { query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup } = this.getUrlSearchParameters(this.props.location);
    this.model.setQuery(query);
    this.model.setPathName(pathName);
    this.model.setOrderDropdownOpen(false);
    this.model.setSearchInDropdownOpen(false);
    this.model.setOrderBy(orderBy);
    this.model.setSearchIn(searchIn);
    this.model.setSelectedUserOrGroup(selectedUserOrGroup);
    this.model.setUsersOrGroupsList([]);
    this.model.setOrderSearchAsc(orderSearchAsc);
    this.model.setLoggedIn(this.props.user.logged);
    this.model.setPage(pageNumber);
    // save listener to remove it when unmounting the component
    // TODO: this could be removed if onPaginationPageChange/this.props.history.push worked
    //    also when only the search part changed
    const listener = this.props.history.listen(location => {
      const { query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup } = this.getUrlSearchParameters(location);
      this.onUrlParametersChange(query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup);
    });
    this.setState({ listener });
  }

  componentWillUnmount() {
    const { listener } = this.state;
    if (listener) {
      listener();
    }
  }

  urlFromQueryAndPageNumber(query, pageNumber , pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup) {
    const selectedUsr = selectedUserOrGroup !== undefined ? "&selectedUserOrGroup="+selectedUserOrGroup : "";
    return `${pathName}?q=${query}&page=${pageNumber}&orderBy=${orderBy}&orderSearchAsc=${orderSearchAsc}&searchIn=${searchIn}${selectedUsr}`
  } 

  getUrlSearchParameters(location) {
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1
    const query = qs.parse(location.search).q || '';
    const orderBy = qs.parse(location.search).orderBy || orderByValuesMap.UPDATEDDATE;
    const searchIn = qs.parse(location.search).searchIn || searchInValuesMap.PROJECTNAME;
    const selectedUserOrGroup = qs.parse(location.search).selectedUserOrGroup || undefined ;
    const orderSearchAsc = qs.parse(location.search).orderSearchAsc === "true" ? true : false;
    const pathName = location.pathname.endsWith('/') ?
      location.pathname.substring(0,location.pathname.length-1) :
      location.pathname;
    this.model.setCurrentTab(pathName);
    return {query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup};
  }

  onUrlParametersChange(query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup) {
    // workaround to prevent the listener of "this.props.history.listen" to trigger in the wrong path
    // INFO: check if the path matches [/projects$, /projects/$, /projects?*, /projects/\D*]
    const regExp = /\/projects($|\/$|(\/|\?)\D+.*)$/;
    if (!regExp.test(pathName)) {
      return;
    }
    this.model.setQueryPageNumberAndPath(query, pageNumber,pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup);
  }

  onPaginationPageChange(newPageNumber) {
    const query = this.model.get('query');
    const pathName = this.model.get('pathName');
    const orderBy= this.model.get('orderBy');
    const orderSearchAsc= this.model.get('orderSearchAsc');
    const searchIn= this.model.get('searchIn');
    const selectedUserOrGroup = this.model.get('selectedUserOrGroup');
    const newUrl = this.urlFromQueryAndPageNumber(query, newPageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup);
    this.props.history.push(newUrl);
  }

  pushNewSearchToHistory() {
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get('query'),
        1,
        this.model.get('pathName'),
        this.model.get('orderBy'),
        this.model.get('orderSearchAsc'),
        this.model.get('searchIn'),
        this.model.get('selectedUserOrGroup')
      )
    )
  }

  onOrderByDropdownToogle() {
    this.model.setOrderDropdownOpen(!this.model.get('orderByDropdownOpen'));
  }

  onSearchInDropdownToogle() {
    this.model.setSearchInDropdownOpen(!this.model.get('searchInDropdownOpen'));
  }

  changeSelectedUserOrGroup(userId){
    this.model.setSelectedUserOrGroup(userId);
    this.pushNewSearchToHistory();
  }

  changeSearchDropdownFilter(e){
    this.model.resetBeforeNewSearch();
    this.model.setSearchIn(e.target.value);
    this.pushNewSearchToHistory();
  }

  getSearchText(){
    switch(this.model.get('searchIn')){
    case searchInValuesMap.PROJECTNAME:
      return "Search by project name";
    case searchInValuesMap.USERNAME:
      return "Search by user name";
    case searchInValuesMap.GROUPNAME:
      return "Search by group name";
    default :
      return "Search Text"
    }
  }

  getSearchInLabel(){
    switch(this.model.get('searchIn')){
    case searchInValuesMap.PROJECTNAME:
      return "projects";
    case searchInValuesMap.USERNAME:
      return "users";
    case searchInValuesMap.GROUPNAME:
      return "groups";
    default :
      return ""
    }
  }
  
  getOrderByLabel(){
    switch(this.model.get('orderBy')){
    case orderByValuesMap.NAME:
      return "name";
    case orderByValuesMap.CREATIONDATE:
      return "creation";
    case orderByValuesMap.UPDATEDDATE:
      return "updated";
    default :
      return ""
    }
  }

  changeSearchDropdownOrder(e){
    this.model.setOrderBy(e.target.value);
    this.pushNewSearchToHistory();
  }

  toogleSearchSorting(){
    this.model.setOrderSearchAsc(!this.model.get('orderSearchAsc'));
    this.pushNewSearchToHistory();
  }

  onSearchQueryChange(e) {
    this.model.setQuery(e.target.value);
  }

  onSearchSubmit(e) {
    e.preventDefault();
    this.model.resetBeforeNewSearch();
    this.pushNewSearchToHistory();
  }

  mapStateToProps(state, ownProps) {
    const currentPage = this.model.get('currentPage');
    return {
      user: ownProps.user,
      searchQuery: this.model.get('query'),
      orderBy: this.model.get('orderBy'),
      searchIn: this.model.get('searchIn'),
      selectedUserOrGroup: this.model.get('selectedUserOrGroup'),
      usersOrGroupsList: this.model.get('usersOrGroupsList'),
      orderByDropdownOpen: this.model.get('orderByDropdownOpen'),
      searchInDropdownOpen: this.model.get('searchInDropdownOpen'),
      orderSearchAsc: this.model.get('orderSearchAsc'),
      loading: this.model.get('loading'),
      page: this.model.get('pages')[currentPage] || {projects: []},
      currentPage: this.model.get('currentPage'),
      totalItems: this.model.get('totalItems'),
      perPage: this.model.get('perPage'),
      onPageChange: this.handlers.onPaginationPageChange,
      selected: this.model.get('selected'),
      currentTab: this.model.get('currentTab')
    }
  }

  render() {
    const VisibleProjectList =
      connect(this.mapStateToProps.bind(this))(ProjectList);

    return <VisibleProjectList
      store={this.model.reduxStore}
      user={this.props.user}
      handlers={this.handlers}
      urlMap={urlMap}
      orderByValuesMap={orderByValuesMap}
      searchInValuesMap={searchInValuesMap}
      searchText={this.getSearchText()}
      orderByLabel={this.getOrderByLabel()}
      searchInLabel={this.getSearchInLabel()}
    />
  }
}

export default List;
export { searchInValuesMap, searchScopesValuesMap, urlMap }

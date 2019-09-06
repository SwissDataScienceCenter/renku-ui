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
import { searchInValuesMap, urlMap } from './ProjectList.container';

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
  loggedIn: {initial: false},
  query: {initial: "", mandatory: true},
  totalItems: {mandatory: true},
  currentPage: {mandatory: true},
  perPage: {mandatory: true},
  orderBy: {initial:'last_activity_at', mandatory:true},
  searchIn: {initial:'projects', mandatory:true},
  usersOrGroupsList: {initial: []},
  pages: {initial: [], schema: [{projectsPageSchema}]},
  currentTab: {initial: 'your_projects', mandatory: true}
});

class ProjectListModel extends StateModel {
  constructor(client) {
    super(projectListSchema, StateKind.REDUX)
    this.client = client
  }

  setQuery(query) {
    this.set('query', query.trim());
  }

  setPage(newPageNumber) {
    this.set('currentPage', newPageNumber);
    return this.getPageData();
  }

  setPathName(pathName){
    this.set('pathName',pathName)
  }

  setSelectedUserOrGroup(selectedUserOrGroupId){
    this.set('selectedUserOrGroup', selectedUserOrGroupId)
  }

  setUsersOrGroupsList(usersOrGroupsList){
    this.set('usersOrGroupsList', usersOrGroupsList)
  }

  setSelected(selected){
    this.set('selected',selected);
  }

  setOrderDropdownOpen(value){
    this.set('orderByDropdownOpen', value);
  }

  setSearchInDropdownOpen(value){
    this.set('searchInDropdownOpen', value);
  }

  setOrderBy(orderBy){
    this.set('orderBy', orderBy);
  }

  setSearchIn(searchIn){
    this.set('searchIn', searchIn);
  }

  setOrderSearchAsc(orderSearchAsc){
    this.set('orderSearchAsc', orderSearchAsc);
  }

  setCurrentTab(currentTab){
    this.set('currentTab', currentTab);
  }

  setLoggedIn(loggedIn){
    this.set('loggedIn', loggedIn);
  }

  setQueryPageNumberAndPath(query, pageNumber, pathName, orderBy, orderSearchAsc, searchIn, selectedUserOrGroup) {
    this.setQuery(query)
    this.setPathName(pathName)
    this.setOrderBy(orderBy)
    this.setOrderSearchAsc(orderSearchAsc)
    this.setSearchIn(searchIn)
    this.setSelectedUserOrGroup(selectedUserOrGroup)
    return this.setPage(pageNumber)
  }

  resetBeforeNewSearch(){
    this.setSelectedUserOrGroup(undefined);
    this.setUsersOrGroupsList(undefined);
    this.set('currentPage', undefined);
    this.set('totalItems', undefined);
    this.set(`pages`, []);
  }

  getEmptyResponseMessage(projects){
    if(this.get('loggedIn') && this.get('query')==='' && projects.length === 0
    && (this.get('currentTab') === urlMap.starred || this.get('currentTab') === urlMap.yourProjects))
    {
      return "EMPTY_PROJECTS_MESSAGE"
    }
  }

  manageResponse(response){
    const pagination = response.pagination;
    this.set('currentPage', pagination.currentPage);
    this.set('totalItems', pagination.totalItems);
    this.set(`pages.${pagination.currentPage}`, {
      projects: response.data,
      emptyResponseMessage: this.getEmptyResponseMessage(response.data)
    });
    this.set('loading', false);
  }

  searchProjects(searchParams){
    return this.client.getProjects(searchParams)
      .then(response => {
        this.manageResponse(response);
      });
  }

  searchProjectsByUsernameOrGroup(searchIn, queryParams, search, selectedUserOrGroupId){
    if(search.length < 3) {
      this.setUsersOrGroupsList([]);
      this.set('loading',false);
      return [];
    }
    return this.client.searchUsersOrGroups({ search }, searchIn)
      .then(response => {
        this.setUsersOrGroupsList(response);
        if(response.length === 0){
          this.set('loading',false);
          return response;
        }
        let selectedElement = selectedUserOrGroupId === undefined ? response[0].id : selectedUserOrGroupId;
        if(selectedUserOrGroupId === undefined){
          this.setSelectedUserOrGroup(selectedElement);  
        }
        this.client.getProjectsBy(searchIn, selectedElement, queryParams)
          .then(response=> {
            this.manageResponse(response);
          })
      }).catch((error) => {
        this.setUsersOrGroupsList([]);
        this.set('loading',false);
      });
  }
  
  getPageData() {
    const searchIn = this.get('searchIn');
    this.set('loading', true);
    const pageNumber = this.get('currentPage');
    const perPage = this.get('perPage');
    const query = this.get('query');
    const orderBy = this.get('orderBy');
    const selectedUserOrGroupId = this.get('selectedUserOrGroup');
    const sort = this.get('orderSearchAsc') === true ? 'asc' : 'desc';
    let queryParams = { page: pageNumber, per_page: perPage, order_by: orderBy, sort:sort }

    if(this.get('loggedIn')){
      switch(this.get('currentTab')){
      case urlMap.projectsUrl:
        queryParams = { ...queryParams , membership: true }
        break;
      case urlMap.starred :
        queryParams = { ...queryParams, starred: true }
        break;
      case urlMap.yourProjects :
        queryParams = { ...queryParams, membership: true }
        break;
      default:
        break;
      }
    }
    
    switch(searchIn) {
    case searchInValuesMap.PROJECTNAME :
      return this.searchProjects({search:query, ...queryParams});
    case searchInValuesMap.USERNAME :
      return this.searchProjectsByUsernameOrGroup( searchIn, queryParams, query, selectedUserOrGroupId ) 
    case searchInValuesMap.GROUPNAME :
      return this.searchProjectsByUsernameOrGroup( searchIn, queryParams, query, selectedUserOrGroupId ) 
    default : return [];
    }
  }
}
export default ProjectListModel;

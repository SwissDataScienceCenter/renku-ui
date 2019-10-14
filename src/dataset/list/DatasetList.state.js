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
 *  DatasetList.state.js
 *  Redux-based state-management code.
 */

import { Schema, StateKind, StateModel} from '../../model/Model';

const orderByValuesMap = {
  NAME: 'name',
  DATE_PUBLISHED: 'datePublished',
  PROJECTSCOUNT: 'projectsCount'
};

const datasetListSchema = new Schema({
  loading: {initial: false},
  loggedIn: {initial: false},
  query: {initial: '', mandatory: true},
  orderBy: {initial:'projectsCount', mandatory:true},
  orderSearchAsc: {initial:false, mandatory:true},
  initialized: {initial: true},
  datasets: {initial: []},
  errorMessage: {initial: ""}
});

class DatasetListModel extends StateModel {
  constructor(client) {
    super(datasetListSchema, StateKind.REDUX)
    this.client = client;
  }

  setQuery(query) {
    this.set('query', encodeURIComponent(query));
  }

  setInitialized(initialized){
    this.set('datasets', []);
    this.set('initialized', initialized);
    this.set('errorMessage','');
  }

  setLoggedIn(loggedIn){
    this.set('loggedIn', loggedIn);
  }

  setOrderBy(orderBy){
    this.set('orderBy', orderBy);
  }

  setPathName(pathName){
    this.set('pathName',pathName)
  }

  setOrderSearchAsc(orderSearchAsc){
    this.set('orderSearchAsc', orderSearchAsc);
  }

  setOrderDropdownOpen(value){
    this.set('orderByDropdownOpen', value);
  }

  setQueryAndSortInSearch(query, orderBy, orderSearchAsc, pathName) {
    this.setQuery(query);
    this.setOrderBy(orderBy);
    this.setOrderSearchAsc(orderSearchAsc);
    this.setPathName(pathName);
    this.performSearch();
  }

  getSorting(){
    const searchOrder = this.get('orderSearchAsc') === true ? 'asc' : 'desc'; 
    switch(this.get('orderBy')){
    case orderByValuesMap.NAME:
      return "name:"+searchOrder;
    case orderByValuesMap.DATE_PUBLISHED:
      return "datePublished:"+searchOrder;
    case orderByValuesMap.PROJECTSCOUNT:
      return "projectsCount:"+searchOrder;
    default :
      return ""
    }
  }

  performSearch() {
    this.set('loading', true);
    const sorting = this.getSorting();
    const query = this.get('query')+"&sort="+sorting;
    return this.client.searchDatasets(query).then((response)=>{
      this.set('datasets', response);
      this.set('loading', false);
      this.set('initialized',false);
      this.set('errorMessage','');
    }).catch((error)=>{
      if(error.response && error.response.status === 400 && this.get('initialized') === false){
        this.set('errorMessage',"The query is invalid.");
      } else if(error.response && error.response.status === 404){
        this.set('errorMessage',"No datasets found for this query.");
      }
      this.set('datasets', []);
      this.set('loading', false);
      this.set('initialized', false);
    })
    

  }
}
export default DatasetListModel;

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

import React, { Component } from "react";
import { connect } from "react-redux";
import DatasetList from "./DatasetList.present";
import DatasetListModel, { orderByValuesMap } from "./DatasetList.state";
import qs from "query-string";

const urlMap = {
  datasetsUrl: "/datasets",
};

class List extends Component {
  constructor(props) {
    super(props);
    this.model = new DatasetListModel(props.client);
    this.handlers = {
      onSearchQueryChange: this.onSearchQueryChange.bind(this),
      onSearchSubmit: this.onSearchSubmit.bind(this),
      onOrderByDropdownToggle: this.onOrderByDropdownToggle.bind(this),
      changeSearchDropdownOrder: this.changeSearchDropdownOrder.bind(this),
      toggleSearchSorting: this.toggleSearchSorting.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
    };
  }

  componentDidMount() {
    const { query, orderBy, orderSearchAsc, pathName, pageNumber } = this.getUrlSearchParameters(this.props.location);
    let queryProcess = query;
    if (queryProcess === undefined)
      this.model.setInitialized(true);
    else
      this.model.setQuery(query);

    this.model.setOrderBy(orderBy);
    this.model.setOrderSearchAsc(orderSearchAsc);
    this.model.setOrderDropdownOpen(false);
    this.model.setPathName(pathName);
    this.model.setPage(pageNumber);
    this.model.performSearch();
    const listener = this.props.history.listen(location => {
      const { query, orderBy, orderSearchAsc, pathName, pageNumber } = this.getUrlSearchParameters(location);
      let queryProcess = query;
      if (queryProcess === undefined) {
        this.model.setInitialized(true);
        queryProcess = "";
      }
      this.onUrlParametersChange(queryProcess, orderBy, orderSearchAsc, pathName, pageNumber);
    });
    this.setState({ listener });
  }

  urlFromQueryAndPageNumber(query, orderBy, orderSearchAsc, pathName, pageNumber) {
    return `${pathName}?q=${query}&page=${pageNumber}&orderBy=${orderBy}&orderSearchAsc=${orderSearchAsc}`;
  }

  getUrlSearchParameters(location) {
    const query = qs.parse(location.search).q || "";
    const orderBy = qs.parse(location.search).orderBy || orderByValuesMap.PROJECTSCOUNT;
    const orderSearchAsc = qs.parse(location.search).orderSearchAsc === "true" ? true : false;
    const pathName = location.pathname.endsWith("/") ?
      location.pathname.substring(0, location.pathname.length - 1) :
      location.pathname;
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1;
    return { query, orderBy, orderSearchAsc, pathName, pageNumber };
  }

  componentWillUnmount() {
    const { listener } = this.state;
    if (listener)
      listener();

  }

  // urlFromQueryAndPageNumber(query) {
  //   const pathname = this.props.location.pathname;
  //   const path = pathname.endsWith('/') ?
  //     pathname.substring(0,pathname.length-1) :
  //     pathname;
  //   return `${path}?q=${query}`
  // }

  onUrlParametersChange(query, orderBy, orderSearchAsc, pathName, pageNumber) {
    // workaround to prevent the listener of "this.props.history.listen" to trigger in the wrong path
    // INFO: check if the path matches [/datasets$, /datasets/$, /datasets?*, /datasets/\D*]
    const regExp = /\/datasets($|\/$|(\/|\?)\D+.*)$/;
    if (!regExp.test(pathName))
      return;

    this.model.setQueryAndSortInSearch(query, orderBy, orderSearchAsc, pathName, pageNumber);
  }

  onPaginationPageChange(pageNumber) {
    this.model.setPage(pageNumber);
    this.model.performSearch();
    this.pushNewSearchToHistory();
  }

  pushNewSearchToHistory() {
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get("query"),
        this.model.get("orderBy"),
        this.model.get("orderSearchAsc"),
        this.model.get("pathName"),
        this.model.get("currentPage")
      )
    );
  }

  onSearchQueryChange(e) {
    this.model.setQuery(e.target.value);
  }

  onOrderByDropdownToggle() {
    this.model.setOrderDropdownOpen(!this.model.get("orderByDropdownOpen"));
  }

  changeSearchDropdownOrder(e) {
    this.model.setOrderBy(e.target.value);
    this.pushNewSearchToHistory();
  }

  toggleSearchSorting() {
    this.model.setOrderSearchAsc(!this.model.get("orderSearchAsc"));
    this.pushNewSearchToHistory();
  }

  getOrderByLabel() {
    switch (this.model.get("orderBy")) {
      case orderByValuesMap.TITLE:
        return "title";
      case orderByValuesMap.DATE_CREATED:
        return "date created";
      case orderByValuesMap.PROJECTSCOUNT:
        return "projects count";
      default:
        return "";
    }
  }

  onSearchSubmit(e) {
    e.preventDefault();
    this.model.resetBeforeNewSearch();
    this.model.performSearch();
    this.pushNewSearchToHistory();
  }

  mapStateToProps(ownProps) {
    return {
      searchQuery: this.model.get("query"),
      loading: this.model.get("loading"),
      datasets: this.model.get("datasets"),
      orderBy: this.model.get("orderBy"),
      orderByDropdownOpen: this.model.get("orderByDropdownOpen"),
      orderSearchAsc: this.model.get("orderSearchAsc"),
      errorMessage: this.model.get("errorMessage"),
      currentPage: this.model.get("currentPage"),
      perPage: this.model.get("perPage"),
      totalItems: this.model.get("totalItems"),
      onPageChange: this.handlers.onPaginationPageChange,
    };
  }

  render() {
    const VisibleDatasetList =
      connect(this.mapStateToProps.bind(this))(DatasetList);

    return <VisibleDatasetList
      store={this.model.reduxStore}
      handlers={this.handlers}
      orderByValuesMap={orderByValuesMap}
      urlMap={urlMap}
      orderByLabel={this.getOrderByLabel()}
    />;
  }
}

export default List;

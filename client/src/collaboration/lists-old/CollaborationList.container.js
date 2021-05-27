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
import IssueList from "./IssueList.present";
import MergeRequestList from "./MergeRequestList.present";
import CollaborationListModel from "./CollaborationList.state";
import qs from "query-string";

const itemsStateMap = {
  OPENED: "opened",
  MERGED: "merged",
  CLOSED: "closed"
};

const collaborationListTypeMap = {
  ISSUES: "issues",
  MREQUESTS: "mrequests" // eslint-disable-line
};

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.model = new CollaborationListModel(props.client, props.projectId, props.fetchElements);
    this.handlers = {
      setItemsState: this.setItemsState.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
    };
  }

  componentDidMount() {
    const { pathName, pageNumber, itemsState } = this.getUrlSearchParameters(this.props.location);
    this.model.setPathName(pathName);
    this.model.setItemsState(itemsState);
    this.model.setPage(pageNumber);
    this.model.performSearch();

    const listener = this.props.history.listen(location => {
      const { pathName, pageNumber, itemsState } = this.getUrlSearchParameters(location);
      this.onUrlParametersChange(pathName, pageNumber, itemsState);
    });
    this.setState({ listener });
  }

  urlFromQueryAndPageNumber(pathName, pageNumber, itemsState) {
    return `${pathName}?page=${pageNumber}&itemsState=${itemsState}`;
  }

  getUrlSearchParameters(location) {
    const itemsState = qs.parse(location.search).itemsState || itemsStateMap.OPENED;
    const pathName = location.pathname.endsWith("/") ?
      location.pathname.substring(0, location.pathname.length - 1) :
      location.pathname;
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1;
    return { pathName, pageNumber, itemsState };
  }

  componentWillUnmount() {
    const { listener } = this.state;
    if (listener)
      listener();
  }

  onUrlParametersChange(pathName, pageNumber, itemsState) {
    // workaround to prevent the listener of "this.props.history.listen" to trigger in the wrong path
    // INFO: check if the path matches [/items$, /items/$, /items?*, /items/\D*]
    const regExp = this.props.listType === collaborationListTypeMap.ISSUES ?
      /\/issues($|\/$|(\/|\?)\D+.*)$/ :
      /\/mergerequests($|\/$|(\/|\?)\D+.*)$/
    ;
    if (!regExp.test(pathName))
      return;

    this.model.setQueryAndSearch(pathName, pageNumber, itemsState);
  }

  onPaginationPageChange(pageNumber) {
    this.model.setPage(pageNumber);
    this.pushNewSearchToHistory();
  }

  pushNewSearchToHistory() {
    this.props.history.push(
      this.urlFromQueryAndPageNumber(
        this.model.get("pathName"),
        this.model.get("currentPage"),
        this.model.get("itemsState")
      )
    );
  }

  setItemsState(itemsState) {
    this.model.setItemsState(itemsState);
    this.pushNewSearchToHistory();
  }

  mapStateToProps(ownProps) {
    return {
      loading: this.model.get("loading"),
      items: this.model.get("items"),
      itemsState: this.model.get("itemsState"),
      errorMessage: this.model.get("errorMessage"),
      currentPage: this.model.get("currentPage"),
      perPage: this.model.get("perPage"),
      totalItems: this.model.get("totalItems"),
      onPageChange: this.handlers.onPaginationPageChange,
    };
  }

  render() {

    const VisibleItemsList = this.props.listType === collaborationListTypeMap.ISSUES ?
      connect(this.mapStateToProps.bind(this))(IssueList)
      : connect(this.mapStateToProps.bind(this))(MergeRequestList);

    return <VisibleItemsList
      store={this.model.reduxStore}
      handlers={this.handlers}
      client={this.props.client}
      fetchElements={this.props.fetchElements}
      projectId={this.props.projectId}
      {...this.props}
    />;
  }
}

export { List as CollaborationList, itemsStateMap, collaborationListTypeMap };

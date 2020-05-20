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
import IssueListModel from "./IssueList.state";
import qs from "query-string";

const urlMap = {
  issuesUrl: "/issues",
};

const issuesStateMap = {
  OPENED: "opened",
  CLOSED: "closed"
};

class List extends Component {
  constructor(props) {
    super(props);
    this.model = new IssueListModel(props.client, props.projectId);
    this.handlers = {
      setIssuesState: this.setIssuesState.bind(this),
      onPaginationPageChange: this.onPaginationPageChange.bind(this),
    };
  }

  componentDidMount() {
    const { pathName, pageNumber, issuesState } = this.getUrlSearchParameters(this.props.location);
    this.model.setPathName(pathName);
    this.model.setIssuesState(issuesState);
    this.model.setPage(pageNumber);
    this.model.performSearch();

    const listener = this.props.history.listen(location => {
      const { pathName, pageNumber, issuesState } = this.getUrlSearchParameters(location);
      this.onUrlParametersChange(pathName, pageNumber, issuesState);
    });
    this.setState({ listener });
  }

  urlFromQueryAndPageNumber(pathName, pageNumber, issuesState) {
    return `${pathName}?page=${pageNumber}&issuesState=${issuesState}`;
  }

  getUrlSearchParameters(location) {
    const issuesState = qs.parse(location.search).issuesState || issuesStateMap.OPENED;
    const pathName = location.pathname.endsWith("/") ?
      location.pathname.substring(0, location.pathname.length - 1) :
      location.pathname;
    const pageNumber = parseInt(qs.parse(location.search).page, 10) || 1;
    return { pathName, pageNumber, issuesState };
  }

  componentWillUnmount() {
    const { listener } = this.state;
    if (listener)
      listener();
  }

  onUrlParametersChange(pathName, pageNumber, issuesState) {
    // workaround to prevent the listener of "this.props.history.listen" to trigger in the wrong path
    // INFO: check if the path matches [/issues$, /issues/$, /issues?*, /issues/\D*]
    const regExp = /\/issues($|\/$|(\/|\?)\D+.*)$/;
    if (!regExp.test(pathName))
      return;

    this.model.setQueryAndSortInSearch(pathName, pageNumber, issuesState);
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
        this.model.get("issuesState")
      )
    );
  }

  setIssuesState(issuesState) {
    this.model.setIssuesState(issuesState);
    this.pushNewSearchToHistory();
  }

  mapStateToProps(ownProps) {
    return {
      loading: this.model.get("loading"),
      issues: this.model.get("issues"),
      issuesState: this.model.get("issuesState"),
      errorMessage: this.model.get("errorMessage"),
      currentPage: this.model.get("currentPage"),
      perPage: this.model.get("perPage"),
      totalItems: this.model.get("totalItems"),
      onPageChange: this.handlers.onPaginationPageChange,
    };
  }

  render() {
    const VisibleIssuesList =
      connect(this.mapStateToProps.bind(this))(IssueList);

    return <VisibleIssuesList
      store={this.model.reduxStore}
      handlers={this.handlers}
      urlMap={urlMap}
      client={this.props.client}
      projectId={this.props.projectId}
      {...this.props}
    />;
  }
}

export { List, issuesStateMap };

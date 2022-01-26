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

import { Schema, StateKind, StateModel } from "../../model/Model";
import uuid from "uuid/v4";

const orderByValuesMap = {
  TITLE: "title",
  DATE: "date",
  PROJECTSCOUNT: "projectsCount"
};

const datasetListSchema = new Schema({
  loading: { initial: false },
  query: { initial: "", mandatory: true },
  orderBy: { initial: "projectsCount", mandatory: true },
  orderSearchAsc: { initial: false, mandatory: true },
  currentPage: { initial: 1, mandatory: true },
  totalItems: { initial: 0, mandatory: true },
  perPage: { initial: 12, mandatory: true },
  pathName: { initial: "" },
  initialized: { initial: true },
  datasets: { initial: [] },
  errorMessage: { initial: "" },
  gridDisplay: { initial: true }
});

class DatasetListModel extends StateModel {
  constructor(client) {
    super(datasetListSchema, StateKind.REDUX);
    this.client = client;
  }

  setQuery(query) {
    this.set("query", encodeURIComponent(query));
  }

  setInitialized(initialized) {
    this.setObject({
      datasets: { $set: [] },
      initialized: initialized,
      errorMessage: "",
    });
  }

  setOrderBy(orderBy) {
    this.set("orderBy", orderBy);
  }

  setPathName(pathName) {
    this.set("pathName", pathName);
  }

  setOrderSearchAsc(orderSearchAsc) {
    this.set("orderSearchAsc", orderSearchAsc);
  }

  setOrderDropdownOpen(value) {
    this.set("orderByDropdownOpen", value);
  }

  setPage(page) {
    this.set("currentPage", parseInt(page, 12));
  }

  setGridDisplay(gridDisplay) {
    this.set("gridDisplay", gridDisplay);
  }

  setQueryAndSortInSearch(query, orderBy, orderSearchAsc, pathName, pageNumber) {
    this.setQuery(query);
    this.setOrderBy(orderBy);
    this.setOrderSearchAsc(orderSearchAsc);
    this.setPathName(pathName);
    this.setPage(pageNumber);
    this.performSearch();
  }

  resetBeforeNewSearch() {
    this.setObject({
      currentPage: 1,
      pages: { $set: [] }
    });
  }

  getSorting() {
    const searchOrder = this.get("orderSearchAsc") === true ? "asc" : "desc";
    switch (this.get("orderBy")) {
      case orderByValuesMap.TITLE:
        return "title:" + searchOrder;
      case orderByValuesMap.DATE:
        return "date:" + searchOrder;
      case orderByValuesMap.PROJECTSCOUNT:
        return "projectsCount:" + searchOrder;
      default:
        return "";
    }
  }

  manageResponse(response) {
    if (!this.get("loading")) return;
    const { pagination } = response;
    const newData = {
      datasets: { $set: response.data },
      currentPage: pagination.currentPage,
      totalItems: pagination.totalItems,
      initialized: false,
      errorMessage: "",
      loading: false
    };
    this.setObject(newData);
    return newData;
  }

  performSearch() {
    if (this.get("loading")) return;

    const searchId = uuid();
    this.set("searchId", searchId);
    this.set("loading", true);
    const searchParams = {
      query: this.get("query") === "" ? "*" : this.get("query"),
      sort: this.getSorting(),
      per_page: this.get("perPage"),
      page: this.get("currentPage"),
    };
    return this.client.searchDatasets(searchParams)
      .then( response => {
        const currentSearchId = this.get("searchId");
        if (currentSearchId !== searchId) return;
        this.manageResponse(response);
      })
      .catch((error) => {
        let newData = {};
        if (error.response && error.response.status === 400 && this.get("initialized") === false)
          newData.errorMessage = "The query is invalid.";
        else if (error.response && error.response.status === 404)
          newData.errorMessage = "No datasets found for this query.";

        newData.datasets = { $set: [] };
        newData.loading = false;
        newData.initialized = false;
        this.setObject(newData);
      });
  }

  cancelSearch() {
    // set that is not loading or waiting for results
    this.set("loading", false);
  }
}

export { orderByValuesMap };
export default DatasetListModel;

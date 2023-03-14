/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import ReactPagination from "react-js-pagination";

/**
 *  renku-ui
 *
 *  Pagination.js
 *  Pagination code and presentation.
 */

class Pagination extends Component {
  render() {

    // We do not display the pagination footer when there are no pages or only one page
    if (this.props.totalItems == null
      || this.props.totalItems < 1
      || this.props.totalItems <= this.props.perPage)
      return null;

    let extraInfoPagination = null;
    if (this.props.showDescription && this.props.totalInPage) {
      const initialValue = (this.props.currentPage * this.props.perPage) - (this.props.perPage - 1) ;
      const lastValue = initialValue + this.props.totalInPage - 1;
      extraInfoPagination = <div className="pagination-label">
        {initialValue} - {lastValue} of {this.props.totalItems} results
      </div>;
    }

    const className = `pagination ${this.props.className ? this.props.className : null}`;
    return <div className="d-flex align-items-center flex-column ">
      <ReactPagination
        activePage={this.props.currentPage}
        itemsCountPerPage={this.props.perPage}
        totalItemsCount={this.props.totalItems}
        onChange={this.props.onPageChange}
        innerClass={className}
        // Some defaults for the styling
        itemClass={"page-item"}
        linkClass={"page-link"}
        activeClass={"page-item active"}
        hideFirstLastPages={false}
        hideDisabled={true}
      />
      {extraInfoPagination}
    </div>;
  }
}
export { Pagination };

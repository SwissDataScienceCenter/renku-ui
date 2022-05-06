/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React from "react";
import Masonry from "react-masonry-css";
import { Pagination } from "./Pagination";
import ListCard from "./list/ListCard";
import ListBar from "./list/ListBar";

/**
 * This class receives a list of "items" and displays them either in a grid or in classic list.
 *
 * @param itemsType string containing the type of items in the list, this is only used to display an empty message.
 * @param search search function used inside the pagination.
 * @param currentPage current page used in the pagination.
 * @param gridDisplay if true the list will be displayed in grid mode.
 * @param totalItems total items, used in the pagination.
 * @param perPage items per page, used in the pagination.
 * @param items items to display, documented on top on ListCard.
 */
function ListDisplay(props) {

  const { currentPage, perPage, items, search, totalItems, gridDisplay, itemsType, gridColumnsBreakPoint } = props;

  if (!items || !items.length)
    return (<p>We could not find any matching {itemsType}s.</p>);

  const rows = gridDisplay ?
    items.map(item => <ListCard key={item.id} {...item} />)
    : items.map(item => <ListBar key={item.id} {...item} />);

  const onPageChange = (page) => { search({ page }); };
  const breakPointColumns = gridColumnsBreakPoint || {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return gridDisplay ?
    <div>
      <Masonry
        className="rk-search-result-grid mb-4"
        breakpointCols= {breakPointColumns}
      >
        {rows}
      </Masonry>
      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalItems} onPageChange={onPageChange}
        className="d-flex justify-content-center rk-search-pagination"/>
    </div>
    :
    <div>
      <div className="mb-4">{rows}</div>
      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalItems} onPageChange={onPageChange}
        className="d-flex justify-content-center rk-search-pagination"/>
    </div>;

}

export default ListDisplay;

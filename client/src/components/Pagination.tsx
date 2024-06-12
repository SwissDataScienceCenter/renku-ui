/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import ReactPagination from "react-js-pagination";

interface PaginationProps {
  className?: string;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  perPage: number;
  showDescription?: boolean;
  totalInPage?: number;
  totalItems?: number;
}

export default function Pagination({
  className: className_,
  currentPage,
  onPageChange,
  perPage,
  showDescription,
  totalInPage,
  totalItems,
}: PaginationProps) {
  // We do not display the pagination footer when there are no pages or only one page
  if (totalItems == null || totalItems < 1 || totalItems <= perPage) {
    return null;
  }

  let extraInfoPagination = null;
  if (showDescription && totalInPage) {
    const initialValue = currentPage * perPage - (perPage - 1);
    const lastValue = initialValue + totalInPage - 1;
    extraInfoPagination = (
      <div className="pagination-label">
        {initialValue} - {lastValue} of {totalItems} results
      </div>
    );
  }

  const className = cx("pagination", className_);

  return (
    <div className="d-flex align-items-center flex-column ">
      <ReactPagination
        activePage={currentPage}
        itemsCountPerPage={perPage}
        totalItemsCount={totalItems}
        onChange={onPageChange}
        innerClass={className}
        // Some defaults for the styling
        itemClass={"page-item"}
        linkClass={"page-link"}
        activeClass={"page-item active"}
        hideFirstLastPages={false}
        hideDisabled
      />
      {extraInfoPagination}
    </div>
  );
}

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
import { PaginationItem, PaginationLink } from "reactstrap";

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

  const className = cx("pagination", className_);

  return (
    <div className={cx("d-flex", "align-items-center", "flex-column")}>
      <CustomPagination
        activePage={currentPage}
        innerClass={className}
        itemsCountPerPage={perPage}
        onChange={onPageChange}
        totalItemsCount={totalItems}
      />
      {showDescription && totalInPage && (
        <ExtraInfoPagination
          currentPage={currentPage}
          perPage={perPage}
          totalInPage={totalInPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}

interface CustomPaginationProps {
  activePage: number;
  innerClass?: string;
  itemsCountPerPage: number;
  maxPages?: number;
  onChange: (pageNumber: number) => void;
  totalItemsCount: number;
}

function CustomPagination({
  activePage,
  innerClass,
  itemsCountPerPage,
  onChange,
  maxPages = 5,
  totalItemsCount,
}: CustomPaginationProps) {
  if (itemsCountPerPage === 0 || totalItemsCount === 0 || maxPages <= 0) {
    return null;
  }
  const totalPages = Math.ceil(totalItemsCount / itemsCountPerPage);
  if (totalPages <= 1) {
    return null;
  }

  const half = Math.floor(maxPages / 2);
  const start = Math.max(1, activePage - half);
  const end = Math.min(totalPages, start + maxPages - 1);
  const startPage =
    end === totalPages ? Math.max(1, totalPages - maxPages + 1) : start;

  const pages = [];

  // First page button: only show if the first page is not already shown
  if (startPage !== 1) {
    pages.push(
      <PaginationElement
        ariaLabel="first page"
        content="⟪"
        onClick={() => onChange(1)}
        key="first"
      />
    );
  }

  // Previous page button: only show if there's a previous page
  if (activePage > 1) {
    pages.push(
      <PaginationElement
        ariaLabel="previous page"
        content="⟨"
        onClick={() => onChange(activePage - 1)}
        key="prev"
      />
    );
  }

  // Page number buttons
  for (let pageNumber = startPage; pageNumber <= end; pageNumber++) {
    pages.push(
      <PaginationElement
        ariaLabel={`page ${pageNumber.toString()} of ${totalPages}`}
        content={pageNumber}
        onClick={() => onChange(pageNumber)}
        extraClass={pageNumber === activePage ? "active" : ""}
        key={pageNumber}
      />
    );
  }

  // Next page button: only show if there's a next page
  if (activePage < totalPages) {
    pages.push(
      <PaginationElement
        ariaLabel="next page"
        content="⟩"
        onClick={() => onChange(activePage + 1)}
        key="next"
      />
    );
  }

  // Last page button: show it if the last page is not already included in the loop
  if (end !== totalPages) {
    pages.push(
      <PaginationElement
        ariaLabel="last page"
        content="⟫"
        onClick={() => onChange(totalPages)}
        key="last"
      />
    );
  }

  return <ul className={cx(innerClass)}>{pages}</ul>;
}

interface PaginationElementProps {
  ariaLabel?: string;
  content: React.ReactNode;
  extraClass?: string;
  key: string | number;
  onClick: () => void;
}
function PaginationElement({
  ariaLabel = "",
  content,
  extraClass = "",
  key,
  onClick,
}: PaginationElementProps) {
  return (
    <PaginationItem key={key} className={extraClass}>
      <PaginationLink
        aria-label={ariaLabel}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {content}
      </PaginationLink>
    </PaginationItem>
  );
}

interface ExtraInfoPaginationProps {
  currentPage: number;
  perPage: number;
  totalInPage: number;
  totalItems: number;
}
function ExtraInfoPagination({
  currentPage,
  perPage,
  totalInPage,
  totalItems,
}: ExtraInfoPaginationProps) {
  const initialValue = currentPage * perPage - (perPage - 1);
  const lastValue = initialValue + totalInPage - 1;
  return (
    <div className="pagination-label">
      {initialValue} - {lastValue} of {totalItems} results
    </div>
  );
}

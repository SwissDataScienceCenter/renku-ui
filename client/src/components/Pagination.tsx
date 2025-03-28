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
import { memo } from "react";
import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import { PaginationItem, PaginationLink } from "reactstrap";

interface PaginationProps {
  ariaLabel?: string;
  className?: string;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  perPage: number;
  showDescription?: boolean;
  totalInPage?: number;
  totalItems?: number;
}

export default function Pagination({
  ariaLabel,
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
      <PaginationNav
        activePage={currentPage}
        ariaLabel={ariaLabel}
        innerClassName={className}
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

interface PaginationNavProps {
  activePage: number;
  ariaLabel?: string;
  innerClassName?: string;
  itemsCountPerPage: number;
  maxPages?: number;
  onChange: (pageNumber: number) => void;
  totalItemsCount: number;
}

const PaginationNav = memo(function PaginationNav({
  activePage,
  ariaLabel = "page navigation",
  innerClassName,
  itemsCountPerPage,
  onChange,
  maxPages = 5,
  totalItemsCount,
}: PaginationNavProps) {
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
        onClick={() => onChange(1)}
        key="first"
      >
        <ChevronDoubleLeft className="bi" />
      </PaginationElement>
    );
  }

  // Previous page button: only show if there's a previous page
  if (activePage > 1) {
    pages.push(
      <PaginationElement
        ariaLabel="previous page"
        onClick={() => onChange(activePage - 1)}
        key="prev"
      >
        <ChevronLeft className="bi" />
      </PaginationElement>
    );
  }

  // Page number buttons
  for (let pageNumber = startPage; pageNumber <= end; pageNumber++) {
    pages.push(
      <PaginationElement
        ariaLabel={`page ${pageNumber} of ${totalPages}`}
        onClick={() => onChange(pageNumber)}
        className={cx(pageNumber === activePage && "active")}
        key={`page-${pageNumber}`}
      >
        {pageNumber}
      </PaginationElement>
    );
  }

  // Next page button: only show if there's a next page
  if (activePage < totalPages) {
    pages.push(
      <PaginationElement
        ariaLabel="next page"
        onClick={() => onChange(activePage + 1)}
        key="next"
      >
        <ChevronRight className="bi" />
      </PaginationElement>
    );
  }

  // Last page button: show it if the last page is not already included in the loop
  if (end !== totalPages) {
    pages.push(
      <PaginationElement
        ariaLabel="last page"
        onClick={() => onChange(totalPages)}
        key="last"
      >
        <ChevronDoubleRight className="bi" />
      </PaginationElement>
    );
  }

  return (
    <nav aria-label={ariaLabel}>
      <ul className={innerClassName}>{pages}</ul>
    </nav>
  );
});

interface PaginationElementProps {
  ariaLabel?: string;
  children?: React.ReactNode;
  className?: string;
  onClick: () => void;
}
function PaginationElement({
  ariaLabel,
  children,
  className,
  onClick,
}: PaginationElementProps) {
  return (
    <PaginationItem className={className}>
      <PaginationLink
        aria-label={ariaLabel}
        href="#"
        // This should be converted to use Link and allow for smooth navigation
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {children}
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

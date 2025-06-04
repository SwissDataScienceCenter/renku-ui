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
import { memo, useCallback } from "react";
import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import { Link, useLocation, type To } from "react-router";
import { PaginationItem, PaginationLink } from "reactstrap";

interface PaginationProps {
  ariaLabel?: string;
  className?: string;
  currentPage: number;
  pageQueryParam: string;
  perPage: number;
  showDescription?: boolean;
  totalInPage?: number;
  totalItems?: number;
}

export default function Pagination({
  ariaLabel,
  className: className_,
  currentPage,
  pageQueryParam,
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
        pageQueryParam={pageQueryParam}
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
  pageQueryParam: string;
  totalItemsCount: number;
}

const PaginationNav = memo(function PaginationNav({
  activePage,
  ariaLabel = "page navigation",
  innerClassName,
  itemsCountPerPage,
  pageQueryParam,
  maxPages = 5,
  totalItemsCount,
}: PaginationNavProps) {
  const { hash, pathname, search } = useLocation();

  const getPageLink = useCallback(
    (page: number) => {
      const newSearch = new URLSearchParams(search);
      newSearch.set(pageQueryParam, `${page}`);
      const to: To = {
        hash: hash,
        pathname: pathname,
        search: newSearch.toString(),
      };
      return to;
    },
    [hash, pageQueryParam, pathname, search]
  );

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
        linkClassName="px-2"
        ariaLabel="first page"
        to={getPageLink(1)}
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
        linkClassName="px-2"
        ariaLabel="previous page"
        to={getPageLink(activePage - 1)}
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
        to={getPageLink(pageNumber)}
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
        linkClassName="px-2"
        ariaLabel="next page"
        to={getPageLink(activePage + 1)}
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
        linkClassName="px-2"
        ariaLabel="last page"
        to={getPageLink(totalPages)}
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
  linkClassName?: string;
  to: To;
}
function PaginationElement({
  ariaLabel,
  linkClassName,
  className,
  children,
  to,
}: PaginationElementProps) {
  return (
    <PaginationItem className={className}>
      <PaginationLink
        tag={Link}
        to={to}
        aria-label={ariaLabel}
        className={linkClassName}
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

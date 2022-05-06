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

import SortingEntities, { SortingOptions } from "../sortingEntities/SortingEntities";
import { FilterButton } from "../entities/Buttons";

interface ResultHeaderProps {
  total?: number;
  phrase?: string;
  sort: SortingOptions;
  handleSort: Function;
  isFiltersOpened: boolean;
  toggleFilter: Function;
  toggleFilterModal: Function;
  isOpenFilterModal: boolean;
}
const SearchResultsHeader = ({
  total, phrase, sort, handleSort, isFiltersOpened, toggleFilter, toggleFilterModal, isOpenFilterModal
}: ResultHeaderProps) => {
  if (!total)
    return null;

  const totalText = total > 1 ? "results" : "result";
  const title = phrase ?
    <div className="rk-search-result-title">
      {total} {totalText} for <span className="fw-bold">{`"${phrase}"`}</span></div> :
    <div className="rk-search-result-title">{total} {totalText} </div>;

  const buttonMobile = (
    <div className="d-sm-block d-md-block d-lg-none d-xl-none d-xxl-none text-end">
      <FilterButton isOpen = {isOpenFilterModal} toggle={toggleFilterModal} />
    </div>
  );

  const buttonDesktop = (
    <div className="d-none d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block">
      <FilterButton isOpen = {isFiltersOpened} toggle={toggleFilter} />
    </div>
  );

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex gap-4 align-items-center">
        {buttonMobile}
        {buttonDesktop}
        {title}
      </div>
      <SortingEntities styleType="desk" sort={sort} setSort={handleSort} />
    </div>
  );
};

export { SearchResultsHeader };


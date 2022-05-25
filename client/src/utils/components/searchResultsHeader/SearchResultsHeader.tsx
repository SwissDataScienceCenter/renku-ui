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

interface ResultHeaderProps {
  total?: number;
  phrase?: string;
  sort: SortingOptions;
  handleSort: Function;
}
const SearchResultsHeader = ({ total, phrase, sort, handleSort }: ResultHeaderProps) => {
  if (!total)
    return null;

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="rk-search-result-title">{total} Results for <span className="fw-bold">{`"${phrase}"`}</span></div>
      <SortingEntities styleType="desk" sort={sort} setSort={handleSort} />
    </div>
  );
};

export { SearchResultsHeader };


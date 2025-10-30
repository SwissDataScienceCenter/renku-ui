/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useSearchParams } from "react-router";

import { useGroupSearch } from "./groupSearch.hook";
import { getQueryHumanReadable } from "./groupSearch.utils";
import { FILTER_QUERY } from "./groupsSearch.constants";

export default function GroupSearchResultRecap() {
  // Get the query and results data
  const [searchParams] = useSearchParams();
  const { data, isFetching } = useGroupSearch();
  const total = data?.pagingInfo.totalResult;
  const filters = getQueryHumanReadable(searchParams);
  const query = searchParams.get(FILTER_QUERY.name) ?? "";

  return (
    <p className="mb-0">
      {isFetching ? (
        "Fetching results"
      ) : (
        <span className={cx("mb-0", "fw-semibold")}>
          {total ? total : "No"} {total && total > 1 ? "results" : "result"}
        </span>
      )}
      {query && (
        <>
          {" "}
          for <span className="fw-semibold">{`"${query}"`}</span>
        </>
      )}
      {filters && (
        <>
          {" "}
          (filtered by <>{filters}</>)
        </>
      )}
    </p>
  );
}

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
import { ReactNode, useMemo } from "react";

import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { useGetSearchQueryQuery } from "../api/searchV2Api.api";
import {
  FILTER_CONTENT,
  FILTER_DATE,
  FILTER_KEYWORD,
  FILTER_MEMBER,
  FILTER_MY_ROLE,
  FILTER_VISIBILITY,
} from "../contextSearch.constants";
import { selectSearchApiQuery } from "../searchV2.slice";

export default function SearchResultRecap() {
  const state = useAppSelector(({ searchV2 }) => searchV2);
  const apiQuery = useAppSelector(selectSearchApiQuery);
  const { data, isFetching } = useGetSearchQueryQuery({ params: apiQuery });
  const total = data?.pagingInfo.totalResult;

  const filters = useMemo(() => {
    const parts: ReactNode[] = [];
    if (state.contentType) {
      parts.push(
        <span key="type">
          {FILTER_CONTENT.label}: {state.contentType}
        </span>
      );
    }
    if (state.visibility) {
      parts.push(
        <span key="visibility">
          {FILTER_VISIBILITY.label}: {state.visibility}
        </span>
      );
    }
    if (state.role) {
      parts.push(
        <span key="role">
          {FILTER_MY_ROLE.label}: {state.role}
        </span>
      );
    }
    if (state.keywords) {
      parts.push(
        <span key="keywords">
          {FILTER_KEYWORD.label}: {state.keywords}
        </span>
      );
    }
    if (state.directMember) {
      parts.push(
        <span key="member">
          {FILTER_MEMBER.label}: {state.directMember}
        </span>
      );
    }
    if (state.created) {
      parts.push(
        <span key="created">
          {FILTER_DATE.label}: {state.created}
        </span>
      );
    }
    return parts.length > 0 ? (
      <>
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < parts.length - 1 && <> + </>}
          </span>
        ))}
      </>
    ) : null;
  }, [state]);

  return (
    <p className="mb-0">
      {isFetching ? (
        "Fetching results"
      ) : (
        <span className={cx("mb-0", "fw-semibold")}>
          {total ? total : "No"} {total && total > 1 ? "results" : "result"}
        </span>
      )}
      {state.query && (
        <>
          {" "}
          for <span className="fw-semibold">{`"${state.query}"`}</span>
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

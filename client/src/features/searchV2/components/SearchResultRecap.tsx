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

import { getFilterValueLabel } from "~/features/searchV2/contextSearch.utils";
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
  const {
    contentType,
    created,
    directMember,
    keywords,
    query,
    role,
    visibility,
  } = state;
  const apiQuery = useAppSelector(selectSearchApiQuery);
  const { data, isFetching } = useGetSearchQueryQuery({ params: apiQuery });
  const total = data?.pagingInfo.totalResult;

  const filters = useMemo(() => {
    const parts: ReactNode[] = [];
    if (contentType) {
      parts.push(
        <span key="type">
          {FILTER_CONTENT.label}:{" "}
          {getFilterValueLabel([contentType], FILTER_CONTENT.allowedValues)}
        </span>,
      );
    }
    if (visibility) {
      parts.push(
        <span key="visibility">
          {FILTER_VISIBILITY.label}:{" "}
          {getFilterValueLabel([visibility], FILTER_VISIBILITY.allowedValues)}
        </span>,
      );
    }
    if (role) {
      parts.push(
        <span key="role">
          {FILTER_MY_ROLE.label}:{" "}
          {getFilterValueLabel(role.split(","), FILTER_MY_ROLE.allowedValues)}
        </span>,
      );
    }
    if (keywords) {
      parts.push(
        <span key="keywords">
          {FILTER_KEYWORD.label}: {keywords}
        </span>,
      );
    }
    if (directMember) {
      parts.push(
        <span key="member">
          {FILTER_MEMBER.label}: {directMember}
        </span>,
      );
    }
    if (created) {
      parts.push(
        <span key="created">
          {FILTER_DATE.label}:{" "}
          {getFilterValueLabel([created], FILTER_DATE.allowedValues)}
        </span>,
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
  }, [contentType, created, directMember, keywords, role, visibility]);

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

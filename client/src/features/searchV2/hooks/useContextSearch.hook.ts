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

import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { useGetSearchQueryQuery } from "~/features/searchV2/api/searchV2Api.api";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { SEARCH_DEBOUNCE_SECONDS } from "../contextSearch.constants";
import { generateQueryParams } from "../contextSearch.utils";

export function useContextSearch(ignoredParams?: string[]) {
  const [searchParams] = useSearchParams();
  const { namespace } = useNamespaceContext();

  const params = useMemo(
    () => generateQueryParams(searchParams, namespace, ignoredParams),
    [namespace, ignoredParams, searchParams]
  );

  return useGetSearchQueryQuery(
    { params },
    { refetchOnMountOrArgChange: SEARCH_DEBOUNCE_SECONDS }
  );
}

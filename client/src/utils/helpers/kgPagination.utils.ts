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

import {
  AbstractKgPaginatedResponse,
  AbstractKgPaginatedQueryArgs,
} from "../types/pagination.types";

export function processPaginationHeaders(
  headers: Headers | undefined | null,
  queryArg: AbstractKgPaginatedQueryArgs,
  results: unknown[]
): AbstractKgPaginatedResponse {
  const headerPage = headers?.get("page");
  const headerPerPage = headers?.get("per-page");
  const headerTotal = headers?.get("total");
  const headerTotalPages = headers?.get("total-pages");
  const page = headerPage ? parseInt(headerPage) : queryArg.page ?? 1;
  const perPage = headerPerPage
    ? parseInt(headerPerPage)
    : queryArg.perPage ?? 20;
  const total = headerTotal
    ? parseInt(headerTotal)
    : results
    ? results.length
    : 0;
  const totalPages = headerTotalPages
    ? parseInt(headerTotalPages)
    : total / perPage;
  return {
    page,
    perPage,
    total,
    totalPages,
  };
}

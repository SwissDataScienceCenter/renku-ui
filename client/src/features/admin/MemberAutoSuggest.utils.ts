/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { SearchEntity } from "~/features/searchV2/api/searchV2Api.api";
import {
  KEY_VALUE_SEPARATOR,
  TYPE_FILTER_KEY,
} from "~/features/searchV2/searchV2.constants";

/**
 * Build a search V2 query string scoped to a single entity type.
 *
 * The search V2 API has no dedicated `type` parameter; the type filter is
 * embedded inside `q` as `type:<Entity>`. Embedding it here ensures the
 * `per_page` budget is spent only on entities of the wanted type, instead
 * of fetching mixed results and discarding most of them client-side.
 */
export function buildTypeScopedSearchQuery(
  searchTerm: string,
  entityType: SearchEntity["type"],
): string {
  return `${TYPE_FILTER_KEY}${KEY_VALUE_SEPARATOR}${entityType} ${searchTerm}`.trim();
}

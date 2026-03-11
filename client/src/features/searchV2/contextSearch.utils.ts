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

import { DATE_FILTER_CUSTOM_SEPARATOR } from "./contextSearch.constants";

export function parseCustomDateFilter(value: string): {
  afterDate: string;
  beforeDate: string;
} {
  const parts = value.split(DATE_FILTER_CUSTOM_SEPARATOR);
  let afterDate = "";
  let beforeDate = "";
  for (const part of parts) {
    if (part.startsWith(">")) afterDate = part.slice(1);
    else if (part.startsWith("<")) beforeDate = part.slice(1);
  }
  return { afterDate, beforeDate };
}

export function buildCustomDateFilterValue(
  afterDate: string,
  beforeDate: string
): string {
  const parts: string[] = [];
  if (afterDate) parts.push(`>${afterDate}`);
  if (beforeDate) parts.push(`<${beforeDate}`);
  return parts.join(DATE_FILTER_CUSTOM_SEPARATOR);
}

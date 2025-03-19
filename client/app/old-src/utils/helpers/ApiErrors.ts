/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

interface RenkuError {
  code: number;
  message: string;
}

interface RenkuErrorResponse {
  data: {
    error: RenkuError;
  };
  status: number;
}

export const isFetchBaseQueryError = (
  error: FetchBaseQueryError | unknown
): error is FetchBaseQueryError => {
  if (error != null && typeof error === "object") {
    const error_ = error as { status?: unknown };
    const statusType = typeof error_.status;
    return statusType === "number" || statusType === "string";
  }
  return false;
};

// See also CoreErrorHelpers.js
export function isRenkuError(error: unknown): error is RenkuError {
  if (error == null) return false;
  if (typeof error !== "object") return false;
  if (!("code" in error)) return false;
  if (!("message" in error)) return false;
  const errorCode = (error as RenkuError).code;
  if (errorCode >= 1000 || errorCode < 0) return true;
  return false;
}

export function isRenkuErrorResponse(
  response: unknown
): response is RenkuErrorResponse {
  if (!isFetchBaseQueryError(response)) return false;

  if (
    !("data" in response) ||
    typeof response.data !== "object" ||
    response.data == null
  )
    return false;
  if (!("error" in response.data) || typeof response.data.error !== "object")
    return false;
  return isRenkuError(response.data.error);
}

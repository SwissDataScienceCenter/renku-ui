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

import React from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

import { ErrorAlert } from "../Alert";

interface RtkErrorAlertProps {
  error: FetchBaseQueryError | SerializedError | undefined | null;
}
export function RtkErrorAlert({ error }: RtkErrorAlertProps) {
  // ? REF: https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
  if (error == null || error === undefined) return null;

  // code or status
  let errorCode = "Unknown";
  if ("status" in error) errorCode = error.status.toString();
  else if ("code" in error && error.code !== undefined)
    errorCode = error.code.toString();

  // message
  const extractErrorMessage = (
    error: FetchBaseQueryError | SerializedError
  ): string => {
    if ("error" in error && error.error.length) return error.error.toString();
    if ("message" in error && error.message?.length)
      return error.message.toString();
    if (
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data
    )
      return (error.data as unknown as Record<string, unknown>)
        .message as string;
    if ("data" in error) return JSON.stringify(error.data);
    return "No details available.";
  };
  const errorMessage = extractErrorMessage(error);

  return (
    <ErrorAlert>
      <h5>Error {errorCode}</h5>
      <p className="mb-0">{errorMessage}</p>
    </ErrorAlert>
  );
}

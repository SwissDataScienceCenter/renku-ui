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
  if (alert === null || alert === undefined) return null;

  const err = error as FetchBaseQueryError | SerializedError;

  // code or status
  let errorCode = "Unknown";
  if ("status" in err) errorCode = err.status as string;
  else if ("code" in err && err.code !== undefined) errorCode = err.code;

  // message
  let errorMessage = "No details available.";
  if ("error" in err && err.error.length) errorMessage = err.error;
  else if ("message" in err && err.message?.length) errorMessage = err.message;
  else if ("data" in err) {
    errorMessage = JSON.stringify(err.data);
  }

  return (
    <ErrorAlert>
      <h5>Error {errorCode}</h5>
      <p className="mb-0">{errorMessage}</p>
    </ErrorAlert>
  );
}

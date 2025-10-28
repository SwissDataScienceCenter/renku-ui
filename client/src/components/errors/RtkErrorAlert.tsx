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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { UpdateProjectResponse } from "../../features/project/project.types";
import { NotebooksErrorResponse } from "../../features/session/sessions.types";
import { extractTextFromObject } from "../../utils/helpers/TextUtils";
import { CoreErrorResponse } from "../../utils/types/coreService.types";
import { ErrorAlert, RenkuAlert } from "../Alert";
import { CoreErrorAlert } from "./CoreErrorAlert";

export function extractRkErrorMessage(
  error: FetchBaseQueryError | SerializedError,
  property = "message"
): string {
  if ("error" in error && error.error.length) return error.error.toString();
  if ("message" in error && error.message?.length)
    return error.message.toString();

  if (
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    property in error.data
  ) {
    const message = (error.data as Record<string, unknown>)[property];
    if (typeof message === "string") return message;
    return extractTextFromObject(message as Record<string, unknown>).join(" ");
  }
  if ("data" in error) return JSON.stringify(error.data);
  return "No details available.";
}

export function extractRkErrorRemoteBranch(
  error: FetchBaseQueryError | SerializedError
): string | undefined {
  if (
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "branch" in error.data
  ) {
    return (error?.data as UpdateProjectResponse)?.branch;
  }
  return undefined;
}

interface RtkErrorAlertProps {
  error: FetchBaseQueryError | SerializedError | undefined | null;
  dismissible?: boolean;
  property?: string;
}
export function RtkErrorAlert({
  error,
  dismissible = true,
  property = "message",
}: RtkErrorAlertProps) {
  // ? REF: https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
  if (error == null) return null;

  // code or status
  const errorCode =
    "status" in error
      ? error.status.toString()
      : "code" in error && error.code !== undefined
      ? error.code.toString()
      : "Unknown";

  // message
  const errorMessage = extractRkErrorMessage(error, property);

  return (
    <ErrorAlert dismissible={dismissible}>
      <h5>Error {errorCode}</h5>
      <p className="mb-0">{errorMessage}</p>
    </ErrorAlert>
  );
}

export function RtkOrCoreError({
  error,
  dismissible = true,
}: RtkErrorAlertProps) {
  if (!error) return null;
  return "status" in error &&
    typeof error.status === "number" &&
    (error.status as number) === 200 &&
    typeof error.data === "object" &&
    error.data &&
    "error" in error.data &&
    (error.data as CoreErrorResponse).error ? (
    <CoreErrorAlert error={(error.data as CoreErrorResponse).error} />
  ) : (
    <RtkErrorAlert dismissible={dismissible} error={error} />
  );
}

export function RtkOrNotebooksError({
  error,
  dismissible = true,
}: RtkErrorAlertProps) {
  if (!error) return null;
  if (
    "status" in error &&
    typeof error.status === "number" &&
    (error.status as number) >= 400 &&
    typeof error.data === "object" &&
    error.data &&
    "error" in error.data &&
    (error.data as NotebooksErrorResponse).error
  ) {
    return (
      <RenkuAlert color="danger" dismissible={dismissible} timeout={0}>
        <h3>Error {(error.data as NotebooksErrorResponse).error.code}</h3>
        <p className="mb-0">
          {(error.data as NotebooksErrorResponse).error.message}
        </p>
      </RenkuAlert>
    );
  }
  return <RtkErrorAlert dismissible={dismissible} error={error} />;
}

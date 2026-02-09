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
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Sentry from "@sentry/react-router";
import { clamp } from "lodash-es";

import { API_ERRORS } from "~/api-client";
import type { AppParams } from "~/utils/context/appParams.types";

const NAMESPACE_DEFAULT = "unknown";
const VERSION_DEFAULT = "unknown";
const RELEASE_UNKNOWN = "unknown";
const RELEASE_DEV = "-dev";
const UI_COMPONENT = "renku-ui";
const EXCLUDED_URLS = [
  /extensions\//i, // Chrome extensions 1
  /^chrome:\/\//i, // Chrome extensions 2
];

export function initClientSideSentry(params: AppParams) {
  const dsn = params.SENTRY_URL;
  const environment = params.SENTRY_NAMESPACE || NAMESPACE_DEFAULT;
  const release = getRelease(params.UI_VERSION || VERSION_DEFAULT);
  const tracesSampleRate = clamp(
    parseFloat(params.SENTRY_SAMPLE_RATE) || 0,
    0,
    1
  );

  const config: Sentry.BrowserOptions = {
    dsn,
    environment,
    release,
    beforeSend: beforeSend,
    denyUrls: [...EXCLUDED_URLS],
    integrations: [Sentry.reactRouterTracingIntegration()],
    tracesSampleRate,
  };
  Sentry.init(config);
  Sentry.setTags({
    component: UI_COMPONENT,
  });
}

export function getRelease(version: string): string {
  // Check input validity
  if (!version || typeof version !== "string") return RELEASE_UNKNOWN;

  // Check format validity
  const regValid = new RegExp(/^\d*(\.\d*){0,2}(-[a-z0-9.]{7,32})?$/);
  const resValid = version.match(regValid);
  if (!resValid || !resValid[0]) return RELEASE_UNKNOWN;

  // Extract information
  const regRelease = new RegExp(/^\d*(\.\d*){0,2}/);
  const resRelease = version.match(regRelease);
  const release =
    !resRelease || !resRelease[0] ? RELEASE_UNKNOWN : resRelease[0];
  const regPatch = new RegExp(/-[a-z0-9.]{6,32}$/);
  const resPatch = version.match(regPatch);
  const patch = !resPatch || !resPatch[0] ? "" : RELEASE_DEV;
  return release + patch;
}

//(event: ErrorEvent, hint: EventHint) => PromiseLike<ErrorEvent | null> | ErrorEvent | null;
function beforeSend(event: Sentry.ErrorEvent) {
  // filter network errors
  if (
    event.exception &&
    event.exception.values &&
    event.exception.values.length
  ) {
    if (event.exception.values.some((e) => e.value === API_ERRORS.networkError))
      return null;
  }

  // errors while previewing the notebooks
  if (
    event.request?.url?.includes("/files/blob/") &&
    event.request.url.endsWith(".ipynb")
  )
    return null;

  return event;
}

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

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import type { Provider } from "./api/connectedServices.api";
import {
  CHECK_STATUS_QUERY_PARAM,
  SEARCH_PARAM_SOURCE,
} from "./connectedServices.constants";

export const OAUTH_DATA_API_AUTHORIZE_PREFIX = "/api/data/oauth2/providers";

export function buildOAuthCompleteUrl(
  provider: Provider,
  source?: string
): string {
  const url = new URL(
    ABSOLUTE_ROUTES.v2.integrations.complete,
    window.location.origin
  );
  if (source) {
    url.searchParams.set(SEARCH_PARAM_SOURCE, source);
  }
  if (provider.kind === "github" && !provider.image_registry_url) {
    url.searchParams.set(CHECK_STATUS_QUERY_PARAM, provider.id);
  }
  return url.href;
}

export function buildOAuthAuthorizeUrl(
  provider: Provider,
  source?: string
): string {
  const nextUrl = buildOAuthCompleteUrl(provider, source);
  return `${OAUTH_DATA_API_AUTHORIZE_PREFIX}/${
    provider.id
  }/authorize?next_url=${encodeURIComponent(nextUrl)}`;
}

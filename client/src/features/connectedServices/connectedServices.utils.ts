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

import { safeNewUrl } from "~/utils/helpers/safeNewUrl.utils";
import type { Provider, ProviderKind } from "./api/connectedServices.api";
import { CHECK_STATUS_QUERY_PARAM } from "./connectedServices.constants";

type GetSettingsUrlArgs = Pick<Provider, "app_slug" | "url">;

export function getSettingsUrl({
  app_slug,
  url,
}: GetSettingsUrlArgs): URL | null {
  if (!app_slug) {
    return null;
  }

  const parsedUrl = safeNewUrl(url);
  if (parsedUrl?.hostname.toLowerCase() === "github.com") {
    return safeNewUrl(`apps/${app_slug}/installations/select_target`, url);
  }

  return safeNewUrl(`github-apps/${app_slug}/installations/select_target`, url);
}

type GetOauth2AuthorizeUrlArgs = {
  providerId: string;
  kind?: ProviderKind;
  registryUrl?: string;
  nextUrl: string;
};

/**
 * Build the OAuth2 "authorize" URL for a connected service provider.
 *
 * Note: for GitHub providers, we optionally append a callback marker
 * (`check-status=<providerId>`) to the `nextUrl` so other parts of the UI
 * can react immediately after returning from the OAuth flow.
 */
export function getOauth2AuthorizeUrl({
  providerId,
  kind,
  registryUrl,
  nextUrl,
}: GetOauth2AuthorizeUrlArgs): string {
  const hereUrl = new URL(nextUrl);

  // Keep behavior consistent with `ConnectButton` in `ConnectedServicesPage`.
  if (kind === "github" && !registryUrl) {
    hereUrl.searchParams.append(CHECK_STATUS_QUERY_PARAM, providerId);
  }

  const authorizeUrl = `/api/data/oauth2/providers/${providerId}/authorize`;
  return `${authorizeUrl}?next_url=${encodeURIComponent(hereUrl.href)}`;
}

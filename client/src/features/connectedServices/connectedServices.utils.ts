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
import type { Provider } from "./api/connectedServices.api";

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

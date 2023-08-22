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

function simplifyPath(path: string): string {
  return (
    "/" +
    path
      .split("/")
      .filter((s) => s.length > 0)
      .join("/")
  );
}

function stripInitialSlash(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

export type CoreApiVersionedUrlConfig = {
  /** The default version to use. Set to "/" to use the latest API version. */
  coreApiVersion: string;
  /** API Version overrides for specific metadata versions. Use "/" to mean 'latest'. */
  overrides: Record<string, string>;
};

/**
 * Helper class to generate versioned urls for the core api.
 */
export class CoreApiVersionedUrlHelper {
  config: CoreApiVersionedUrlConfig;
  constructor(
    config: Pick<CoreApiVersionedUrlConfig, "coreApiVersion"> &
      Partial<Pick<CoreApiVersionedUrlConfig, "overrides">>
  ) {
    this.config = {
      coreApiVersion: config.coreApiVersion,
      overrides: config.overrides ?? {},
    };
  }

  urlForEndpoint(
    endpoint: string,
    metadataVersion: string | undefined | null,
    apiVersionOverride?: string
  ): string {
    const endpoint_ = stripInitialSlash(endpoint);
    const metadataVersion_ = stripInitialSlash(metadataVersion ?? "");
    const apiVersion = apiVersionOverride
      ? apiVersionOverride
      : this.config.overrides[metadataVersion_] ?? this.config.coreApiVersion;
    const apiPath = metadataVersion_
      ? `${metadataVersion_}/${apiVersion}`
      : apiVersion;
    if (endpoint_.length > 0 || metadataVersion_.length > 0)
      return simplifyPath(`/${apiPath}/${endpoint_}`);
    if (apiPath !== "/") return `/${apiPath}/`;
    return "/";
  }
}

export function getCoreVersionedUrl(
  endpoint: string,
  metadataVersion?: string | null,
  helper?: CoreApiVersionedUrlHelper,
  apiVersionOverride?: string
): string {
  const helper_ =
    helper != null
      ? helper
      : new CoreApiVersionedUrlHelper({ coreApiVersion: "/" });
  return helper_.urlForEndpoint(endpoint, metadataVersion, apiVersionOverride);
}

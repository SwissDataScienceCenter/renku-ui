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

function stripInitialSlash(
  path: string | null | undefined
): string | undefined {
  if (path == null) return undefined;
  path = path.startsWith("/") ? path.slice(1) : path;
  if (path.length < 1) return undefined;
  return path;
}

export type CoreApiVersionedUrlConfig = {
  /** The default version to use. Set to "/" to use the latest API version. */
  coreApiVersion: string;
  /** API Version overrides for specific metadata versions. Set to "/" to mean 'latest'. */
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
    this.config = createCoreApiVersionedUrlConfig(config);
  }

  urlForEndpoint(
    endpoint: string,
    metadataVersion: string | undefined | null,
    apiVersionOverride?: string
  ): string {
    return coreVersionedUrl(this.config, {
      apiVersion: apiVersionOverride,
      endpoint,
      metadataVersion,
    });
  }
}

export function apiVersionForMetadataVersion(
  config: CoreApiVersionedUrlConfig,
  metadataVersion: string | undefined | null,
  apiVersionOverride?: string
) {
  const apiVersion = apiVersionOverride
    ? apiVersionOverride
    : metadataVersion
    ? config.overrides[metadataVersion] ?? config.coreApiVersion
    : config.coreApiVersion;
  return stripInitialSlash(apiVersion);
}

export function createCoreApiVersionedUrlConfig(
  config: Partial<CoreApiVersionedUrlConfig>
) {
  const overrides = config.overrides ?? {};
  return {
    coreApiVersion: config.coreApiVersion ?? "/",
    overrides,
  };
}

export function coreVersionedUrl(
  config: CoreApiVersionedUrlConfig,
  params: VersionedPathForEndpointParams
) {
  const sanitized = sanitizedVersionedPathParams({
    endpoint: params.endpoint,
    metadataVersion: params.metadataVersion,
  });
  sanitized.apiVersion = apiVersionForMetadataVersion(
    config,
    sanitized.metadataVersion,
    params.apiVersion ?? undefined
  );
  return versionedPathForEndpoint(sanitized);
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

/**
 * Take a proposed set of endpoint params and remove initial slashes and convert empty string to undefined.
 * @param param Proposed endpoint params to clean up
 */
export function sanitizedVersionedPathParams({
  apiVersion,
  endpoint,
  metadataVersion,
}: Partial<VersionedPathForEndpointParams>) {
  endpoint = stripInitialSlash(endpoint);
  metadataVersion = stripInitialSlash(metadataVersion);
  apiVersion = stripInitialSlash(apiVersion);
  return {
    apiVersion,
    endpoint,
    metadataVersion,
  };
}

export type VersionedPathForEndpointParams = {
  /* The API version to use, with any initial slash stripped. undefined/null => latest */
  apiVersion?: string;
  /* The endpoint, with any initial slash stripped. undefined/null => root */
  endpoint: string | undefined | null;
  /* The metadata version, with any initial slash stripped. undefined/null => latest */
  metadataVersion: string | undefined | null;
};

export function versionedPathForEndpoint({
  apiVersion,
  endpoint,
  metadataVersion,
}: VersionedPathForEndpointParams) {
  if (endpoint == null) endpoint = "";
  if (metadataVersion == null && apiVersion == null) return `/${endpoint}`;
  if (metadataVersion == null) return `/${apiVersion}/${endpoint}`;
  if (apiVersion == null) return `/${metadataVersion}/${endpoint}`;
  return `/${metadataVersion}/${apiVersion}/${endpoint}`;
}

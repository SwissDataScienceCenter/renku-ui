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

/**
 * Parse the chart version into components according to https://github.com/jupyterhub/chartpress/tree/1.3.0
 * NB This may need to change if chartpress is updated.
 * @param version the chart version
 * @returns the version components
 */
export function parseChartVersion(version: string | undefined) {
  if (version == null) {
    return {
      taggedVersion: "unknown",
      devHash: "unknown",
    };
  }
  const versionComponents = version.split("-");
  if (versionComponents.length === 1) {
    return {
      taggedVersion: version,
      devHash: null,
    };
  }
  const taggedVersion = versionComponents[0];
  const versionMetadata = versionComponents[1];
  const metadataComponents = versionMetadata.split(".");
  const lastComponent = metadataComponents[metadataComponents.length - 1];
  if (lastComponent.match(/^h.+$/)) {
    // This is non-tagged version, e.g. [tag].n[number of commits].h[commit hash]
    const devHash = lastComponent.slice(1);
    return {
      taggedVersion,
      devHash,
    };
  }
  // This is a tagged dev version, e.g. [tag]-[build info]
  const devHash = lastComponent;
  return {
    taggedVersion,
    devHash,
  };
}

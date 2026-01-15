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

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLaunchersList } from "~/features/sessionsV2/api/sessionLaunchersV2.api";

const DEFAULT_INTERNAL_GITLAB_HOSTS = {
  repository: "gitlab.renkulab.io",
  images: "registry.renkulab.io",
};

// exported for testing
export function doesUrlHostMatchHost(url: string, host: string) {
  const urlString = /^https?:\/\//.test(url) ? url : "http://" + url;
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.host === host;
  } catch (e) {
    return false;
  }
}

export function doesProjectReferenceRenkulabGitLab(
  allRepositories: Project["repositories"],
  allLaunchers: SessionLaunchersList
) {
  const { repositories, launchers } = projectReferencesToRenkulabGitLab(
    allRepositories,
    allLaunchers
  );
  return repositories.length > 0 || launchers.length > 0;
}

export function doesRepositoryReferenceRenkulabGitLab(url: string) {
  return doesUrlHostMatchHost(url, DEFAULT_INTERNAL_GITLAB_HOSTS.repository);
}

function doesImageReferenceRenkulabGitLab(imageRef: string) {
  return doesUrlHostMatchHost(imageRef, DEFAULT_INTERNAL_GITLAB_HOSTS.images);
}

function projectReferencesToRenkulabGitLab(
  allRepositories: Project["repositories"],
  allLaunchers: SessionLaunchersList
) {
  const repositories =
    allRepositories?.filter((repo) =>
      doesRepositoryReferenceRenkulabGitLab(repo)
    ) ?? [];
  const launchers = allLaunchers.filter(
    (launcher) =>
      launcher.environment.container_image != null &&
      doesImageReferenceRenkulabGitLab(launcher.environment.container_image)
  );
  return { repositories, launchers };
}

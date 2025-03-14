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

/**
 * Validates the URL of a code repository. Note that RenkuLab only supports HTTP(S) at the moment.
 */
export function validateCodeRepository(repositoryURL: string): true | string {
  const cleaned = repositoryURL.trim();
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return true;
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
  return "The repository URL must be a valid HTTP or HTTPS URL.";
}

/**
 * Checks that there is no duplicate in the list of repositories in a project.
 */
export function validateNoDuplicatesInCodeRepositories(
  repositories: string[]
): true | string {
  const cleaned = repositories.map((repo) => repo.trim());
  const uniqueRepos = cleaned.reduce(
    (repos, current) => repos.add(current),
    new Set<string>()
  );
  if (uniqueRepos.size === repositories.length) {
    return true;
  }
  return "This repository is already included in the project.";
}

export function detectSSHRepository(repositoryURL: string): boolean {
  const cleaned = repositoryURL.trim();
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === "ssh:") {
      return true;
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
  // This matches URLs like "git@github.com:SwissDataScienceCenter/renku-ui.git"
  const gitUrlRegex = /git@(?:.)+:/;
  return cleaned.match(gitUrlRegex) != null;
}

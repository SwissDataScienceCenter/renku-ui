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

import {
  detectSSHRepository,
  validateCodeRepository,
  validateNoDuplicatesInCodeRepositories,
} from "./repositories.utils";

describe("validateCodeRepository", () => {
  it("accepts an http URL", () => {
    const repositoryURL =
      "http://github.com/SwissDataScienceCenter/renku-ui.git";

    const result = validateCodeRepository(repositoryURL);

    expect(result).toBe(true);
  });

  it("accepts an https URL", () => {
    const repositoryURL =
      "https://github.com/SwissDataScienceCenter/renku-ui.git";

    const result = validateCodeRepository(repositoryURL);

    expect(result).toBe(true);
  });

  it("rejects an ssh URL", () => {
    const repositoryURL = "ssh://git@github.com/repository.git";

    const result = validateCodeRepository(repositoryURL);

    expect(result).toContain(
      "The repository URL must be a valid HTTP or HTTPS URL."
    );
  });

  it("rejects a git URL", () => {
    const repositoryURL = "git@github.com:SwissDataScienceCenter/renku-ui.git";

    const result = validateCodeRepository(repositoryURL);

    expect(result).toContain(
      "The repository URL must be a valid HTTP or HTTPS URL."
    );
  });
});

describe("validateNoDuplicatesInCodeRepositories", () => {
  it("accepts different repositories", () => {
    const repositories = [
      "https://github.com/SwissDataScienceCenter/renku-ui.git",
      "https://github.com/SwissDataScienceCenter/renku-data-services.git",
    ];

    const result = validateNoDuplicatesInCodeRepositories(repositories);

    expect(result).toBe(true);
  });

  it("rejects duplicate repositories", () => {
    const repositories = [
      "https://github.com/SwissDataScienceCenter/renku-ui.git",
      "https://github.com/SwissDataScienceCenter/renku-ui.git",
    ];

    const result = validateNoDuplicatesInCodeRepositories(repositories);

    expect(result).toContain(
      "This repository is already included in the project."
    );
  });
});

describe("detectSSHRepository", () => {
  it("matches an ssh URL", () => {
    const repositoryURL = "ssh://git@github.com/repository.git";

    const result = detectSSHRepository(repositoryURL);

    expect(result).toBeTruthy();
  });

  it("matches a git URL", () => {
    const repositoryURL = "git@github.com:SwissDataScienceCenter/renku-ui.git";

    const result = detectSSHRepository(repositoryURL);

    expect(result).toBeTruthy();
  });

  it("does not matches an https URL", () => {
    const repositoryURL =
      "https://github.com/SwissDataScienceCenter/renku-ui.git";

    const result = detectSSHRepository(repositoryURL);

    expect(result).toBeFalsy();
  });
});

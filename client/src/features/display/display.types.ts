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

interface ProjectConfig {
  projectPath: string;
  gitUrl: string;
  branch: string;
}

interface SessionConfig {
  targetServer: string;
}

interface FaviconSet {
  ico: string;
  png_32x: string;
  png_16x: string;
  svg: string;
}

export type FaviconStatus =
  | "general"
  | "running"
  | "waiting"
  | "error"
  | "pause";

export type DoiPage = "link" | "create" | "separate";

interface Display {
  favicon: FaviconStatus;
  doiPage: DoiPage;
  modals: {
    ssh: {
      show: boolean;
      projectPath: string;
      gitUrl: string;
      branch: string;
    };
    sessionLogs: {
      show: boolean;
      targetServer: string;
    };
  };
}

export type { Display, FaviconSet, ProjectConfig, SessionConfig };

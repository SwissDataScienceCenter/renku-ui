/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { EntityCreator } from "../../components/entities/Creators";
import { SessionStatus } from "../../features/session/sessions.types";

export interface NotebookAnnotations {
  branch: string;
  "commit-sha": string;
  default_image_used: boolean;
  namespace: string;
  gitlabProjectId: number;
  projectName: string;
  repository: string;

  hibernation: Record<string, unknown>;
  hibernationBranch: string;
  hibernationCommitSha: string;
  hibernationDate: string;
  hibernationDirty: boolean;
  hibernationSynchronized: boolean;
  hibernatedSecondsThreshold: string;

  [key: string]: unknown;
}

interface LogsData {
  [key: string]: string;
}

export interface SessionHandlers {
  // eslint-disable-next-line @typescript-eslint/ban-types
  fetchLogs: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  stopNotebook: Function;
}

export interface Notebook {
  data: {
    annotations: NotebookAnnotations;
    resources: {
      requests: {
        cpu: number;
        memory: string;
        storage: string;
      };
    };
    started: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commits?: any;
    image: string;
    name: string;
    status: SessionStatus;
    url: string;
  };
  logs: {
    data: LogsData;
    fetched?: string;
    fetching: boolean;
  };
  available: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetched: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetching: any;
}

export interface ProjectMetadata {
  accessLevel: number;
  avatarUrl?: string;
  description: string;
  externalUrl?: string;
  lastActivityAt: string;
  owner?: EntityCreator;
  pathWithNamespace?: string;
  path_with_namespace?: string;
  tagList: string[];
  title: string;
  visibility: "public" | "internal" | "private";
}

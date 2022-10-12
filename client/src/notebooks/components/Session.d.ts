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

import { EntityCreator } from "../entities/Creators";
import { SessionStatusData } from "./StartSessionProgressBar";

interface NotebookAnnotations {
  [key: string]: string;
}

interface LogsData {
  [key: string]: string;
}

export interface SessionHandlers {
  fetchLogs: Function;
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
    commits?: any;
    image: string;
    name: string;
    status: SessionStatusData;
    url: string;
  };
  logs: {
    data: LogsData;
    fetched?: string;
    fetching: boolean;
  };
  available: boolean;
  fetched: any;
  fetching: any;
}

export interface ProjectMetadata {
  path_with_namespace?: string;
  pathWithNamespace?: string;
  title: string;
  visibility: "public" | "internal" | "private";
  description: string;
  tagList: string[];
  owner?: EntityCreator;
  lastActivityAt: string;
  accessLevel: number;
}

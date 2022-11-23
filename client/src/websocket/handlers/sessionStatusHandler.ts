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
interface Session {
  annotations: Record<string, string>;
  cloudStorage: Record<string, string|number> | null;
  image: string;
  name: string;
  resources: {
    requests: Record<string, string|number>;
    usage: Record<string, string|number> | null;
    started: string;
  };
  state: {
    "pod_name": string;
  };
  status: {
    details: {
      status: string;
      step: string;
    }[];
    message?: string;
    readyNumContainers: number;
    state: string;
    totalNumContainers: number;
  };
  url: string;
}

interface ServersResult {
  fetching: boolean;
  fetched: Date;
  all: Record<string, Session>;
}

function handleSessionsStatus(data: Record<string, unknown>, webSocket: WebSocket, model: any, notifications: any) {
  if (data.message) {
    const statuses = JSON.parse(data.message as string);

    let updatedNotebooks: ServersResult = { fetching: false, fetched: new Date(), all: {} };
    updatedNotebooks.all = statuses;
    model.set("notebooks.notebooks", updatedNotebooks);
  }
  return null;
}

export { handleSessionsStatus };

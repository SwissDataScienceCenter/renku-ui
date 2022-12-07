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

import { isSessionUrl } from "../../utils/helpers/url/Url";
import { NotebooksCoordinator } from "../../notebooks";
import APIClient from "../../api-client";
import { StateModel } from "../../model";

function handleSessionsStatus(
  data: Record<string, unknown>, webSocket: WebSocket, model: StateModel, getLocation: Function, client: APIClient) {
  if (data.message as boolean && client && model) {
    const location = getLocation();

    if (!isSessionUrl(location?.pathname)) {
      const notebooksModel = model.subModel("notebooks");
      const userModel = model.subModel("user");
      const notebookCoordinator = new NotebooksCoordinator(client, notebooksModel, userModel);
      notebookCoordinator.fetchNotebooks();
    }
  }
}

export { handleSessionsStatus };

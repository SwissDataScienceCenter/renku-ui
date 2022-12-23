/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

// API methods that return Gitlab server instance-level information

import { renkuFetch } from "./utils";

function addInstanceMethods(client) {
  client.getGroupByPath = (path) => {
    const headers = client.getBasicHeaders();
    const urlEncodedPath = encodeURIComponent(path);
    return client.clientFetch(`${client.baseUrl}/groups/${urlEncodedPath}`, {
      method: "GET",
      headers
    });
  };

  client.isValidUrlForIframe = async (url) => {
    const response = await renkuFetch(`${client.baseUrl}/allows-iframe/${encodeURIComponent(url)}`, {
      method: "GET",
      headers: new Headers({ "Accept": "application/json" })
    });
    const data = await response.json();
    return data?.isIframeValid ?? false;
  };
}

export default addInstanceMethods;

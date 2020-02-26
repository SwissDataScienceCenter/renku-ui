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

import { RETURN_TYPES } from './utils';


function addUserMethods(client) {
  client.getUser = () => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(
      `${client.baseUrl}/user`, {
        method: 'GET',
        headers: headers
      },
      RETURN_TYPES.json, false, false).then(response => response.data);
  }

  client.getUserByPath = (path) => {
    const headers = client.getBasicHeaders();
    const queryParams = { username: encodeURIComponent(path) };
    return client.clientFetch(`${client.baseUrl}/users`, {
      method: 'GET',
      headers,
      queryParams
    })
  }
}

export default addUserMethods;

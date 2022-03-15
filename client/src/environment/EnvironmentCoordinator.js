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

/**
 *  renku-ui
 *
 *  EnvironmentCoordinator.js
 */

function updateObjectFromCoreVersion(oldList, data) {
  const services = [...oldList, data];
  const available = {};
  for (let v of data.versions)
    available[v.data["metadata_version"]] = true;

  return {
    coreVersions: { available: { $set: available } },
    services: {
      fetching: false,
      fetched: new Date(),
      list: { $set: services }
    }
  };
}

class EnvironmentCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  fetchCoreServiceVersions() {
    const model = this.model;
    model.set("services.fetching", true);

    return this.client.getCoreVersion()
      .then(data => {
        const obj = updateObjectFromCoreVersion(model.get("services.list"), data);
        model.setObject(obj);

        return data;
      })
      .catch(error => {
        const errorObject = { services: {
          fetching: false,
          fetched: new Date(),
          error } };
        model.setObject(errorObject);

        return errorObject;
      });
  }
}

export { EnvironmentCoordinator };

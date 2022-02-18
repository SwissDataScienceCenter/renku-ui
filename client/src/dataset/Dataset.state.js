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

import { datasetSchema } from "../model/RenkuModels";
import { API_ERRORS } from "../api-client";
import { mapDataset } from "./DatasetFunctions";

/**
 *  incubator-renku-ui
 *
 *  Dataset.state.js
 *  Redux-based state-management code.
 */

class DatasetCoordinator {

  constructor(client, model, notifications = null) {
    this.client = client;
    this.model = model;
    this.notifications = notifications;
  }

  get(component = "") {
    return this.model.get(component);
  }

  resetDataset() {
    const emptyModel = datasetSchema.createInitialized();
    this.model.baseModel.setObject({
      [this.model.baseModelPath]: { $set: emptyModel }
    });
  }

  set(component, value) {
    return this.model.set(component, value);
  }

  setUpdating(options) {
    this.model.setUpdating(options);
  }

  setDatasetFiles(files) {
    // this.set("files.hasPart", files);
    this.model.setObject({
      files: {
        hasPart: files,
        fetched: new Date(),
        fetching: false
      }
    });
  }

  setDataset(datasetKg, datasets, datasetId, datasetFiles) {
    const data = mapDataset(datasets ?
      datasets.find(dataset => dataset.identifier === datasetId)
      : undefined
    , datasetKg, datasetFiles);
    const values = {
      ...data,
      fetched: new Date(),
      fetching: false
    };

    this.model.setObject({ metadata: values });

    if (datasetKg?.hasPart || datasets?.hasPart) {
      this.set("files.fetched", true);
      this.setDatasetFiles(datasetKg?.hasPart || datasets?.hasPart);
    }
    return values;
  }

  fetchDataset(datasetId, datasets, fetchKg) {
    if (!datasetId)
      return null;

    this.set("metadata.fetching", true);
    if (!fetchKg)
      return this.setDataset(undefined, datasets, datasetId);

    return this.fetchDatasetKg(datasetId, datasets);
  }

  fetchDatasetKg(datasetId, datasets) {
    return this.client.fetchDatasetFromKG(datasetId)
      .then((datasetInfo) => {
        if (datasetInfo !== undefined)
          return this.setDataset(datasetInfo, datasets, datasetId);
        return null;
      }).catch(error => {
        this.setDataset(undefined, datasets, datasetId);
        if (error.case === API_ERRORS.notFoundError)
          this.set("metadata.fetchError", { code: 404, message: "dataset not found or missing permissions" });
        else if (error.case === API_ERRORS.internalServerError)
          this.set("metadata.fetchError", { code: 500, message: "cannot fetch selected dataset" });
        else throw error;
      });
  }

  fetchDatasetFilesFromCoreService(name, httpProjectUrl, versionUrl) {
    if (!name || !httpProjectUrl || !versionUrl)
      return;

    this.set("files.fetching", true);
    return this.client.fetchDatasetFilesFromCoreService(name, httpProjectUrl, versionUrl)
      .then(response => {
        if (response.data.result) {
          const files = response.data.result.files
            .map(file => ({ name: file.name, atLocation: file.path }));
          this.setDatasetFiles(files);
          return { hasPart: files };
        }
        this.setDatasetFiles([]);
        if (response.data && response.data.error) {
          if (response.data.error.code === -32100) {
            this.set("files.fetchError", { code: 404, message: "dataset not found or missing permissions" });
          }
          else {
            this.set("files.fetchError",
              { code: 0, message: response.data.error.reason });
          }
        }
        return { hasPart: [] };
      });
  }
}

export { DatasetCoordinator };

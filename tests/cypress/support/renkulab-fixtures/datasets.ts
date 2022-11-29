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

import { FixturesConstructor } from "./fixtures";

function toLegacyIdentifier(datasetId) {
  return datasetId.slice(0, 8) + "-" + datasetId.slice(8, 12) + "-" + datasetId.slice(12, 16) +
    "-" + datasetId.slice(16, 20) + "-" + datasetId.slice(20);
}

/**
 * Fixtures for Datasets
 */
function Datasets<T extends FixturesConstructor>(Parent: T) {
  return class DatasetsFixtures extends Parent {

    datasets(name = "getDatasets", resultFile = "datasets/datasets.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/kg/datasets?query=*&sort=projectsCount%3Adesc&per_page=12&page=1",
        fixture
      ).as(name);
      return this;
    }

    datasetById(id = "a20838d8cd514eaab3efbd54a8104732", name = "getDatasetById" ) {
      const fixture = this.useMockedData ? { fixture: `datasets/dataset_${id}.json` } : undefined;
      cy.intercept(
        "/ui-server/api/kg/datasets/" + id,
        fixture
      ).as(name);
      return this;
    }

    invalidDataset(id = "a46c10c94a40359181965e5c4cdabc", name = "invalidDataset") {
      const fixture = this.useMockedData ? { fixture: `datasets/no-dataset.json`, statusCode: 404 } : undefined;
      cy.intercept(
        "/ui-server/api/kg/datasets/" + id,
        fixture
      ).as(name);
      return this;
    }

    projectKGDatasetList(path = "", name = "datasetKGList", resultFile = "datasets/project-dataset-kg-list.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        `/ui-server/api/kg/projects/${path}/datasets`,
        fixture
      ).as(name);
      return this;
    }

    projectDatasetList(name = "datasetList", resultFile = "datasets/project-dataset-list.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/*/datasets.list?git_url=*",
        fixture
      ).as(name);
      return this;
    }

    projectDatasetLegacyIdList(name = "datasetList", resultFile = "datasets/project-dataset-list.json") {
      if (!this.useMockedData) return;
      cy.fixture(resultFile).then((result) => {
        for (const ds of result.result.datasets)
          ds.identifier = toLegacyIdentifier(ds.identifier);
        cy.intercept(
          "GET",
          "/ui-server/api/renku/*/datasets.list?git_url=*",
          result
        ).as(name);
      });
      return this;
    }

    getFiles(name = "getFiles" ) {
      const fixture = this.useMockedData ? { fixture: `datasets/dataset-files.json` } : undefined;
      cy.intercept(
        "/ui-server/api/renku/*/datasets.files_list?*",
        fixture
      ).as(name);
      return this;
    }

    importToProject(name = "importToProject", resultFile = "datasets/datasets-import.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/datasets.import",
        fixture
      ).as(name);
      return this;
    }

    importJobCompleted(name = "importJobCompleted", resultFile = "datasets/import-job-completed.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/jobs/*",
        fixture,
      ).as(name);
      return this;
    }

    importJobError(name = "importJobError", resultFile = "datasets/import-job-error.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/jobs/*",
        fixture,
      ).as(name);
      return this;
    }

    uploadDatasetFile(name = "uploadDatasetFile", resultFile = "datasets/upload-dataset-file.json", options?) {
      const fixture = this.useMockedData ?
        { fixture: resultFile,
          statusCode: options?.statusCode ?? 200,
        } : undefined;
      let params = options && options.override_existing ?
        `?override_existing=${options.override_existing}` : "*";

      params = options && options.unpack_archive ?
        `${params}&unpack_archive=${options.unpack_archive}` : "*";

      cy.intercept(
        "/ui-server/api/renku/*/cache.files_upload" + params,
        fixture,
      ).as(name);
      cy.intercept(
        "/ui-server/api/renku/cache.files_upload" + params,
        fixture,
      ).as(name);
      return this;
    }

    createDataset(name = "createDataset", resultFile = "datasets/create-dataset.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/*/datasets.create",
        fixture,
      ).as(name);
      return this;
    }

    addFileDataset(name = "addFile", resultFile = "datasets/add-file.json") {
      const fixture = this.useMockedData ? { fixture: resultFile } : undefined;
      cy.intercept(
        "/ui-server/api/renku/*/datasets.add",
        fixture,
      ).as(name);
      return this;
    }
  };
}

export { Datasets };

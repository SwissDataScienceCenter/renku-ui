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
import { DeepPartial, NameOnlyFixture, SimpleFixture } from "./fixtures.types";

function toLegacyIdentifier(datasetId: string): string {
  return (
    datasetId.slice(0, 8) +
    "-" +
    datasetId.slice(8, 12) +
    "-" +
    datasetId.slice(12, 16) +
    "-" +
    datasetId.slice(16, 20) +
    "-" +
    datasetId.slice(20)
  );
}

/**
 * Fixtures for Datasets
 */
export function Datasets<T extends FixturesConstructor>(Parent: T) {
  return class DatasetsFixtures extends Parent {
    datasetById(args?: Partial<DatasetByIdArgs>) {
      const { id, name } = Cypress._.defaults({}, args, {
        id: "a20838d8cd514eaab3efbd54a8104732",
        name: "getDatasetById",
      });
      const response = { fixture: `datasets/dataset_${id}.json` };
      cy.intercept(`/ui-server/api/kg/datasets/${id}`, response).as(name);
      return this;
    }

    datasetsRemove(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "datasetsRemove",
      });
      const response = { body: { result: { name, remote_branch: "master" } } };
      cy.intercept(
        "POST",
        "/ui-server/api/renku/*/datasets.remove",
        response
      ).as(name);
      return this;
    }

    invalidDataset(args?: Partial<InvalidDatasetArgs>) {
      const { id, name } = Cypress._.defaults({}, args, {
        id: "a46c10c94a40359181965e5c4cdabc",
        name: "invalidDataset",
      });
      const response = { fixture: `datasets/no-dataset.json`, statusCode: 404 };
      cy.intercept(`/ui-server/api/kg/datasets/${id}`, response).as(name);
      return this;
    }

    projectKGDatasetList(args?: Partial<ProjectKGDatasetListArgs>) {
      const { fixture, name, path } = Cypress._.defaults({}, args, {
        fixture: "datasets/project-dataset-kg-list.json",
        name: "datasetKGList",
        path: "",
      });
      const response = { fixture };
      cy.intercept(`/ui-server/api/kg/projects/${path}/datasets`, response).as(
        name
      );
      return this;
    }

    projectDatasetList(args?: Partial<ProjectDatasetListArgs>) {
      const { fixture, name, transformResponse } = Cypress._.defaults(
        {},
        args,
        {
          fixture: "datasets/project-dataset-list.json",
          name: "datasetList",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transformResponse: (response: any) => response,
        }
      );
      cy.fixture(fixture).then((content) => {
        const result = transformResponse(content);
        const response = { body: result };
        cy.intercept(
          "/ui-server/api/renku/**/datasets.list?git_url=*",
          response
        ).as(name);
      });
      return this;
    }

    projectDatasetLegacyIdList(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/project-dataset-list.json",
        name: "datasetList",
      });
      cy.fixture(fixture).then((response) => {
        for (const ds of response.result.datasets) {
          ds.identifier = toLegacyIdentifier(ds.identifier);
        }
        cy.intercept(
          "GET",
          "/ui-server/api/renku/*/datasets.list?git_url=*",
          response
        ).as(name);
      });
      return this;
    }

    getFiles(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/dataset-files.json",
        name: "getFiles",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/datasets.files_list?*", response).as(
        name
      );
      return this;
    }

    importToProject(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/datasets-import.json",
        name: "importToProject",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/datasets.import", response).as(name);
      cy.intercept("/ui-server/api/renku/datasets.import", response).as(name);
      return this;
    }

    importJobCompleted(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/import-job-completed.json",
        name: "importJobCompleted",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/jobs/*", response).as(name);
      cy.intercept("/ui-server/api/renku/jobs/*", response).as(name);
      return this;
    }

    importJobError(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/import-job-error.json",
        name: "importJobError",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/jobs/*", response).as(name);
      cy.intercept("/ui-server/api/renku/jobs/*", response).as(name);
      return this;
    }

    uploadDatasetFile(args?: Partial<UploadDatasetFileArgs>) {
      const { fixture, name, overrideExisting, statusCode, unpackArchive } =
        Cypress._.defaults({}, args, {
          fixture: "datasets/upload-dataset-file.json",
          name: "uploadDatasetFile",
          overrideExisting: "*",
          statusCode: 200,
          unpackArchive: null,
        });
      const params = new URLSearchParams([
        ...(overrideExisting
          ? [["override_existing", `${overrideExisting}`]]
          : []),
        ...(unpackArchive ? [["unpack_archive", `${unpackArchive}`]] : []),
      ]).toString();
      const url = `/ui-server/api/renku/*/cache.files_upload${
        params ? `?${params}` : ""
      }`;
      const response = { fixture, statusCode };
      cy.intercept(url, response).as(name);
      return this;
    }

    createDataset(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/create-dataset.json",
        name: "createDataset",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/datasets.create", response).as(name);
      return this;
    }

    editDataset(args?: DeepPartial<EditDatasetArgs>) {
      const { edited, name, remoteBranch } = Cypress._.defaultsDeep({}, args, {
        edited: { name: "abcd", title: "abcd edited" },
        name: "editDataset",
        remoteBranch: "master",
      }) as EditDatasetArgs;
      const response = {
        body: {
          result: { edited, remote_branch: remoteBranch, warnings: [] },
        },
      };

      cy.intercept("/ui-server/api/renku/*/datasets.edit", response).as(name);
      return this;
    }

    addFileDataset(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "datasets/add-file.json",
        name: "addFile",
      });
      const response = { fixture };
      cy.intercept("/ui-server/api/renku/*/datasets.add", response).as(name);
      return this;
    }
  };
}

interface DatasetByIdArgs {
  id: string;
  name: string;
}

interface InvalidDatasetArgs {
  id: string;
  name: string;
}

interface ProjectKGDatasetListArgs extends SimpleFixture {
  path: string;
}

interface ProjectDatasetListArgs extends SimpleFixture {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformResponse: <T = any, R = any>(response: T) => R;
}

interface UploadDatasetFileArgs extends SimpleFixture {
  overrideExisting: boolean | "*" | null;
  statusCode: number;
  unpackArchive: boolean | "*" | null;
}

interface EditDatasetArgs {
  edited: { name: string; title: string };
  name: string;
  remoteBranch: string;
}

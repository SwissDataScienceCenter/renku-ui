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

import fixtures from "../support/renkulab-fixtures";

function checkDatasetInKg(cy, fixtures, projectPath) {
  const datasetName = "abcd";
  const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
  fixtures.datasetById(datasetIdentifier);
  cy.visit(`projects/${projectPath}/datasets/${datasetName}`);
  cy.wait("@getProject");
  cy.wait("@datasetList");
  cy.wait("@getDatasetById");
  cy.getDataCy("add-to-project-button").should("be.enabled");
  cy.getDataCy("not-in-kg-warning").should("not.exist");
}

function checkDatasetDisplay(cy, fixtures, datasets, projectPath) {
  datasets.forEach((d, i) => {
    const datasetIdentifier = d.identifier.replace(/-/g, "");
    const requestId = `getDatasetById${i}`;
    fixtures.datasetById(datasetIdentifier, requestId);
    cy.getDataCy("list-card-title").contains(d.title).click();
    cy.wait(`@${requestId}`);
    cy.getDataCy("dataset-title").should("contain.text", d.title);
    cy.getDataCy("header-project").should("not.exist");
    cy.getDataCy("go-back-button").should(
      "contain.text",
      `Back to ${projectPath}`
    );
    cy.getDataCy("edit-dataset-button").should("exist");
    cy.getDataCy("delete-dataset-button").should("exist");

    cy.getDataCy("go-back-button").click();
  });
}

function checkDatasetLimitedPermissionDisplay(
  cy,
  fixtures,
  datasets,
  editDisabled = false
) {
  datasets.forEach((d, i) => {
    const datasetIdentifier = d.identifier.replace(/-/g, "");
    const requestId = `getDatasetById${i}`;
    fixtures.datasetById(datasetIdentifier, requestId);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000, { log: false });
    cy.getDataCy("list-card-title").should("have.length", 3);
    cy.getDataCy("list-card-title").contains(d.title).click();
    cy.wait(`@${requestId}`);
    cy.getDataCy("dataset-title").should("contain.text", d.title);

    if (editDisabled) {
      cy.getDataCy("edit-dataset-button").should("be.disabled");
      cy.getDataCy("add-to-project-button").should("be.disabled");
    } else {
      cy.getDataCy("edit-dataset-button").should("not.exist");
      cy.getDataCy("add-to-project-button").should("be.visible");
    }

    cy.getDataCy("go-back-button").click();
  });
}

describe("Project dataset", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
  });

  it("displays project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        checkDatasetDisplay(cy, fixtures, datasets, projectPath);
      });
  });

  it("can edit project dataset", () => {
    fixtures.getFiles().uploadDatasetFile().addFileDataset().editDataset();

    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        const dataset = datasets[0];
        const datasetIdentifier = dataset.identifier.replace(/-/g, "");
        fixtures.datasetById(datasetIdentifier, "getDatasetById");
        cy.getDataCy("list-card-title").contains(dataset.title).click();
        cy.wait("@getDatasetById");
        cy.getDataCy("edit-dataset-button").first().click();
        cy.wait("@getFiles");

        cy.get("input[name='title']").should("have.value", dataset.title);
        cy.get("input[name='title']").type(" edited");

        cy.getDataCy("creator-name")
          .first()
          .should("have.value", dataset.creators[0].name);
        cy.getDataCy("creator-name")
          .last()
          .should("have.value", dataset.creators[2].name);
        cy.getDataCy("creator-name").first().type(" edited");

        cy.get("div.input-tag").contains("test");
        cy.get("div.input-tag").contains("testing datasets");
        cy.getDataCy("input-keywords").type("added");

        cy.get("div.ck-editor__main").contains("Dataset for testing purposes");
        cy.getDataCy("ckeditor-description")
          .find("p")
          .click()
          .type(". New description");

        cy.get("div.tree-container").contains("air_quality_no2.txt");
        cy.get('[data-cy="dropzone"]').attachFile(
          "/datasets/files/count_flights.txt",
          { subjectType: "drag-n-drop" }
        );
        cy.wait("@uploadDatasetFile");

        // fixtures.projectKGDatasetList(projectPath);
        // eslint-disable-next-line max-nested-callbacks
        fixtures.projectDatasetList(undefined, undefined, (content) => {
          content.result.datasets[0].title = `${dataset.title} edited`;
          return content;
        });
        cy.getDataCy("submit-button").click();
        cy.wait("@editDataset")
          .its("request.body")
          // eslint-disable-next-line max-nested-callbacks
          .then((body) => {
            cy.wrap(body).its("name").should("equal", dataset.name);
            cy.wrap(body)
              .its("title")
              .should("equal", `${dataset.title} edited`);
            cy.wrap(body).its("keywords").should("include", "added");
            cy.wrap(body.creators[0])
              .its("name")
              .should("to.match", /edited$/);
          });
        cy.wait("@addFile");
        cy.wait("@datasetList", { timeout: 20_000 });
        cy.wait("@getProjectLockStatus");
        cy.get(".card-title").contains(dataset.title);
      });
  });

  it("can edit project dataset with protected branch", () => {
    fixtures
      .getFiles()
      .uploadDatasetFile()
      .addFileDataset()
      .editDataset(undefined, undefined, "protected");

    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        const dataset = datasets[0];
        const datasetIdentifier = dataset.identifier.replace(/-/g, "");
        fixtures.datasetById(datasetIdentifier, "getDatasetById");
        cy.getDataCy("list-card-title").contains(dataset.title).click();
        cy.wait("@getDatasetById");
        cy.getDataCy("edit-dataset-button").first().click();
        cy.wait("@getFiles");

        cy.get("input[name='title']").should("have.value", dataset.title);
        cy.get("input[name='title']").type(" edited");

        // eslint-disable-next-line max-nested-callbacks
        fixtures.projectDatasetList(undefined, undefined, (content) => {
          content.result.datasets[0].title = `${dataset.title} edited`;
          return content;
        });
        cy.getDataCy("submit-button").click();
        cy.contains(
          "The operation was successful, but this project requires use of merge requests to make changes."
        ).should("be.visible");
      });
  });

  it("delete project dataset", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        const dataset = datasets[0];
        const datasetIdentifier = dataset.identifier.replace(/-/g, "");
        fixtures.datasetById(datasetIdentifier, "getDatasetById");
        cy.getDataCy("list-card-title").contains(dataset.title).click();
        cy.wait("@getDatasetById");
        cy.getDataCy("delete-dataset-button").should("exist").click();
        fixtures.datasetsRemove(datasetIdentifier);
        cy.get("button").contains("Delete dataset").should("exist").click();
        // dataset should be deleted
        cy.wait("@datasetsRemove");
        // list should be refreshed
        cy.wait("@datasetList");
        cy.contains("Datasets List").should("be.visible");
      });
  });

  it("dataset limited options if has not permissions", () => {
    const projectPath = "e2e/testing-datasets";
    fixtures.project(
      projectPath,
      "getProjectLimited",
      "projects/project-limited-permissions.json"
    );
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProjectLimited");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        checkDatasetLimitedPermissionDisplay(cy, fixtures, datasets);
      });
  });

  it("dataset is in Kg", () => {
    checkDatasetInKg(cy, fixtures, projectPath);
  });

  it("dataset is NOT in Kg", () => {
    const datasetName = "abcd";
    const datasetIdentifier = "4577b68957b7478bba1f07d6513b43d2";
    fixtures.invalidDataset(datasetIdentifier);
    fixtures.getFiles();
    cy.visit(`projects/${projectPath}/datasets/${datasetName}`);
    cy.wait("@getProject");
    cy.wait("@datasetList");
    cy.wait("@invalidDataset");
    cy.wait("@getFiles");
    cy.getDataCy("add-to-project-button").should("not.be.enabled");
    cy.getDataCy("not-in-kg-warning").should("exist");
  });
});

describe("Project dataset (legacy ids)", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetLegacyIdList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
  });

  it("displays legacy project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        checkDatasetDisplay(cy, fixtures, datasets, projectPath);
      });
  });

  it("legacy dataset details", () => {
    checkDatasetInKg(cy, fixtures, projectPath);
  });
});

describe("Error loading datasets", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList(
      "datasetList",
      "datasets/dataset-list-error.json"
    );
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus();
  });

  it("display project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@datasetList")
      .its("response.body")
      .then(() => {
        cy.getDataCy("error-datasets-modal").should("exist");
      });
  });
});

describe("Migration check errors", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectLockStatus();
  });

  it("display project datasets", () => {
    fixtures.projectMigrationError({
      errorNumber: 2200,
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@getMigration");
    cy.get("div.alert-danger")
      .contains("There was an error verifying support for this project.")
      .should("be.visible");
  });
});

describe("Project dataset (locked)", () => {
  const projectPath = "e2e/testing-datasets";

  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects();
    fixtures.project(projectPath);
    fixtures.projectKGDatasetList(projectPath);
    fixtures.projectDatasetList();
    fixtures.projectTestContents(undefined, 9);
    fixtures.projectMigrationUpToDate({
      queryUrl: "*",
      fixtureName: "getMigration",
    });
    fixtures.projectLockStatus({ locked: true });
  });

  it("display project datasets", () => {
    cy.visit(`projects/${projectPath}/datasets`);
    cy.wait("@getProject");
    cy.wait("@getProjectLockStatus");
    cy.wait("@datasetList")
      .its("response.body")
      .then((data) => {
        const datasets = data.result.datasets;
        // all datasets are displayed
        const totalDatasets = datasets?.length;
        cy.getDataCy("list-card").should("have.length", totalDatasets);
        checkDatasetLimitedPermissionDisplay(cy, fixtures, datasets, true);
      });

    cy.contains("Project is being modified.").should("be.visible");
    cy.getDataCy("add-dataset-button").should("be.disabled");
  });
});

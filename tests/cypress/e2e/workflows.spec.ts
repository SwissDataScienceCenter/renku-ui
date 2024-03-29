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

describe("iteract with workflows", () => {
  beforeEach(() => {
    fixtures.config().versions().userTest();
    fixtures.projects().landingUserProjects().projectTest();
    fixtures.projectLockStatus().projectMigrationUpToDate();
  });

  it("get list of workflows and interact", () => {
    fixtures.getWorkflows();
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-page").should("exist");
    cy.wait("@getWorkflows");
    cy.getDataCy("workflows-browser")
      .should("exist")
      .children()
      .should("have.length", 4);
    cy.getDataCy("workflows-browser").children().first().contains("pipeline");

    // change ordering
    cy.workflowsChangeSorting("Estimated duration");
    cy.getDataCy("workflows-browser").children().first().contains("train");

    // change order direction
    cy.workflowsChangeSortOrder();
    cy.getDataCy("workflows-browser").children().first().contains("pipeline");
  });

  it("view inactive workflows and interact", () => {
    fixtures.getWorkflows({
      fixture: "workflows/workflows-list-links-mappings-inactive.json",
    });
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-page").should("exist");
    cy.wait("@getWorkflows");

    // Click "Show inactive workflows"
    cy.getDataCy("workflows-inactive-toggle").should("exist").click();

    cy.getDataCy("workflows-browser")
      .should("exist")
      .children()
      .should("have.length", 4);
    cy.getDataCy("workflows-browser").children().first().contains("pipeline");

    // change ordering
    cy.workflowsChangeSorting("Estimated duration");
    cy.getDataCy("workflows-browser").children().first().contains("train");

    // change order direction
    cy.workflowsChangeSortOrder();
    cy.getDataCy("workflows-browser").children().first().contains("pipeline");
  });

  it("expand a workflow - waiting", () => {
    fixtures.getWorkflows();
    cy.intercept("/ui-server/api/renku/*/workflow_plans.show?*", {
      fixture: "workflows/workflow-show-links-mappings.json",
      delay: 1_000,
    });
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-browser")
      .children()
      .first()
      .contains("pipeline")
      .click();
    cy.getDataCy("workflow-details-waiting").should("exist");
    cy.getDataCy("workflow-details-error").should("not.exist");
    cy.getDataCy("workflow-details-unavailable").should("not.exist");
  });

  it("expand a workflow - unavailable", () => {
    fixtures.getWorkflows();
    fixtures.getWorkflowDetails({
      fixture: "workflows/workflow-show-details-notexists.json",
    });
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-browser")
      .children()
      .first()
      .contains("pipeline")
      .click();
    cy.getDataCy("workflow-details-waiting").should("not.exist");
    cy.getDataCy("workflow-details-error").should("exist");
    cy.getDataCy("workflow-details-unavailable").should("not.exist");
  });

  it("interact with complex workflow mappings and links", () => {
    fixtures.getWorkflows();
    fixtures.getWorkflowDetails();

    // clicking trigger naviation to the target URL
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-browser")
      .children()
      .first()
      .contains("pipeline")
      .click();
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/workflows/952c938055a041168f6e795ae33b0d22"
    );

    // first mapping is selected
    cy.getDataCy("workflow-details-mapping-panel")
      .contains("model")
      .should("exist");

    // switch to another mapping
    cy.contains("gamma").click();
    cy.getDataCy("workflow-details-mapping-panel")
      .contains("gamma")
      .should("exist");
    cy.getDataCy("workflow-details-mapping-panel")
      .contains("model")
      .should("not.exist");

    // links exist and work
    cy.getDataCy("workflow-details-links").should("exist");
    cy.getDataCy("workflow-details-links")
      .children()
      .first()
      .contains("outputs #4")
      .find("a")
      .click();
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/workflows/d1341c90f2b2464dba2bd933fc716007"
    );
  });

  it("interact with simple workflow inputs, outputs, parameters", () => {
    fixtures.getWorkflows();
    fixtures.getWorkflowDetails({
      fixture: "workflows/workflow-show-params.json",
    });
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.wait("@getWorkflows");
    cy.workflowsChangeSorting("Estimated duration");
    cy.getDataCy("workflows-browser")
      .children()
      .first()
      .contains("train")
      .click();
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/workflows/d1341c90f2b2464dba2bd933fc716007"
    );

    // look for some props
    cy.getDataCy("workflow-details-info-table")
      .should("exist")
      .children()
      .contains("Author(s)");
    cy.getDataCy("workflow-details-info-table")
      .should("exist")
      .children()
      .contains("Train a model");
    cy.getDataCy("workflow-details-extended-table")
      .should("exist")
      .children()
      .contains("Estimated runtime");
    cy.getDataCy("workflow-details-extended-table")
      .should("exist")
      .children()
      .contains("python train.py --data data/X_train");

    // check inputs
    cy.getDataCy("workflow-details-params-table")
      .contains("input-1")
      .should("exist");
    cy.getDataCy("workflow-details-params-list")
      .children()
      .first()
      .contains("input-1")
      .should("exist");
    cy.getDataCy("workflow-details-params-list")
      .children()
      .eq(2)
      .contains("target")
      .should("exist")
      .click();
    cy.getDataCy("workflow-details-params-table")
      .contains("input-1")
      .should("not.exist");
    cy.getDataCy("workflow-details-params-table")
      .contains("data/Y_train")
      .should("exist");

    // check params
    cy.getDataCy("workflow-details-params-list")
      .eq(2)
      .contains("gamma")
      .should("exist")
      .click();
    cy.getDataCy("workflow-details-params-table")
      .contains("--gamma")
      .should("exist");

    // check output and go to file
    cy.getDataCy("workflow-details-params-list")
      .eq(1)
      .contains("model")
      .should("exist")
      .click();
    cy.getDataCy("workflow-details-params-table")
      .contains("models/trained_model")
      .should("exist")
      .find("a")
      .click();
    cy.url().should("not.include", "workflows");
    cy.url().should("include", "/files/blob/models/trained_model");
  });

  it("open outdated workflow", () => {
    fixtures.getWorkflows();
    fixtures.getWorkflowDetails({
      fixture: "workflows/workflow-show-outdated.json",
    });
    cy.visit("/projects/e2e/local-test-project/workflows");
    cy.getDataCy("workflows-browser")
      .children()
      .first()
      .contains("pipeline")
      .click();
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/workflows/952c938055a041168f6e795ae33b0d22"
    );
    cy.getDataCy("workflow-details-newer").should("exist").find("a").click();
    cy.url().should(
      "include",
      "/projects/e2e/local-test-project/workflows/3398f0a970774e2d82b1791190de85d0"
    );
  });
});

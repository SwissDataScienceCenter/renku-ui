/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

describe("launch sessions with data connectors", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user1-uuid",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .projects()
      .readGroupV2Namespace({ groupSlug: "user1-uuid" })
      .landingUserProjects()
      .readProjectV2()
      .readProjectV2WithoutDocumentation()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .resourcePoolsTest()
      .getResourceClass()
      .listProjectV2Members()
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      })
      .sessionServersEmptyV2()
      .sessionImage()
      .newLauncher()
      .environments()
      .sessionSecretSlots({
        fixture: "projectV2SessionSecrets/empty_list.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/empty_list.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo1.git",
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("launch session with public data connector", () => {
    fixtures
      .testCloudStorage()
      .listProjectDataConnectors()
      .getDataConnector({
        fixture: "dataConnector/data-connector-public.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the data connector is there
    cy.getDataCy("data-connector-name").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("data-connector-name").click();
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("requires-credentials-section")
      .contains("No")
      .should("be.visible");
    cy.getDataCy("data-connector-view-back-button").click();

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    fixtures.dataConnectorSecrets({
      dataConnectorId: "ULID-1",
      fixture: "dataConnector/data-connector-secrets-empty.json",
    });
    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(0);
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("start-session-button").click();
    });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session with data connector requiring credentials", () => {
    fixtures
      .testCloudStorage()
      .listProjectDataConnectors()
      .getDataConnector()
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the data connector is there
    cy.getDataCy("data-connector-name").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("data-connector-name").click();
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("requires-credentials-section")
      .contains("Yes")
      .should("be.visible");
    cy.getDataCy("data-connector-view-back-button").click();

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(1);
        const override = dcOverrides[0];
        expect(override.skip).to.be.false;
        expect(override.data_connector_id).to.equal("ULID-1");
        expect(override.configuration).to.have.property("access_key_id");
        expect(override.configuration).to.have.property("secret_access_key");
        expect(override.configuration["access_key_id"]).to.equal("access key");
        expect(override.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);
    cy.getDataCy("session-data-connector-credentials-modal")
      .should("be.visible")
      .contains("Please provide")
      .should("not.be.visible");

    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Please provide")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session with data connector, saving credentials", () => {
    fixtures
      .testCloudStorage()
      .listProjectDataConnectors()
      .getDataConnector()
      .dataConnectorSecrets({
        dataConnectorId: "ULID-1",
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-1",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");
    cy.getDataCy("data-connector-name").contains("example storage");

    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(0);
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });

    cy.wait("@getDataConnectorSecrets");

    cy.getDataCy("session-data-connector-credentials-modal")
      .should("be.visible")
      .contains("Please provide")
      .should("not.be.visible");

    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Please provide")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.get("#saveCredentials").click();

    fixtures.dataConnectorSecrets({
      dataConnectorId: "ULID-1",
      fixture: "dataConnector/data-connector-secrets.json",
      name: "getDataConnectorSecretsAfterSaving",
    });

    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.contains("Saving credentials...").should("be.visible");
    cy.wait("@patchDataConnectorSecrets");
    cy.wait("@getDataConnectorSecretsAfterSaving");

    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session with skipped data connector", () => {
    fixtures
      .testCloudStorage()
      .listProjectDataConnectors()
      .getDataConnector()
      .dataConnectorSecrets({
        dataConnectorId: "ULID-1",
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-1",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");
    cy.getDataCy("data-connector-name").contains("example storage");

    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(1);
        const override = dcOverrides[0];
        expect(override.skip).to.be.true;
        expect(override.data_connector_id).to.equal("ULID-1");
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    fixtures.testCloudStorage({ success: false });
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.get("#saveCredentials").click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    fixtures.dataConnectorSecrets({
      dataConnectorId: "ULID-1",
      fixture: "dataConnector/data-connector-secrets.json",
      name: "getDataConnectorSecretsAfterSaving",
    });
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Skip")
      .click();
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session with saved credentials", () => {
    fixtures
      .testCloudStorage()
      .sessionServersEmptyV2()
      .listProjectDataConnectors()
      .getDataConnector()
      .dataConnectorSecrets()
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(0);
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
        cy.wait("@getDataConnectorSecrets");
      });
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session with incomplete saved credentials", () => {
    fixtures
      .testCloudStorage()
      .listProjectDataConnectors()
      .getDataConnector()
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-partial.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(1);
        const override = dcOverrides[0];
        expect(override.skip).to.be.false;
        expect(override.data_connector_id).to.equal("ULID-1");
        expect(override.configuration).to.have.property("access_key_id");
        expect(override.configuration).to.have.property("secret_access_key");
        expect(override.configuration["access_key_id"]).to.equal("access key");
        expect(override.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("show warning on launch", () => {
    fixtures.testCloudStorage().listProjectDataConnectors().getDataConnector({
      fixture: "dataConnector/data-connector-public.json",
    });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the data connector is there
    cy.getDataCy("data-connector-name").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("data-connector-name").click();
    cy.getDataCy("data-connector-title").should(
      "contain.text",
      "example storage"
    );
    cy.getDataCy("requires-credentials-section")
      .contains("No")
      .should("be.visible");
    cy.getDataCy("data-connector-view-back-button").click();

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    fixtures.dataConnectorSecrets({
      dataConnectorId: "ULID-1",
      fixture: "dataConnector/data-connector-secrets-empty.json",
    });
    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(0);
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("start-session-button").click();
    });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);
    cy.getDataCy("session-repositories-warning");
  });

  it.skip("launch session multiple data connectors requiring multiple credentials, saving all", () => {
    fixtures
      .testCloudStorage({ success: false })
      .listProjectDataConnectors({
        fixture: "dataConnector/project-data-connector-links-multiple.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-1",
        fixture: "dataConnector/data-connector-public.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-2",
      })
      .getDataConnector({
        dataConnectorId: "ULID-3",
        fixture: "dataConnector/data-connector-webdav.json",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-2",
        content: [
          {
            name: "access_key_id",
            value: "access key",
          },
          {
            name: "secret_access_key",
            value: "secret key",
          },
        ],
      })
      .patchDataConnectorSecrets({
        dataConnectorId: "ULID-3",
        content: [
          {
            name: "pass",
            value: "webDav pass",
          },
        ],
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(3);
        const s3Storage = csConfig[0];
        expect(s3Storage.configuration).to.not.have.property("access_key_id");
        expect(s3Storage.configuration).to.not.have.property(
          "secret_access_key"
        );

        const s3Storage1 = csConfig[1];
        expect(s3Storage1.configuration).to.have.property("access_key_id");
        expect(s3Storage1.configuration).to.have.property("secret_access_key");
        expect(s3Storage1.configuration["access_key_id"]).to.equal(
          "access key"
        );
        expect(s3Storage1.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        const webDavStorage = csConfig[2];
        expect(webDavStorage.configuration).to.have.property("pass");
        expect(webDavStorage.configuration["pass"]).to.equal("webDav pass");
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.get("#saveCredentials").click();
    fixtures.testCloudStorage({ success: true });
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#pass")
      .type("webDav pass");
    cy.get("#saveCredentials").click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@getResourceClass");
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it.skip("launch session multiple data connectors requiring multiple credentials, skipping some", () => {
    fixtures
      .testCloudStorage({ success: false })
      .listProjectDataConnectors({
        fixture: "dataConnector/project-data-connector-links-multiple.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-1",
        fixture: "dataConnector/data-connector-public.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-2",
      })
      .getDataConnector({
        dataConnectorId: "ULID-3",
        fixture: "dataConnector/data-connector-webdav.json",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(3);
        const s3Storage = csConfig[0];
        expect(s3Storage.configuration).to.not.have.property("access_key_id");
        expect(s3Storage.configuration).to.not.have.property(
          "secret_access_key"
        );

        const s3Storage1 = csConfig[1];
        expect(s3Storage1.configuration).to.have.property("access_key_id");
        expect(s3Storage1.configuration).to.have.property("secret_access_key");
        expect(s3Storage1.configuration["access_key_id"]).to.equal(
          "access key"
        );
        expect(s3Storage1.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        const webDavStorage = csConfig[2];
        expect(webDavStorage.configuration).to.have.property("pass");
        expect(webDavStorage.configuration["pass"]).to.equal("webDav pass");
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    fixtures.testCloudStorage({ success: false });
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("could not be mounted")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Retry")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("could not be mounted")
      .should("be.visible");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Skip")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#pass")
      .type("webDav pass");
    fixtures.testCloudStorage({ success: true });
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@getResourceClass");
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it.skip("launch session with multiple data connectors requiring credentials, skipping all", () => {
    fixtures
      .testCloudStorage({ success: false })
      .listProjectDataConnectors({
        fixture: "dataConnector/project-data-connector-links-multiple.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-1",
        fixture: "dataConnector/data-connector-public.json",
      })
      .getDataConnector({
        dataConnectorId: "ULID-2",
      })
      .getDataConnector({
        dataConnectorId: "ULID-3",
        fixture: "dataConnector/data-connector-webdav.json",
      })
      .dataConnectorSecrets({
        fixture: "dataConnector/data-connector-secrets-empty.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(3);
        const s3Storage = csConfig[0];
        expect(s3Storage.configuration).to.not.have.property("access_key_id");
        expect(s3Storage.configuration).to.not.have.property(
          "secret_access_key"
        );

        const s3Storage1 = csConfig[1];
        expect(s3Storage1.configuration).to.have.property("access_key_id");
        expect(s3Storage1.configuration).to.have.property("secret_access_key");
        expect(s3Storage1.configuration["access_key_id"]).to.equal(
          "access key"
        );
        expect(s3Storage1.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        const webDavStorage = csConfig[2];
        expect(webDavStorage.configuration).to.have.property("pass");
        expect(webDavStorage.configuration["pass"]).to.equal("webDav pass");
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });

    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");

    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Skip")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .find("#pass")
      .type("webDav pass");
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-data-connector-credentials-modal")
      .contains("Skip")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@getResourceClass");
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });
});

describe("launch sessions with secrets", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user1-uuid",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .projects()
      .readGroupV2Namespace({ groupSlug: "user1-uuid" })
      .landingUserProjects()
      .readProjectV2()
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .resourcePoolsTest()
      .getResourceClass()
      .listProjectV2Members()
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      })
      .sessionServersEmptyV2()
      .sessionImage()
      .newLauncher()
      .environments()
      .listProjectDataConnectors({
        fixture: "dataConnector/empty-list.json",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo1.git",
      })
      .getRepositoryMetadata({
        repositoryUrl: "https://domain.name/repo2.git",
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("launch session without secrets", () => {
    fixtures
      .sessionSecretSlots({
        fixture: "projectV2SessionSecrets/empty_list.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/empty_list.json",
      });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session requiring secrets, skipping", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);

    cy.getDataCy("session-secrets-modal").should("be.visible");
    cy.getDataCy("session-secrets-modal")
      .contains("Session secrets")
      .should("be.visible");
    cy.getDataCy("session-secrets-modal").contains(
      "[data-cy=session-secrets-ready]",
      "A Secret"
    );
    cy.getDataCy("session-secrets-modal").contains("button", "Skip").click();

    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });

  it("launch session requiring secrets, saving new secret", () => {
    fixtures.sessionSecretSlots().sessionSecrets();

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);

    cy.getDataCy("session-secrets-modal").should("be.visible");
    cy.getDataCy("session-secrets-modal")
      .contains("Session secrets")
      .should("be.visible");
    cy.getDataCy("session-secrets-modal").contains(
      "[data-cy=session-secrets-ready]",
      "A Secret"
    );
    cy.getDataCy("session-secrets-modal")
      .contains("[data-cy=session-secrets-unready-item]", "Another Secret")
      .should("be.visible")
      .as("unreadySecret");
    cy.get("@unreadySecret")
      .contains("label", "Provide a new secret value")
      .click();
    cy.get("@unreadySecret")
      .contains("label", "Secret value")
      .click()
      .type("my new secret value");

    fixtures
      .patchSessionSecrets({
        fixture: "projectV2SessionSecrets/patch_secrets_with_new_value.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/patched_secrets_with_new_value.json",
        name: "updatedSessionSecrets",
      });

    cy.get("@unreadySecret")
      .contains("button", "Save new secret")
      .should("be.visible")
      .click();
    cy.wait("@patchSessionSecrets").wait("@updatedSessionSecrets");

    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });
});

describe("view autostart link", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .listNamespaceV2()
      .dataServicesUser({
        response: {
          id: "0945f006-e117-49b7-8966-4c0842146313",
          username: "user-1",
          email: "user1@email.com",
        },
      })
      .projects()
      .readGroupV2Namespace({ groupSlug: "user1-uuid" })
      .landingUserProjects()
      .readProjectV2()
      .readProjectV2WithoutDocumentation({
        fixture: "projectV2/read-projectV2-empty.json",
      })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" })
      .resourcePoolsTest()
      .getResourceClass()
      .getProjectV2Permissions({ projectId: "01HYJE5FR1JV4CWFMBFJQFQ4RM" })
      .listProjectV2Members()
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      })
      .sessionServersEmptyV2()
      .sessionImage()
      .newLauncher()
      .environments()
      .sessionSecretSlots({
        fixture: "projectV2SessionSecrets/empty_list.json",
      })
      .sessionSecrets({
        fixture: "projectV2SessionSecrets/empty_list.json",
      });
    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("use autostart link", () => {
    fixtures.testCloudStorage().listProjectDataConnectors().getDataConnector({
      fixture: "dataConnector/data-connector-public.json",
    });

    cy.visit("/p/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@sessionServersEmptyV2");
    cy.wait("@sessionLaunchers");
    cy.wait("@listProjectDataConnectors");

    // check session launcher view and edit session launcher
    cy.getDataCy("session-launcher-item")
      .find('[data-cy="button-with-menu-dropdown"]')
      .click();
    cy.getDataCy("session-launcher-menu-share-link").click();
    cy.contains("Copy Launch Link").should("be.visible");

    // start session
    cy.fixture("sessions/sessionV2.json").then((session) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/api/data/sessions", (req) => {
        const dcOverrides = req.body.data_connectors_overrides;
        expect(dcOverrides).to.have.length(0);
        req.reply({ body: session, delay: 2000 });
      }).as("createSession");
    });
    fixtures.getSessionsV2({ fixture: "sessions/sessionsV2.json" });
    cy.visit(
      "/p/user1-uuid/test-2-v2-project/sessions/01HYJE99XEKWNKPYN8WRB6QA8Z/start"
    );
    cy.wait("@getResourceClass");
    cy.url().should("match", /\/p\/.*\/sessions\/.*\/start$/);
    cy.wait("@createSession");
    cy.url().should("match", /\/p\/.*\/sessions\/show\/.*/);
  });
});

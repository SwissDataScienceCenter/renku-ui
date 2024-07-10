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

describe("launch sessions with cloud storage", () => {
  beforeEach(() => {
    fixtures
      .config()
      .versions()
      .userTest()
      .dataServicesUser({
        response: {
          id: "user1-uuid",
          email: "user1@email.com",
        },
      })
      .namespaces();
    fixtures
      .projects()
      .landingUserProjects()
      .listProjectV2()
      .readProjectV2()
      .resourcePoolsTest()
      .getResourceClass()
      .listProjectV2Members();
    fixtures
      .readProjectV2({ fixture: "projectV2/read-projectV2-empty.json" })
      .getStorageSchema({ fixture: "cloudStorage/storage-schema-s3.json" });
    fixtures
      .sessionLaunchers({
        fixture: "projectV2/session-launchers.json",
      })
      .sessionServersEmpty()
      .sessionImage()
      .newLauncher()
      .environments();
    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
  });

  it("launch session with public data source", () => {
    fixtures.testCloudStorage().cloudStorage({
      isV2: true,
      fixture: "cloudStorage/cloud-storage.json",
      name: "getCloudStorageV2",
    });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // ensure the data source is there
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("requires-credentials-section")
      .contains("No")
      .should("be.visible");
    cy.getDataCy("data-source-view-back-button").click();

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("session-status").should("contain.text", "Not Running");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });
    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item").within(() => {
      cy.getDataCy("start-session-button").click();
    });
    cy.wait("@getResourceClass");
    cy.wait("@createSession");

    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with data source requiring credentials", () => {
    fixtures.testCloudStorage().cloudStorage({
      isV2: true,
      fixture: "cloudStorage/cloud-storage-with-secrets.json",
      name: "getCloudStorageV2",
    });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // ensure the data source is there
    cy.getDataCy("data-storage-name").should("contain.text", "example-storage");
    cy.getDataCy("data-storage-name").click();
    cy.getDataCy("data-source-title").should("contain.text", "example-storage");
    cy.getDataCy("requires-credentials-section")
      .contains("Yes")
      .should("be.visible");
    cy.getDataCy("data-source-view-back-button").click();

    // ensure the session launcher is there
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("session-name").should("contain.text", "Session-custom");
        cy.getDataCy("session-status").should("contain.text", "Not Running");
        cy.getDataCy("start-session-button").should("contain.text", "Launch");
      });

    // start session
    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        const storage = csConfig[0];
        expect(storage.configuration).to.have.property("access_key_id");
        expect(storage.configuration).to.have.property("secret_access_key");
        expect(storage.configuration["access_key_id"]).to.equal("access key");
        expect(storage.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });
    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@getResourceClass");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .should("be.visible")
      .contains("Please provide")
      .should("not.be.visible");

    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Please provide")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with data source, saving credentials", () => {
    fixtures
      .testCloudStorage()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-empty.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    fixtures.postCloudStorageSecrets({
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
    });

    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        const storage = csConfig[0];
        // The following two lines are for when the credentials are not in the config, but
        // this causes problems, allow them to be there for now
        // See also projectCloudStorage.utils.ts:storageDefinitionAfterSavingCredentialsFromConfig
        // expect(storage.configuration).to.not.have.property("access_key_id");
        // expect(storage.configuration).to.not.have.property("secret_access_key");

        expect(storage.configuration).to.have.property("access_key_id");
        expect(storage.configuration).to.have.property("secret_access_key");
        expect(storage.configuration["access_key_id"]).to.equal("access key");
        expect(storage.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });

    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .should("be.visible")
      .contains("Please provide")
      .should("not.be.visible");

    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Please provide")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.get("#saveCredentials").click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.contains("Saving credentials...").should("be.visible");
    cy.wait("@postCloudStorageSecrets");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with data source, saving credentials on skip", () => {
    fixtures
      .testCloudStorage()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-empty.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    fixtures.postCloudStorageSecrets({
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
    });

    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        const storage = csConfig[0];
        expect(storage.configuration).to.have.property("access_key_id");
        expect(storage.configuration).to.have.property("secret_access_key");
        expect(storage.configuration["access_key_id"]).to.equal("access key");
        expect(storage.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });

    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    fixtures.testCloudStorage({ success: false });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.get("#saveCredentials").click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Skip")
      .click();
    cy.contains("Saving credentials...").should("be.visible");
    cy.wait("@postCloudStorageSecrets");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with saved credentials", () => {
    fixtures
      .testCloudStorage()
      .sessionServersEmpty()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets();

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        const storage = csConfig[0];
        expect(storage.storage_id).to.equal("2");
        expect(storage.configuration).to.not.have.property("access_key_id");
        expect(storage.configuration).to.not.have.property("secret_access_key");
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });

    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with incomplete saved credentials", () => {
    fixtures
      .testCloudStorage()
      .cloudStorage({
        isV2: true,
        fixture: "cloudStorage/cloud-storage-with-secrets.json",
        name: "getCloudStorageV2",
      })
      .cloudStorageSecrets({
        fixture: "cloudStorage/cloud-storage-secrets-partial.json",
      });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    fixtures.postCloudStorageSecrets({
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
    });

    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
        const csConfig = req.body.cloudstorage;
        expect(csConfig.length).equal(1);
        const storage = csConfig[0];
        expect(storage.storage_id).to.equal("2");
        expect(storage.configuration).to.have.property("access_key_id");
        expect(storage.configuration).to.have.property("secret_access_key");
        expect(storage.configuration["access_key_id"]).to.equal("access key");
        expect(storage.configuration["secret_access_key"]).to.equal(
          "secret key"
        );
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });

    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Secret Access Key (password)")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with data source requiring multiple credentials", () => {
    fixtures.cloudStorage({
      isV2: true,
      fixture: "cloudStorage/cloud-storage-multiple.json",
      name: "getCloudStorageV2",
    });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
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
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });
    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    fixtures.testCloudStorage({ success: false });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("could not be mounted")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Retry")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("could not be mounted")
      .should("be.visible");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Skip")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#pass")
      .type("webDav pass");
    fixtures.testCloudStorage({ success: true });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@getResourceClass");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });

  it("launch session with data source requiring multiple credentials, skipping all", () => {
    fixtures.cloudStorage({
      isV2: true,
      fixture: "cloudStorage/cloud-storage-multiple.json",
      name: "getCloudStorageV2",
    });

    cy.visit("/v2/projects/user1-uuid/test-2-v2-project");
    cy.wait("@readProjectV2");
    cy.wait("@getSessionServers");
    cy.wait("@sessionLaunchers");

    // start session
    cy.fixture("sessions/sessionsV2.json").then((sessions) => {
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept("POST", "/ui-server/api/notebooks/v2/servers", (req) => {
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
        req.reply({ body: sessions[0] });
      }).as("createSession");
    });
    fixtures.getSessions({ fixture: "sessions/sessionsV2.json" });
    cy.getDataCy("session-launcher-item")
      .first()
      .within(() => {
        cy.getDataCy("start-session-button").click();
      });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#access_key_id")
      .type("access key");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#secret_access_key")
      .type("secret key");
    fixtures.testCloudStorage({ success: false });
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Skip")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .find("#pass")
      .type("webDav pass");
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Continue")
      .click();
    cy.getDataCy("session-cloud-storage-credentials-modal")
      .contains("Skip")
      .click();
    cy.wait("@testCloudStorage");
    cy.wait("@getResourceClass");
    cy.wait("@createSession");
    cy.url().should("match", /\/projects\/.*\/sessions\/.*\/start$/);
  });
});

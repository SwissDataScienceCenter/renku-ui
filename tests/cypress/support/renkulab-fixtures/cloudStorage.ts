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

import { FixturesConstructor } from "./fixtures";
import { SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Cloud Storage
 */

interface CloudStorageArgs extends SimpleFixture {
  isV2?: boolean;
}

interface CloudStorageSecretsArgs extends SimpleFixture {
  storageId?: string;
}

interface PostCloudStorageSecretsArgs extends CloudStorageSecretsArgs {
  content: {
    name: string;
    value: string;
  }[];
  shouldNotBeCalled?: boolean;
}

interface TestCloudStorageArgs extends SimpleFixture {
  success?: boolean;
}

export function CloudStorage<T extends FixturesConstructor>(Parent: T) {
  return class CloudStorageFixtures extends Parent {
    cloudStorage(args?: CloudStorageArgs) {
      const {
        fixture = "cloudStorage/cloud-storage.json",
        name = "getCloudStorage",
        isV2 = false,
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        isV2
          ? "/ui-server/api/data/storages_v2?project_id=*"
          : "/ui-server/api/data/storage?project_id=*",
        response
      ).as(name);
      return this;
    }

    cloudStorageSecrets(args?: CloudStorageSecretsArgs) {
      const {
        fixture = "cloudStorage/cloud-storage-secrets.json",
        name = "getCloudStorageSecrets",
        storageId = 2,
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        `/ui-server/api/data/storages_v2/${storageId}/secrets`,
        response
      ).as(name);
      return this;
    }

    cloudStorageStar(args?: SimpleFixture) {
      const {
        fixture = "cloudStorage/cloud-storage.json",
        name = "getCloudStorage",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/data/storage*", response).as(name);
      return this;
    }

    cloudStorageSPecific(args?: SimpleFixture) {
      const {
        fixture = "cloudStorage/cloud-storage.json",
        name = "getCloudStorage",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/data/storage", response).as(name);
      return this;
    }

    deleteCloudStorageSecrets(args?: CloudStorageSecretsArgs) {
      const { name = "deleteCloudStorageSecrets", storageId = 2 } = args ?? {};
      // eslint-disable-next-line max-nested-callbacks
      cy.intercept(
        "DELETE",
        `/ui-server/api/data/storages_v2/${storageId}/secrets`,
        { body: null, delay: 1000 }
      ).as(name);
      return this;
    }

    postCloudStorageSecrets(args?: PostCloudStorageSecretsArgs) {
      const {
        content,
        fixture = "cloudStorage/cloud-storage-secrets.json",
        name = "postCloudStorageSecrets",
        shouldNotBeCalled = false,
        storageId = 2,
      } = args ?? {};
      cy.fixture(fixture).then((secrets) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept(
          "POST",
          `/ui-server/api/data/storages_v2/${storageId}/secrets`,
          (req) => {
            if (shouldNotBeCalled)
              throw new Error("No call to post secrets expected");
            const newSecrets = req.body;
            expect(newSecrets.length).equal(content.length);
            newSecrets.forEach((secret, index) => {
              expect(secret.name).equal(content[index].name);
              expect(secret.value).equal(content[index].value);
            });
            req.reply({ body: secrets, delay: 1000 });
          }
        ).as(name);
      });
      return this;
    }

    postCloudStorage(args?: SimpleFixture) {
      const {
        fixture = "cloudStorage/new-cloud-storage.json",
        name = "postCloudStorage",
      } = args ?? {};
      const response = { fixture, statusCode: 201 };
      cy.intercept("POST", "/ui-server/api/data/storage*", response).as(name);
      return this;
    }

    patchCloudStorage(args?: CloudStorageArgs) {
      const { name = "patchCloudStorage", isV2 = false } = args ?? {};
      const response = {
        statusCode: 201,
        fixture: "cloudStorage/new-cloud-storage.json",
      };
      cy.intercept(
        "PATCH",
        isV2
          ? "/ui-server/api/data/storages_v2/*"
          : "/ui-server/api/data/storage/*",
        response
      ).as(name);
      return this;
    }

    getStorageSchema(args?: SimpleFixture) {
      const {
        name = "getStorageSchema",
        fixture = "cloudStorage/storage-schema.json",
      } = args ?? {};
      const response = {
        fixture,
        statusCode: 200,
        delay: 1000,
      };
      cy.intercept("GET", "/ui-server/api/data/storage_schema", response).as(
        name
      );
      return this;
    }

    deleteCloudStorage(args?: CloudStorageArgs) {
      const { name = "deleteCloudStorage", isV2 = false } = args ?? {};
      const response = { statusCode: 204 };
      cy.intercept(
        "DELETE",
        isV2
          ? "/ui-server/api/data/storages_v2/*"
          : "/ui-server/api/data/storage/*",
        response
      ).as(name);
      return this;
    }

    testCloudStorage(args?: TestCloudStorageArgs) {
      const { name = "testCloudStorage", success = true } = args ?? {};
      const response = success
        ? { statusCode: 200 }
        : {
            statusCode: 422,
            body: {
              error: {
                code: 1422,
                message:
                  "2024/06/11 09:39:07 ERROR : : error listing: InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records.\n\tstatus code: 403, request id: P58392SAB, host id: Epk3482=\n2024/06/11 09:39:07 Failed to lsf with 2 errors: last error was: error in ListJSON: InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records.\n\tstatus code: 403, request id: P58392SAB, host id: Epk3482=\n",
              },
            },
          };
      cy.intercept(
        "POST",
        "/ui-server/api/data/storage_schema/test_connection",
        response
      ).as(name);
      return this;
    }
  };
}

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

interface TestCloudStorageArgs extends SimpleFixture {
  success?: boolean;
}

export function CloudStorage<T extends FixturesConstructor>(Parent: T) {
  return class CloudStorageFixtures extends Parent {
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
      cy.intercept("GET", "/api/data/storage_schema", response).as(name);
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
        "/api/data/storage_schema/test_connection",
        response,
      ).as(name);
      return this;
    }
  };
}

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
import { NameOnlyFixture, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Cloud Storage
 */

export function CloudStorage<T extends FixturesConstructor>(Parent: T) {
  return class CloudStorageFixtures extends Parent {
    cloudStorage(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "cloudStorage/cloud-storage.json",
        name: "getCloudStorage",
      });
      const response = this.useMockedData ? { fixture } : undefined;
      cy.intercept("/ui-server/api/data/storage*", response).as(name);
      return this;
    }

    postCloudStorage(args?: Partial<SimpleFixture>) {
      const { fixture, name } = Cypress._.defaults({}, args, {
        fixture: "cloudStorage/new-cloud-storage.json",
        name: "postCloudStorage",
      });
      const response = this.useMockedData
        ? { fixture, statusCode: 201 }
        : undefined;
      cy.intercept(
        { method: "POST", path: "/ui-server/api/data/storage" },
        response
      ).as(name);
      return this;
    }

    patchCloudStorage(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "patchCloudStorage",
      });
      const response = this.useMockedData ? { statusCode: 201 } : undefined;
      cy.intercept(
        { method: "PATCH", path: "/ui-server/api/data/storage/*" },
        response
      ).as(name);
      return this;
    }

    deleteCloudStorage(args?: Partial<NameOnlyFixture>) {
      const { name } = Cypress._.defaults({}, args, {
        name: "deleteCloudStorage",
      });
      const response = this.useMockedData ? { statusCode: 204 } : undefined;
      cy.intercept(
        { method: "DELETE", path: "/ui-server/api/data/storage/*" },
        response
      ).as(name);
      return this;
    }
  };
}

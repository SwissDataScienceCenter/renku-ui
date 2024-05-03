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

interface DataServicesUserFixture extends NameOnlyFixture {
  response: ExactUser;
}

interface ExactUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}
interface ExactUserFixture extends NameOnlyFixture {
  exactEmailQueryString: string;
  response: ExactUser[];
}

/**
 * Fixtures for Data Services
 */

export function DataServices<T extends FixturesConstructor>(Parent: T) {
  return class DataServicesFixtures extends Parent {
    resourcePoolsTest(args?: SimpleFixture) {
      const {
        fixture = "dataServices/resource-pools.json",
        name = "getResourcePools",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/data/resource_pools*", response).as(
        name
      );
      return this;
    }

    adminResourcePoolUsers(
      name = "getAdminResourcePoolUsers",
      fixture = "dataServices/resource-pool-users.json"
    ) {
      cy.intercept("/ui-server/api/data/users", {
        fixture,
      }).as(name);
      cy.intercept("/ui-server/api/data/resource_pools/*/users", {
        fixture,
      });
      return this;
    }

    dataServicesUser(args: DataServicesUserFixture) {
      const { response, name = "getDataServicesUser" } = args;
      cy.intercept("GET", "/ui-server/api/data/user", {
        body: response,
      }).as(name);
      return this;
    }

    exactUser(args: ExactUserFixture) {
      const { name = "getExactUser", exactEmailQueryString, response } = args;
      cy.intercept(
        "GET",
        `/ui-server/api/data/users?exact_email=${exactEmailQueryString}`,
        {
          body: response,
        }
      ).as(name);
      return this;
    }
  };
}

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
  username: string;
  is_admin?: boolean;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface PostResourcePoolWithRunaiRemoteArgs extends SimpleFixture {
  base_url?: string;
}

interface UrlRedirectFixture extends NameOnlyFixture {
  sourceUrl: string;
  targetUrl: string | null;
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
      cy.intercept("GET", "/api/data/resource_pools*", response).as(name);
      return this;
    }

    postResourcePoolWithRunaiRemote(
      args?: PostResourcePoolWithRunaiRemoteArgs
    ) {
      const {
        fixture = "dataServices/resource-pools.json",
        name = "postResourcePool",
        base_url = "https://runai.example.com",
      } = args ?? {};
      cy.fixture(fixture).then((resourcePool) => {
        cy.intercept("POST", "/api/data/resource_pools", (req) => {
          if (req.body.remote.kind != "runai") {
            throw new Error("remote.kind must be 'runai'");
          }
          if (req.body.remote.base_url != base_url) {
            throw new Error(
              `remote.base_url ${req.body.remote.base_url} must equal ${base_url}`
            );
          }
          req.reply({ body: resourcePool, statusCode: 201, delay: 1000 });
        }).as(name);
      });
      return this;
    }

    adminResourcePoolUsers(
      name = "getAdminResourcePoolUsers",
      fixture = "dataServices/resource-pool-users.json"
    ) {
      cy.intercept("/api/data/users", {
        fixture,
      }).as(name);
      cy.intercept("/api/data/resource_pools/*/users", {
        fixture,
      });
      return this;
    }

    dataServicesUser(args: DataServicesUserFixture) {
      const { response: response_, name = "getDataServicesUser" } = args;
      const response = {
        is_admin: false,
        ...response_,
      };
      cy.intercept("GET", "/api/data/user", {
        body: response,
      }).as(name);
      return this;
    }

    getResourceClass(args?: SimpleFixture) {
      const {
        fixture = "dataServices/resource-class.json",
        name = "getResourceClass",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/api/data/classes/*", response).as(name);
      return this;
    }

    urlRedirect(args: UrlRedirectFixture) {
      const { sourceUrl, targetUrl, name = "getUrlRedirect" } = args;
      const response = {
        source_url: sourceUrl,
        target_url: targetUrl,
      };
      cy.intercept("GET", `/api/data/platform/redirects/${sourceUrl}`, {
        body: response,
        statusCode: targetUrl ? 200 : 404,
      }).as(name);
      return this;
    }
  };
}

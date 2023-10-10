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

/**
 * Fixtures for User
 */

function User<T extends FixturesConstructor>(Parent: T) {
  return class UserFixtures extends Parent {
    userTest(
      names = { user: "getUser", keycloakUser: "getKeycloakUser" },
      fixtures = { user: "user.json", keycloakUser: "keycloak-user.json" }
    ) {
      cy.intercept("/ui-server/api/user", {
        fixture: fixtures.user,
      }).as(names.user);
      cy.intercept(
        "/ui-server/api/kc/realms/Renku/protocol/openid-connect/userinfo",
        {
          fixture: fixtures.keycloakUser,
        }
      ).as(names.keycloakUser);
      return this;
    }

    userNone(names = { user: "getUser", keycloakUser: "getKeycloakUser" }) {
      cy.intercept("/ui-server/api/user", {
        statusCode: 401,
        body: {},
      }).as(names.user);
      cy.intercept(
        "/ui-server/api/kc/realms/Renku/protocol/openid-connect/userinfo",
        {
          statusCode: 401,
          body: {},
        }
      ).as(names.keycloakUser);
      return this;
    }

    renkuDown(name = "getUser") {
      cy.intercept("/ui-server/api/user", {
        statusCode: 500,
        body: {},
      }).as(name);
      return this;
    }

    userAdmin(
      names = { user: "getUser", keycloakUser: "getKeycloakUser" },
      fixtures = { user: "user.json", keycloakUser: "keycloak-admin-user.json" }
    ) {
      this.userTest(names, fixtures);
      return this;
    }
  };
}

export { User };

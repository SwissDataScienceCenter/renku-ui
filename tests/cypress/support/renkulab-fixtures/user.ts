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
import { DeepRequired, NameOnlyFixture, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for User
 */

export function User<T extends FixturesConstructor>(Parent: T) {
  return class UserFixtures extends Parent {
    userTest(args?: UserTestArgs) {
      const { user, keycloakUser } = Cypress._.defaultsDeep({}, args, {
        user: {
          fixture: "user.json",
          name: "getUser",
        },
        keycloakUser: {
          fixture: "keycloak-user.json",
          name: "getKeycloakUser",
        },
      }) as DeepRequired<UserTestArgs>;

      const userResponse = { fixture: user.fixture };
      cy.intercept("GET", "/ui-server/api/user", userResponse).as(user.name);

      const keycloakUserResponse = { fixture: keycloakUser.fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/kc/realms/Renku/protocol/openid-connect/userinfo",
        keycloakUserResponse
      ).as(keycloakUser.name);

      return this;
    }

    userNone(args?: UserNoneArgs) {
      const { user, keycloakUser } = Cypress._.defaultsDeep({}, args, {
        user: {
          name: "getUser",
        },
        keycloakUser: {
          name: "getKeycloakUser",
        },
      }) as DeepRequired<UserNoneArgs>;

      const response = { body: {}, statusCode: 401 };

      cy.intercept("GET", "/ui-server/api/user", response).as(user.name);

      cy.intercept(
        "GET",
        "/ui-server/api/kc/realms/Renku/protocol/openid-connect/userinfo",
        response
      ).as(keycloakUser.name);

      return this;
    }

    renkuDown(args?: NameOnlyFixture) {
      const { name = "getUser" } = args ?? {};
      const response = { body: {}, statusCode: 500 };
      cy.intercept("GET", "/ui-server/api/user", response).as(name);
      return this;
    }

    userAdmin(args?: UserTestArgs) {
      const { user, keycloakUser } = Cypress._.defaultsDeep({}, args, {
        user: {
          fixture: "user.json",
          name: "getUser",
        },
        keycloakUser: {
          fixture: "keycloak-admin-user.json",
          name: "getKeycloakUser",
        },
      }) as DeepRequired<UserTestArgs>;
      this.userTest({ user, keycloakUser });
      return this;
    }
  };
}

interface UserTestArgs {
  user?: SimpleFixture;
  keycloakUser?: SimpleFixture;
}

interface UserNoneArgs {
  user?: NameOnlyFixture;
  keycloakUser?: NameOnlyFixture;
}

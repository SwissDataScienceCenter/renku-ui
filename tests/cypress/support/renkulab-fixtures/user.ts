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
      const { user, dataServiceUser } = Cypress._.defaultsDeep({}, args, {
        // user: {
        //   fixture: "user.json",
        //   name: "getUser",
        // },
        dataServiceUser: {
          fixture: "data-service-user.json",
          name: "getUser",
        },
      }) as DeepRequired<UserTestArgs>;

      // const userResponse = { fixture: user.fixture };
      // cy.intercept("GET", "/ui-server/api/user", userResponse).as(user.name);

      const dataServiceUserResponse = { fixture: dataServiceUser.fixture };
      cy.intercept("GET", "/api/data/user", dataServiceUserResponse).as(
        dataServiceUser.name
      );

      return this;
    }

    userNone(args?: UserNoneArgs) {
      const { user, dataServiceUser, delay } = Cypress._.defaultsDeep(
        {},
        args,
        {
          // user: {
          //   name: "getUser",
          // },
          dataServiceUser: {
            name: "getUser",
          },
          delay: null,
        }
      ) as DeepRequired<UserNoneArgs>;

      // const responseGitLab = {
      //   body: {},
      //   statusCode: 401,
      //   ...(delay != null ? { delay } : {}),
      // };
      // cy.intercept("GET", "/ui-server/api/user", responseGitLab).as(user.name);

      const responseDataService = {
        body: {
          error: {
            code: 1401,
            message: "You have to be authenticated to perform this operation.",
          },
        },
        statusCode: 401,
        ...(delay != null ? { delay } : {}),
      };
      cy.intercept("GET", "/api/data/user", responseDataService).as(
        dataServiceUser.name
      );

      return this;
    }

    renkuDown(args?: NameOnlyFixture) {
      const { name = "getUser" } = args ?? {};
      const response = { body: {}, statusCode: 500 };
      // cy.intercept("GET", "/ui-server/api/user", response).as(name);
      cy.intercept("GET", "/api/data/user", response).as(name);
      return this;
    }

    userAdmin(args?: UserTestArgs) {
      const { user, dataServiceUser } = Cypress._.defaultsDeep({}, args, {
        user: {
          fixture: "user.json",
          name: "getUser",
        },
        dataServiceUser: {
          fixture: "data-service-admin-user.json",
          name: "getUser",
        },
      }) as DeepRequired<UserTestArgs>;
      this.userTest({ user, dataServiceUser });
      return this;
    }
  };
}

interface UserTestArgs {
  user?: SimpleFixture;
  dataServiceUser?: SimpleFixture;
}

interface UserNoneArgs {
  user?: NameOnlyFixture;
  dataServiceUser?: NameOnlyFixture;
  delay?: number | null;
}

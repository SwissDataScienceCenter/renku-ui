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
    userTest(name = "getUser") {
      cy.intercept("/ui-server/api/user", {
        fixture: "user.json"
      }).as(name);
      return this;
    }

    userNone(name = "getUser") {
      cy.intercept("/ui-server/api/user", {
        statusCode: 401,
        body: {}
      }).as(name);
      return this;
    }

    renkuDown(name = "getUser") {
      cy.intercept("/ui-server/api/user", {
        statusCode: 500,
        body: {}
      }).as(name);
      return this;
    }
  };
}

export { User };

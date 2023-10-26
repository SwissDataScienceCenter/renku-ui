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
import { NameOnlyFixture, SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for User
 */

export function User<T extends FixturesConstructor>(Parent: T) {
  return class UserFixtures extends Parent {
    userTest(args?: SimpleFixture) {
      const { fixture = "user.json", name = "getUser" } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/user", response).as(name);
      return this;
    }

    userNone(args?: NameOnlyFixture) {
      const { name = "getUser" } = args ?? {};
      const response = { body: {}, statusCode: 401 };
      cy.intercept("GET", "/ui-server/api/user", response).as(name);
      return this;
    }

    renkuDown(args?: NameOnlyFixture) {
      const { name = "getUser" } = args ?? {};
      const response = { body: {}, statusCode: 500 };
      cy.intercept("GET", "/ui-server/api/user", response).as(name);
      return this;
    }
  };
}

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

export function UserPreferences<T extends FixturesConstructor>(Parent: T) {
  return class UserPreferencesFixtures extends Parent {
    userPreferences(args?: SimpleFixture) {
      const {
        fixture = "user-preferences/user-preferences-default.json",
        name = "getUserPreferences",
      } = args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api/data/user/preferences", response).as(
        name
      );
      return this;
    }

    postPinnedProject(args?: SimpleFixture) {
      const {
        fixture = "user-preferences/user-preferences-1-pin.json",
        name = "postPinnedProject",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "POST",
        "/ui-server/api/data/user/preferences/pinned_projects",
        response
      ).as(name);
      return this;
    }
  };
}

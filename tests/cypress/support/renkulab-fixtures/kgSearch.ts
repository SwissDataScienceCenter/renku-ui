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
import { SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for kg search
 */

export function KgSearch<T extends FixturesConstructor>(Parent: T) {
  return class KgSearchFixtures extends Parent {
    getLastSearch(args?: SimpleFixture) {
      const { fixture = "kgSearch/lastSearch.json", name = "getLastSearch" } =
        args ?? {};
      const response = { fixture };
      cy.intercept("GET", "/ui-server/api//last-searches/6", response).as(name);
      return this;
    }

    entitySearch(args?: EntitySearchArgs) {
      const {
        fixture = "kgSearch/search.json",
        name = "getEntities",
        params = "*",
        total = 7,
      } = args ?? {};
      const response = { fixture, headers: { Total: `${total}` } };
      cy.intercept("GET", `/ui-server/api/kg/entities${params}`, response).as(
        name
      );
      return this;
    }

    noActiveProjects(args?: SimpleFixture) {
      const {
        fixture = "kgSearch/no-active-projects.json",
        name = "getNoActiveProjects",
      } = args ?? {};
      const response = { fixture };
      cy.intercept(
        "GET",
        "/ui-server/api/kg/users/*/projects?state=NOT_ACTIVATED&*",
        response
      ).as(name);
      return this;
    }
  };
}

interface EntitySearchArgs extends SimpleFixture {
  params?: string;
  total?: number;
}

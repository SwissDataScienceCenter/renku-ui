/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import fixtures from "../support/renkulab-fixtures";

describe("unknown routes", () => {
  beforeEach(() => {
    fixtures.config().versions();
  });

  it("displays a 404 on an unknown url", () => {
    fixtures.userTest().dataServicesUser({
      response: {
        id: "user2-uuid",
        username: "user2",
      },
    });
    cy.intercept("GET", "/test/does-not-exist").as("visit");
    cy.visit("/test/does-not-exist", { failOnStatusCode: false });
    cy.wait("@visit").its("response.statusCode").should("eq", 404);

    cy.contains("Page not found").should("exist");
  });
});

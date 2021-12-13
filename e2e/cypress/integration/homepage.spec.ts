/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { User } from "../support/authentication/user.interfaces";

describe("render the home page", () => {
  const userData: User = Cypress.env("USER");

  it("renders correctly", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });

  it("login", () => {
    cy.gui_kc_login(userData, true);
  });

  it("logout", () => {
    cy.gui_kc_login(userData, true);
    cy.gui_logout();
  });

});

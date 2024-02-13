/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { NameOnlyFixture } from "./fixtures.types";

/**
 * Fixtures for the dashboard page
 */
export function Terms<T extends FixturesConstructor>(Parent: T) {
  return class TermsFixtures extends Parent {
    overridePrivacyPolicy(args?: NameOnlyFixture) {
      const { name = "getOverridePrivacyPolicy" } = args ?? {};
      const overridePrivacyPolicy = `# Override privacy policy\nThis is a custom privacy policy.
        `;
      const response = { body: overridePrivacyPolicy };
      cy.intercept("GET", "/privacy-statement.md", response).as(name);

      return this;
    }

    overrideTermsOfUse(args?: NameOnlyFixture) {
      const { name = "getOverrideTermsOfUse" } = args ?? {};
      const overridePrivacyPolicy = `# Override terms of use\nThis is a custom terms of use.
          `;
      const response = { body: overridePrivacyPolicy };
      cy.intercept("GET", "/terms-of-use.md", response).as(name);

      return this;
    }
  };
}

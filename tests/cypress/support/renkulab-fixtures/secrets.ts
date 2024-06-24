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

interface ListSecretsArgs extends NameOnlyFixture {
  numberOfSecrets?: number;
  secretsKind?: "general" | "storage";
}

function generateFakeSecrets(
  num: number,
  kind: ListSecretsArgs["secretsKind"]
) {
  const secrets = [];
  for (let i = 0; i < num; ++i) {
    const secretName =
      kind === "general" ? `secret_${i}` : `storage-secret_${i}`;
    secrets.push({
      id: `id_${i}`,
      modification_date: new Date(),
      name: secretName,
    });
  }
  return secrets;
}

export function Secrets<T extends FixturesConstructor>(Parent: T) {
  return class SecretsFixtures extends Parent {
    listSecrets(args?: ListSecretsArgs) {
      const {
        name = "listSecrets",
        numberOfSecrets = 0,
        secretsKind = "general",
      } = args ?? {};
      const response = {
        body: generateFakeSecrets(numberOfSecrets, secretsKind),
      };
      cy.intercept(
        "GET",
        `/ui-server/api/data/user/secrets?kind=${secretsKind}`,
        response
      ).as(name);
      return this;
    }

    newSecret(args?: NameOnlyFixture) {
      const { name = "fake_id" } = args ?? {};
      const response = {
        body: {
          id: "fake_id",
          modification_date: new Date(),
          name: "fake_secret",
        },
      };
      cy.intercept("POST", "/ui-server/api/data/user/secrets", response).as(
        name
      );
      return this;
    }

    editSecret(args?: NameOnlyFixture) {
      const { name = "editSecret" } = args ?? {};
      const response = {
        body: {
          id: "fake_id",
          modification_date: new Date(),
          name: "fake_secret",
        },
      };
      cy.intercept("PATCH", "/ui-server/api/data/user/secrets/*", response).as(
        name
      );
      return this;
    }

    deleteSecret(args?: NameOnlyFixture) {
      const { name = "deleteSecret" } = args ?? {};
      const response = {
        body: {},
      };
      cy.intercept("DELETE", "/ui-server/api/data/user/secrets/*", response).as(
        name
      );
      return this;
    }
  };
}

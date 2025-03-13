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

interface ListSecretsArgs extends SecretArgs {
  numberOfSecrets?: number;
}

interface SecretArgs extends NameOnlyFixture {
  secretsKind?: "general" | "storage";
}

function generateFakeSecretsGeneral(num: number) {
  const secrets = [];
  for (let i = 0; i < num; ++i) {
    const secretName = `secret_${i}`;
    secrets.push({
      id: `id_${i}`,
      modification_date: new Date(),
      name: secretName,
      kind: "general",
      session_secret_slot_ids: [],
      data_connector_ids: [],
    });
  }
  return secrets;
}

function generateFakeSecretsStorage(num: number) {
  const secrets = [];
  // The first part of the id is the data-source id.
  // Make two secrets per data-source.
  const dataSourcesCount = Math.ceil(num / 2);
  for (let i = 0; i < dataSourcesCount; ++i) {
    const dataSourceId = `data_source_${i}`;
    for (let j = 0; j < 2; ++j) {
      const secretName = `${dataSourceId}-secret_${i}`;
      secrets.push({
        id: `id_${i}_${j}`,
        modification_date: new Date(),
        name: secretName,
        kind: "storage",
        session_secret_slot_ids: [],
        data_connector_ids: [dataSourceId],
      });
    }
  }
  return secrets;
}

function generateFakeSecrets(
  num: number,
  kind: ListSecretsArgs["secretsKind"]
) {
  if (kind === "general") {
    return generateFakeSecretsGeneral(num);
  } else if (kind === "storage") {
    return generateFakeSecretsStorage(num);
  }
  return [];
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
        `/api/data/user/secrets?kind=${secretsKind}`,
        response
      ).as(name);
      return this;
    }

    newSecret(args?: SecretArgs) {
      const { name = "fake_id", secretsKind = "general" } = args ?? {};
      const response = {
        body: {
          id: "fake_id",
          modification_date: new Date(),
          name: "fake_secret",
          kind: secretsKind,
        },
      };
      cy.intercept("POST", "/api/data/user/secrets", response).as(name);
      return this;
    }

    editSecret(args?: SecretArgs) {
      const { name = "editSecret", secretsKind } = args ?? {};
      const response = {
        body: {
          id: "fake_id",
          modification_date: new Date(),
          name: "fake_secret",
          kind: secretsKind,
        },
      };
      cy.intercept("PATCH", "/api/data/user/secrets/*", response).as(name);
      return this;
    }

    deleteSecret(args?: NameOnlyFixture) {
      const { name = "deleteSecret" } = args ?? {};
      const response = {
        body: {},
      };
      cy.intercept("DELETE", "/api/data/user/secrets/*", response).as(name);
      return this;
    }
  };
}

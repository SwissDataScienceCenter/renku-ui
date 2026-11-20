/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { describe, expect, it } from "vitest";

import type { DataConnectorRead } from "../dataConnectorsV2/api/data-connectors.api";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import {
  applySkipUnfinishedStorageCredentials,
  applyStorageCredentialUpdate,
  isStorageCredentialResolved,
  skippedStorageCredential,
} from "./sessionStorageCredentials.utils";

function connector(
  id: string,
  overrides: Partial<DataConnectorConfiguration> = {},
): DataConnectorConfiguration {
  return {
    active: true,
    skip: false,
    touched: false,
    dataConnector: { id, name: id } as DataConnectorRead,
    sensitiveFieldDefinitions: [],
    sensitiveFieldValues: { password: "" },
    saveCredentials: false,
    savedCredentialFields: [],
    ...overrides,
  };
}

function tested(id: string, password: string): DataConnectorConfiguration {
  return connector(id, {
    touched: true,
    sensitiveFieldValues: { password },
  });
}

describe("isStorageCredentialResolved", () => {
  it("is true when the config is skipped or touched with every value filled", () => {
    expect(isStorageCredentialResolved(connector("a"))).toBe(false);
    expect(isStorageCredentialResolved(tested("a", "secret"))).toBe(true);
    expect(isStorageCredentialResolved(connector("a", { skip: true }))).toBe(
      true,
    );
    expect(
      isStorageCredentialResolved(
        connector("a", {
          touched: true,
          sensitiveFieldValues: { password: "" },
        }),
      ),
    ).toBe(false);
  });
});

describe("storage credential list updates", () => {
  it("keeps an earlier success when a later success is applied to that result", () => {
    const initial = [connector("a"), connector("b")];
    const afterA = applyStorageCredentialUpdate(
      initial,
      "a",
      tested("a", "one"),
    );
    const afterB = applyStorageCredentialUpdate(
      afterA,
      "b",
      tested("b", "two"),
    );

    expect(
      afterB.map((config) => config.sensitiveFieldValues.password),
    ).toEqual(["one", "two"]);
    expect(afterB.every(isStorageCredentialResolved)).toBe(true);
  });

  it("leaves an already tested connector unchanged", () => {
    const initial = [tested("a", "one")];
    const next = applyStorageCredentialUpdate(
      initial,
      "a",
      tested("a", "other"),
    );

    expect(next).toBe(initial);
  });

  it("skips connectors that are not tested", () => {
    const initial = [tested("a", "one"), connector("b"), connector("c")];
    const next = applySkipUnfinishedStorageCredentials(initial);

    expect(next[0]).toBe(initial[0]);
    expect(next[1]).toEqual(skippedStorageCredential(initial[1]));
    expect(next[2]).toEqual(skippedStorageCredential(initial[2]));
  });
});

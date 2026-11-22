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

import {
  configsAfterCredentialSave,
  dataConnectorsOverrideFromConfig,
} from "../cloudStorage/projectCloudStorage.utils";
import type { DataConnectorRead } from "../dataConnectorsV2/api/data-connectors.api";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

function connector(
  id: string,
  overrides: Partial<SessionStartDataConnectorConfiguration> = {},
): SessionStartDataConnectorConfiguration {
  return {
    active: true,
    skip: false,
    touched: true,
    dataConnector: {
      id,
      name: id,
      storage: { configuration: {} },
    } as DataConnectorRead,
    sensitiveFieldDefinitions: [],
    sensitiveFieldValues: { password: "secret" },
    saveCredentials: true,
    savedCredentialFields: [],
    ...overrides,
  };
}

describe("configsAfterCredentialSave()", () => {
  it("clears touched on a successful save, matching the existing transform", () => {
    const saved = connector("saved");
    const [result] = configsAfterCredentialSave([saved], new Set());

    expect(result.saveCredentials).toBe(false);
    expect(result.touched).toBe(false);
    expect(result.sensitiveFieldValues).toEqual({ password: "secret" });
  });

  it("keeps a failed connector touched so the launch still sends its values", () => {
    const failed = connector("failed");
    const saved = connector("saved");
    const [failedResult, savedResult] = configsAfterCredentialSave(
      [failed, saved],
      new Set(["failed"]),
    );

    expect(failedResult.touched).toBe(true);
    expect(failedResult.saveCredentials).toBe(false);
    expect(failedResult.sensitiveFieldValues).toEqual({ password: "secret" });
    expect(dataConnectorsOverrideFromConfig(failedResult)).toMatchObject([
      {
        data_connector_id: "failed",
        configuration: { password: "secret" },
      },
    ]);
    expect(savedResult.touched).toBe(false);
    expect(savedResult.saveCredentials).toBe(false);
    expect(dataConnectorsOverrideFromConfig(savedResult)).toEqual([]);
  });
});

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

import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type { GetRepositoriesApiResponse } from "../repositories/api/repositories.api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import {
  applyLaunchSkips,
  buildSessionLaunchSnapshot,
  sessionLaunchSnapshotInput,
  withCredentialsSkipped,
  withExpiredConnectorsSkipped,
  type SessionLaunchSnapshotInput,
  type SessionLaunchSnapshotSource,
} from "./sessionLaunchWizard.utils";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

const emptyInput: SessionLaunchSnapshotInput = {
  resourceClassRequired: false,
  imageRequired: false,
  imageLabel: "image:latest",
  repositories: [],
  expiredConnectors: [],
  secrets: [],
  sshRequired: false,
  credentials: [],
};

describe("buildSessionLaunchSnapshot", () => {
  it("keeps only the steps that need attention, in launch order", () => {
    const snapshot = buildSessionLaunchSnapshot({
      ...emptyInput,
      resourceClassRequired: true,
      imageRequired: true,
      repositories: [{ id: "https://example/repo.git", label: "repo" }],
      secrets: [{ id: "slot-1", label: "Token" }],
      credentials: [{ id: "connector-1", label: "Storage" }],
    });

    expect(snapshot.steps.map((step) => step.id)).toEqual([
      "resourceClass",
      "image",
      "repositories",
      "sessionSecrets",
      "storageCredentials",
    ]);
  });

  it("returns no steps when nothing needs attention", () => {
    expect(buildSessionLaunchSnapshot(emptyInput).steps).toEqual([]);
  });
});

describe("withExpiredConnectorsSkipped", () => {
  it("skips only connectors that are still expired", () => {
    const expired = connector({ expires_at: "2020-01-01T00:00:00Z" });
    const current = connector({
      id: "current",
      expires_at: "2999-01-01T00:00:00Z",
    });

    const next = withExpiredConnectorsSkipped([expired, current]);

    expect(next[0]).toMatchObject({ active: false, skip: true });
    expect(next[1]).toMatchObject({ active: true, skip: false });
  });
});

describe("withCredentialsSkipped", () => {
  it("skips only connectors that still need credentials", () => {
    const missing = connector({
      id: "missing",
      sensitiveFieldValues: { token: "" },
    });
    const provided = connector({
      id: "provided",
      sensitiveFieldValues: { token: "saved-secret" },
    });

    const next = withCredentialsSkipped([missing, provided]);

    expect(next[0]).toMatchObject({
      active: false,
      saveCredentials: false,
      skip: true,
    });
    expect(next[1]).toMatchObject({ active: true, skip: false });
  });
});

describe("applyLaunchSkips", () => {
  it("skips expired connectors and unfinished credentials for those steps", () => {
    const expired = connector({
      id: "expired",
      expires_at: "2020-01-01T00:00:00Z",
    });
    const missing = connector({
      id: "missing",
      sensitiveFieldValues: { token: "" },
    });
    const provided = connector({
      id: "provided",
      sensitiveFieldValues: { token: "saved-secret" },
    });

    const next = applyLaunchSkips(
      [expired, missing, provided],
      ["expiredDataConnectors", "storageCredentials"],
    );

    expect(next[0]).toMatchObject({ active: false, skip: true });
    expect(next[1]).toMatchObject({
      active: false,
      saveCredentials: false,
      skip: true,
    });
    expect(next[2]).toMatchObject({ active: true, skip: false });
  });

  it("leaves credential connectors unchanged when that step is not skipped", () => {
    const missing = connector({
      id: "missing",
      sensitiveFieldValues: { token: "" },
    });

    const next = applyLaunchSkips([missing], ["expiredDataConnectors"]);

    expect(next[0]).toBe(missing);
  });
});

describe("sessionLaunchSnapshotInput", () => {
  it("returns null until the launch data has settled", () => {
    expect(
      sessionLaunchSnapshotInput(snapshotSource({ settled: false })),
    ).toBeNull();
    expect(
      sessionLaunchSnapshotInput(snapshotSource({ dataConnectors: undefined })),
    ).toBeNull();
    expect(
      sessionLaunchSnapshotInput(
        snapshotSource({ launcherResourcesError: new Error("unavailable") }),
      ),
    ).toBeNull();
  });

  it("includes an inaccessible external image and omits an accessible one", () => {
    const blocked = sessionLaunchSnapshotInput(
      snapshotSource({
        containerImage: "registry.example/app:1",
        isExternalImageEnvironment: true,
        sessionImageAccessible: false,
      }),
    );
    const ready = sessionLaunchSnapshotInput(
      snapshotSource({
        isExternalImageEnvironment: true,
        sessionImageAccessible: true,
      }),
    );

    expect(blocked?.imageRequired).toBe(true);
    expect(blocked?.imageLabel).toBe("registry.example/app:1");
    expect(ready?.imageRequired).toBe(false);
  });

  it("includes a repository that needs push access only for a writer", () => {
    const repositories = [repositoryNeedingPush()];

    const writer = sessionLaunchSnapshotInput(
      snapshotSource({ hasWritePermission: true, repositories }),
    );
    const reader = sessionLaunchSnapshotInput(
      snapshotSource({ hasWritePermission: false, repositories }),
    );

    expect(writer?.repositories).toEqual([
      {
        id: "https://gitlab.example.com/group/push-repo.git",
        label: "push-repo",
      },
    ]);
    expect(reader?.repositories).toEqual([]);
  });

  it("includes ssh, missing secrets, and connectors that still need credentials", () => {
    const input = sessionLaunchSnapshotInput(
      snapshotSource({
        dataConnectors: [
          connector({ id: "storage", sensitiveFieldValues: { token: "" } }),
        ],
        launcher: sshLauncher(),
        sessionSecretSlotsWithSecrets: [
          {
            secretId: null,
            secretSlot: { id: "slot-1", name: "Token" },
          } as SessionSecretSlotWithSecret,
          {
            secretId: "secret-1",
            secretSlot: { id: "slot-2", name: "Ready" },
          } as SessionSecretSlotWithSecret,
        ],
        sshKeys: [],
      }),
    );

    expect(input?.sshRequired).toBe(true);
    expect(input?.secrets).toEqual([{ id: "slot-1", label: "Token" }]);
    expect(input?.credentials).toEqual([{ id: "storage", label: "storage" }]);
  });
});

function snapshotSource(
  overrides: Partial<SessionLaunchSnapshotSource> = {},
): SessionLaunchSnapshotSource {
  return {
    containerImage: "image:latest",
    dataConnectors: [],
    hasWritePermission: false,
    isCustomLaunch: false,
    isExternalImageEnvironment: false,
    launcher: { environment: {} } as SessionLauncher,
    launcherClassAvailable: true,
    launcherResourcesError: null,
    repositories: [],
    sessionImageAccessible: true,
    sessionSecretSlotsWithSecrets: [],
    settled: true,
    sshKeys: [],
    ...overrides,
  };
}

function sshLauncher(): SessionLauncher {
  return {
    environment: {
      build_parameters: { frontend_variant: "ssh" },
    },
  } as SessionLauncher;
}

function repositoryNeedingPush(): GetRepositoriesApiResponse {
  return {
    data: {
      status: "valid",
      connection: {
        id: "connection-1",
        provider_id: "gitlab",
        status: "disconnected",
      },
      metadata: {
        git_url: "https://gitlab.example.com/group/push-repo.git",
        pull_permission: true,
        push_permission: false,
        visibility: "private",
      },
    },
    error: false,
    url: "https://gitlab.example.com/group/push-repo.git",
  };
}

function connector({
  id = "expired",
  expires_at = "2999-01-01T00:00:00Z",
  sensitiveFieldValues = {},
}: {
  id?: string;
  expires_at?: string;
  sensitiveFieldValues?: Record<string, string>;
}): SessionStartDataConnectorConfiguration {
  return {
    active: true,
    dataConnector: {
      id,
      name: id,
      expires_at,
    },
    saveCredentials: false,
    savedCredentialFields: [],
    sensitiveFieldDefinitions: [],
    sensitiveFieldValues,
    skip: false,
    touched: false,
  } as unknown as SessionStartDataConnectorConfiguration;
}

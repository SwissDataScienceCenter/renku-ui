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

import { exec } from "node:child_process";
import { open } from "node:fs/promises";
import { join } from "node:path/posix";
import { argv } from "node:process";
import { parseDocument } from "yaml";

const GH_BASE_URL = "https://raw.githubusercontent.com";
const DATA_SERVICES_REPO = "SwissDataScienceCenter/renku-data-services";
const DATA_SERVICES_RELEASE = "main";

async function main() {
  argv.forEach((arg) => {
    if (arg.trim() === "computeResources") {
      updateComputeResourcesApi();
    } else if (arg.trim() === "connectedServices") {
      updateConnectedServicesApi();
    } else if (arg.trim() === "dataConnectors") {
      updateDataConnectorsApi();
    } else if (arg.trim() === "namespaceV2") {
      updateNamespaceV2Api();
    } else if (arg.trim() === "platform") {
      updatePlatformApi();
    } else if (arg.trim() === "projectCloudStorage") {
      updateProjectCloudStorageApi();
    } else if (arg.trim() === "projectV2") {
      updateProjectV2Api();
    } else if (arg.trim() === "searchV2") {
      updateSearchV2Api();
    } else if (arg.trim() === "sessionLaunchersV2") {
      updateSessionLaunchersV2Api();
    } else if (arg.trim() === "sessionsV2") {
      updateSessionsV2Api();
    } else if (arg.trim() === "users") {
      updateUsersApi();
    }
  });
}

async function updateComputeResourcesApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/crc/api.spec.yaml",
    destFile: "src/features/sessionsV2/api/computeResources.openapi.json",
  });
}

async function updateConnectedServicesApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/connected_services/api.spec.yaml",
    destFile:
      "src/features/connectedServices/api/connectedServices.openapi.json",
  });
}

async function updateDataConnectorsApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/data_connectors/api.spec.yaml",
    destFile: "src/features/dataConnectorsV2/api/data-connectors.openapi.json",
  });
}

async function updateNamespaceV2Api() {
  updateApiFiles({
    specFile: "components/renku_data_services/namespace/api.spec.yaml",
    destFile: "src/features/projectsV2/api/namespace.openapi.json",
  });
}

async function updatePlatformApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/platform/api.spec.yaml",
    destFile: "src/features/platform/api/platform.openapi.json",
  });
}

async function updateProjectCloudStorageApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/storage/api.spec.yaml",
    destFile:
      "src/features/project/components/cloudStorage/api/projectCloudStorage.openapi.json",
  });
}

async function updateProjectV2Api() {
  updateApiFiles({
    specFile: "components/renku_data_services/project/api.spec.yaml",
    destFile: "src/features/projectsV2/api/projectV2.openapi.json",
  });
}

async function updateSearchV2Api() {
  updateApiFiles({
    specFile: "components/renku_data_services/search/api.spec.yaml",
    destFile: "src/features/searchV2/api/search.openapi.json",
  });
}

async function updateSessionLaunchersV2Api() {
  updateApiFiles({
    specFile: "components/renku_data_services/session/api.spec.yaml",
    destFile: "src/features/sessionsV2/api/sessionLaunchersV2.openapi.json",
  });
}

async function updateSessionsV2Api() {
  updateApiFiles({
    specFile: "components/renku_data_services/notebooks/api.spec.yaml",
    destFile: "src/features/sessionsV2/api/sessionsV2.openapi.json",
  });
}

async function updateUsersApi() {
  updateApiFiles({
    specFile: "components/renku_data_services/users/api.spec.yaml",
    destFile: "src/features/usersV2/api/users.openapi.json",
  });
}

async function updateApiFiles({ specFile, destFile }) {
  const API_SPEC_FILE = specFile;
  const DEST_FILE = destFile;

  console.log(
    `Updating "${DEST_FILE}" with spec file from release ${DATA_SERVICES_RELEASE}...`
  );

  const fileUrl = new URL(
    join(DATA_SERVICES_REPO, DATA_SERVICES_RELEASE, API_SPEC_FILE),
    GH_BASE_URL
  );
  const res = await fetch(fileUrl);
  if (res.status >= 400) {
    throw new Error(`could not retrieve ${fileUrl}`);
  }
  const apiSpec = await res.text();
  const parsedSpec = parseDocument(apiSpec);

  // Remove "discriminator" fields as they mess up code generation
  const jsonSpec = JSON.parse(JSON.stringify(parsedSpec));
  const cleanedSpec = removeDiscriminatorFields(jsonSpec);

  const fh = await open(DEST_FILE, "w", 0o622);
  fh.writeFile(JSON.stringify(cleanedSpec, null, 2));

  await new Promise((resolve, reject) => {
    const cp = exec(["npx", "prettier", "-w", DEST_FILE].join(" "));
    cp.on("error", (error) =>
      reject(new Error("failed to run prettier", { cause: error }))
    );
    cp.on("exit", (code) => {
      code == 0 ? resolve() : reject(new Error("failed to run prettier"));
    });
  });
}

function removeDiscriminatorFields(jsonSpec) {
  if (typeof jsonSpec !== "object" || jsonSpec == null) {
    return jsonSpec;
  }
  if (jsonSpec instanceof Array) {
    const cleanedSpec = [];
    for (let i = 0; i < jsonSpec.length; ++i) {
      cleanedSpec[i] = removeDiscriminatorFields(jsonSpec[i]);
    }
    return cleanedSpec;
  }
  const cleanedSpec = {};
  Object.keys(jsonSpec).forEach((key) => {
    if (key.trim().toLowerCase() !== "discriminator") {
      cleanedSpec[key] = removeDiscriminatorFields(jsonSpec[key]);
    }
  });
  return cleanedSpec;
}

main();

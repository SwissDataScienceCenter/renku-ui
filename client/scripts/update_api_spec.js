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
// const DATA_SERVICES_RELEASE = "v0.37.1";
const DATA_SERVICES_RELEASE = "leafty/update-rclone-1-69";

async function main() {
  argv.forEach((arg) => {
    if (arg.trim() === "dataConnectors") {
      updateDataConnectorsApi();
    } else if (arg.trim() === "users") {
      updateUsersApi();
    }
  });
}

async function updateDataConnectorsApi() {
  const API_SPEC_FILE =
    "components/renku_data_services/data_connectors/api.spec.yaml";
  const DEST_FILE =
    "src/features/dataConnectorsV2/api/data-connectors.openapi.json";

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

  const fh = await open(DEST_FILE, "w", 0o622);
  fh.writeFile(JSON.stringify(parsedSpec, null, 2));

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

async function updateUsersApi() {
  const API_SPEC_FILE = "components/renku_data_services/users/api.spec.yaml";
  const DEST_FILE = "src/features/usersV2/api/users.openapi.json";

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

  const fh = await open(DEST_FILE, "w", 0o622);
  fh.writeFile(JSON.stringify(parsedSpec, null, 2));

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

main();

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

// Run `npm run generate-api:resourceUsage` to generate the API

import path from "path";
import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  // Configure to inject endpoints into the dataConnectorsApi
  apiFile: "./resourceUsage.empty-api.ts",
  apiImport: "resourceUsageEmptyApi",
  outputFile: "./resourceUsage.generated-api.ts",
  exportName: "resourceUsageGeneratedApi",
  hooks: true,
  schemaFile: path.join(__dirname, "resourceUsage.openapi.json"),
};

export default config;

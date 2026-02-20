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

import { CONFIG_JSON } from "~server/constants";

function tryParseGatewayUrl() {
  try {
    return new URL(CONFIG_JSON.GATEWAY_URL);
  } catch (error) {
    if (error instanceof TypeError) {
      return undefined;
    }
  }
}

const gatewayUrl = tryParseGatewayUrl();

export function getBaseApiUrl(requestUrl: string): string {
  console.log({ gatewayUrl: gatewayUrl?.toString() });
  const apiUrl = new URL("/api", gatewayUrl || requestUrl);
  return apiUrl.toString();
}

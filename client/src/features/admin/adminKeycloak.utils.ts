/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

const DEFAULT_KEYCLOAK_REALM = "Renku";

export function validateKeycloakRealmParams(params: unknown): string {
  if (
    params == null ||
    typeof params !== "object" ||
    !("KEYCLOAK_REALM" in params)
  ) {
    return DEFAULT_KEYCLOAK_REALM;
  }

  const params_ = params as { KEYCLOAK_REALM: unknown };

  const realm =
    typeof params_.KEYCLOAK_REALM === "string"
      ? params_.KEYCLOAK_REALM.trim()
      : "";

  if (!realm) {
    return DEFAULT_KEYCLOAK_REALM;
  }

  return realm;
}

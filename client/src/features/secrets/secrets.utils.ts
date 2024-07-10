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

import { Docs } from "../../utils/constants/Docs";
import type { SecretDetails } from "./secrets.types";

export const SECRETS_DOCS_URL = Docs.rtdTopicGuide("secrets/secrets.html");

export const SECRETS_VALUE_LENGTH_LIMIT = 5_000;

type Secret = Pick<SecretDetails, "name">;

export function storageSecretNameToFieldName(secret: Secret) {
  return secret.name.split("-").slice(1).join("-") || secret.name;
}

export function storageSecretNameToStorageId(secret: Secret) {
  return secret.name.split("-")[0];
}

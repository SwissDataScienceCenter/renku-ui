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

import { getJSONStringArray } from "../sessionsV2/session.utils";
import { SessionEnvironment } from "../sessionsV2/sessionsV2.types";

export function getSessionEnvironmentValues(environment: SessionEnvironment) {
  return {
    container_image: environment.container_image,
    default_url: environment.default_url,
    description: environment.description,
    name: environment.name,
    port: environment.port ?? undefined,
    working_directory: environment.working_directory?.trim() || undefined,
    mount_directory: environment.mount_directory?.trim() || undefined,
    uid: environment.uid ?? undefined,
    gid: environment.gid ?? undefined,
    command: getJSONStringArray(environment.command),
    args: getJSONStringArray(environment.args),
  };
}

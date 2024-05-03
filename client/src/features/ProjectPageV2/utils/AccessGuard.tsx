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

import type { Role } from "../../projectsV2/api/projectV2.api.ts";

import { roleCompare } from "./roleUtils.ts";

type AccessGuardProps = {
  disabled: React.ReactNode;
  enabled: React.ReactNode;
  minimumRole?: Role;
  role: Role;
};

export default function AccessGuard({
  disabled,
  enabled,
  minimumRole = "owner",
  role,
}: AccessGuardProps) {
  if (role === "owner") return enabled;
  if (roleCompare(role, minimumRole) > 0) return disabled;
  return enabled;
}

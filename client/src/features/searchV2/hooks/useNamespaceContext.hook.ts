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

import { useOutletContext } from "react-router";

import type { GroupResponse } from "~/features/projectsV2/api/namespace.api";
import type { UserWithId } from "~/features/usersV2/api/users.api";

export type NamespaceContextType =
  | {
      kind: "group";
      namespace: string;
      group: GroupResponse;
    }
  | {
      kind: "user";
      namespace: string;
      user: UserWithId;
    }
  | {
      kind: "global";
      namespace: undefined;
    };

export function useNamespaceContext() {
  const ctx = useOutletContext<NamespaceContextType | undefined>();
  if (!ctx) {
    return {
      kind: "global",
      namespace: undefined,
      group: undefined,
      user: undefined,
    };
  }
  return ctx;
}

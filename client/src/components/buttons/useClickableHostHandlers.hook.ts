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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, type MouseEvent } from "react";

const MENU_HOST_IGNORE_SELECTOR = "button, a, .btn-group";

// Makes a whole row/card clickable via onActivate, but lets nested
// buttons, links, and menus handle their own clicks instead.
export default function useClickableHostHandlers(onActivate?: () => void) {
  const onClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!onActivate) return;
      if (
        event.target instanceof Element &&
        event.target.closest(MENU_HOST_IGNORE_SELECTOR)
      ) {
        return;
      }
      onActivate();
    },
    [onActivate],
  );

  if (!onActivate) return {};

  return { onClick };
}

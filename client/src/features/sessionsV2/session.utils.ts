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
 * limitations under the License
 */
import { SessionStatusState } from "../session/sessions.types.ts";

export type FaviconStatus = "running" | "waiting" | "error" | "pause";

export function calculateFaviconStatus(
  sessionState?: SessionStatusState,
  isLoading?: boolean
): FaviconStatus {
  if (isLoading) {
    return "waiting";
  }

  if (!sessionState) {
    return "error";
  }

  switch (sessionState) {
    case "hibernated":
      return "pause";
    case "stopping":
      return "waiting";
    case "running":
      return "running";
    case "failed":
      return "error";
    default:
      return "waiting";
  }
}

export const FAVICON_BY_SESSION_STATUS = {
  running: "/faviconPlay.svg",
  waiting: "/faviconWarning.svg",
  error: "/faviconError.svg",
  pause: "/faviconPause.svg",
};

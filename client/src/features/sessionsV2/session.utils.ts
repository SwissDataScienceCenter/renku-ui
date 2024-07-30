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
import { FaviconSet } from "../display/display.types";
import { SessionStatusState } from "../session/sessions.types";

export type FaviconStatus = "running" | "waiting" | "error" | "pause";

export function getSessionFavicon(
  sessionState?: SessionStatusState,
  isLoading?: boolean
): FaviconSet {
  if (isLoading) {
    return FAVICON_BY_SESSION_STATUS["waiting"];
  }

  if (!sessionState) {
    return FAVICON_BY_SESSION_STATUS["error"];
  }

  switch (sessionState) {
    case "hibernated":
      return FAVICON_BY_SESSION_STATUS["pause"];
    case "stopping":
      return FAVICON_BY_SESSION_STATUS["waiting"];
    case "running":
      return FAVICON_BY_SESSION_STATUS["running"];
    case "failed":
      return FAVICON_BY_SESSION_STATUS["error"];
    default:
      return FAVICON_BY_SESSION_STATUS["waiting"];
  }
}

export const FAVICON_BY_SESSION_STATUS = {
  running: {
    ico: "/src/styles/assets/favicon.ico",
    png_16x: "/src/styles/assets/favicon-16x16.png",
    png_32x: "/src/styles/assets/favicon-32x32.png",
    svg: "/src/styles/assets/faviconPlay.svg",
  },
  waiting: {
    ico: "/src/styles/assets/favicon.ico",
    png_16x: "/src/styles/assets/favicon-16x16.png",
    png_32x: "/src/styles/assets/favicon-32x32.png",
    svg: "/src/styles/assets/faviconWarning.svg",
  },
  error: {
    ico: "/src/styles/assets/favicon.ico",
    png_16x: "/src/styles/assets/favicon-16x16.png",
    png_32x: "/src/styles/assets/favicon-32x32.png",
    svg: "/src/styles/assets/faviconError.svg",
  },
  pause: {
    ico: "/src/styles/assets/favicon.ico",
    png_16x: "/src/styles/assets/favicon-16x16.png",
    png_32x: "/src/styles/assets/favicon-32x32.png",
    svg: "/src/styles/assets/faviconPause.svg",
  },
};

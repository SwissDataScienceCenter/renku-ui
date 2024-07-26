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

import { useEffect, useState } from "react";
import { Session } from "../../../session/sessions.types.ts";

export type FaviconStatus = "running" | "waiting" | "error" | "pause";

export function calculateFaviconStatus(
  session?: Session,
  isLoading?: boolean
): FaviconStatus {
  if (isLoading) {
    return "waiting";
  }

  if (!session) {
    return "error";
  }

  switch (session.status.state) {
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

export function SessionFavicon({ status }: { status: FaviconStatus }) {
  const [favicon, setFavicon] = useState("/favicon.ico");

  const removeExistingFavicon = () => {
    const existingIcons = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    existingIcons.forEach((icon) => icon?.parentNode?.removeChild(icon));
  };

  const modifyFavicon = (faviconPath: string) => {
    const faviconType = faviconPath.endsWith(".svg")
      ? "image/svg+xml"
      : faviconPath.endsWith(".ico")
      ? "image/x-icon"
      : "image/png";
    const faviconElement = document.createElement("link");
    faviconElement.rel = "icon";
    faviconElement.type = faviconType;
    faviconElement.href = faviconPath;
    faviconElement.setAttribute("sizes", "16x16 32x32 48x48");
    document.head.appendChild(faviconElement);

    const shortcutIconElement = document.createElement("link");
    shortcutIconElement.rel = "shortcut icon";
    shortcutIconElement.type = faviconType;
    shortcutIconElement.href = faviconPath;
    document.head.appendChild(shortcutIconElement);
  };

  useEffect(() => {
    removeExistingFavicon();
    modifyFavicon(favicon);

    return () => {
      // cleanup and set favicon to default
      removeExistingFavicon();
      modifyFavicon("/favicon.ico");
    };
  }, [favicon]);

  useEffect(() => {
    const faviconByStatus = {
      running: "/faviconPlay.svg",
      waiting: "/faviconWarning.svg",
      error: "/faviconError.svg",
      pause: "/faviconPause.svg",
    };
    setFavicon(faviconByStatus[status]);
  }, [status]);

  return null;
}

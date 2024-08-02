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

import { useEffect } from "react";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { FAVICON_BY_SESSION_STATUS } from "../sessionsV2/session.utils.ts";

export function Favicon() {
  const favicon = useAppSelector(({ display }) => display.favicon);

  useEffect(() => {
    const removeExistingFavicon = () => {
      const existingIcons = document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"]'
      );
      existingIcons.forEach((icon) => icon?.parentNode?.removeChild(icon));
    };

    const addFavicon = (href: string, rel: string, size?: string) => {
      const faviconType = href.endsWith(".svg")
        ? "image/svg+xml"
        : href.endsWith(".ico")
        ? "image/x-icon"
        : "image/png";

      const linkElement = document.createElement("link");
      linkElement.rel = rel;
      linkElement.type = faviconType;
      linkElement.href = href;
      if (size) linkElement.setAttribute("sizes", size);

      document.head.appendChild(linkElement);
    };

    removeExistingFavicon();
    const faviconSet = FAVICON_BY_SESSION_STATUS[favicon];
    addFavicon(faviconSet.ico, "shortcut icon");
    addFavicon(faviconSet.png_32x32, "icon", "32x32");
    addFavicon(faviconSet.png_16x16, "icon", "16x16");
    addFavicon(faviconSet.svg, "icon");
  }, [favicon]);

  return null;
}

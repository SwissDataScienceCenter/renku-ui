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
import faviconICO from "../../styles/assets/favicon/Favicon.ico";
import faviconSVG from "../../styles/assets/favicon/Favicon.svg";
import favicon16px from "../../styles/assets/favicon/Favicon16px.png";
import favicon32px from "../../styles/assets/favicon/Favicon32px.png";
import faviconErrorICO from "../../styles/assets/favicon/FaviconError.ico";
import faviconErrorSVG from "../../styles/assets/favicon/FaviconError.svg";
import faviconError16px from "../../styles/assets/favicon/FaviconError16px.png";
import faviconError32px from "../../styles/assets/favicon/FaviconError32px.png";
import faviconPauseICO from "../../styles/assets/favicon/FaviconPause.ico";
import faviconPauseSVG from "../../styles/assets/favicon/FaviconPause.svg";
import faviconPause16px from "../../styles/assets/favicon/FaviconPause16px.png";
import faviconPause32px from "../../styles/assets/favicon/FaviconPause32px.png";
import faviconRunningICO from "../../styles/assets/favicon/FaviconRunning.ico";
import faviconRunningSVG from "../../styles/assets/favicon/FaviconRunning.svg";
import faviconRunning16px from "../../styles/assets/favicon/FaviconRunning16px.png";
import faviconRunning32px from "../../styles/assets/favicon/FaviconRunning32px.png";
import faviconWaitingICO from "../../styles/assets/favicon/FaviconWaiting.ico";
import faviconWaitingSVG from "../../styles/assets/favicon/FaviconWaiting.svg";
import faviconWaiting16px from "../../styles/assets/favicon/FaviconWaiting16px.png";
import faviconWaiting32px from "../../styles/assets/favicon/FaviconWaiting32px.png";

export const DEFAULT_URL = "/";
export const DEFAULT_PORT = 8888;
export const FAVICON_BY_SESSION_STATUS = {
  general: {
    ico: faviconICO,
    png_16x16: favicon16px,
    png_32x32: favicon32px,
    svg: faviconSVG,
  },
  running: {
    ico: faviconRunningICO,
    png_16x16: faviconRunning16px,
    png_32x32: faviconRunning32px,
    svg: faviconRunningSVG,
  },
  waiting: {
    ico: faviconWaitingICO,
    png_16x16: faviconWaiting16px,
    png_32x32: faviconWaiting32px,
    svg: faviconWaitingSVG,
  },
  error: {
    ico: faviconErrorICO,
    png_16x16: faviconError16px,
    png_32x32: faviconError32px,
    svg: faviconErrorSVG,
  },
  pause: {
    ico: faviconPauseICO,
    png_16x16: faviconPause16px,
    png_32x32: faviconPause32px,
    svg: faviconPauseSVG,
  },
};

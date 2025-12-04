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
import { BuilderSelectorOption } from "./sessionsV2.types";

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

export const CUSTOM_LAUNCH_SEARCH_PARAM = "renku_custom_launch";

export const ENV_VARIABLES_RESERVED_PREFIX = "RENKU";

export const ENVIRONMENT_VALUES_DESCRIPTION = {
  urlPath: `Specify a subpath for your Renku session. By default, the session opens at the path defined by the environment variable \`RENKU_SESSION_PATH\`. If you set a subpath (e.g., "foo"), the session will open at \`<RENKU_SESSION_PATH>/foo\`.`,
  port: `The network port that your application will use to listen for incoming connections.  
Default: \`8080\`.`,
  workingDirectory: `Set the directory where your session will open. If not specified, Renku uses the Docker image setting. Renku will also create the project inside this directory including any data sources and repositories.`,
  uid: `The identifier assigned to the user that will run the application. This determines file permissions and ownership.  
Default: \`1000\`.`,
  gid: `The identifier assigned to the group that will run the application. This helps manage group-based permissions.  
Default: \`1000\`.`,
  mountDirectory: `Renku will provide persistent storage for your session even when you pause or resume it. Set the location where this storage should be mounted. It should be the same as or a parent of the working directory to avoid data loss. Defaults to the working directory if not specified.`,
  command: `The command that will be run i.e. will overwrite the image Dockerfile \`ENTRYPOINT\`.`,
  args: `The arguments that will follow the command, i.e. will overwrite the image Dockerfile \`CMD\`.`,
  stripPathPrefix: `When this is activated then the server that is running in the session container will receive all requests with the path prefix stripped out. Note that this is an advanced feature which usually requires the server application running inside the session to be made aware that a proxy is rewriting the URL paths and also to be informed of the real path prefix that is being stripped.`,
};

export const CONTAINER_IMAGE_PATTERN =
  /^[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*(\/[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*)*(:[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127}|@sha256:[a-fA-F0-9]{64}){0,1}$/;

export const BUILDER_IMAGE_NOT_READY_VALUE = "image:unknown-at-the-moment";

export const BUILDER_TYPES = [
  {
    value: "python",
    label: "Python",
    description: (
      <>
        Create a Python environment from an <code>environment.yml</code> file.
        This file must be at the root of the repository. See the documentation
        for examples.
      </>
    ),
  },
] as readonly BuilderSelectorOption[];

export const BUILDER_FRONTENDS = [
  {
    /* eslint-disable spellcheck/spell-checker */
    value: "vscodium",
    label: "VSCodium",
    description: "A freely-licensed version Microsoft’s editor VS Code.",
    /* eslint-enable spellcheck/spell-checker */
  },
  {
    /* eslint-disable spellcheck/spell-checker */
    value: "jupyterlab",
    label: "Jupyterlab",
    description:
      "Web-based interactive development environment for Jupyter notebooks, code and data.",
    /* eslint-enable spellcheck/spell-checker */
  },
  {
    /* eslint-disable spellcheck/spell-checker */
    value: "ttyd",
    label: "ttyd",
    description: "Web-based terminal, with minimalist interface.",
    /* eslint-enable spellcheck/spell-checker */
  },
] as readonly BuilderSelectorOption[];

export const IMAGE_BUILD_DOCS =
  "https://renku.notion.site/How-to-create-a-custom-environment-from-a-code-repository-1960df2efafc801b88f6da59a0aa8234";

export const LAUNCHER_CONTAINER_IMAGE_VALIDATION_MESSAGE = {
  required: "Please provide a container image.",
  pattern: "Please provide a valid container image.",
};

export const LAUNCHER_CONTAINER_IMAGE_QUERY_DEBOUNCE = 1_000;

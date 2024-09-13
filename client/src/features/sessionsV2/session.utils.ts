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
import { FaviconStatus } from "../display/display.types";
import { SessionStatusState } from "../session/sessions.types";
import {
  SessionEnvironmentList,
  SessionLauncher,
  SessionLauncherEnvironmentParams,
  SessionLauncherForm,
} from "./sessionsV2.types";

export function getSessionFavicon(
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

export function getFormCustomValuesDesc() {
  return {
    urlPath: `Specify a subpath for your Renku session. By default, the session opens at the path defined by the environment variable \`RENKU_SESION_PATH\`. If you set a subpath (e.g., "foo"), the session will open at \`<RENKU_SESION_PATH>/foo\`.`,
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
  };
}
export const DEFAULT_URL = "/";
export const DEFAULT_PORT = 8888;

export function orderEnvironments(
  environments?: SessionEnvironmentList,
  environmentId?: string
): SessionEnvironmentList | undefined {
  if (!environments || !environmentId) return environments;
  const targetEnvironment = environments.find(
    (env) => env.id === environmentId
  );

  if (!targetEnvironment) {
    return environments;
  }
  const otherEnvironments = environments.filter(
    (env) => env.id !== environmentId
  );
  return [targetEnvironment, ...otherEnvironments];
}

export function getFormattedEnvironmentValues(
  data: SessionLauncherForm
): SessionLauncherEnvironmentParams {
  const {
    container_image,
    default_url,
    name,
    port,
    working_directory,
    uid,
    gid,
    mount_directory,
    environment_id,
    environment_kind,
    command,
    args,
  } = data;
  return environment_kind === "GLOBAL"
    ? {
        id: environment_id,
      }
    : {
        environment_kind: "CUSTOM",
        container_image,
        name,
        default_url: default_url.trim() ? default_url : DEFAULT_URL,
        port,
        working_directory,
        mount_directory,
        uid,
        gid,
        //command: command?.length > 0 ? [`${command}`] : undefined,
        command: command.length > 0 ? getJsonValue(`${command}`) : undefined,
        args: args.length > 0 ? getJsonValue(`${args}`) : undefined,
        // args: args?.length > 0 ? [`${args}`] : undefined,
      };
}

function getJsonValue(toParse: string) {
  try {
    return JSON.parse(toParse);
  } catch (error) {
    return [toParse];
  }
}

export function getLauncherDefaultValues(launcher: SessionLauncher) {
  return {
    name: launcher.name,
    description: launcher.description ?? "",
    environment_kind: launcher.environment.environment_kind,
    environment_id:
      launcher.environment.environment_kind === "GLOBAL"
        ? launcher.environment.id
        : "",
    container_image:
      launcher.environment.environment_kind === "CUSTOM"
        ? launcher.environment.container_image
        : "",
    default_url: launcher.environment.default_url ?? DEFAULT_URL,
    port: launcher.environment.port,
    working_directory: launcher.environment.working_directory,
    mount_directory: launcher.environment.mount_directory,
    uid: launcher.environment.uid,
    gid: launcher.environment.gid,
    command: launcher.environment.command,
    args: launcher.environment.args,
  };
}

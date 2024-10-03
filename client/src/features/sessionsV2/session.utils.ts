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

import { FaviconStatus } from "../display/display.types";
import { SessionStatusState } from "../session/sessions.types";
import { DEFAULT_URL } from "./session.constants";
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

export function prioritizeSelectedEnvironment(
  environments?: SessionEnvironmentList,
  selectedEnvironmentId?: string
): SessionEnvironmentList | undefined {
  if (!environments || !selectedEnvironmentId) return environments;
  const targetEnvironment = environments.find(
    (env) => env.id === selectedEnvironmentId
  );

  if (!targetEnvironment) {
    return environments;
  }
  const otherEnvironments = environments.filter(
    (env) => env.id !== selectedEnvironmentId
  );
  return [targetEnvironment, ...otherEnvironments];
}

export function getFormattedEnvironmentValues(
  data: SessionLauncherForm
): SessionLauncherEnvironmentParams | false {
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

  if (environment_kind === "GLOBAL") {
    return { id: environment_id };
  }

  const commandFormatted = safeParseJSONArray(command);
  const argsFormatted = safeParseJSONArray(args);
  if (commandFormatted === false || argsFormatted === false) return false;

  return {
    environment_kind: "CUSTOM",
    container_image,
    name,
    default_url: default_url.trim() || DEFAULT_URL,
    port,
    working_directory,
    mount_directory,
    uid,
    gid,
    command: commandFormatted,
    args: argsFormatted,
  };
}

export function getLauncherDefaultValues(launcher: SessionLauncher) {
  return {
    name: launcher.name,
    description: launcher.description ?? "",
    environment_kind: launcher.environment?.environment_kind,
    environment_id:
      launcher.environment?.environment_kind === "GLOBAL"
        ? launcher.environment?.id
        : "",
    container_image:
      launcher.environment?.environment_kind === "CUSTOM"
        ? launcher.environment?.container_image
        : "",
    default_url: launcher.environment?.default_url ?? DEFAULT_URL,
    port: launcher.environment?.port,
    working_directory: launcher.environment?.working_directory,
    mount_directory: launcher.environment?.mount_directory,
    uid: launcher.environment?.uid,
    gid: launcher.environment?.gid,
    command: safeStringify(launcher.environment?.command),
    args: safeStringify(launcher.environment?.args),
  };
}

/**
 * Safely converts any value to a JSON string.
 * @param value - The value to stringify.
 * @returns
 * - The JSON string representation of the value if successful.
 * - An error message ("Failed to stringify the value") if `JSON.stringify` throws an error.
 *
 * @example
 * safeStringify({ key: "value" }); // '{"key":"value"}'
 * safeStringify(undefined); // "undefined"
 * safeStringify(() => {}); // "Failed to stringify the value"
 */
export function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return "Failed to stringify the value";
  }
}

/**
 * Safely parses a JSON string and checks if it is a valid JSON array.
 *
 * @param value - The JSON string to parse.
 * @returns The parsed JSON array if valid, `null` if the string is empty or only contains whitespace,
 *          and `false` if the string is not valid JSON or not a JSON array.
 */
export function safeParseJSONArray(value: string) {
  if (!value?.trim()) return null;

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : false;
  } catch (error) {
    return false;
  }
}

/**
 * Validates whether a given string is a valid JSON array, intended for use in form validation.
 * @param value - The string to validate as a JSON array.
 * @returns
 * - `true` if the string is a valid JSON array.
 * - An error message as a string if the input is not a valid JSON format or not a JSON array.
 * - `undefined` if the input is an empty or whitespace-only string (i.e., no validation performed).
 *
 * @example
 * isValidJSONArrayString('["item1", "item2"]'); // true
 * isValidJSONArrayString('{"key": "value"}'); // "Input must be a valid JSON array"
 * isValidJSONArrayString('invalid json'); // "Input must be a valid JSON format"
 * isValidJSONArrayString(''); // undefined
 */
export function isValidJSONArrayString(
  value: string
): true | string | undefined {
  if (!value?.trim()) return undefined;

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue)
      ? true
      : "Input must be a valid JSON array";
  } catch {
    return "Input must be a valid JSON format";
  }
}

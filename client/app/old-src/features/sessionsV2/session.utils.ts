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
import type {
  EnvironmentList as SessionEnvironmentList,
  SessionLauncher,
  SessionLauncherEnvironmentParams,
  SessionLauncherEnvironmentPatchParams,
} from "./api/sessionLaunchersV2.api";
import { DEFAULT_URL } from "./session.constants";
import { SessionLauncherForm } from "./sessionsV2.types";

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

/**
 * Formats and validates the environment values for launching a session.
 *
 * @param {SessionLauncherForm} data - The form data used to configure the environment for a session launcher.
 *
 * @returns {{ success: boolean; data?: SessionLauncherEnvironmentParams; error?: string }} -
 *  Returns an object with the following structure:
 *   - `success`: A boolean indicating whether the function executed successfully.
 *   - `data`: If `success` is true, contains the formatted `SessionLauncherEnvironmentParams` object.
 *   - `error`: If `success` is false, contains a string describing the error (e.g., "Invalid command or args format").
 */
export function getFormattedEnvironmentValues(data: SessionLauncherForm): {
  success: boolean;
  data?: SessionLauncherEnvironmentParams;
  error?: string;
} {
  const {
    args,
    builder_variant,
    command,
    container_image,
    default_url,
    environmentId,
    environmentSelect,
    frontend_variant,
    gid,
    mount_directory,
    name,
    port,
    repository,
    uid,
    working_directory,
  } = data;

  if (environmentSelect === "global") {
    return { success: true, data: { id: environmentId } };
  }

  if (environmentSelect === "custom + build") {
    return {
      success: true,
      data: {
        environment_image_source: "build",
        builder_variant,
        frontend_variant,
        repository,
      },
    };
  }

  const commandFormatted = safeParseJSONStringArray(command);
  const argsFormatted = safeParseJSONStringArray(args);
  if (!commandFormatted.parsed || !argsFormatted.parsed)
    return { success: false, error: "Invalid command or args format" };

  return {
    success: true,
    data: {
      environment_kind: "CUSTOM",
      environment_image_source: "image",
      container_image,
      name,
      default_url: default_url.trim() || DEFAULT_URL,
      port,
      working_directory,
      mount_directory,
      uid,
      gid,
      command: commandFormatted.data ?? undefined,
      args: argsFormatted.data ?? undefined,
    },
  };
}

/**
 * Formats and validates the environment values for launching a session. (edit mode)
 *
 * @param {SessionLauncherEnvironmentPatchParams} data - The form data used to configure the environment for a session launcher.
 *
 * @returns {{ success: boolean; data?: SessionLauncherEnvironmentParams; error?: string }} -
 *  Returns an object with the following structure:
 *   - `success`: A boolean indicating whether the function executed successfully.
 *   - `data`: If `success` is true, contains the formatted `SessionLauncherEnvironmentParams` object.
 *   - `error`: If `success` is false, contains a string describing the error (e.g., "Invalid command or args format").
 */
export function getFormattedEnvironmentValuesForEdit(
  data: SessionLauncherForm
): {
  success: boolean;
  data?: SessionLauncherEnvironmentPatchParams;
  error?: string;
} {
  const { environmentSelect } = data;

  if (
    environmentSelect === "global" ||
    environmentSelect === "custom + image"
  ) {
    return getFormattedEnvironmentValues(data);
  }

  const { builder_variant, frontend_variant, repository } = data;

  return {
    success: true,
    data: {
      environment_image_source: "build",
      environment_kind: "CUSTOM",
      build_parameters: {
        builder_variant,
        frontend_variant,
        repository,
      },
    },
  };
}

export function getJSONStringArray(value: string[] | undefined) {
  const valueToString = safeStringify(value);
  return valueToString === null ? undefined : valueToString;
}

export function getLauncherDefaultValues(
  launcher: SessionLauncher
): Partial<SessionLauncherForm> {
  return {
    name: launcher.name,
    description: launcher.description ?? "",
    environmentSelect:
      launcher.environment.environment_kind === "GLOBAL"
        ? "global"
        : launcher.environment.environment_image_source === "build"
        ? "custom + build"
        : "custom + image",
    environmentId:
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
    command: getJSONStringArray(launcher.environment?.command),
    args: getJSONStringArray(launcher.environment?.args),
    builder_variant:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.builder_variant
        : "",
    frontend_variant:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.frontend_variant
        : "",
    repository:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.repository
        : "",
  };
}

/**
 * Safely converts any value to a JSON string.
 * @param value - The value to stringify.
 * @returns
 * - The JSON string representation of the value if successful.
 * - An null if `JSON.stringify` throws an error.
 *
 * @example
 * safeStringify({ key: "value" }); // '{"key":"value"}'
 * safeStringify(undefined); // "undefined"
 * safeStringify(() => {}); // null
 */
export function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return null;
  }
}

interface ParseResult {
  parsed: boolean;
  data?: string[] | null;
  error?: string;
}
/**
 * Safely parses a JSON string and checks if it is a valid JSON array of strings.
 */
export function safeParseJSONStringArray(value: string): ParseResult {
  if (!value?.trim()) return { parsed: true, data: null };

  try {
    const parsedValue = JSON.parse(value);
    if (!Array.isArray(parsedValue))
      return { parsed: false, error: "Input must be a valid JSON array" };

    if (!parsedValue.every((item) => typeof item === "string"))
      return {
        parsed: false,
        error: "Array must contain only string elements",
      };

    return { parsed: true, data: parsedValue };
  } catch (error) {
    return { parsed: false, error: "Input must be a valid JSON format" };
  }
}

/**
 * Validates whether a given string is a valid JSON array, intended for use in form validation.
 * @param value - The string to validate as a JSON array.
 * @returns
 * - `true` if the string is a valid JSON array.
 * - An error message as a string if the input is not a valid JSON format or not a JSON array.
 * - `undefined` if the input is an empty or whitespace-only string (i.e., no validation performed).
 */
export function isValidJSONStringArray(
  value: string
): true | string | undefined {
  const parseString = safeParseJSONStringArray(value);
  if (parseString.parsed && parseString.data === null) return undefined;

  if (parseString.parsed) return true;
  return parseString.error ?? "Is not a valid JSON array string";
}

/**
 * Ensure a given URL uses the HTTPS protocol.
 * If the URL already starts with "https://", it is returned unchanged.
 * If the URL starts with "http://", it is replaced with "https://".
 * If the URL has no protocol, "https://" is prepended.
 *
 * @param url - The URL to be ensured with HTTPS protocol.
 * @returns A URL string guaranteed to start with "https://".
 * @throws Error if the input is not a valid URL.
 */
export function ensureHTTPS(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "https:") {
      return url;
    }

    if (parsedUrl.protocol === "http:") {
      return url.replace("http:", "https:");
    }

    throw new Error("Unsupported protocol");
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

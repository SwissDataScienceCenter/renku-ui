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

import { dataConnectorsOverrideFromConfig } from "../cloudStorage/projectCloudStorage.utils";
import { FaviconStatus } from "../display/display.types";
import type {
  ResourceClassWithId,
  ResourcePoolWithId,
} from "./api/computeResources.api";
import type {
  EnvironmentList as SessionEnvironmentList,
  SessionLauncher,
  SessionLauncherEnvironmentParams,
  SessionLauncherEnvironmentPatchParams,
} from "./api/sessionLaunchersV2.api";
import type {
  ImageCheckResponse,
  SessionPostRequest,
  SessionResponse,
} from "./api/sessionsV2.api";
import {
  BUILDER_FRONTEND_COMBINATIONS,
  BUILDER_PLATFORMS,
  DEFAULT_PORT,
  DEFAULT_URL,
  ENV_VARIABLES_RESERVED_PREFIX,
  getCompatibleFrontends,
  LAUNCHER_BY_CATEGORY,
  SUBMISSION_ID_PATTERN,
  SUBMISSION_ID_VALIDATION_MESSAGE,
} from "./session.constants";
import {
  SESSION_LAUNCHER_KIND,
  type EnvironmentSelectOption,
  type LauncherCategory,
  type LauncherCategoryDefinition,
  type SessionLauncherForm,
  type SessionLauncherKind,
  type SessionStatusState,
} from "./sessionsV2.types";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

export function getLauncherCategoryDefinitionByLauncher(
  launcher: SessionLauncher
): LauncherCategoryDefinition {
  return isJobLauncher(launcher)
    ? LAUNCHER_BY_CATEGORY["job"]
    : LAUNCHER_BY_CATEGORY["session"];
}

export function sessionLauncherKindToCategory(
  kind: SessionLauncherKind
): LauncherCategory {
  return kind === SESSION_LAUNCHER_KIND.NON_INTERACTIVE ? "job" : "session";
}

export function getLauncherCategory(
  launcher: SessionLauncher
): LauncherCategory {
  return sessionLauncherKindToCategory(launcher.launcher_type);
}

export function getLauncherCategoryDefinition(
  category: LauncherCategory
): LauncherCategoryDefinition {
  return LAUNCHER_BY_CATEGORY[category];
}

export function getLauncherApiType(
  category: LauncherCategory
): SessionLauncherKind {
  return getLauncherCategoryDefinition(category).apiType;
}

export function isJobLauncher(launcher: SessionLauncher): boolean {
  return launcher.launcher_type === SESSION_LAUNCHER_KIND.NON_INTERACTIVE;
}

export function isGlobalEnvironmentIncluded(allowedEnvironments: string[]) {
  return allowedEnvironments.includes("global");
}

export function getNewLauncherFormDefaultValues(
  environmentSelect: EnvironmentSelectOption
): Pick<
  SessionLauncherForm,
  | "name"
  | "description"
  | "environmentSelect"
  | "environmentId"
  | "container_image"
  | "default_url"
  | "port"
  | "repository"
  | "platform"
  | "builder_variant"
  | "frontend_variant"
  | "command"
  | "args"
> {
  return {
    name: "",
    description: "",
    environmentSelect,
    environmentId: "",
    container_image: "",
    default_url: DEFAULT_URL,
    port: DEFAULT_PORT,
    repository: "",
    platform: "",
    builder_variant: "python",
    frontend_variant: "jupyterlab", // eslint-disable-line spellcheck/spell-checker
    command: "",
    args: "",
  };
}



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
export function getFormattedEnvironmentValues(
  data: SessionLauncherForm,
  launcherCategory: LauncherCategory = "session"
): {
  success: boolean;
  data?: SessionLauncherEnvironmentParams;
  error?: string;
} {
  const {
    args,
    builder_variant,
    command,
    container_image,
    context_dir: context_dir_,
    default_url,
    environmentId,
    environmentSelect,
    frontend_variant,
    gid,
    mount_directory,
    name,
    platform: platform_,
    port,
    repository_revision: repository_revision_,
    repository,
    uid,
    working_directory,
    strip_path_prefix,
  } = data;

  if (environmentSelect === "global") {
    return { success: true, data: { id: environmentId } };
  }

  if (environmentSelect === "custom + build") {
    const context_dir = context_dir_?.trim();
    const repository_revision = repository_revision_?.trim();
    const platform =
      BUILDER_PLATFORMS.map(({ value }) => value).find(
        (value) => value === platform_
      ) ?? BUILDER_PLATFORMS[0].value;
    const isCompatible =
      BUILDER_FRONTEND_COMBINATIONS[builder_variant]?.includes(
        frontend_variant
      ) ?? true;
    const buildPayload: SessionLauncherEnvironmentParams = {
      environment_image_source: "build",
      builder_variant,
      frontend_variant: isCompatible
        ? frontend_variant
        : getCompatibleFrontends(builder_variant)[0] || "jupyterlab", // eslint-disable-line spellcheck/spell-checker
      repository,
      platforms: [platform],
      ...(context_dir ? { context_dir } : {}),
      ...(repository_revision ? { repository_revision } : {}),
    };

    if (launcherCategory === "job") {
      if (!command?.trim()) {
        return { success: false, error: "Job command is required" };
      }
      const commandFormatted = safeParseJSONStringArray(command);
      if (!commandFormatted.parsed) {
        return { success: false, error: "Invalid job command format" };
      }
      if (commandFormatted.data == null || commandFormatted.data.length === 0) {
        return { success: false, error: "Job command can't be empty" };
      }
      buildPayload.job_command = commandFormatted.data;
    }
    if (launcherCategory === "job" && args?.trim()) {
      const argsFormatted = safeParseJSONStringArray(args);
      if (!argsFormatted.parsed) {
        return { success: false, error: "Invalid job args format" };
      }
      if (argsFormatted.data == null || argsFormatted.data.length === 0) {
        return { success: false, error: "Job args can't be empty" };
      }
      buildPayload.job_args = argsFormatted.data;
    }
    return { success: true, data: buildPayload };
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
      strip_path_prefix: strip_path_prefix ?? false,
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
  data: SessionLauncherForm,
  launcherCategory: LauncherCategory
): {
  success: boolean;
  data?: SessionLauncherEnvironmentPatchParams;
  error?: string;
} {
  const { environmentSelect } = data;

  const result = getFormattedEnvironmentValues(data, launcherCategory);
  if (!result.success) {
    return result;
  }
  const commandParsed = safeParseJSONStringArray(data.command);
  const argsParsed = safeParseJSONStringArray(data.args);

  if (
    environmentSelect === "global" ||
    environmentSelect === "custom + image"
  ) {
    const { data: environment } = result;

    return {
      ...result,
      data: {
        ...environment,
        ...(commandParsed.data
          ? { command: commandParsed.data }
          : { command: null }),
        ...(argsParsed.data ? { args: argsParsed.data } : { args: null }),
      },
    };
  }

  const {
    builder_variant,
    context_dir,
    frontend_variant,
    platform: platform_,
    repository_revision,
    repository,
  } = data;
  const platform =
    BUILDER_PLATFORMS.map(({ value }) => value).find(
      (value) => value === platform_
    ) ?? BUILDER_PLATFORMS[0].value;

  if (launcherCategory === "job" && !commandParsed.data?.length) {
    return { success: false, error: "Job command is required" };
  }

  return {
    success: true,
    data: {
      environment_image_source: "build",
      environment_kind: "CUSTOM",
      build_parameters: {
        builder_variant,
        frontend_variant,
        repository,
        repository_revision: repository_revision ?? "",
        context_dir: context_dir ?? "",
        platforms: [platform],
        ...(commandParsed.data && { job_command: commandParsed.data }),
        ...(argsParsed.data && { job_args: argsParsed.data }),
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
  const isJobBuildEnvironment =
    isJobLauncher(launcher) &&
    launcher.environment.environment_image_source === "build";
  const buildParameters =
    launcher.environment.environment_image_source === "build"
      ? launcher.environment.build_parameters
      : undefined;

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
    command: isJobBuildEnvironment
      ? getJSONStringArray(buildParameters?.job_command)
      : getJSONStringArray(launcher.environment?.command),
    args: isJobBuildEnvironment
      ? getJSONStringArray(buildParameters?.job_args)
      : getJSONStringArray(launcher.environment?.args),
    strip_path_prefix: launcher.environment?.strip_path_prefix ?? false,
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
    repository_revision:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.repository_revision ?? ""
        : "",
    context_dir:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.context_dir ?? ""
        : "",
    platform:
      launcher.environment.environment_image_source === "build"
        ? launcher.environment.build_parameters.platforms?.at(0) ?? ""
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
  } catch {
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
  } catch {
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
 * Validates a JSON string array field that must be present and non-empty.
 */
export function isValidRequiredJSONStringArray(
  value: string,
  requiredMessage = "Job command is required.",
  emptyMessage = "Job command can't be empty."
): true | string {
  if (!value?.toString().trim()) {
    return requiredMessage;
  }

  const validationResult = isValidJSONStringArray(value);
  if (validationResult === true) {
    const parsed = safeParseJSONStringArray(value);
    if (!parsed.data?.length) {
      return emptyMessage;
    }
    return true;
  }

  return validationResult ?? requiredMessage;
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
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Validation method for environment variable names
 *
 * @param name the name of the environment variable
 * @returns true if the variable name is allowed, an error message otherwise.
 */
export function validateEnvVariableName(name: string): true | string {
  if (name.toUpperCase().startsWith(ENV_VARIABLES_RESERVED_PREFIX)) {
    return `Variable names cannot start with '${ENV_VARIABLES_RESERVED_PREFIX}'.`;
  }
  return true;
}

export function validateSubmissionId(value: string): true | string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return SUBMISSION_ID_VALIDATION_MESSAGE.required;
  }
  if (/\s/.test(trimmed)) {
    return SUBMISSION_ID_VALIDATION_MESSAGE.pattern;
  }
  if (!SUBMISSION_ID_PATTERN.test(trimmed)) {
    return SUBMISSION_ID_VALIDATION_MESSAGE.pattern;
  }
  return true;
}

export function isSubmissionIdTaken({
  sessions,
  launcherId,
  projectId,
  submissionId,
}: {
  sessions: SessionResponse[] | undefined;
  launcherId: string;
  projectId: string;
  submissionId: string;
}): boolean {
  const trimmed = submissionId.trim();
  if (!trimmed || sessions == null) {
    return false;
  }
  return sessions.some(
    (session) =>
      session.launcher_id === launcherId &&
      session.project_id === projectId &&
      session.submission_id === trimmed
  );
}

export interface BuildJobSessionPostRequestArgs {
  launcher: SessionLauncher;
  submissionId: string;
  resourceClass: ResourceClassWithId;
  diskStorage?: number;
  command?: string;
  args?: string;
  dataConnectors?: SessionStartDataConnectorConfiguration[];
}

export function buildJobSessionPostRequest({
  launcher,
  submissionId,
  resourceClass,
  diskStorage,
  command,
  args,
  dataConnectors,
}: BuildJobSessionPostRequestArgs): SessionPostRequest {
  const commandParsed = safeParseJSONStringArray(command ?? "");
  const argsParsed = safeParseJSONStringArray(args ?? "");

  if (command?.trim() && !commandParsed.parsed) {
    throw new Error("Invalid job command format");
  }
  if (args?.trim() && !argsParsed.parsed) {
    throw new Error("Invalid job args format");
  }

  const request: SessionPostRequest = {
    launcher_id: launcher.id,
    submission_id: submissionId.trim(),
    resource_class_id: resourceClass.id,
    job_command_override: command?.trim() ? commandParsed.data : undefined,
    job_args_override: args?.trim() ? argsParsed.data : undefined,
  };

  if (diskStorage != null && diskStorage !== resourceClass.default_storage) {
    request.disk_storage = diskStorage;
  }

  if (dataConnectors?.length) {
    request.data_connectors_overrides = dataConnectors.flatMap(
      dataConnectorsOverrideFromConfig
    );
  }

  return request;
}

export function getLauncherEnvironmentSelect(
  launcher: SessionLauncher
): EnvironmentSelectOption {
  if (launcher.environment.environment_kind === "GLOBAL") {
    return "global";
  }
  if (launcher.environment.environment_image_source === "build") {
    return "custom + build";
  }
  return "custom + image";
}

export function getSubmitJobEnvironmentKindLabel(launcher: SessionLauncher) {
  const { environment } = launcher;
  if (environment.environment_kind === "GLOBAL") {
    return "Global environment";
  }
  if (environment.environment_image_source === "build") {
    return "Code based environment";
  }
  return "External image environment";
}

export function isImageCompatibleWith(
  image: ImageCheckResponse,
  platform: ResourcePoolWithId["platform"]
): boolean | "unknown" {
  if (image.platforms == null) {
    return "unknown";
  }
  const imagePlatforms = image.platforms?.map(
    ({ os, architecture }) => `${os}/${architecture}`
  );
  return imagePlatforms.some((p) => p === platform);
}

export function generateSubmissionId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `run-${randomPart}`;
}

const LAUNCHER_HASH_PREFIX = "launcher-";
const JOB_HASH_SEGMENT = "/job/";

export function buildLauncherHash(launcherId: string): string {
  return `${LAUNCHER_HASH_PREFIX}${launcherId}`;
}

export function buildLauncherJobHash(
  launcherId: string,
  submissionId: string
): string {
  return `${buildLauncherHash(launcherId)}${JOB_HASH_SEGMENT}${submissionId}`;
}

export function parseLauncherHash(hash: string): {
  launcherId?: string;
  submissionId?: string;
} {
  if (!hash.startsWith(LAUNCHER_HASH_PREFIX)) {
    return {};
  }
  const rest = hash.slice(LAUNCHER_HASH_PREFIX.length);
  const jobIndex = rest.indexOf(JOB_HASH_SEGMENT);
  if (jobIndex === -1) {
    return { launcherId: rest };
  }
  return {
    launcherId: rest.slice(0, jobIndex),
    submissionId: rest.slice(jobIndex + JOB_HASH_SEGMENT.length),
  };
}

export function isLauncherHashOpen(hash: string, launcherId: string): boolean {
  return parseLauncherHash(hash).launcherId === launcherId;
}

export function getJobAccordionTargetId(submissionId: string): string {
  return `job-${submissionId}`;
}

export function resolveOpenJobSubmissionId(
  hashSubmissionId: string | undefined,
  sessions: { submission_id?: string }[]
): string | undefined {
  if (hashSubmissionId) {
    const exists = sessions.some(
      (session) => session.submission_id === hashSubmissionId
    );
    return exists ? hashSubmissionId : undefined;
  }
  if (sessions.length === 1 && sessions[0].submission_id) {
    return sessions[0].submission_id;
  }
  return undefined;
}

export function toggleLauncherHash(hash: string, launcherId: string): string {
  const parsed = parseLauncherHash(hash);
  if (parsed.launcherId === launcherId) {
    if (parsed.submissionId) {
      return buildLauncherHash(launcherId);
    }
    return "";
  }
  return buildLauncherHash(launcherId);
}

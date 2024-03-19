/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
 * limitations under the License.
 */

import { clamp } from "lodash";
import type { DashboardMessageParams } from "../../features/dashboard/message/DashboardMessage.types";
import type { HomepageParams } from "../../landing/anonymousHome.types";
import type { CoreApiVersionedUrlConfig } from "../helpers/url";
import { DEFAULT_APP_PARAMS } from "./appParams.constants";
import type {
  AppParams,
  AppParamsBooleans,
  AppParamsNumbers,
  AppParamsStrings,
  PreviewThresholdParams,
  PrivacyBannerLayoutParams,
  SessionClassEmailUsParams,
  TemplatesParams,
  UploadThresholdParams,
} from "./appParams.types";

export function validatedAppParams(params: unknown): AppParams {
  if (typeof params !== "object" || params == null) {
    return DEFAULT_APP_PARAMS;
  }

  const params_ = params as RawAppParams;

  // String params
  const BASE_URL = validateString(params_, "BASE_URL");
  const GATEWAY_URL = validateString(params_, "GATEWAY_URL");
  const KEYCLOAK_REALM = validateString(params_, "KEYCLOAK_REALM");
  const MAINTENANCE = validateString(params_, "MAINTENANCE");
  const PRIVACY_BANNER_CONTENT = validateString(
    params_,
    "PRIVACY_BANNER_CONTENT"
  );
  const RENKU_CHART_VERSION = validateString(params_, "RENKU_CHART_VERSION");
  const SENTRY_NAMESPACE = validateString(params_, "SENTRY_NAMESPACE");
  const SENTRY_SAMPLE_RATE = validateString(params_, "SENTRY_SAMPLE_RATE");
  const SENTRY_URL = validateString(params_, "SENTRY_URL");
  const STATUSPAGE_ID = validateString(params_, "STATUSPAGE_ID");
  const UISERVER_URL = validateString(params_, "UISERVER_URL");
  const UI_SHORT_SHA = validateString(params_, "UI_SHORT_SHA");
  const UI_VERSION = validateString(params_, "UI_VERSION");

  // Boolean params
  const ANONYMOUS_SESSIONS = validateBoolean(params_, "ANONYMOUS_SESSIONS");
  const PRIVACY_BANNER_ENABLED = validateBoolean(
    params_,
    "PRIVACY_BANNER_ENABLED"
  );
  const TERMS_PAGES_ENABLED = validateBoolean(params_, "TERMS_PAGES_ENABLED");

  // Integer params
  const USER_PREFERENCES_MAX_PINNED_PROJECTS = validateInteger(
    params_,
    "USER_PREFERENCES_MAX_PINNED_PROJECTS"
  );

  // Object params
  const CORE_API_VERSION_CONFIG = validateCoreApiVersionConfig(params_);
  const DASHBOARD_MESSAGE = validateDashboardMessage(params_);
  const HOMEPAGE = validateHomepage(params_);
  const PREVIEW_THRESHOLD = validatePreviewThreshold(params_);
  const PRIVACY_BANNER_LAYOUT = validatePrivacyBannerLayout(params_);
  const TEMPLATES = validateTemplates(params_);
  const UPLOAD_THRESHOLD = validateUploadThreshold(params_);
  const SESSION_CLASS_EMAIL_US = validateSessionClassEmailUs(params_);

  return {
    ANONYMOUS_SESSIONS,
    BASE_URL,
    CORE_API_VERSION_CONFIG,
    DASHBOARD_MESSAGE,
    GATEWAY_URL,
    HOMEPAGE,
    KEYCLOAK_REALM,
    MAINTENANCE,
    PREVIEW_THRESHOLD,
    PRIVACY_BANNER_CONTENT,
    PRIVACY_BANNER_ENABLED,
    PRIVACY_BANNER_LAYOUT,
    TERMS_PAGES_ENABLED,
    RENKU_CHART_VERSION,
    SENTRY_NAMESPACE,
    SENTRY_SAMPLE_RATE,
    SENTRY_URL,
    SESSION_CLASS_EMAIL_US,
    STATUSPAGE_ID,
    TEMPLATES,
    UISERVER_URL,
    UI_SHORT_SHA,
    UI_VERSION,
    UPLOAD_THRESHOLD,
    USER_PREFERENCES_MAX_PINNED_PROJECTS,
  };
}

interface RawAppParams {
  [key: string]: unknown;
}

function validateString(
  params: RawAppParams,
  key: keyof AppParamsStrings
): string {
  const value = params[key];
  if (typeof value !== "string") {
    return DEFAULT_APP_PARAMS[key];
  }
  return value.trim();
}

function validateBoolean(
  params: RawAppParams,
  key: keyof AppParamsBooleans
): boolean {
  const value = params[key];

  // adjust boolean param value
  if (typeof value === "string") {
    if (value.trim().toLowerCase() === "true") {
      return true;
    }
    if (value.trim().toLowerCase() === "false") {
      return false;
    }
  }

  if (typeof value !== "boolean") {
    return DEFAULT_APP_PARAMS[key];
  }
  return value;
}

interface ValidateIntegerOptions {
  min?: number;
  max?: number;
}

function validateInteger(
  params: RawAppParams,
  key: keyof AppParamsNumbers,
  options?: ValidateIntegerOptions
): number {
  const min = options?.min ?? Number.MIN_SAFE_INTEGER;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;

  const value = params[key];

  // adjust integer param value
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return clamp(parsed, min, max);
    }
  }

  if (typeof value !== "number") {
    return DEFAULT_APP_PARAMS[key];
  }
  return clamp(value, min, max);
}

function validateCoreApiVersionConfig(
  params: RawAppParams
): Partial<CoreApiVersionedUrlConfig> {
  const value = params["CORE_API_VERSION_CONFIG"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["CORE_API_VERSION_CONFIG"];
  }
  return value;
}

function validateDashboardMessage(
  params: RawAppParams
): DashboardMessageParams {
  const value = params["DASHBOARD_MESSAGE"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["DASHBOARD_MESSAGE"];
  }

  const rawDashboardParams = value as {
    [key: string]: unknown;
  };

  const enabled = !!rawDashboardParams.enabled;

  const text =
    typeof rawDashboardParams.text === "string" ? rawDashboardParams.text : "";

  const additionalText =
    typeof rawDashboardParams.additionalText === "string"
      ? rawDashboardParams.additionalText
      : "";

  const dismissible = !!rawDashboardParams.dismissible;

  const rawStyle =
    typeof rawDashboardParams.style === "string"
      ? rawDashboardParams.style.trim().toLowerCase()
      : "";
  const style =
    rawStyle === "plain"
      ? "plain"
      : rawStyle === "success"
      ? "success"
      : rawStyle === "info"
      ? "info"
      : rawStyle === "warning"
      ? "warning"
      : rawStyle === "danger"
      ? "danger"
      : "plain";

  if (enabled && text && style) {
    return {
      enabled,
      text,
      additionalText,
      style,
      dismissible,
    };
  }

  return DEFAULT_APP_PARAMS["DASHBOARD_MESSAGE"];
}

function validateHomepage(params: RawAppParams): HomepageParams {
  const value = params["HOMEPAGE"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["HOMEPAGE"];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return value as any;
}

function validatePreviewThreshold(
  params: RawAppParams
): PreviewThresholdParams {
  const value = params["PREVIEW_THRESHOLD"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["PREVIEW_THRESHOLD"];
  }

  const rawParams = value as { hard: unknown; soft: unknown };

  const hard =
    typeof rawParams.hard === "number"
      ? rawParams.hard
      : DEFAULT_APP_PARAMS["PREVIEW_THRESHOLD"].hard;
  const soft =
    typeof rawParams.soft === "number"
      ? rawParams.soft
      : DEFAULT_APP_PARAMS["PREVIEW_THRESHOLD"].soft;
  return { hard, soft };
}

function validatePrivacyBannerLayout(
  params: RawAppParams
): PrivacyBannerLayoutParams | null {
  const value = params["PRIVACY_BANNER_LAYOUT"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["PRIVACY_BANNER_LAYOUT"];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return value as any;
}

function validateTemplates(params: RawAppParams): TemplatesParams {
  const value = params["TEMPLATES"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["TEMPLATES"];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return value as any;
}

function validateUploadThreshold(params: RawAppParams): UploadThresholdParams {
  const value = params["UPLOAD_THRESHOLD"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["UPLOAD_THRESHOLD"];
  }

  const rawParams = value as { soft: unknown };

  const soft =
    typeof rawParams.soft === "number"
      ? rawParams.soft
      : DEFAULT_APP_PARAMS["PREVIEW_THRESHOLD"].soft;
  return { soft };
}

function validateSessionClassEmailUs(
  params: RawAppParams
): SessionClassEmailUsParams {
  const value = params["SESSION_CLASS_EMAIL_US"];
  if (typeof value !== "object" || value == null) {
    return DEFAULT_APP_PARAMS["SESSION_CLASS_EMAIL_US"];
  }

  const rawEmailUsParams = value as {
    [key: string]: unknown;
  };

  const enabled = !!rawEmailUsParams.enabled;

  const to = typeof rawEmailUsParams.to === "string" ? rawEmailUsParams.to : "";

  const subject =
    typeof rawEmailUsParams.subject === "string"
      ? rawEmailUsParams.subject
      : "";

  const body =
    typeof rawEmailUsParams.body === "string" ? rawEmailUsParams.body : "";

  if (enabled && to) {
    return {
      enabled,
      email: {
        to,
        subject,
        body,
      },
    };
  }

  return DEFAULT_APP_PARAMS["SESSION_CLASS_EMAIL_US"];
}

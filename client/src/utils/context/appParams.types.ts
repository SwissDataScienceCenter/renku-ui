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

import type { DashboardMessageParams } from "../../features/dashboard/message/DashboardMessage.types";
import type { HomepageParams } from "../../landing/anonymousHome.types";
import type { CoreApiVersionedUrlConfig } from "../helpers/url";

export interface AppParams {
  ANONYMOUS_SESSIONS: boolean;
  BASE_URL: string;
  CORE_API_VERSION_CONFIG: Partial<CoreApiVersionedUrlConfig>;
  DASHBOARD_MESSAGE: DashboardMessageParams;
  GATEWAY_URL: string;
  HOMEPAGE: HomepageParams;
  KEYCLOAK_REALM: string;
  MAINTENANCE: string;
  PREVIEW_THRESHOLD: PreviewThresholdParams;
  PRIVACY_BANNER_CONTENT: string;
  PRIVACY_BANNER_ENABLED: boolean;
  PRIVACY_BANNER_LAYOUT: PrivacyBannerLayoutParams | null;
  PRIVACY_PAGE_ENABLED: boolean;
  RENKU_CHART_VERSION: string;
  SENTRY_NAMESPACE: string;
  SENTRY_SAMPLE_RATE: string; // TODO: convert to number type
  SENTRY_URL: string;
  STATUSPAGE_ID: string;
  TEMPLATES: TemplatesParams;
  UISERVER_URL: string;
  UI_SHORT_SHA: string;
  UI_VERSION: string;
  UPLOAD_THRESHOLD: UploadThresholdParams;
  USER_PREFERENCES_MAX_PINNED_PROJECTS: number;
}

export type AppParamsStrings = {
  [K in keyof AppParams as AppParams[K] extends string
    ? K
    : never]: AppParams[K];
};

export type AppParamsBooleans = {
  [K in keyof AppParams as AppParams[K] extends boolean
    ? K
    : never]: AppParams[K];
};

export type AppParamsNumbers = {
  [K in keyof AppParams as AppParams[K] extends number
    ? K
    : never]: AppParams[K];
};

export interface PreviewThresholdParams {
  hard: number;
  soft: number;
}

export interface PrivacyBannerLayoutParams {
  [key: string]: unknown;
}

export interface TemplatesParams {
  custom: boolean;
  repositories: TemplatesRepositories[];
}

interface TemplatesRepositories {
  name: string;
  ref: string;
  url: string;
}

export interface UploadThresholdParams {
  soft: number;
}

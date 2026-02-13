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

import { HomepageParams } from "~/features/landing/anonymousHome.types";

export interface AppParams {
  ANONYMOUS_SESSIONS: boolean;
  BASE_URL: string;
  GATEWAY_URL: string;
  HOMEPAGE: HomepageParams;
  IMAGE_BUILDERS_ENABLED: boolean;
  KEYCLOAK_REALM: string;
  MAINTENANCE: string;
  PREVIEW_THRESHOLD: PreviewThresholdParams;
  PRIVACY_BANNER_CONTENT: string;
  PRIVACY_BANNER_ENABLED: boolean;
  PRIVACY_BANNER_LAYOUT: PrivacyBannerLayoutParams | null;
  RENKU_CHART_VERSION: string;
  SENTRY_NAMESPACE: string;
  SENTRY_SAMPLE_RATE: string; // TODO: convert to number type
  SENTRY_URL: string;
  SESSION_CLASS_EMAIL_US: SessionClassEmailUsParams;
  STATUSPAGE_ID: string;
  TEMPLATES: TemplatesParams;
  TERMS_PAGES_ENABLED: boolean;
  UI_SHORT_SHA: string;
  UI_VERSION: string;
  UISERVER_URL: string;
  UPLOAD_THRESHOLD: UploadThresholdParams;
  USER_PREFERENCES_MAX_PINNED_PROJECTS: number;
  CONTACT_EMAIL: string;
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

export type SessionClassEmailUsParams =
  | SessionClassEmailUsParamsDisabled
  | SessionClassEmailUsParamsEnabled;

interface SessionClassEmailUsParamsDisabled {
  enabled: false;
}

interface SessionClassEmailUsParamsEnabled {
  enabled: true;
  email: {
    to: string;
    subject: string;
    body: string;
  };
}

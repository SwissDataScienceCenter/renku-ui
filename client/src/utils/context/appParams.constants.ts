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

import { Docs } from "../constants/Docs";
import type { AppParams } from "./appParams.types";

const DEFAULT_KEYCLOAK_REALM = "Renku";

const DEFAULT_USER_PREFERENCES_MAX_PINNED_PROJECTS = 10;

const DEFAULT_CORE_API_VERSION_CONFIG: AppParams["CORE_API_VERSION_CONFIG"] = {
  coreApiVersion: "/",
};

const DEFAULT_DASHBOARD_MESSAGE: AppParams["DASHBOARD_MESSAGE"] = {
  enabled: false,
};

const DEFAULT_HOMEPAGE: AppParams["HOMEPAGE"] = {
  custom: {
    enabled: false,
    main: {
      backgroundImage: { url: "" },
      contentMd: "# Welcome to RenkuLab",
    },
  },
  datasetSlug: "",
  projectPath: "",
  showcase: {
    enabled: false,
    description: "",
    projects: [],
    title: "",
  },
  tutorialLink: Docs.READ_THE_DOCS_TUTORIALS_STARTING,
};

const DEFAULT_PREVIEW_THRESHOLD: AppParams["PREVIEW_THRESHOLD"] = {
  hard: 10_485_760, //10MB
  soft: 1_048_576, // 1MB
};

const DEFAULT_PRIVACY_BANNER_LAYOUT: AppParams["PRIVACY_BANNER_LAYOUT"] = null;

const DEFAULT_TEMPLATES: AppParams["TEMPLATES"] = {
  custom: false,
  repositories: [],
};

const DEFAULT_UPLOAD_THRESHOLD: AppParams["UPLOAD_THRESHOLD"] = {
  soft: 104_857_600,
};

export const DEFAULT_APP_PARAMS: AppParams = {
  ANONYMOUS_SESSIONS: false,
  BASE_URL: "",
  CORE_API_VERSION_CONFIG: DEFAULT_CORE_API_VERSION_CONFIG,
  DASHBOARD_MESSAGE: DEFAULT_DASHBOARD_MESSAGE,
  GATEWAY_URL: "",
  HOMEPAGE: DEFAULT_HOMEPAGE,
  KEYCLOAK_REALM: DEFAULT_KEYCLOAK_REALM,
  MAINTENANCE: "",
  PREVIEW_THRESHOLD: DEFAULT_PREVIEW_THRESHOLD,
  PRIVACY_BANNER_CONTENT: "",
  PRIVACY_BANNER_LAYOUT: DEFAULT_PRIVACY_BANNER_LAYOUT,
  PRIVACY_ENABLED: false,
  RENKU_CHART_VERSION: "",
  SENTRY_NAMESPACE: "",
  SENTRY_SAMPLE_RATE: "0",
  SENTRY_URL: "",
  STATUSPAGE_ID: "",
  TEMPLATES: DEFAULT_TEMPLATES,
  UISERVER_URL: "",
  UI_SHORT_SHA: "",
  UI_VERSION: "",
  UPLOAD_THRESHOLD: DEFAULT_UPLOAD_THRESHOLD,
  USER_PREFERENCES_MAX_PINNED_PROJECTS:
    DEFAULT_USER_PREFERENCES_MAX_PINNED_PROJECTS,
};

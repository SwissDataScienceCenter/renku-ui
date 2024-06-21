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
 * limitations under the License.
 */

export const ABSOLUTE_ROUTES = {
  root: "/",
  v2: {
    root: "/v2",
    groups: {
      root: "/v2/groups",
      new: "/v2/groups/new",
      show: "/v2/groups/:slug",
    },
    projects: {
      root: "/v2/projects",
      new: "/v2/projects/new",
      show: {
        root: "/v2/projects/:namespace/:slug",
        info: "/v2/projects/:namespace/:slug/info",
        settings: "/v2/projects/:namespace/:slug/settings",
        sessions: {
          root: "/v2/projects/:namespace/:slug/sessions",
          show: "/v2/projects/:namespace/:slug/sessions/show/:session",
          start: "/v2/projects/:namespace/:slug/sessions/:launcherId/start",
          startCustom:
            "/v2/projects/:namespace/:slug/sessions/:launcherId/start?custom",
        },
      },
      showById: "/v2/projects/:id",
    },
    help: {
      root: "/v2/help",
      contact: "/v2/help/contact",
      status: "/v2/help/status",
      release: "/v2/help/release",
      tos: "/v2/help/tos",
      privacy: "/v2/help/privacy",
    },
    search: "/v2/search",
    connectedServices: "/v2/connected-services",
  },
} as const;

export const RELATIVE_ROUTES = {
  root: "/",
  v2: {
    root: "v2/*",
    groups: {
      root: "groups/*",
      new: "new",
      show: ":slug",
    },
    projects: {
      root: "projects/*",
      new: "new",
      show: {
        root: ":namespace/:slug/*",
        info: "info",
        settings: "settings/*",
        sessions: {
          root: "sessions/*",
          show: "show/:session",
          start: ":launcherId/start",
        },
      },
      showById: ":id",
    },
    help: {
      root: "help/*",
      contact: "contact",
      status: "status",
      release: "release",
      tos: "tos",
      privacy: "privacy",
    },
    search: "search",
    connectedServices: "connected-services",
  },
} as const;

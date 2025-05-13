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
    user: "/v2/user",
    users: {
      show: "/v2/users/:username",
    },
    groups: {
      new: "/v2/groups/new",
      show: {
        root: "/v2/groups/:slug",
        settings: "/v2/groups/:slug/settings",
        splat: "/v2/groups/:slug/*",
      },
    },
    projects: {
      new: "/v2/projects/new",
      show: {
        root: "/v2/projects/:namespace/:slug",
        settings: "/v2/projects/:namespace/:slug/settings",
        sessions: {
          root: "/v2/projects/:namespace/:slug/sessions",
          show: "/v2/projects/:namespace/:slug/sessions/show/:session",
          start: "/v2/projects/:namespace/:slug/sessions/:launcherId/start",
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
    secrets: "/v2/secrets",
  },
  v1: {
    root: "/v1",
    search: "/v1/search",
    help: {
      root: "/v1/help",
      contact: "/v1/help/contact",
      status: "/v1/help/status",
      release: "/v1/help/release",
      tos: "/v1/help/tos",
      privacy: "/v1/help/privacy",
    },
    notifications: "/v1/notifications",
    styleGuide: "/v1/style-guide",
    secrets: "/v1/secrets",
    sessions: "/v1/sessions",
  },
} as const;

export const RELATIVE_ROUTES = {
  root: "/",
  datasets: "/datasets",
  projects: "/projects",
  v1: {
    root: "/v1",
    search: "search",
    help: "help/*",
    sessions: "sessions",
    notifications: "notifications",
    secrets: "secrets",
    styleGuide: "style-guide",
    inactiveKGProjects: "inactive-kg-projects",
  },
  v2: {
    root: "v2/*",
    user: "user",
    users: {
      show: "users/:username",
    },
    groups: {
      root: "groups/*",
      new: "new",
      show: {
        root: ":slug/*",
        settings: "settings",
      },
    },
    projects: {
      root: "projects/*",
      new: "new",
      show: {
        root: ":namespace/:slug/*",
        settings: "settings",
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
    secrets: "secrets",
  },
} as const;

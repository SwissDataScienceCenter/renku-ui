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
  datasets: {
    root: "/datasets",
    splat: "/datasets/*",
  },
  projects: {
    root: "/projects",
    splat: "/projects/*",
  },
  v1: {
    root: "/v1",
    splat: "/v1/*",
    inactiveKGProjects: "/v1/inactive-kg-projects",
    search: "/v1/search",
    projects: {
      root: "/v1/projects",
      all: "/v1/projects/all",
      new: "/v1/projects/new",
      starred: "/v1/projects/starred",
    },
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
  v2: {
    root: "/",
    integrations: "/integrations",
    groups: {
      show: {
        root: "/g/:slug",
        settings: "/g/:slug/settings",
        splat: "/g/:slug/*",
      },
    },
    help: {
      root: "/help",
      contact: "/help/contact",
      status: "/help/status",
      release: "/help/release",
      tos: "/help/tos",
      privacy: "/help/privacy",
    },
    projects: {
      show: {
        root: "/p/:namespace/:slug",
        settings: "/p/:namespace/:slug/settings",
        sessions: {
          root: "/p/:namespace/:slug/sessions",
          show: "/p/:namespace/:slug/sessions/show/:session",
          start: "/p/:namespace/:slug/sessions/:launcherId/start",
        },
      },
      showById: "/p/:id",
    },
    search: "/search",
    secrets: "/secrets",
    user: "/user",
    users: {
      show: "/u/:username",
    },
  },
} as const;

export const RELATIVE_ROUTES = {
  root: "/",
  datasets: "/datasets",
  projects: "/projects",
  v1: {
    root: "v1/*",
    projects: {
      root: "projects/*",
      all: "all",
      new: "new",
      starred: "starred",
    },
    help: "help/*",
    inactiveKGProjects: "inactive-kg-projects",
    notifications: "notifications",
    search: "search",
    secrets: "secrets",
    sessions: "sessions",
    styleGuide: "style-guide",
  },
  v2: {
    root: "/*",
    integrations: "integrations",
    groups: {
      root: "g/*",
      new: "new",
      show: {
        root: ":slug/*",
        settings: "settings",
      },
    },
    help: {
      root: "help/*",
      contact: "contact",
      status: "status",
      release: "release",
      tos: "tos",
      privacy: "privacy",
    },
    projects: {
      root: "p/*",
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
    search: "search",
    secrets: "secrets",
    user: "user",
    users: {
      show: "u/:username",
    },
  },
} as const;

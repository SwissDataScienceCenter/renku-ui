/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { convertType, urlJoin } from "./utils";
import { StoragePrefix } from "./storage";

const SERVER = {
  url: process.env.SERVER_URL,
  port: 8080,
  prefix: "/ui-server",
  logLevel: process.env.SERVER_LOG_LEVEL || "info",
  serverUiVersion: process.env.UI_SERVER_VERSION || "unknown",
  proxyTimeout: 600 * 1000, // in milliseconds
  wsSuffix: "/ws",
  keepCookies: JSON.parse(process.env.SERVER_KEEP_COOKIES || "[]"),
};

const gatewayUrl = process.env.GATEWAY_URL || urlJoin(SERVER.url ?? "", "/api");

const DEPLOYMENT = {
  gatewayUrl,
};

const SENTRY = {
  enabled: ["true", "1"].includes(
    (process.env.SENTRY_ENABLED ?? "").toLowerCase()
  ),
  url: process.env.SENTRY_URL || undefined,
  namespace: process.env.SENTRY_NAMESPACE || undefined,
  telepresence: !!process.env.TELEPRESENCE,
  sampleRate: parseFloat(process.env.SENTRY_TRACE_RATE) || 0,
  debugMode: ["true", "1"].includes(
    (process.env.SENTRY_DEBUG ?? "").toLowerCase()
  ),
};

const AUTHENTICATION = {
  serverUrl: process.env.AUTH_SERVER_URL || SERVER.url + "/auth/realms/Renku",
  cookiesKey: "_renku_session",
  authHeaderField: "Authorization",
  authHeaderPrefix: "bearer ",
};

const REDIS = {
  host: process.env.REDIS_HOST || "localhost",
  port: convertType(process.env.REDIS_PORT) || 6379,
  database: convertType(process.env.REDIS_DATABASE) || 0,
  password: process.env.REDIS_PASSWORD || null,
  isSentinel: convertType(process.env.REDIS_IS_SENTINEL) || false,
  masterSet: process.env.REDIS_MASTER_SET || "mymaster",
};

const ROUTES = {
  api: "/api",
  auth: "/auth",
};

const DATA = {
  projectsStoragePrefix: StoragePrefix.LAST_PROJECTS,
  searchStoragePrefix: StoragePrefix.LAST_SEARCHES,
  searchDefaultLength: 10,
  projectsDefaultLength: 20,
};

const WEBSOCKET = {
  enabled: ["true", "1"].includes(
    (process.env.WEBSOCKET_ENABLED ?? "").toLowerCase()
  ),
  shortIntervalSec: 5, // ? in seconds
  longIntervalSec: 180, // ? in seconds
  delayStartSec: 3, // ? in seconds
  timeoutActivationStatus: 120, // in minutes
};

const PROMETHEUS = {
  enabled: ["true", "1"].includes(
    (process.env.PROMETHEUS_ENABLED ?? "").toLowerCase()
  ),
  path: "/metrics",
};

const config = {
  auth: AUTHENTICATION,
  data: DATA,
  deployment: DEPLOYMENT,
  prometheus: PROMETHEUS,
  redis: REDIS,
  routes: ROUTES,
  sentry: SENTRY,
  server: SERVER,
  websocket: WEBSOCKET,
};

export default config;

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

import { convertType } from "./utils";


const SERVER = {
  url: process.env.SERVER_URL,
  port: convertType(process.env.SERVER_PORT) || 8080,
  prefix: process.env.SERVER_PREFIX || "/ui-server",
  logLevel: process.env.SERVER_LOG_LEVEL || "info",
  serverUiVersion: process.env.UI_SERVER_VERSION || "unknown"
};

const DEPLOYMENT = {
  gatewayUrl: process.env.GATEWAY_URL || SERVER.url + "/api",
  gatewayLoginUrl:
    (process.env.GATEWAY_URL || SERVER.url + "/api") + (process.env.GATEWAY_LOGIN_PATH || "/auth/login"),
  gatewayLogoutUrl:
    (process.env.GATEWAY_URL || SERVER.url + "/api") + (process.env.GATEWAY_LOGOUT_PATH || "/auth/logout"),
};

const SENTRY = {
  enabled: !!process.env.SENTRY_ENABLED,
  url: process.env.SENTRY_URL || undefined,
  namespace: process.env.SENTRY_NAMESPACE || undefined,
  telepresence: !!process.env.TELEPRESENCE,
  sampleRate: parseFloat(process.env.SENTRY_TRACE_RATE) || 0
};

const AUTHENTICATION = {
  serverUrl: process.env.AUTH_SERVER_URL || SERVER.url + "/auth/realms/Renku",
  clientId: process.env.AUTH_CLIENT_ID || "renku-ui",
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  tokenExpirationTolerance: convertType(process.env.AUTH_TOKEN_TOLERANCE) || 10,
  cookiesKey: "ui-server-session",
  authHeaderField: "Authorization",
  authHeaderPrefix: "bearer ",
  invalidHeaderField: "ui-server-auth",
  invalidHeaderExpired: "expired",
  retryConnectionAttempts: 10,
};

const REDIS = {
  host: process.env.REDIS_HOST || "localhost",
  port: convertType(process.env.REDIS_PORT) || 6379,
  database: process.env.REDIS_DATABASE || "0",
  password: process.env.REDIS_PASSWORD || null,
};

const ROUTES = {
  api: "/api",
  auth: "/auth",
};


const config = {
  server: SERVER, deplyoment: DEPLOYMENT, auth: AUTHENTICATION, redis: REDIS, routes: ROUTES, sentry: SENTRY
};

export default config;

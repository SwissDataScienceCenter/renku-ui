/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import {
  RETURN_TYPES,
  renkuFetch,
  type FetchOptions,
} from "~/api-client/utils";
import { API_ERRORS, APIError } from "~/api-client/errors";
import processPaginationHeaders from "~/api-client/pagination";

/**
 * A compatibility layer implementation of the old APIClient supporting only the
 * features needed by the V2 UI.
 */

const FETCH_DEFAULT = {
  options: { headers: new Headers() },
  returnType: "json" as const,
  alertOnErr: false,
  reLogin: true,
  anonymousLogin: false,
  maxIterations: 10,
};

export default class ApiClientV2Compat {
  baseUrl: string;
  uiServerUrl: string;
  supportsLegacy = false;

  constructor(baseUrl: string, uiServerUrl: string) {
    this.baseUrl = baseUrl;
    this.uiServerUrl = uiServerUrl;
  }

  async clientFetch(
    url: string,
    options: FetchOptions = FETCH_DEFAULT.options,
    returnType = FETCH_DEFAULT.returnType,
    reLogin = FETCH_DEFAULT.reLogin,
    anonymousLogin = FETCH_DEFAULT.anonymousLogin
  ) {
    try {
      const response = await renkuFetch(url, options);
      // This avoids showing errors for a second while doing the anonymous log-in.
      if (!response && anonymousLogin)
        return returnType === RETURN_TYPES.json ? { data: {} } : "";
      else if (!response) return null;
      switch (returnType) {
        case RETURN_TYPES.json: {
          const data = await response.json();
          return {
            data,
            pagination: processPaginationHeaders(response.headers),
          };
        }
        case RETURN_TYPES.text:
          return await response.text();
        case RETURN_TYPES.full:
          return response;
        default:
          return response;
      }
    } catch (error) {
      if (!(error instanceof APIError)) {
        throw error; // Re-raise the error if it's not an APIError
      }
      if (error.case === API_ERRORS.authExpired) {
        this.doLogin();
        throw error; // Re-raise the error after redirecting to login
      }
      // For permission errors we send the user to login
      if (reLogin && error.case === API_ERRORS.unauthorizedError)
        return this.doLogin();
      // Default case: Re-raise the error for the application
      // to take care of it.
      throw error;
    }
  }

  doLogin() {
    // This is invoked to check authentication.
    window.location.href = `${
      this.uiServerUrl
    }/auth/login?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  doLogout() {
    window.location.href = `${
      this.uiServerUrl
    }/auth/logout?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  getBasicHeaders() {
    const headers = {
      Accept: "application/json",
    };
    return new Headers(headers);
  }

  async getGitLabUser() {
    const headers = this.getBasicHeaders();
    const response = await this.clientFetch(
      `${this.baseUrl}/user`,
      {
        method: "GET",
        headers: headers,
      },
      FETCH_DEFAULT.returnType,
      false
    );
    if (!response || typeof response !== "object" || response == null)
      return null;

    if (!("data" in response)) {
      return null;
    }
    return response.data;
  }

  async getRenkuUser() {
    const headers = this.getBasicHeaders();
    // see features/usersV2/api/users.api
    const response = await fetch("/api/data/user", {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || typeof data !== "object" || data == null) return null;
    return {
      state: "active",
      ...data,
    };
  }

  async getUser() {
    // return await this.getGitLabUser();
    return await this.getRenkuUser();
  }
}

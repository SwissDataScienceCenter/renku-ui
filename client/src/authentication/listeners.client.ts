/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { Location, NavigateFunction } from "react-router";

import { NOTIFICATION_TOPICS } from "~/notifications/Notifications.constants";
import type { NotificationsManager } from "~/notifications/notifications.types";
import {
  LOGOUT_EVENT_TIMEOUT,
  RENKU_QUERY_PARAMS,
  RENKU_USER_SIGNED_IN_COOKIE,
  RENKU_USER_SIGNED_IN_COOKIE_TTL,
} from "./authentication.constants";

interface HandleLoginParamsArgs {
  location: Location<unknown>;
  navigate: NavigateFunction;
}

/**
 * Manages communication of login/logout events between tabs. It uses localStorage to communicate
 * the events between tabs, and uses sessionStorage to remember an event after a refresh within a tab.
 *
 * Remove renku login parameters and set localStorage object
 */
export function handleLoginParams({
  location,
  navigate,
}: HandleLoginParamsArgs): void {
  // Check if user has just logged in
  const queryParams = new URLSearchParams(location.search);
  if (
    queryParams.get(RENKU_QUERY_PARAMS.login) === RENKU_QUERY_PARAMS.loginValue
  ) {
    // delete the login param
    queryParams.delete(RENKU_QUERY_PARAMS.login);
    navigate({ search: queryParams.toString() }, { replace: true });

    // save the login time to localStorage to allow other tabs to handle the event
    localStorage.setItem(RENKU_QUERY_PARAMS.login, Date.now().toString());

    // save the login state in a client-side cookie
    if (window.cookieStore) {
      window.cookieStore.set({
        name: RENKU_USER_SIGNED_IN_COOKIE,
        value: "1",
        expires: Date.now() + RENKU_USER_SIGNED_IN_COOKIE_TTL,
        sameSite: "strict",
      });
    }
  }
}

/**
 * Set up event listener fol localStorage authentication events. There should be only one listener per browser tab.
 *
 * Returns a cleanup function.
 */
export function setupListener(): () => void {
  function listener(event: StorageEvent): void {
    if (event.key === RENKU_QUERY_PARAMS.logout) {
      setTimeout(() => {
        sessionStorage.setItem(
          RENKU_QUERY_PARAMS.logout,
          Date.now().toString()
        );
        window.location.reload();
      }, LOGOUT_EVENT_TIMEOUT);
    } else if (event.key === RENKU_QUERY_PARAMS.login) {
      sessionStorage.setItem(RENKU_QUERY_PARAMS.login, Date.now().toString());
      window.location.reload();
    }
  }

  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("storage", listener);
  };
}

/**
 * Set up event listener fol localStorage authentication events. This should be called once per browser tab.
 *
 * @param {object} notifications - notification manager object.
 *
 * Returns a cleanup function.
 */
export function triggerNotifications(notifications: NotificationsManager) {
  // Check login
  const login = sessionStorage.getItem(RENKU_QUERY_PARAMS.login);
  if (login) {
    sessionStorage.removeItem(RENKU_QUERY_PARAMS.login);
    notifications.addSuccess(
      NOTIFICATION_TOPICS.AUTHENTICATION,
      "The page was refreshed because you recently logged in on a different tab."
    );
  }

  // Check logout
  const logout = sessionStorage.getItem(RENKU_QUERY_PARAMS.logout);
  if (logout) {
    sessionStorage.removeItem(RENKU_QUERY_PARAMS.logout);
    notifications.addWarning(
      NOTIFICATION_TOPICS.AUTHENTICATION,
      "The page was refreshed because you recently logged out on a different tab."
    );
  }
}
/**
 * Invoke whenever then logout process has been triggered.
 */
export function notifyLogout(): void {
  localStorage.setItem(RENKU_QUERY_PARAMS.logout, Date.now().toString());
  // Manual logout: remove the `renku_user_signed_in` cookie
  if (window.cookieStore) {
    window.cookieStore.delete(RENKU_USER_SIGNED_IN_COOKIE);
  }
}

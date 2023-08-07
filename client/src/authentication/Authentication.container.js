/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  authentication/Authentication.container.js
 *  Authentication components to log in and out.
 */

const RenkuQueryParams = {
  login: "renku_login",
  logout: "renku_logout",
  loginValue: "1",
};

const LOGOUT_EVENT_TIMEOUT = 5000;

/**
 * Manages communication of login/logout events between tabs. It uses localStorage to communicate
 * the events between tabs, and uses sessionStorage to remember an event after a refresh within a tab.
 */
const LoginHelper = {
  /**
   * Remove renku login parameters and set localStorage object
   *
   * @param {object} history - return url for the authentication backend
   */
  handleLoginParams: (history) => {
    // check if user has just logged in
    const queryParams = new URLSearchParams(history.location.search);
    if (
      queryParams.get(RenkuQueryParams.login) === RenkuQueryParams.loginValue
    ) {
      // delete the login param
      queryParams.delete(RenkuQueryParams.login);
      history.replace({ search: queryParams.toString() });

      // save the login time to localStorage to allow other tabs to handle the event
      localStorage.setItem(RenkuQueryParams.login, Date.now());
    }
  },
  /**
   * Set up event listener fol localStorage authentication events. Invoke only once.
   */
  setupListener: () => {
    window.onstorage = (event) => {
      if (event.key === RenkuQueryParams.logout) {
        setTimeout(() => {
          sessionStorage.setItem(RenkuQueryParams.logout, Date.now());
          window.location.reload();
        }, LOGOUT_EVENT_TIMEOUT);
      } else if (event.key === RenkuQueryParams.login) {
        sessionStorage.setItem(RenkuQueryParams.login, Date.now());
        window.location.reload();
      }
    };
  },
  /**
   * Set up event listener fol localStorage authentication events. Invoke only once.
   *
   * @param {object} notifications - notification manager object.
   */
  triggerNotifications: (notifications) => {
    // check login
    const login = sessionStorage.getItem(RenkuQueryParams.login);
    if (login) {
      sessionStorage.removeItem(RenkuQueryParams.login);
      notifications?.addSuccess(
        notifications.Topics.AUTHENTICATION,
        "The page was refreshed because you recently logged in on a different tab."
      );
    }

    // check logout
    const logout = sessionStorage.getItem(RenkuQueryParams.logout);
    if (logout) {
      sessionStorage.removeItem(RenkuQueryParams.logout);
      notifications?.addWarning(
        notifications.Topics.AUTHENTICATION,
        "The page was refreshed because you recently logged out on a different tab."
      );
    }
  },
  /**
   * Invoke whenever then logout process has been triggered.
   */
  notifyLogout: () => {
    localStorage.setItem(RenkuQueryParams.logout, Date.now());
  },
  queryParams: RenkuQueryParams,
};

export { LoginHelper, RenkuQueryParams };

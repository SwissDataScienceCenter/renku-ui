/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  Authentication.test.js
 *  Tests for authentication.
 */
import { describe, expect, it, vi } from "vitest";

import { LoginHelper, RenkuQueryParams } from "./Authentication.container";

// Mock relevant react objects
const location = { pathname: "", state: "", previous: "", search: "" };
const history = {
  location,
  replace: () => {
    // eslint-disable-line @typescript-eslint/no-empty-function
  },
};
const url = "https://fakedev.renku.ch/";
delete window.location;
window.location = { reload: vi.fn(), replace: vi.fn() };

async function dispatchStorageEvent(key, newValue) {
  // ? Dispatch Storage Event by creating it in an iframe
  return new Promise((resolve) => {
    const listener = (event) => {
      if (event.key === key && event.newValue === `${newValue}`) {
        window.removeEventListener("storage", listener);
        resolve();
      }
    };
    window.addEventListener("storage", listener);

    const iframe = window.document.createElement("iframe");
    iframe.style.display = "none";
    window.document.body.appendChild(iframe);

    iframe.contentWindow?.localStorage.setItem(key, newValue);
    iframe.remove();
  });
}

describe("LoginHelper functions", () => {
  const { queryParams } = LoginHelper;

  it("handleLoginParams", async () => {
    localStorage.clear();

    LoginHelper.handleLoginParams(history);
    expect(localStorage.length).toBe(0);
    const loginUrl = new URL(url);
    loginUrl.searchParams.set(
      RenkuQueryParams.login,
      RenkuQueryParams.loginValue
    );
    const loginHistory = {
      ...history,
      location: { ...location, search: loginUrl.href.replace(url, "") },
    };
    const datePre = new Date().getTime();

    LoginHelper.handleLoginParams(loginHistory);
    expect(localStorage.length).toBe(1);
    // ? Alternative to avoid using the localStorage function: localStorage.__STORE__[queryParams.login]
    const loginDate = parseInt(localStorage.getItem(queryParams.login));
    expect(loginDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(loginDate).toBeLessThanOrEqual(datePost);
  });

  it("setupListener", async () => {
    localStorage.clear();
    sessionStorage.clear();
    delete window.location;
    window.location = { reload: vi.fn() };

    LoginHelper.setupListener();
    expect(localStorage.length).toBe(0);
    const datePre = new Date().getTime();

    await dispatchStorageEvent(queryParams.login, new Date());
    expect(sessionStorage.length).toBe(1);
    const sessionStorageDate = parseInt(
      sessionStorage.getItem(queryParams.login)
    );
    expect(sessionStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(sessionStorageDate).toBeLessThanOrEqual(datePost);

    await dispatchStorageEvent(queryParams.logout, new Date());
    expect(sessionStorage.length).toBe(1); // that takes longer due to the timeout
  });

  it("notifyLogout", async () => {
    localStorage.clear();

    expect(localStorage.length).toBe(0);
    const datePre = new Date().getTime();

    LoginHelper.notifyLogout();
    expect(localStorage.length).toBe(1);
    const localStorageDate = parseInt(localStorage.getItem(queryParams.logout));
    expect(localStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(localStorageDate).toBeLessThanOrEqual(datePost);

    await dispatchStorageEvent(queryParams.logout, new Date());
    expect(localStorage.length).toBe(1); // that takes longer due to the timeout
  });
});

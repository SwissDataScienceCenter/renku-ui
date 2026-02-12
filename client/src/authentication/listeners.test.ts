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

import type { Location } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { RENKU_QUERY_PARAMS } from "./authentication.constants";
import {
  handleLoginParams,
  notifyLogout,
  setupListener,
} from "./listeners.client";

// Mock relevant react objects
const location: Location<void> = {
  pathname: "",
  search: "",
  hash: "",
  key: "default",
  state: undefined,
};
// eslint-disable-line @typescript-eslint/no-empty-function
const navigate = vi.fn();
const url = "https://fakedev.renku.ch/";
// @ts-expect-error mocking window.location
delete window.location;
// @ts-expect-error mocking window.location
window.location = { reload: vi.fn(), replace: vi.fn() };

async function dispatchStorageEvent(
  key: string,
  newValue: string
): Promise<void> {
  // ? Dispatch Storage Event by creating it in an iframe
  return new Promise((resolve) => {
    function listener(event: StorageEvent) {
      if (event.key === key && event.newValue === newValue) {
        window.removeEventListener("storage", listener);
        resolve();
      }
    }
    window.addEventListener("storage", listener);

    const iframe = window.document.createElement("iframe");
    iframe.style.display = "none";
    window.document.body.replaceChildren(iframe);

    window.setTimeout(() => {
      iframe.contentWindow?.localStorage.setItem(key, newValue);
      iframe.remove();
    }, 1);
  });
}

describe("Authentication listeners functions", () => {
  it("handleLoginParams", async () => {
    localStorage.clear();

    handleLoginParams({ location, navigate });
    expect(localStorage.length).toBe(0);
    const loginUrl = new URL(url);
    loginUrl.searchParams.set(
      RENKU_QUERY_PARAMS.login,
      RENKU_QUERY_PARAMS.loginValue
    );
    const loginLocation: Location<void> = {
      ...location,
      search: loginUrl.href.replace(url, ""),
    };
    const datePre = new Date().getTime();

    handleLoginParams({ location: loginLocation, navigate });
    expect(localStorage.length).toBe(1);
    // ? Alternative to avoid using the localStorage function: localStorage.__STORE__[queryParams.login]
    const loginDateStr = localStorage.getItem(RENKU_QUERY_PARAMS.login);
    expect(loginDateStr).toBeTruthy();
    const loginDate = parseInt(loginDateStr!);
    expect(loginDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(loginDate).toBeLessThanOrEqual(datePost);
  });

  it("setupListener", async () => {
    localStorage.clear();
    sessionStorage.clear();
    // @ts-expect-error mocking window.location
    delete window.location;
    // @ts-expect-error mocking window.location
    window.location = { reload: vi.fn() };

    const cleanup = setupListener();
    expect(localStorage.length).toBe(0);
    const datePre = new Date().getTime();

    await dispatchStorageEvent(RENKU_QUERY_PARAMS.login, Date.now().toString());
    expect(sessionStorage.length).toBe(1);
    const sessionStorageDateStr = sessionStorage.getItem(
      RENKU_QUERY_PARAMS.login
    );
    expect(sessionStorageDateStr).toBeTruthy();
    const sessionStorageDate = parseInt(sessionStorageDateStr!);
    expect(sessionStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(sessionStorageDate).toBeLessThanOrEqual(datePost);

    await dispatchStorageEvent(
      RENKU_QUERY_PARAMS.logout,
      Date.now().toString()
    );
    expect(sessionStorage.length).toBe(1); // that takes longer due to the timeout

    cleanup();
  });

  it("notifyLogout", async () => {
    localStorage.clear();

    expect(localStorage.length).toBe(0);
    const datePre = new Date().getTime();

    notifyLogout();
    expect(localStorage.length).toBe(1);
    const localStorageDateStr = localStorage.getItem(RENKU_QUERY_PARAMS.logout);
    expect(localStorageDateStr).toBeTruthy();
    const localStorageDate = parseInt(localStorageDateStr!);
    expect(localStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = new Date().getTime();
    expect(localStorageDate).toBeLessThanOrEqual(datePost);

    // Flush event loop before using dispatchStorageEvent()
    await new Promise<void>((resolve) => window.setTimeout(() => resolve(), 1));

    await dispatchStorageEvent(
      RENKU_QUERY_PARAMS.logout,
      Date.now().toString()
    );
    expect(localStorage.length).toBe(1); // that takes longer due to the timeout
  });
});

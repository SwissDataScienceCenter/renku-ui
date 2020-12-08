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

import React from "react";
import { act } from "react-dom/test-utils";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

import { LoginHelper, Login } from "./index";


// Mock relevant react objects
const location = { pathname: "", state: "", previous: "", search: "" };
const history = { location, replace: () => {} };
const url = "https://fakedev.renku.ch/";

// Mock localStorage event generator
function dispatchFakeStorageEvent(key, newValue) {
  /* eslint-disable no-console */
  const original = console.error;
  console.error = jest.fn();
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
  console.error = original;
  /* eslint-enable no-console */
}


describe("rendering", () => {
  const params = { BASE_URL: "https://fake" };

  it("renders Login", async () => {
    const props = {
      params,
      location
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(<MemoryRouter>
        <Login {...props} />
      </MemoryRouter>, div);
    });
  });
});

describe("LoginHelper functions", () => {
  const { queryParams } = LoginHelper;

  it("createLoginUrl", async () => {
    const extraParam = `${queryParams.login}=${queryParams.loginValue}`;

    expect(LoginHelper.createLoginUrl(url)).toBe(`${url}?${extraParam}`);

    const urlWithParam = `${url}?test=1`;
    expect(LoginHelper.createLoginUrl(urlWithParam)).toBe(`${urlWithParam}&${extraParam}`);
  });

  it("handleLoginParams", async () => {
    localStorage.clear();

    LoginHelper.handleLoginParams(history);
    expect(Object.keys(localStorage.__STORE__).length).toBe(0);
    const loginUrl = LoginHelper.createLoginUrl(url);
    const loginHistory = { ...history, location: { ...location, search: loginUrl.replace(url, "") } };
    const datePre = (new Date()).getTime();

    LoginHelper.handleLoginParams(loginHistory);
    expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    // ? Alternative to avoid using the localStorage function: localStorage.__STORE__[queryParams.login]
    const loginDate = parseInt(localStorage.getItem(queryParams.login));
    expect(loginDate).toBeGreaterThanOrEqual(datePre);
    const datePost = (new Date()).getTime();
    expect(loginDate).toBeLessThanOrEqual(datePost);
  });

  it("setupListener", async () => {
    localStorage.clear();
    sessionStorage.clear();

    LoginHelper.setupListener();
    expect(Object.keys(sessionStorage.__STORE__).length).toBe(0);
    const datePre = (new Date()).getTime();

    dispatchFakeStorageEvent(queryParams.login, new Date());
    expect(Object.keys(sessionStorage.__STORE__).length).toBe(1);
    const sessionStorageDate = parseInt(sessionStorage.getItem(queryParams.login));
    expect(sessionStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = (new Date()).getTime();
    expect(sessionStorageDate).toBeLessThanOrEqual(datePost);

    dispatchFakeStorageEvent(queryParams.logout, new Date());
    expect(Object.keys(sessionStorage.__STORE__).length).toBe(1); // that takes longer due to the timeout
  });

  it("notifyLogout", async () => {
    localStorage.clear();

    expect(Object.keys(localStorage.__STORE__).length).toBe(0);
    const datePre = (new Date()).getTime();

    LoginHelper.notifyLogout();
    expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    const localStorageDate = parseInt(localStorage.getItem(queryParams.logout));
    expect(localStorageDate).toBeGreaterThanOrEqual(datePre);
    const datePost = (new Date()).getTime();
    expect(localStorageDate).toBeLessThanOrEqual(datePost);

    dispatchFakeStorageEvent(queryParams.logout, new Date());
    expect(Object.keys(sessionStorage.__STORE__).length).toBe(1); // that takes longer due to the timeout
  });
});

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

/**
 *  renku-ui
 *
 *  Sentry.test.js
 *  Tests for Sentry.
 */


const FAKE = {
  url: "https://12345abcde@sentry.dev.renku.ch/5",
  namespace: "fake_namespace",
  promise: new Promise(() => { }),
  version: "0.0",
};

describe("Sentry settings", () => {
  // Avoid errors triggered by re-initializing the Sentry client.
  let Sentry;
  beforeEach(() => {
    jest.isolateModules(() => {
      Sentry = require("./Sentry").Sentry;
    });
  });

  it("init function - url parameter", () => {
    expect(() => Sentry.init())
      .toThrow("provide a Sentry URL");
    expect(() => Sentry.init(12345))
      .toThrow("provide a Sentry URL");
    expect(() => Sentry.init(FAKE.url)).not.toThrow();
  });

  it("init function - namespace parameter", () => {
    expect(() => Sentry.init(FAKE.url, 12345))
      .toThrow("optional <namespace> must be a valid string");
    expect(() => Sentry.init(FAKE.url, ""))
      .toThrow("optional <namespace> must be a valid string");
    expect(() => Sentry.init(FAKE.url, FAKE.namespace)).not.toThrow();
  });

  it("init function - userPromise parameter", () => {
    expect(() => Sentry.init(FAKE.url, null, "wrong_type"))
      .toThrow("optional <userPromise> must be a valid promise");
    expect(() => Sentry.init(FAKE.url, null, {}))
      .toThrow("optional <userPromise> must be a valid promise");
    expect(() => Sentry.init(FAKE.url, null, FAKE.promise)).not.toThrow();
  });

  it("init function - version parameter", () => {
    expect(() => Sentry.init(FAKE.url, null, null, 12345))
      .toThrow("optional <version> must be a valid string");
    expect(() => Sentry.init(FAKE.url, null, null, ""))
      .toThrow("optional <version> must be a valid string");
    expect(() => Sentry.init(FAKE.url, null, null, FAKE.url)).not.toThrow();
  });

  it("init function - re-initialize", () => {
    expect(() => Sentry.init(FAKE.url)).not.toThrow();
    expect(() => Sentry.init(FAKE.url)).toThrow("re-initialize the Sentry client");
  });

  it("init function - check Sentry object", () => {
    const sentrySettings = Sentry.init(FAKE.url, FAKE.namespace, FAKE.promise, FAKE.version);
    expect(sentrySettings).toBeTruthy();
    expect(sentrySettings.SDK_NAME).toBe("sentry.javascript.browser");
  });
});


describe("Helper functions", () => {
  let getRelease;
  beforeEach(() => {
    jest.isolateModules(() => {
      getRelease = require("./Sentry").getRelease;
    });
  });

  it("getRelease", () => {
    const RELEASE = {
      normal: "1.10.0",
      short: "1.10",
      full: "1.10.0-abcd123",
      wrong: "1.10.0.abcd123"
    };
    const DEV_SUFFIX = "-dev";

    expect(getRelease(RELEASE.normal)).toBe(RELEASE.normal);
    expect(getRelease(RELEASE.short)).toBe(RELEASE.short);
    expect(getRelease(RELEASE.full)).toBe(RELEASE.normal + DEV_SUFFIX);
    expect(getRelease(12345)).toBe("unknown");
    expect(getRelease("abcd")).toBe("unknown");
    expect(getRelease(RELEASE.wrong)).toBe("unknown");
  });
});

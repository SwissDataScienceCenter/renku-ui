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

import { validateCSP } from "../../src/utils/url";
import config from "../../src/config";


describe("Test url util functions", () => {
  it("Test validateCSP", async () => {
    const url = "https://gitlab.com/myNamespace/myProject/-/issues";
    config.server.url = "https://dev.renku.ch";

    // Invalid url
    expect(validateCSP("abcdef", "frame-ancestors *").isIframeValid).toBe(false);

    // CSP doesn t have frame-ancestors
    expect(validateCSP(url, "default-src 'none' ; base-uri 'self'").isIframeValid).toBe(false);

    // all domain valid
    expect(validateCSP(url, "frame-ancestors *").isIframeValid).toBe(true);

    // valid by protocol
    expect(validateCSP(url, "frame-ancestors https://*").isIframeValid).toBe(true);

    // invalid by protocol
    expect(validateCSP(url, "frame-ancestors http://*").isIframeValid).toBe(false);

    // invalid None rule
    expect(validateCSP(url, "frame-ancestors 'none'").isIframeValid).toBe(false);

    // valid full match url
    const originUrl = new URL(config.server.url);
    expect(validateCSP(url, `frame-ancestors ${originUrl.origin}`).isIframeValid).toBe(true);

    // valid subdomain match url
    expect(validateCSP(url, `frame-ancestors *.renku.ch`).isIframeValid).toBe(true);

    // valid subdomain-composed match
    config.server.url = "https://test.dev.renku.ch";
    expect(validateCSP(url, `frame-ancestors *.dev.renku.ch`).isIframeValid).toBe(true);

    // valid subdomain-composed match
    config.server.url = "https://dev.renku.ch";
    expect(validateCSP(url, `frame-ancestors *.dev.renku.ch`).isIframeValid).toBe(false);

    // validate subdomain-composed match and protocol
    config.server.url = "https://test.dev.renku.ch";
    expect(validateCSP(url, `frame-ancestors http://*.dev.renku.ch`).isIframeValid).toBe(false);
    expect(validateCSP(url, `frame-ancestors https://*.dev.renku.ch`).isIframeValid).toBe(true);

    // valid 'self' match
    config.server.url = "https://dev.renku.ch";
    expect(validateCSP("https://dev.renku.ch", "frame-ancestors 'self'").isIframeValid).toBe(true);

    // invalid when does not match any rule
    expect(validateCSP(url, `frame-ancestors https://renkulab.io/`).isIframeValid).toBe(false);
  });
});

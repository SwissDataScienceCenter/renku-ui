/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { describe, expect, it } from "vitest";

import {
  coreVersionedUrl,
  createCoreApiVersionedUrlConfig,
} from "./versionedUrls";

describe("Test versionedUrl config, always latest", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  const config = createCoreApiVersionedUrlConfig({ coreApiVersion: "/" });

  it("Version: number only", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: initial slash", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: `/${FAKE_ENDPOINT}`,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: none", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: null,
    });
    expect(numberedUrl).toBe(`/${FAKE_ENDPOINT}`);
  });
  it("Endpoint: missing", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: "",
      metadataVersion: null,
    });
    expect(numberedUrl).toBe("/");
  });
});

describe("Test versionedUrl config, default, no overrides", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  const config = createCoreApiVersionedUrlConfig({ coreApiVersion: "2.0" });

  it("Version: number only", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version: initial slash", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: `/${FAKE_ENDPOINT}`,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version: none", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: null,
    });
    expect(numberedUrl).toBe(`/2.0/${FAKE_ENDPOINT}`);
  });
  it("Endpoint: missing", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: "",
      metadataVersion: null,
    });
    expect(numberedUrl).toBe("/2.0/");
  });
});

describe("Test versionedUrl config, with overrides", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  const config = createCoreApiVersionedUrlConfig({
    coreApiVersion: "/2.0",
    overrides: {
      "9": "/",
      "11": "3.0",
    },
  });

  it("Version 10", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version 9", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 9,
    });
    expect(numberedUrl).toBe(`/9/${FAKE_ENDPOINT}`);
  });
  it("Version 11", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 11,
    });
    expect(numberedUrl).toBe(`/11/3.0/${FAKE_ENDPOINT}`);
  });
  it("Initial slash, version 10", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: `/${FAKE_ENDPOINT}`,
      metadataVersion: 10,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Initial slash, version 9", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: `/${FAKE_ENDPOINT}`,
      metadataVersion: 9,
    });
    expect(numberedUrl).toBe(`/9/${FAKE_ENDPOINT}`);
  });
  it("Initial slash,version 11", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: `/${FAKE_ENDPOINT}`,
      metadataVersion: 11,
    });
    expect(numberedUrl).toBe(`/11/3.0/${FAKE_ENDPOINT}`);
  });

  it("Version 10 locally overridden", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 10,
      apiVersion: "3.0",
    });
    expect(numberedUrl).toBe(`/10/3.0/${FAKE_ENDPOINT}`);
  });
  it("Version 9 locally overridden", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 9,
      apiVersion: "3.0",
    });
    expect(numberedUrl).toBe(`/9/3.0/${FAKE_ENDPOINT}`);
  });
  it("Version 11 locally overridden", () => {
    const numberedUrl = coreVersionedUrl(config, {
      endpoint: FAKE_ENDPOINT,
      metadataVersion: 11,
      apiVersion: "/",
    });
    expect(numberedUrl).toBe(`/11/${FAKE_ENDPOINT}`);
  });
});

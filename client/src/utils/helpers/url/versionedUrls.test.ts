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

import {
  CoreApiVersionedUrlHelper,
  getCoreVersionedUrl,
} from "./versionedUrls";

describe("Test versionedUrl", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";

  it("Version: number only", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "10",
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: initial slash", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/10",
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: none", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
    });
    expect(numberedUrl).toBe(`/${FAKE_ENDPOINT}`);
  });
  it("Endpoint: missing", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: "",
    });
    expect(numberedUrl).toBe("/");
  });
});

describe("Test versionedUrl helper, always latest", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  // const helper = new CoreApiVersionedUrlHelper({
  //   coreApiVersion: "/",
  // });

  it("Version: number only", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "10",
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: initial slash", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/10",
    });
    expect(numberedUrl).toBe(`/10/${FAKE_ENDPOINT}`);
  });
  it("Version: none", () => {
    const numberedUrl = getCoreVersionedUrl({ endpoint: FAKE_ENDPOINT });
    expect(numberedUrl).toBe(`/${FAKE_ENDPOINT}`);
  });
  it("Endpoint: missing", () => {
    const numberedUrl = getCoreVersionedUrl({ endpoint: "" });
    expect(numberedUrl).toBe("/");
  });
});

describe("Test versionedUrl helper, default, no overrides", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  // const helper = new CoreApiVersionedUrlHelper({
  //   coreApiVersion: "2.0",
  // });
  const coreApiVersion = "2.0";

  it("Version: number only", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "10",
      coreApiVersion,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version: initial slash", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/10",
      coreApiVersion,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version: none", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      coreApiVersion,
    });
    expect(numberedUrl).toBe(`/2.0/${FAKE_ENDPOINT}`);
  });
  it("Endpoint: missing", () => {
    const numberedUrl = getCoreVersionedUrl({ endpoint: "", coreApiVersion });
    expect(numberedUrl).toBe("/2.0/");
  });
});

describe("Test versionedUrl helper, default with overrides", () => {
  const FAKE_ENDPOINT = "renkuEntity.edit";
  // const helper = new CoreApiVersionedUrlHelper({
  //   coreApiVersion: "2.0",
  //   overrides: {
  //     "9": "/",
  //     "11": "/3.0",
  //   },
  // });
  const coreApiVersion = "2.0";
  const overrides = {
    "9": "/",
    "11": "/3.0",
  };

  it("Version 10", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "10",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version 9", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "9",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/9/${FAKE_ENDPOINT}`);
  });
  it("Version 11", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "11",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/11/3.0/${FAKE_ENDPOINT}`);
  });
  it("Version /10", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/10",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/10/2.0/${FAKE_ENDPOINT}`);
  });
  it("Version /9", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/9",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/9/${FAKE_ENDPOINT}`);
  });
  it("Version /11", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/11",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/11/3.0/${FAKE_ENDPOINT}`);
  });

  it("Version /10 locally overridden", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/10",
      apiVersionOverride: "3.0",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/10/3.0/${FAKE_ENDPOINT}`);
  });
  it("Version /9 locally overridden", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/9",
      apiVersionOverride: "3.0",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/9/3.0/${FAKE_ENDPOINT}`);
  });
  it("Version /11 locally overridden", () => {
    const numberedUrl = getCoreVersionedUrl({
      endpoint: FAKE_ENDPOINT,
      metadataVersion: "/11",
      apiVersionOverride: "/",
      coreApiVersion,
      overrides,
    });
    expect(numberedUrl).toBe(`/11/${FAKE_ENDPOINT}`);
  });
});

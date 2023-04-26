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
 *  Files.test.js
 *  Tests for file components.
 */

import {
  isCloudStorageBucketValid,
  isCloudStorageEndpointValid,
} from "./ObjectStoresConfig.present";

describe("storage bucket names", () => {
  it("validates good storage bucket names", () => {
    expect(isCloudStorageBucketValid({ bucket: "foo" })).toEqual(true);
    expect(isCloudStorageBucketValid({ bucket: "0foo" })).toEqual(true);
    expect(isCloudStorageBucketValid({ bucket: "foo.bar" })).toEqual(true);
    expect(isCloudStorageBucketValid({ bucket: "foo-bar" })).toEqual(true);
    expect(isCloudStorageBucketValid({ bucket: "foo0" })).toEqual(true);
  });
  it("validates bad storage bucket names", () => {
    expect(isCloudStorageBucketValid({ bucket: "a" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: ".foo" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: "-foo" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: "foo-" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: "Foo" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: "fooBar" })).toEqual(false);
    expect(isCloudStorageBucketValid({ bucket: "fo-O" })).toEqual(false);
  });
});

describe("storage endpoints", () => {
  it("validates good storage endpoints", () => {
    expect(isCloudStorageEndpointValid({ endpoint: "http://foo.com" })).toEqual(
      true
    );
    expect(
      isCloudStorageEndpointValid({ endpoint: "https://foo.com/bar" })
    ).toEqual(true);
  });
  it("validates bad storage endpoints", () => {
    expect(isCloudStorageEndpointValid({ endpoint: "a" })).toEqual(false);
    expect(isCloudStorageEndpointValid({ endpoint: "a/" })).toEqual(false);
    expect(isCloudStorageEndpointValid({ endpoint: "https://foo" })).toEqual(
      false
    );
  });
});

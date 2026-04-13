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
 *  utils.test.js
 *  test fo utilities
 */

import { describe, expect, it } from "vitest";

import {
  convertUnicodeToAscii,
  slugFromTitle,
} from "./helpers/HelperFunctions";
import { verifyTitleCharacters } from "./helpers/verifyTitleCharacters.utils";

describe("title related functions", () => {
  // convertUnicodeToAscii
  it("function convertUnicodeToAscii - valid strings", () => {
    expect(convertUnicodeToAscii("João")).toEqual("Joao"); // eslint-disable-line
    expect(convertUnicodeToAscii("здрасти")).toEqual("здрасти");
    expect(convertUnicodeToAscii("Zürich")).toEqual("Zuerich"); // eslint-disable-line
  });

  // slugFromTitle
  it("function slugFromTitle without parameters", () => {
    expect(slugFromTitle("This is my Project")).toEqual("This-is-my-Project");
  });
  it("slugFromTitle lowercase - remove accents", () => {
    expect(slugFromTitle("João", true)).toEqual("jo-o");
  });
  it("slugFromTitle lowercase - replaces any whitespace with hyphens", () => {
    expect(slugFromTitle("My Input String", true)).toEqual("my-input-string");
  });
  it("slugFromTitle lowercase - remove trailing whitespace", () => {
    expect(slugFromTitle(" a new project ", true)).toEqual("a-new-project");
  });
  it("slugFromTitle lowercase - remove only non-allowed special characters", () => {
    expect(slugFromTitle("test!_pro-ject~", true)).toEqual("test-pro-ject"); // eslint-disable-line
  });
  it("slugFromTitle lowercase - squash multiple hyphens", () => {
    expect(slugFromTitle("test!!!!_pro-ject~", true)).toEqual("test-pro-ject"); // eslint-disable-line
  });
  it("slugFromTitle lowercase - return empty string if only non-allowed characters", () => {
    expect(slugFromTitle("здрасти", true)).toEqual("");
  });
  it("slugFromTitle lowercase - squash multiple separators", () => {
    expect(slugFromTitle("Test:-)", true)).toEqual("test");
  });
  it("slugFromTitle lowercase - trim any separators from the beginning and end", () => {
    expect(slugFromTitle("-Test:-)-", true)).toEqual("test");
  });
  it("function slugFromTitle lowercase with custom separator", () => {
    expect(slugFromTitle("This is my Project", true, false, "+")).toEqual(
      "this+is+my+project"
    );
  });
  it("function slugFromTitle ascii", () => {
    expect(slugFromTitle("João-Mario", true, true)).toEqual("joao-mario"); // eslint-disable-line
    expect(slugFromTitle("João-._--Mario", true, true)).toEqual("joao-mario"); // eslint-disable-line
    expect(slugFromTitle("Zürich", true, true)).toEqual("zuerich"); // eslint-disable-line
    expect(slugFromTitle("здрасти", true, true)).toEqual("");
  });

  // verifyTitleCharacters
  it("function verifyTitleCharacters - valid strings", () => {
    expect(verifyTitleCharacters("João")).toBeTruthy();
    expect(verifyTitleCharacters("здрасти_.и")).toBeTruthy();
    expect(verifyTitleCharacters("")).toBeTruthy();
  });

  it("function verifyTitleCharacters - invalid strings", () => {
    expect(verifyTitleCharacters("Test:-)")).toBeFalsy();
    expect(verifyTitleCharacters("test!_pro-ject~")).toBeFalsy(); // eslint-disable-line
    expect(verifyTitleCharacters("yeah 🚀")).toBeFalsy();
  });
});

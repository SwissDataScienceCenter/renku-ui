/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest";

import {
  buildPoolMember,
  parseBatchInput,
} from "./addMemberToResourcePool.utils";

describe("parseBatchInput", () => {
  it("splits non-empty lines and trims whitespace for users", () => {
    expect(parseBatchInput("a@x.ch\n b@y.ch \n", "user")).toEqual([
      "a@x.ch",
      "b@y.ch",
    ]);
  });

  it("drops blank lines", () => {
    expect(parseBatchInput("a@x.ch\n\n  \nb@y.ch", "user")).toEqual([
      "a@x.ch",
      "b@y.ch",
    ]);
  });

  it("returns an empty list for blank input", () => {
    expect(parseBatchInput("", "user")).toEqual([]);
  });

  it("keeps every non-empty line for groups (no slash filter)", () => {
    expect(parseBatchInput("my-group\nno-slash-here", "group")).toEqual([
      "my-group",
      "no-slash-here",
    ]);
  });

  it("filters out project lines without a slash", () => {
    expect(parseBatchInput("ns/first\norphan\nns/second", "project")).toEqual([
      "ns/first",
      "ns/second",
    ]);
  });
});

describe("buildPoolMember", () => {
  it("maps user to viewer role", () => {
    expect(buildPoolMember("user", "u-1")).toEqual({
      member_type: "user",
      id: "u-1",
      role: "viewer",
    });
  });

  it("maps group to group_viewer role", () => {
    expect(buildPoolMember("group", "g-1")).toEqual({
      member_type: "group",
      id: "g-1",
      role: "group_viewer",
    });
  });

  it("maps project to project_viewer role", () => {
    expect(buildPoolMember("project", "p-1")).toEqual({
      member_type: "project",
      id: "p-1",
      role: "project_viewer",
    });
  });
});

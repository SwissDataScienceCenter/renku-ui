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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest";

import {
  buildDataConnectorBreadcrumbLevels,
  buildProjectBreadcrumbLevels,
  getNamespacePageUrl,
  parseProjectOwnedNamespace,
} from "./entityBreadcrumb.utils";

describe("parseProjectOwnedNamespace()", () => {
  it("splits a project-owned namespace into parent and project slug", () => {
    expect(parseProjectOwnedNamespace("user1-uuid/my-project")).toEqual({
      namespace: "user1-uuid",
      slug: "my-project",
    });
  });
});

describe("getNamespacePageUrl()", () => {
  it("builds the user page url", () => {
    expect(getNamespacePageUrl("user1-uuid", "user")).toBe("/u/user1-uuid");
  });

  it("builds the group page url", () => {
    expect(getNamespacePageUrl("test-2-group-v2", "group")).toBe(
      "/g/test-2-group-v2",
    );
  });

  it("returns undefined when the namespace kind is unknown", () => {
    expect(getNamespacePageUrl("user1-uuid")).toBeUndefined();
  });
});

describe("buildProjectBreadcrumbLevels()", () => {
  it("builds a user-owned project trail", () => {
    expect(
      buildProjectBreadcrumbLevels({
        namespace: "user1-uuid",
        namespaceKind: "user",
        namespaceName: "User One",
        slug: "my-project",
      }),
    ).toEqual([
      { type: "user", label: "User One", to: "/u/user1-uuid" },
      { type: "project", label: "my-project" },
    ]);
  });

  it("builds a group-owned project trail", () => {
    expect(
      buildProjectBreadcrumbLevels({
        namespace: "test-2-group-v2",
        namespaceKind: "group",
        namespaceName: "Example Group",
        slug: "my-project",
      }),
    ).toEqual([
      { type: "group", label: "Example Group", to: "/g/test-2-group-v2" },
      { type: "project", label: "my-project" },
    ]);
  });

  it("falls back to the namespace slug when the display name is missing", () => {
    expect(
      buildProjectBreadcrumbLevels({
        namespace: "user1-uuid",
        namespaceKind: "user",
        slug: "my-project",
      }),
    ).toEqual([
      { type: "user", label: "user1-uuid", to: "/u/user1-uuid" },
      { type: "project", label: "my-project" },
    ]);
  });

  it("omits the namespace link and icon when its kind could not be resolved", () => {
    expect(
      buildProjectBreadcrumbLevels({
        namespace: "test-2-group-v2",
        slug: "my-project",
      }),
    ).toEqual([
      { type: undefined, label: "test-2-group-v2", to: undefined },
      { type: "project", label: "my-project" },
    ]);
  });
});

describe("buildDataConnectorBreadcrumbLevels()", () => {
  it("builds a namespace-owned trail", () => {
    expect(
      buildDataConnectorBreadcrumbLevels({
        namespace: "user1-uuid",
        namespaceKind: "user",
        namespaceName: "User One",
        slug: "user-storage",
      }),
    ).toEqual([
      { type: "user", label: "User One", to: "/u/user1-uuid" },
      { type: "dataConnector", label: "user-storage" },
    ]);
  });

  it("builds a project-owned trail", () => {
    expect(
      buildDataConnectorBreadcrumbLevels({
        namespace: "user1-uuid/my-project",
        namespaceKind: "user",
        namespaceName: "User One",
        projectName: "My Project",
        slug: "project-storage",
      }),
    ).toEqual([
      { type: "user", label: "User One", to: "/u/user1-uuid" },
      { type: "project", label: "My Project", to: "/p/user1-uuid/my-project" },
      { type: "dataConnector", label: "project-storage" },
    ]);
  });

  it("builds a global trail with a source link", () => {
    expect(
      buildDataConnectorBreadcrumbLevels({
        slug: "doi-10.5281-zenodo.13896309",
        source: "zenodo.org",
        sourceUrl: "https://doi.org/10.5281/zenodo.13896309",
      }),
    ).toEqual([
      {
        type: "source",
        label: "zenodo.org",
        to: "https://doi.org/10.5281/zenodo.13896309",
      },
      { type: "dataConnector", label: "doi-10.5281-zenodo.13896309" },
    ]);
  });

  it("uses 'unknown' when a global connector has no source", () => {
    expect(buildDataConnectorBreadcrumbLevels({ slug: "global-dc" })).toEqual([
      { type: "source", label: "unknown" },
      { type: "dataConnector", label: "global-dc" },
    ]);
  });
});

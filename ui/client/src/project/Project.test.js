/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  Project.test.js
 *  Tests for project.
 */

import { describe, expect, it } from "vitest";

import { testClient as client } from "../api-client";
import { StateModel, globalSchema } from "../model";
import { mapProjectFeatures } from "./Project";
import { filterPaths } from "./Project.present";
import { ProjectCoordinator } from "./Project.state";

describe("test ProjectCoordinator related components", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(
    client,
    model.subModel("project")
  );
  const projectState = model.subModel("project").get();
  const projectStateKeys = Object.keys(projectState);

  it("test mapProjectFeatures function", () => {
    // mapping all
    let projectMappedState = mapProjectFeatures(projectCoordinator)(
      model.get()
    );
    expect(
      projectStateKeys.every((i) => Object.keys(projectMappedState).includes(i))
    ).toBeTruthy();
    expect(
      Object.keys(projectMappedState).every((i) => projectStateKeys.includes(i))
    ).toBeTruthy();

    // mapping only one component
    const projectStateKey = projectStateKeys.slice(0, 1);
    projectMappedState = mapProjectFeatures(
      projectCoordinator,
      projectStateKey
    )(model.get());
    expect(
      projectStateKeys.every((i) => Object.keys(projectMappedState).includes(i))
    ).toBeFalsy();
    expect(
      Object.keys(projectMappedState).every((i) => projectStateKeys.includes(i))
    ).toBeTruthy();

    // mapped component may include extra functions
    const projectCategory = "commits";
    const projectCategoryState = model.subModel("project").get(projectCategory);
    let projectCategoryMapped = mapProjectFeatures(projectCoordinator, [
      projectCategory,
    ])(model.get()).commits;
    expect(
      Object.keys(projectCategoryState).every((i) =>
        Object.keys(projectCategoryMapped).includes(i)
      )
    ).toBeTruthy();
    expect(
      Object.keys(projectCategoryMapped).every((i) =>
        Object.keys(projectCategoryState).includes(i)
      )
    ).toBeFalsy();

    // mapped to parent object -- useful to avoid collision when using in legacy components
    const parent = "parent";
    let projectCategoryParent = mapProjectFeatures(
      projectCoordinator,
      [projectCategory],
      parent
    )(model.get());
    expect(projectCategoryParent[projectCategory]).toBeUndefined();
    expect(projectCategoryParent[parent]).toBeTruthy();
    let descendantKeys = Object.keys(
      projectCategoryParent[parent][projectCategory]
    );
    expect(
      descendantKeys.every((i) =>
        Object.keys(projectCategoryMapped).includes(i)
      )
    ).toBeTruthy();
    expect(
      Object.keys(projectCategoryMapped).every((i) =>
        descendantKeys.includes(i)
      )
    ).toBeTruthy();
  });
});

describe("new project actions", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(
    client,
    model.subModel("project")
  );
  it("sets a core field", () => {
    expect(projectCoordinator.get("metadata.title")).toEqual("");
    projectCoordinator.set("metadata.title", "a title");
    expect(projectCoordinator.get("metadata.title")).toEqual("a title");
  });
  it("sets a visibility field", () => {
    expect(projectCoordinator.get("metadata.visibility")).toEqual("private");
    projectCoordinator.set("metadata.visibility", "public");
    expect(projectCoordinator.get("metadata.visibility")).toEqual("public");
  });
});

describe("project view actions", () => {
  it("retrieves a project from server", () => {
    const model = new StateModel(globalSchema);
    const projectCoordinator = new ProjectCoordinator(
      client,
      model.subModel("project")
    );
    // eslint-disable-next-line
    projectCoordinator.fetchProject(client, 1).then(() => {
      expect(projectCoordinator.get("metadata.title")).toEqual(
        "A-first-project"
      );
    });
  });
});

describe("path filtering", () => {
  const origPaths = [
    ".foo",
    ".renku",
    ".renku/foo",
    "foo.txt",
    "bar",
    "myFolder/.hidden",
    "myFolder/visible",
    "myFolder/.alsoHidden/readme.md",
    "myFolder/.alsoHidden/other.txt",
    "myFolder/alsoVisible/.hidden",
    "myFolder/alsoVisible/readme.md",
    "myFolder/alsoVisible/other.txt",
  ];
  it(`filters the default blacklist [/^..*/, \\..*/]`, () => {
    const blacklist = [/^\..*/, /\/\..*/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual([
      "foo.txt",
      "bar",
      "myFolder/visible",
      "myFolder/alsoVisible/readme.md",
      "myFolder/alsoVisible/other.txt",
    ]);
  });

  it(`filters the another blacklist [/^..*/, /readme.md/]`, () => {
    const blacklist = [/^\..*/, /readme.md/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual([
      "foo.txt",
      "bar",
      "myFolder/.hidden",
      "myFolder/visible",
      "myFolder/.alsoHidden/other.txt",
      "myFolder/alsoVisible/.hidden",
      "myFolder/alsoVisible/other.txt",
    ]);
  });
});

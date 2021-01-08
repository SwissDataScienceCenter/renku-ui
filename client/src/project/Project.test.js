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

import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";

import { StateKind, StateModel, globalSchema } from "../model";
import Project, { mapProjectFeatures, withProjectMapped } from "./Project";
import { filterPaths } from "./Project.present";
import { OverviewCommitsBody } from "./overview/ProjectOverview.present";
import { ProjectModel, ProjectCoordinator } from "./Project.state";
import { testClient as client } from "../api-client";
import { generateFakeUser } from "../user/User.test";


const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1"
});

describe("test ProjectCoordinator related components", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(client, model.subModel("project"));
  const projectState = model.subModel("project").get();
  const projectStateKeys = Object.keys(projectState);

  it("test mapProjectFeatures function", () => {
    // mapping all
    let projectMappedState = mapProjectFeatures(projectCoordinator)(model.get());
    expect(projectStateKeys.every(i => Object.keys(projectMappedState).includes(i))).toBeTruthy();
    expect(Object.keys(projectMappedState).every(i => projectStateKeys.includes(i))).toBeTruthy();

    // mapping only one component
    const projectStateKey = projectStateKeys.slice(0, 1);
    projectMappedState = mapProjectFeatures(projectCoordinator, projectStateKey)(model.get());
    expect(projectStateKeys.every(i => Object.keys(projectMappedState).includes(i))).toBeFalsy();
    expect(Object.keys(projectMappedState).every(i => projectStateKeys.includes(i))).toBeTruthy();

    // mapped component may include extra functions
    const projectCategory = "commits";
    const projectCategoryState = model.subModel("project").get(projectCategory);
    let projectCategoryMapped = mapProjectFeatures(projectCoordinator, [projectCategory])(model.get()).commits;
    expect(Object.keys(projectCategoryState).every(i => Object.keys(projectCategoryMapped).includes(i))).toBeTruthy();
    expect(Object.keys(projectCategoryMapped).every(i => Object.keys(projectCategoryState).includes(i))).toBeFalsy();

    // mapped to parent object -- useful to avoid collision when using in legacy components
    const parent = "parent";
    let projectCategoryParent = mapProjectFeatures(projectCoordinator, [projectCategory], parent)(model.get());
    expect(projectCategoryParent[projectCategory]).toBeUndefined();
    expect(projectCategoryParent[parent]).toBeTruthy();
    let descendantKeys = Object.keys(projectCategoryParent[parent][projectCategory]);
    expect(descendantKeys.every(i => Object.keys(projectCategoryMapped).includes(i))).toBeTruthy();
    expect(Object.keys(projectCategoryMapped).every(i => descendantKeys.includes(i))).toBeTruthy();
  });

  it("test withProjectMapped higher order function", () => {
    const div = document.createElement("div");
    const categories = ["commits", "metadata"];
    const CommitsConnected = withProjectMapped(OverviewCommitsBody, categories);

    ReactDOM.render(
      <MemoryRouter>
        <CommitsConnected
          history={fakeHistory}
          location={fakeHistory.location}
          projectCoordinator={projectCoordinator} />
      </MemoryRouter>
      , div);
  });
});

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const model = new StateModel(globalSchema);

  it("renders list without crashing for anonymous user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <Project.List
          client={client}
          model={model}
          store={model.reduxStore}
          user={anonymousUser}
          history={fakeHistory}
          location={fakeHistory.location} />
      </MemoryRouter>
      , div);
  });
  it("renders list without crashing for logged user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <Project.List
          client={client}
          model={model}
          history={fakeHistory}
          user={loggedUser}
          location={fakeHistory.location} />
      </MemoryRouter>
      , div);
  });
  it("renders view without crashing for anonymous user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <Project.View
          id="1"
          client={client}
          user={anonymousUser}
          model={model}
          history={fakeHistory}
          location={fakeHistory.location}
          match={{ params: { id: "1" }, url: "/projects/1/" }} />
      </MemoryRouter>
      , div);
  });
  it("renders view without crashing for logged user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <Project.View
          id="1"
          client={client}
          model={model}
          history={fakeHistory}
          user={loggedUser}
          match={{ params: { id: "1" }, url: "/projects/1/" }} />
      </MemoryRouter>
      , div);
  });
});

describe("new project actions", () => {
  const model = new ProjectModel(StateKind.REDUX);
  it("sets a core field", () => {
    expect(model.get("core.title")).toEqual("no title");
    model.set("core.title", "a title");
    expect(model.get("core.title")).toEqual("a title");
  });
  it("sets a visibility field", () => {
    expect(model.get("visibility.level")).toEqual("private");
    model.set("visibility.level", "public");
    expect(model.get("visibility.level")).toEqual("public");
  });
});

describe("project view actions", () => {
  it("retrieves a project from server", () => {
    const model = new ProjectModel(StateKind.REDUX);
    // eslint-disable-next-line
    model.fetchProject(client, 1).then(() => {
      expect(model.get("core.title")).toEqual("A-first-project");
    });
  });
});

describe("path filtering", () => {
  const origPaths = [".foo", ".renku", ".renku/foo", "foo.txt", "bar",
    "myFolder/.hidden", "myFolder/visible",
    "myFolder/.alsoHidden/readme.md", "myFolder/.alsoHidden/other.txt",
    "myFolder/alsoVisible/.hidden", "myFolder/alsoVisible/readme.md", "myFolder/alsoVisible/other.txt",
  ];
  it(`filters the default blacklist [/^..*/, \\..*/]`, () => {
    const blacklist = [/^\..*/, /\/\..*/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual([
      "foo.txt", "bar", "myFolder/visible", "myFolder/alsoVisible/readme.md", "myFolder/alsoVisible/other.txt"
    ]);
  });

  it(`filters the another blacklist [/^..*/, /readme.md/]`, () => {
    const blacklist = [/^\..*/, /readme.md/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual(["foo.txt", "bar", "myFolder/.hidden", "myFolder/visible",
      "myFolder/.alsoHidden/other.txt",
      "myFolder/alsoVisible/.hidden", "myFolder/alsoVisible/other.txt"]);
  });
});

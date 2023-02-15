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
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";

import { StateModel, globalSchema } from "../model";
import Project, { mapProjectFeatures, withProjectMapped } from "./Project";
import { filterPaths } from "./Project.present";
import { OverviewCommitsBody } from "./overview/ProjectOverview.present";
import { ProjectCoordinator } from "./Project.state";
import { ACCESS_LEVELS, testClient as client } from "../api-client";
import { generateFakeUser } from "../user/User.test";
import ProjectVersionStatus from "./status/ProjectVersionStatus.present";


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

  it("test withProjectMapped higher order function", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const categories = ["commits", "metadata"];
    const CommitsConnected = withProjectMapped(OverviewCommitsBody, categories);

    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <MemoryRouter>
            <CommitsConnected
              history={fakeHistory}
              location={fakeHistory.location}
              projectCoordinator={projectCoordinator} />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const model = new StateModel(globalSchema);

  it("renders view without crashing for anonymous user", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
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
        </Provider>
      );
    });
  });

  it("renders view without crashing for logged user", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <MemoryRouter>
            <Project.View
              id="1"
              client={client}
              model={model}
              history={fakeHistory}
              user={loggedUser}
              location={fakeHistory.location}
              match={{ params: { id: "1" }, url: "/projects/1/" }} />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});

describe("new project actions", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(client, model.subModel("project"));
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
    const projectCoordinator = new ProjectCoordinator(client, model.subModel("project"));
    // eslint-disable-next-line
    projectCoordinator.fetchProject(client, 1).then(() => {
      expect(projectCoordinator.get("metadata.title")).toEqual("A-first-project");
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

describe("rendering ProjectVersionStatus", () => {
  const props = {
    launchNotebookUrl: "http://renku.url/project/namespace/sessions/new",
    loading: false,
    metadata: { accessLevel: ACCESS_LEVELS.MAINTAINER, defaultBranch: "master", id: 12345 },
    migration: { check: {}, core: {} },
    onMigrationProject: () => {},
    user: { logged: true },
  };

  it("shows bouncer if loading", async () => {
    const allProps = { ...props };
    allProps.loading = true;
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);

    await act(async () => {
      root.render(<ProjectVersionStatus key="suggestions" {...allProps} />);
    });


    expect(div.children.length).toBe(2);
    const bouncers = div.querySelectorAll(".bouncer");
    expect(bouncers.length).toBe(2);
  });

  it("shows success if everything is ok", async () => {
    // This fails with SyntaxError: '##btn_instructions_template' is not a valid selector
    // but it works in the browser, and I do not know why
    const allProps = { ...props };
    allProps.migration = {
      check: {
        "project_supported": true,
        "dockerfile_renku_status": {
          "latest_renku_version": "1.0.0",
          "dockerfile_renku_version": "1.0.0",
          "automated_dockerfile_update": false,
          "newer_renku_available": false
        },
        "core_compatibility_status": {
          "project_metadata_version": "9",
          "migration_required": false,
          "current_metadata_version": "9"
        },
        "core_renku_version": "1.0.0",
        "project_renku_version": "1.0.0",
        "template_status": {
          "newer_template_available": false,
          "template_id": "python-minimal",
          "automated_template_update": false,
          "template_ref": null,
          "project_template_version": "1.0.0",
          "template_source": "renku",
          "latest_template_version": "1.0.0"
        }
      },
      core: {
        backendAvailable: true
      }
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProjectVersionStatus key="suggestions" {...allProps} />
        </MemoryRouter>
      );
    });
    expect(div.children.length).toBe(2);

    const bouncers = div.querySelectorAll(".bouncer");
    expect(bouncers.length).toBe(0);

    const success = div.querySelectorAll(".alert-success");
    expect(success.length).toBe(2);
  });

});

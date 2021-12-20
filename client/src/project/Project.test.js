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
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import TestRenderer, { act } from "react-test-renderer";
import { createMemoryHistory } from "history";

import { StateModel, globalSchema, projectSchema, SpecialPropVal } from "../model";
import Project, { mapProjectFeatures, withProjectMapped } from "./Project";
import { filterPaths } from "./Project.present";
import { OverviewCommitsBody } from "./overview/ProjectOverview.present";
import { ProjectCoordinator } from "./Project.state";
import { ACCESS_LEVELS, testClient as client } from "../api-client";
import { generateFakeUser } from "../user/User.test";
import { ProjectSuggestActions } from "./Project.present";
import ProjectVersionStatus from "./status/ProjectVersionStatus.present";
import { sleep } from "../utils/HelperFunctions";


const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1"
});

const getProjectSuggestionProps = (props, loading = true, commits = [], readmeCommits = [], datasets = []) => {
  props.projectCoordinator.get = (ref) => {
    switch (ref) {
      case "commitsReadme":
        return {
          fetching: true,
          fetched: !loading,
          list: readmeCommits,
        };
      case "commits":
        return {
          fetching: true,
          fetched: !loading,
          list: commits,
        };
      case "datasets.core":
        return loading ? SpecialPropVal.UPDATING : { datasets: datasets };
    }
    return {};
  };
  props.projectCoordinator.fetchReadmeCommits = () => readmeCommits;
  props.externalUrl = "/gitlab/";
  props.newDatasetUrl = "new-dataset-url";

  return props;
};

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
      <Provider store={model.reduxStore}>
        <MemoryRouter>
          <CommitsConnected
            history={fakeHistory}
            location={fakeHistory.location}
            projectCoordinator={projectCoordinator} />
        </MemoryRouter>
      </Provider>
      , div);
  });
});

describe("rendering", () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const model = new StateModel(globalSchema);

  it("renders view without crashing for anonymous user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
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
      , div);
  });
  it("renders view without crashing for logged user", () => {
    const div = document.createElement("div");
    ReactDOM.render(
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
      , div);
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

describe("rendering ProjectSuggestActions", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(client, model.subModel("project"));

  const props = {
    ...projectSchema,
    projectCoordinator,
    model: {},
    fetchDatasets: () => {},
    metadata: { accessLevel: ACCESS_LEVELS.MAINTAINER, defaultBranch: "master" }
  };

  it("Don't render if is loading data", () => {
    const allProps = getProjectSuggestionProps(props, true);
    const component = TestRenderer.create(
      <ProjectSuggestActions key="suggestions" {...allProps} />,
    );
    expect(component.toJSON()).toBe(null);
  });

  it("Don't render if user is not a project maintainer", () => {
    const allProps = getProjectSuggestionProps(props, true);
    allProps.metadata.accessLevel = ACCESS_LEVELS.GUEST;
    const component = TestRenderer.create(
      <ProjectSuggestActions key="suggestions" {...allProps} />,
    );
    expect(component.toJSON()).toBe(null);
    allProps.metadata.accessLevel = ACCESS_LEVELS.MAINTAINER;
  });

  it("only render readme suggestion when exist datasets", async () => {
    const exampleCommit = [{ id: "abc", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(props, false, exampleCommit, exampleCommit, [{}]);
    let rendered;
    act(() => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectSuggestActions key="suggestions" {...allProps} />
        </MemoryRouter>,
      );
    });
    await sleep(0);
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({ className: "suggestionTitle" });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0]?.children[0]).toBe("Edit README.md");
  });

  it("only render dataset suggestion when exist more that 1 commit in readme", async () => {
    const exampleCommits = [{ id: "abc", committed_date: "2021-01-01" }, { id: "def", committed_date: "2021-01-02" }];
    const allProps = getProjectSuggestionProps(props, false, exampleCommits, exampleCommits, []);
    let rendered;
    act(() => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectSuggestActions key="suggestions" {...allProps} />
        </MemoryRouter>,
      );
    });
    await sleep(0);
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({ className: "suggestionTitle" });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0]?.children[0]).toBe("Add some datasets");
  });

  it("render all suggestion when exist only that 1 readme commit and no datasets", async () => {
    const exampleCommit = [{ id: "abc", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(props, false, exampleCommit, exampleCommit, []);
    let rendered;
    act(() => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectSuggestActions key="suggestions" {...allProps} />
        </MemoryRouter>,
      );
    });
    await sleep(0);
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({ className: "suggestionTitle" });
    expect(suggestions.length).toBe(2);
    expect(suggestions[0]?.children[0]).toBe("Edit README.md");
    expect(suggestions[1]?.children[0]).toBe("Add some datasets");
  });

  it("no render all suggestion when exist more than 4 commits", async () => {
    const exampleCommits = [
      { id: "abc1", committed_date: "2021-01-01" },
      { id: "abc2", committed_date: "2021-01-02" },
      { id: "abc3", committed_date: "2021-01-03" },
      { id: "abc4", committed_date: "2021-01-04" },
      { id: "abc5", committed_date: "2021-01-05" }];
    const exampleReadmeCommit = [{ id: "abc1", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(props, false, exampleCommits, exampleReadmeCommit, []);
    let rendered;
    act(() => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectSuggestActions key="suggestions" {...allProps} />
        </MemoryRouter>,
      );
    });
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({ className: "suggestionTitle" });
    expect(suggestions.length).toBe(0);
  });
});

describe("rendering ProjectVersionStatus", () => {
  const props = {
    launchNotebookUrl: "http://renku.url/project/namespace/sessions/new",
    loading: false,
    metadata: { accessLevel: ACCESS_LEVELS.MAINTAINER, defaultBranch: "master" },
    migration: { check: {} },
    onMigrationProject: () => {},
    user: { logged: true },
  };

  it("does not render if is user not logged in", () => {
    const allProps = { ...props };
    allProps.user.logged = false;
    const component = TestRenderer.create(
      <ProjectVersionStatus key="versionStatus" {...allProps} />
    );
    expect(component.toJSON()).toBe(null);
    allProps.user.logged = true;
  });

  it("shows bouncer if loading", () => {
    const allProps = { ...props };
    allProps.loading = true;
    const div = document.createElement("div");

    ReactDOM.render(
      <ProjectVersionStatus key="suggestions" {...allProps} />
      , div);

    expect(div.children.length).toBe(3);
    const bouncers = div.querySelectorAll(".bouncer");
    expect(bouncers.length).toBe(3);
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
      }
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <MemoryRouter>
        <ProjectVersionStatus key="suggestions" {...allProps} />
      </MemoryRouter>
      , div);
    expect(div.children.length).toBe(3);

    const bouncers = div.querySelectorAll(".bouncer");
    expect(bouncers.length).toBe(0);

    const success = div.querySelectorAll(".alert-success");
    expect(success.length).toBe(3);
  });

});

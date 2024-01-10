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

/**
 *  incubator-renku-ui
 *
 *  ProjectSuggestionActions.test.js
 *  Tests for project Suggestion Actions.
 */
import { MemoryRouter } from "react-router-dom";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it } from "vitest";

import { ACCESS_LEVELS, testClient as client } from "../api-client";
import { StateModel, globalSchema, projectSchema } from "../model";
import {
  ProjectSuggestActions,
  ProjectSuggestionDataset,
  ProjectSuggestionReadme,
} from "./Project.present";
import { ProjectCoordinator } from "./Project.state";

const getProjectSuggestionProps = (
  props,
  loading = true,
  commits = [],
  commitsReadme = [],
  datasets = [{}]
) => {
  props.fetchReadmeCommits = () => commitsReadme;
  if (commits)
    props.commits = { fetched: true, fetching: !loading, list: commits };
  if (commitsReadme)
    props.commitsReadme = {
      fetched: true,
      fetching: !loading,
      list: commitsReadme,
    };
  props.datasets.core.datasets = datasets;
  props.externalUrl = "/gitlab/";
  props.newDatasetUrl = "new-dataset-url";
  props.lockStatus = { locked: false };
  if (loading) props.datasets.core.datasets = null;

  return props;
};
describe("rendering ProjectSuggestActions", () => {
  const model = new StateModel(globalSchema);
  const projectCoordinator = new ProjectCoordinator(
    client,
    model.subModel("project")
  );

  const props = {
    ...projectSchema.createInitialized(),
    projectCoordinator,
    model: {},
    fetchDatasets: () => {
      // eslint-disable-line @typescript-eslint/ban-types
    },
    metadata: {
      accessLevel: ACCESS_LEVELS.MAINTAINER,
      defaultBranch: "master",
      id: 12345,
    },
  };

  it("Don't render if is loading data", async () => {
    const allProps = getProjectSuggestionProps(props, true);
    const component = TestRenderer.create(
      <ProjectSuggestActions key="suggestions" {...allProps} />
    );
    expect(component.toJSON()).toBe(null);
  });

  it("Don't render if user is not a project maintainer", async () => {
    const allProps = getProjectSuggestionProps(props, false);
    allProps.metadata.accessLevel = ACCESS_LEVELS.GUEST;
    const component = TestRenderer.create(
      <ProjectSuggestActions key="suggestions" {...allProps} />
    );
    expect(component.toJSON()).toBe(null);
    allProps.metadata.accessLevel = ACCESS_LEVELS.MAINTAINER;
  });

  it("only render readme suggestion when exist datasets", async () => {
    const exampleCommit = [{ id: "abc", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(
      props,
      false,
      exampleCommit,
      exampleCommit,
      [{}]
    );
    let rendered;
    // ProjectSuggestActions does not play well with js dom because of the transition -- use the underlying components
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <>
            <ProjectSuggestionReadme {...allProps} />
            <ProjectSuggestionDataset {...allProps} />
          </>
        </MemoryRouter>
      );
    });
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({
      className: "suggestionTitle",
    });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0]?.children[0]).toBe("Edit README.md");
  });

  it("only render dataset suggestion when exist more that 1 commit in readme", async () => {
    const exampleCommits = [
      { id: "abc", committed_date: "2021-01-01" },
      { id: "def", committed_date: "2021-01-02" },
    ];
    const allProps = getProjectSuggestionProps(
      props,
      false,
      exampleCommits,
      exampleCommits,
      []
    );
    let rendered;
    // ProjectSuggestActions does not play well with js dom because of the transition -- use the underlying components
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <>
            <ProjectSuggestionReadme {...allProps} />
            <ProjectSuggestionDataset {...allProps} />
          </>
        </MemoryRouter>
      );
    });
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({
      className: "suggestionTitle",
    });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0]?.children[0]).toBe("Add some datasets");
  });

  it("render all suggestion when exist only that 1 readme commit and no datasets", async () => {
    const exampleCommit = [{ id: "abc", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(
      props,
      false,
      exampleCommit,
      exampleCommit,
      []
    );
    allProps.commits = { list: exampleCommit, fetched: true };
    allProps.commitsReadme = { list: exampleCommit, fetched: true };
    let rendered;
    // ProjectSuggestActions does not play well with js dom because of the transition -- use the underlying components
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <>
            <ProjectSuggestionReadme {...allProps} />
            <ProjectSuggestionDataset {...allProps} />
          </>
        </MemoryRouter>
      );
    });
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({
      className: "suggestionTitle",
    });
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
      { id: "abc5", committed_date: "2021-01-05" },
    ];
    const exampleReadmeCommit = [{ id: "abc1", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(
      props,
      false,
      exampleCommits,
      exampleReadmeCommit,
      []
    );
    allProps.commits = { list: exampleCommits, fetched: true };
    allProps.commitsReadme = { list: exampleReadmeCommit, fetched: true };
    let rendered;
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectSuggestActions key="suggestions" {...allProps} />
        </MemoryRouter>
      );
    });
    const testInstance = rendered.root;
    const suggestions = testInstance.findAllByProps({
      className: "suggestionTitle",
    });
    expect(suggestions.length).toBe(0);
  });

  it("Don't render if the project is locked", () => {
    const exampleCommit = [{ id: "abc", committed_date: "2021-01-01" }];
    const allProps = getProjectSuggestionProps(
      props,
      false,
      exampleCommit,
      exampleCommit,
      []
    );
    allProps.commits = { list: exampleCommit, fetched: true };
    allProps.commitsReadme = { list: exampleCommit, fetched: true };
    allProps.lockStatus.locked = true;
    const component = TestRenderer.create(
      <ProjectSuggestActions key="suggestions" {...allProps} />
    );
    expect(component.toJSON()).toBe(null);
  });
});

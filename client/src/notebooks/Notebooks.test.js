/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 * Tests for the session components
 */

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import {
  CheckNotebookStatus, Notebooks, NotebooksDisabled, NotebooksHelper, ShowSession, StartNotebookServer
} from "./index";
import { mergeEnumOptions } from "./Notebooks.present";
import { ExpectedAnnotations } from "./Notebooks.state";
import { StateModel, globalSchema } from "../model";
import { ProjectCoordinator } from "../project";
import { testClient as client } from "../api-client";


const model = new StateModel(globalSchema);

const simplifiedGlobalOptions = {
  default_url: {
    default: "/lab",
    options: ["/lab", "/rstudio"],
    type: "enum"
  },
  cpu_request: {
    default: 1,
    options: [0.5, 1, 2],
    type: "enum"
  },
  mem_request: {
    default: "1G",
    options: ["1G", "2G"],
    type: "enum"
  },
  lfs_auto_fetch: {
    default: false,
    type: "boolean"
  },
  gpu_request: {
    default: 0,
    type: "int"
  }
};

describe("notebook status", () => {
  const servers = [{
    "status": {
      "message": null,
      "phase": "Running",
      "ready": true,
      "reason": null,
      "step": "Ready"
    },
    "expected": "running"
  }, {
    "status": {
      "message": "containers with unready status: [notebook]",
      "phase": "Pending",
      "ready": false,
      "reason": "ContainersNotReady",
      "step": "ContainersReady"
    },
    "expected": "pending"
  }];

  it("computed vs expected", () => {
    for (let server of servers) {
      expect(NotebooksHelper.getStatus(server)).toBe(server.expected);
      expect(NotebooksHelper.getStatus(server.status)).toBe(server.expected);
    }
  });
});

describe("notebook server clean annotation", () => {
  const domain = ExpectedAnnotations.domain;
  const baseAnnotations = ExpectedAnnotations[domain].default;
  it("renku.io default", () => {
    const fakeAnswer = {};
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(fakeAnswer, domain);
    const expectedAnnotations = { ...baseAnnotations };
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations));
  });
  it("renku.io mixed", () => {
    const namespace = "myCoolNamespace";
    const branch = "anotherBranch";
    const projectName = "funkyProject";
    const repository = `https://fake.repo/${namespace}/${projectName}`;
    const defaultImageUsedText = "True";
    const defaultImageUsedBool = true;

    const fakeAnswer = {
      [`${domain}/namespace`]: namespace,
      [`${domain}/branch`]: branch,
      [`${domain}/projectName`]: projectName,
      [`${domain}/repository`]: repository,
      [`${domain}/default_image_used`]: defaultImageUsedText,
    };
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(fakeAnswer, domain);
    const expectedAnnotations = {
      ...baseAnnotations, namespace, branch, projectName, repository, default_image_used: defaultImageUsedBool
    };
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations));
  });
});

describe("parse project level session options", () => {
  it("valid content", () => {
    const content = `
      [interactive]
      defaultUrl = /tree
      mem_request = 2
      lfs_auto_fetch = True
    `;
    const parsedContent = NotebooksHelper.parseProjectOptions(content);

    // check keys
    expect(Object.keys(parsedContent).length).toBe(3);
    expect(Object.keys(parsedContent)).toContain("lfs_auto_fetch");
    expect(Object.keys(parsedContent)).toContain("mem_request");
    expect(Object.keys(parsedContent)).toContain("default_url");
    expect(Object.keys(parsedContent)).not.toContain("defaultUrl");

    // check values
    expect(parsedContent.default_url).toBe("/tree");
    expect(parsedContent.mem_request).not.toBe("2");
    expect(parsedContent.mem_request).toBe(2);
    expect(parsedContent.lfs_auto_fetch).not.toBe("True");
    expect(parsedContent.lfs_auto_fetch).not.toBe("true");
    expect(parsedContent.lfs_auto_fetch).toBe(true);
  });

  it("invalid content", () => {
    let content = `
      [nonRenku]
      default_url = /tree`;
    let parsedContent = NotebooksHelper.parseProjectOptions(content);
    expect(Object.keys(parsedContent).length).toBe(0);

    content = `
      [renku "anything"]
      default_url = /tree`;
    parsedContent = NotebooksHelper.parseProjectOptions(content);
    expect(Object.keys(parsedContent).length).toBe(0);

    const contents = ["just invalid text", true, 1, null];
    contents.forEach(content => {
      const noContent = NotebooksHelper.parseProjectOptions(content);
      expect(Object.keys(noContent).length).toBe(0);
    });
  });
});

describe("verify project level options validity according to deployment global options", () => {
  it("valid options", () => {
    const testValues = [
      { option: "default_url", value: "/lab", result: true },
      { option: "default_url", value: "anyString", result: true },
      { option: "default_url", value: "", result: true },
      { option: "default_url", value: 12345, result: false },
      { option: "default_url", value: true, result: false },
      { option: "cpu_request", value: 1, result: true },
      { option: "cpu_request", value: 2, result: true },
      { option: "cpu_request", value: 10, result: false },
      { option: "cpu_request", value: "1", result: false },
      { option: "cpu_request", value: true, result: false },
      { option: "lfs_auto_fetch", value: false, result: true },
      { option: "lfs_auto_fetch", value: true, result: true },
      { option: "lfs_auto_fetch", value: "true", result: false },
      { option: "lfs_auto_fetch", value: "abc", result: false },
      { option: "lfs_auto_fetch", value: 1, result: false },
      { option: "gpu_request", value: 1, result: true },
      { option: "gpu_request", value: 2, result: true },
      { option: "gpu_request", value: 10, result: true },
      { option: "gpu_request", value: "1", result: false },
      { option: "gpu_request", value: true, result: false },
    ];

    testValues.forEach(testSet => {
      const result = NotebooksHelper.checkOptionValidity(
        simplifiedGlobalOptions, testSet.option, testSet.value);
      expect(result).toBe(testSet.result);
    });
  });
});

describe("verify project settings validity", () => {
  it("valid settings", () => {
    const SETTINGS = [
      { valid: false, text: { object: "notValid" } },
      { valid: false, text: false },
      { valid: false, text: "random" },
      { valid: false, text: "" },
      { valid: true, text: "image" },
    ];
    const VALUES = [
      { valid: false, text: { object: "notValid" } },
      { valid: false, text: true },
      { valid: false, text: "" },
      { valid: true, text: "url" },
      { valid: true, text: "any string would work, this may be improved" },
    ];

    // only a combination of valid setting name and setting value return true
    for (const setting of SETTINGS) {
      for (const value of VALUES) {
        const test = NotebooksHelper.checkSettingValidity(setting.text, value.text);
        expect(test).toEqual(setting.valid && value.valid);
      }
    }
  });
});

describe("verify project/global options merging", () => {
  it("merges options", () => {
    const projectOptionsIni = `
      [interactive]
      default_url = /tree
      cpu_request = 4
      mem_request = 8G
      lfs_auto_fetch = True
    `;
    const projectOptions = NotebooksHelper.parseProjectOptions(projectOptionsIni);

    const testValues = [
      { option: "default_url", value: ["/lab", "/rstudio", "/tree"] },
      { option: "cpu_request", value: [0.5, 1, 2] },
      { option: "mem_request", value: ["1G", "2G"] },
    ];

    testValues.forEach(v => {
      const result = mergeEnumOptions(simplifiedGlobalOptions, projectOptions, v["option"]);
      expect(result).toEqual(v.value);
    });
  });
});

describe("verify defaults", () => {
  it("get defaults", () => {
    const projectOptions = {
      "config": {
        "interactive.default_url": "/lab",
        "interactive.fake": "test value",
        "interactive.mem_request": "2G",
        "interactive.cpu_request": "2",
        "renku.lfs_threshold": "100 kb"
      },
      "default": {
        "interactive.default_url": "/lab",
        "renku.lfs_threshold": "100 kb"
      }
    };
    const projectDefaults = NotebooksHelper.getProjectDefault(simplifiedGlobalOptions, projectOptions);

    // Correct overwriting
    expect(projectDefaults.defaults.global["mem_request"])
      .not.toBe(projectOptions.config["interactive.mem_request"]);
    expect(projectDefaults.defaults.global["mem_request"])
      .toBe(simplifiedGlobalOptions["mem_request"].default);
    expect(projectDefaults.defaults.project["mem_request"])
      .toBe(projectOptions.config["interactive.mem_request"]);

    expect(projectDefaults.defaults.global["default_url"])
      .toBe(projectDefaults.defaults.project["default_url"]);
    expect(projectDefaults.defaults.global["default_url"])
      .toBe(simplifiedGlobalOptions["default_url"].default);
    expect(projectDefaults.defaults.project["default_url"])
      .toBe(projectOptions.config["interactive.default_url"]);

    // No leaks of project-only values to default values
    expect(projectDefaults.defaults.project).toHaveProperty("fake");
    expect(projectDefaults.defaults.global).not.toHaveProperty("fake");

    // No leaks of non-sessions options
    expect(projectDefaults.defaults.project).not.toHaveProperty("renku.lfs_threshold");
    expect(projectDefaults.defaults.project).not.toHaveProperty("lfs_threshold");

    // No leaks of prefix
    expect(projectDefaults.defaults.project).toHaveProperty("default_url");
    expect(projectDefaults.defaults.project).not.toHaveProperty("interactive.default_url");
  });
});

describe("rendering", () => {
  const scope = {
    namespace: "fake",
    project: "fake",
    branch: { name: "master" }
  };
  const fakeLocation = { pathname: "" };

  it("renders NotebooksDisabled", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <NotebooksDisabled location={fakeLocation} />
      </MemoryRouter>, div);
  });

  it("renders ShowSession", async () => {
    const props = {
      client,
      model,
      match: { params: { server: "server-session-fake-name" } }
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <ShowSession {...props} urlNewSession="new_session"/>
        </MemoryRouter>, div);
    });
  });

  it("renders Notebooks", async () => {
    const props = {
      client,
      model
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <Notebooks {...props} standalone={true} urlNewSession="new_session"/>
        </MemoryRouter>, div);
    });
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <Notebooks {...props} standalone={false} urlNewSession="new_session"/>
        </MemoryRouter>, div);
    });
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <Notebooks {...props} standalone={true} scope={scope} urlNewSession="new_session"/>
        </MemoryRouter>, div);
    });
  });

  it("renders StartNotebookServer without crashing", async () => {
    const projectCoordinator = new ProjectCoordinator(client, model.subModel("project"));
    await act(async () => {
      await projectCoordinator.fetchProject(client, "test");
      await projectCoordinator.fetchCommits();
    });
    const props = {
      client,
      model,
      project: projectCoordinator.get(),
      notebooks: model.get("notebooks"),
      user: { logged: true, data: { username: "test" } },
      branches: [],
      autosaved: [],
      location: fakeLocation,
      refreshBranches: () => { },
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <StartNotebookServer {...props} />
        </MemoryRouter>, div);
    });
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <StartNotebookServer {...props} scope={scope} />
        </MemoryRouter>, div);
    });
  });

  it("renders CheckNotebookStatus", async () => {
    const props = {
      client,
      model,
      scope,
      launchNotebookUrl: "/projects/abc/def/launchNotebook",
      filePath: "notebook.ipynb"
    };

    const div = document.createElement("div");
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <CheckNotebookStatus {...props} />
        </MemoryRouter>, div);
    });
  });
});

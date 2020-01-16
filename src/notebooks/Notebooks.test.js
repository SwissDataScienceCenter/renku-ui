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
 * Tests for the interactive environment components
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import { NotebooksHelper, Notebooks, StartNotebookServer, CheckNotebookStatus } from './index';
import { ExpectedAnnotations } from './Notebooks.state';
import { StateModel, globalSchema } from '../model'
import { testClient as client } from '../api-client'


const model = new StateModel(globalSchema);

describe('notebook status', () => {
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

  it('computed vs expected', () => {
    for (let server of servers) {
      expect(NotebooksHelper.getStatus(server)).toBe(server.expected);
      expect(NotebooksHelper.getStatus(server.status)).toBe(server.expected);
    }
  });
});

describe('notebook server clean annotation', () => {
  const baseAnnotations = ExpectedAnnotations["renku.io"].default;
  it('renku.io default', () => {
    const fakeAnswer = {};
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(fakeAnswer, "renku.io");
    const expectedAnnotations = { ...baseAnnotations }
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations));
  });
  it('renku.io elaborated', () => {
    const namespace = "myCoolNampsace";
    const branch = "anotherBranch"

    const fakeAnswer = { "renku.io/namespace": namespace, "renku.io/branch": branch };
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(fakeAnswer, "renku.io");
    const expectedAnnotations = { ...baseAnnotations, namespace, branch }
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations));
  });
});

describe('parse project level environment options', () => {
  it('valid content', () => {
    const content = `
      [renku "interactive"]
      default_url = /tree
      mem_request = 2
      lfs_auto_fetch = True
    `;
    const parsedContent = NotebooksHelper.parseProjectOptions(content);

    // check keys
    expect(Object.keys(parsedContent).length).toBe(3);
    expect(Object.keys(parsedContent)).toContain("lfs_auto_fetch");
    expect(Object.keys(parsedContent)).toContain("mem_request");
    expect(Object.keys(parsedContent)).not.toContain("default_url");
    expect(Object.keys(parsedContent)).toContain("defaultUrl");

    // check values
    expect(parsedContent.defaultUrl).toBe("/tree")
    expect(parsedContent.mem_request).not.toBe("2")
    expect(parsedContent.mem_request).toBe(2)
    expect(parsedContent.lfs_auto_fetch).not.toBe("True")
    expect(parsedContent.lfs_auto_fetch).not.toBe("true")
    expect(parsedContent.lfs_auto_fetch).toBe(true)
  });

  it('invalid content', () => {
    let content = `
      [nonrenku]
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

describe('verify project level options validity according to deployment global options', () => {
  it('valid options', () => {
    const simplifiedGlobalOptions = {
      defaultUrl: {
        default: "/lab",
        options: ["/lab", "/rstudio"],
        type: "enum"
      },
      cpu_request: {
        default: 1,
        options: [0.5, 1, 2],
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

    const testValues = [
      { option: "defaultUrl", value: "/lab", result: true },
      { option: "defaultUrl", value: "anyString", result: true },
      { option: "defaultUrl", value: "", result: true },
      { option: "defaultUrl", value: 12345, result: false },
      { option: "defaultUrl", value: true, result: false },
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

describe('rendering', () => {
  const scope = {
    namespace: "fake",
    project: "fake",
    branch: { name: "master" }
  };

  it('renders Notebooks', () => {
    const props = {
      client,
      model
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <Notebooks {...props} standalone={true} />
      </MemoryRouter>, div);
    ReactDOM.render(
      <MemoryRouter>
        <Notebooks {...props} standalone={false} />
      </MemoryRouter>, div);
    ReactDOM.render(
      <MemoryRouter>
        <Notebooks {...props} standalone={true} scope={scope} />
      </MemoryRouter>, div);
  });

  it('renders StartNotebookServer without crashing', () => {
    const props = {
      client,
      model,
      branches: [],
      autosaved: [],
      refreshBranches: () => { },
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <StartNotebookServer {...props} />
      </MemoryRouter>, div);
    ReactDOM.render(
      <MemoryRouter>
        <StartNotebookServer {...props} scope={scope} />
      </MemoryRouter>, div);
  });

  it('renders CheckNotebookStatus', () => {
    const props = {
      client,
      model,
      scope,
      launchNotebookUrl: "/projects/abc/def/launchNotebook",
      filePath: "notebook.ypynb"
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <CheckNotebookStatus {...props} />
      </MemoryRouter>, div);
  });
});

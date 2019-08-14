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
  * Tests for the notebook server component
  */

import React from 'react';
import ReactDOM from 'react-dom';

import { Notebooks, StartNotebookServer, NotebooksHelper } from './index';
import { ExpectedAnnotations } from './Notebooks.state';
import { testClient as client } from '../api-client'


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

describe('rendering', () => {
  const scope = {
    namespace: "fake",
    project: "fake",
    branch: { name: "master" }
  }

  it('renders standalone Notebooks', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Notebooks client={client} standalone={true} />
    , div);
    ReactDOM.render(
      <Notebooks client={client} standalone={false} />
    , div);
    ReactDOM.render(
      <Notebooks client={client} standalone={true} scope={scope} />
    , div);
  });

  it('renders StartNotebookServer without crashing', () => {
    const props = {
      client: client,
      branches: [],
      autosaved: [],
      refreshBranches: () => { },
    }

    const div = document.createElement('div');
    ReactDOM.render(
      <StartNotebookServer {...props} />
    , div);
    ReactDOM.render(
      <StartNotebookServer {...props} scope={scope} />
    , div);
  });
});

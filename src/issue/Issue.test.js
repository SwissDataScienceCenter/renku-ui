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
 *  Issue.test.js
 *  Tests for issue.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import Issue from './Issue';
import State from './Issue.state';
import { testClient as client } from '../api-client';
import { slugFromTitle } from '../utils/HelperFunctions';
import { generateFakeUser } from '../user/User.test';

describe('rendering', () => {
  const user = generateFakeUser(true);

  let spy = null;
  beforeEach(() => {
    // ckeditor dumps some junk to the conole.error. Ignore it.
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('renders new without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Issue.New location={{ pathname: '/projects/1/issue_new' }} user={user} />, div);
  });
	
  it('renders list without crashing', () => {
    const baseUrl = "base";
    const urlMap = {
      issuesUrl: `${baseUrl}/collaboration`,
      issueNewUrl: `${baseUrl}/issue_new`,
      issueUrl: `${baseUrl}/collaboration/issues/:issueIid(\\d+)`,
    };
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Issue.List client={client} urlMap={urlMap} user={user} issues={[]} />
      </MemoryRouter>
      , div);
  });
  it('renders view without crashing', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(
      <MemoryRouter>
        <Issue.View id="1" client={client} user={user} />
      </MemoryRouter>
      , div);
  });
});

describe('helpers', () => {
  it('computes display id correctly', () => {
    expect(slugFromTitle("This is my Issue")).toEqual("this-is-my-issue");
  });
});

describe('issue view actions', () => {
  it('creates a server return action', () => {
    expect(State.View.setAll({ core: { title: "A Title", description: "A desc", displayId: "a-title" } }))
      .toEqual({ type: 'server_return', payload: { core: { title: "A Title", description: "A desc", displayId: "a-title" } } });
  });
});

describe('issue view reducer', () => {
  const initialState = State.View.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: { title: "", description: "", displayId: "" },
      visibility: { level: "public" }
    });
  });
  it('advances state', () => {
    const state1 = State.View.reducer(initialState, State.View.setAll({ core: { title: "A Title", description: "A desc", displayId: "a-title" } }));
    expect(state1)
      .toEqual({
        core: { title: "A Title", description: "A desc", displayId: "a-title" },
        visibility: { level: "public" }
      });
  });
});

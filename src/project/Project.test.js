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

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { StateKind, StateModel, globalSchema } from '../model';
import Project from './Project';
import { filterPaths } from './Project.present';
import { ProjectModel } from './Project.state';
import { testClient as client } from '../api-client';
import { slugFromTitle } from '../utils/HelperFunctions';
import { generateFakeUser } from '../user/User.test';


const fakeHistory = createMemoryHistory({
  initialEntries: ['/'],
  initialIndex: 0,
})
fakeHistory.push({
  pathname: '/projects',
  search: '?page=1'
})

describe('rendering', () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const model = new StateModel(globalSchema);

  it('renders new without crashing for logged user', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.New
          client={client}
          model={model}
          history={fakeHistory}
          user={loggedUser} />
      </MemoryRouter>
      , div);
  });
  it('renders list without crashing for anonymous user', () => {
    const div = document.createElement('div');
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
  it('renders list without crashing for logged user', () => {
    const div = document.createElement('div');
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
  it('renders view without crashing for anonymous user', () => {
    const div = document.createElement('div');
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
  it('renders view without crashing for logged user', () => {
    const div = document.createElement('div');
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

describe('helpers', () => {
  it('computes display id correctly', () => {
    expect(slugFromTitle("This is my Project")).toEqual("this-is-my-project");
  });
});

describe('new project actions', () => {
  const model = new ProjectModel(StateKind.REDUX);
  it('sets a core field', () => {
    expect(model.get('core.title')).toEqual('no title');
    model.set('core.title', 'a title')
    expect(model.get('core.title')).toEqual('a title');
  });
  it('sets a visibility field', () => {
    expect(model.get('visibility.level')).toEqual('private');
    model.set('visibility.level', 'public')
    expect(model.get('visibility.level')).toEqual('public');
  });
});

describe('project view actions', () => {
  it('retrieves a project from server', () => {
    const model = new ProjectModel(StateKind.REDUX);
    model.fetchProject(client, 1).then(() => {
      expect(model.get('core.title')).toEqual('A-first-project')
    })
  })
});

describe('path filtering', () => {
  const origPaths = ['.foo', '.renku', '.renku/foo', 'foo.txt', 'bar',
    'myfolder/.hidden', 'myfolder/visible',
    'myfolder/.alsohidden/readme.md', 'myfolder/.alsohidden/other.txt',
    'myfolder/alsovisible/.hidden', 'myfolder/alsovisible/readme.md', 'myfolder/alsovisible/other.txt',
  ];
  it('filters the default blacklist [/^\..*/, /\/\..*/]', () => {
    const blacklist = [/^\..*/, /\/\..*/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual(['foo.txt', 'bar', 'myfolder/visible', 'myfolder/alsovisible/readme.md', 'myfolder/alsovisible/other.txt']);
  })

  it('filters the another blacklist [/^\..*/, /readme.md/]', () => {
    const blacklist = [/^\..*/, /readme.md/];
    const paths = filterPaths(origPaths, blacklist);
    expect(paths).toEqual(['foo.txt', 'bar', 'myfolder/.hidden', 'myfolder/visible',
      'myfolder/.alsohidden/other.txt',
      'myfolder/alsovisible/.hidden', 'myfolder/alsovisible/other.txt']);
  })
});

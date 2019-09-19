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

import { StateKind, StateModel } from '../model/Model';
import Project from './Project';
import { filterPaths, sanitizedHTMLFromMarkdown } from './Project.present'
import State, { ProjectModel } from  './Project.state';
import { testClient as client } from '../api-client';
import { slugFromTitle } from '../utils/HelperFunctions'
import { generateFakeUser } from '../app-state/UserState.test';


const fakeHistory = createMemoryHistory({
  initialEntries: [ '/' ],
  initialIndex: 0,
})
fakeHistory.push({
  pathname: '/projects',
  search: '?page=1'
})

describe('rendering', () => {
  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();

  it('renders new without crashing for logged user', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Project.New client={client} user={loggedUser}/>, div);
  });
  it('renders list without crashing for anonymous user', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.List client={client} history={fakeHistory} user={anonymousUser} location={fakeHistory.location}/>
      </MemoryRouter>
      , div);
  });
  it('renders list without crashing for logged user', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.List client={client} history={fakeHistory} user={loggedUser} location={fakeHistory.location}/>
      </MemoryRouter>
      , div);
  });
  it('renders view without crashing for anonymous user', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.View id="1" client={client} user={anonymousUser} match={{params: {id: "1"}, url:"/projects/1/"}} />
      </MemoryRouter>
      , div);
  });
  it('renders view without crashing for logged user', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.View id="1" client={client} user={loggedUser} match={{params: {id: "1"}, url:"/projects/1/"}} />
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

describe('html sanitization', () => {
  it('handles empty markdown', () => {
    const markdown = ""
    const html = sanitizedHTMLFromMarkdown(markdown)
    expect(html).toEqual("")
  })

  it('handles pure markdown', () => {
    const markdown = "# internal-test\nA Renku project.\n\nThis is an *internal* project that is used for testing."
    const html = sanitizedHTMLFromMarkdown(markdown)
    expect(html).toEqual(`<h1 id="internaltest">internal-test</h1>\n<p>A Renku project.</p>\n<p>This is an <em>internal</em> project that is used for testing.</p>`)
  })

  it('handles mixed markdown', () => {
    const markdown =`# internal-test

A Renku project.

This is an *internal* project that is used for testing.

<div>
  This is some HTML in a div, since that is valid Markdown.
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
</div>`
    const expected = `<h1 id="internaltest">internal-test</h1>
<p>A Renku project.</p>
<p>This is an <em>internal</em> project that is used for testing.</p>
<div>
  This is some HTML in a div, since that is valid Markdown.
</div>
<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
</div>`
    const html = sanitizedHTMLFromMarkdown(markdown)
    expect(html).toEqual(expected)
  })

  it('strips suspicious markdown', () => {
    const markdown =`# internal-test

A Renku project.

This is an *internal* project that is used for testing.

<div>
  This is some HTML in a div, since that is valid Markdown.
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      The following alerts should get sanitized away.
      <script>alert('xss');</script>
      hello <a name="n" href="javascript:alert('xss')">*you*</a>
    </div>
  </div>
</div>`
    const expected = `<h1 id="internaltest">internal-test</h1>
<p>A Renku project.</p>
<p>This is an <em>internal</em> project that is used for testing.</p>
<div>
  This is some HTML in a div, since that is valid Markdown.
</div>
<div class="container-fluid">
  <div class="row">
    <div class="col-sm-8">
      An 8 unit column here on the left.
    </div>
    <div class="col-sm-4">
      A 4 unit column here on the right.
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
      The following alerts should get sanitized away.
      \n      hello <a name="n">*you*</a>
    </div>
  </div>
</div>`
    const html = sanitizedHTMLFromMarkdown(markdown)
    expect(html).toEqual(expected)
  })
});

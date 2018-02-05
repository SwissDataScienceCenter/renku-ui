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
 *  incubator-renga-ui
 *
 *  Project.test.js
 *  Tests for project.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import Project from './Project';
import State, { displayIdFromTitle } from  './Project.state';
import client from '../gitlab/test-client'

describe('rendering', () => {
  it('renders new without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Project.New />, div);
  });
  it('renders list without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.List client={client}/>
      </MemoryRouter>
      , div);
  });
  it('renders view without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Project.View id="1" client={client} />
      </MemoryRouter>
      , div);
  });
});

describe('helpers', () => {
  it('computes display id correctly', () => {
    expect(displayIdFromTitle("This is my Project")).toEqual("this-is-my-project");
  });
});

describe('new project actions', () => {
  it('creates a core field set action', () => {
    expect(State.New.Core.set('title', 'a title')).toEqual({type: 'core', payload: {title: 'a title', displayId: 'a-title'}});
  });
  it('creates a visibility set action', () => {
    expect(State.New.Visibility.set('private')).toEqual({type: 'visibility', payload: {level: 'private'}});
  });
  it('creates a data set action', () => {
    expect(State.New.Data.set('reference', 'url_or_doi', "http://foo.bar/data.csv")).toEqual({type: 'data_reference', payload: {'url_or_doi': "http://foo.bar/data.csv"}});
  });
});

describe('new project reducer', () => {
  const initialState = State.New.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"", author: ""},
        upload: {files: []}
      }
    });
  });
  it('advances state', () => {
    const state1 = State.New.reducer(initialState, State.New.Core.set('title', 'new title'));
    expect(state1)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "public"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"", author: ""},
        upload: {files: []}
      }
    });
    const state2 = State.New.reducer(state1, State.New.Visibility.set('private'));
    expect(state2)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"", author: ""},
        upload: {files: []}
      }
    });
    const state3 = State.New.reducer(state2, State.New.Data.set('reference', 'url_or_doi', 'http://foo.bar/data.csv'));
    expect(state3)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"http://foo.bar/data.csv", author: ""},
        upload: {files: []}
      }
    });
  });
});

describe('project list actions', () => {
  it('creates a server return action', () => {
    expect(State.List.receive({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}))
      .toEqual({type: 'server_return', payload: {aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}})
  });
});

describe('project list reducer', () => {
  const initialState = State.List.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({projects:[]});
  });
  it('advances state', () => {
    const state1 = State.List.reducer(initialState, State.List.receive({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}));
    expect(state1)
    .toEqual({
      projects: [{aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}]
    });
  });
});

describe('project view actions', () => {
  it('creates a server return action', () => {
    expect(State.View.receive({metadata:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}}))
      .toEqual({type: 'server_return', payload:{metadata:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}}});
  });
});

describe('project view reducer', () => {
  const initialState = State.View.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"", author: ""},
        upload: {files: []}
      }
    });
  });
  it('advances state', () => {
    const action = State.View.receive({
      metadata: {
        core: {
          title: "A Title",
          description: "A desc",
          displayId: "a-title"
        }
      }
    }, 'metadata');
    expect(State.View.reducer(initialState, action))
    .toEqual({
      core: {title: "A Title", description: "A desc", displayId: "a-title"},
      visibility: {level: "public"},
      data: {
        readme: {
          text: ""
        },
        reference: {url_or_doi:"", author: ""},
        upload: {files: []}
      }
    });
  });
});

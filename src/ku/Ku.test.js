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
 *  Ku.test.js
 *  Tests for ku.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'fetch-mock';

import Ku from './Ku';
import State, { displayIdFromTitle } from  './Ku.state';

const mockKuListResponse = {
    "aggregations": {},
    "hits": {
        "hits": [
            {
                "created": "2018-01-09T21:21:01.648602+00:00",
                "id": 1,
                "links": {
                    "self": "http://localhost:3000/kus/1"
                },
                "metadata": {
                    "control_number": "1",
                    "core": {
                        "description": "For testing purposes",
                        "displayId": "my-first-ku",
                        "title": "My first ku"
                    },
                    "datasets": {
                        "refs": [
                            {
                                "id": "my cool dataset"
                            }
                        ]
                    },
                    "visibility": {
                        "level": "public"
                    }
                },
                "updated": "2018-01-09T21:21:01.648614+00:00"
            }
        ],
        "total": 1
    },
    "links": {
        "self": "http://localhost:3000/kus/?page=1&size=10"
    }
};

const mockKuDetailResponse = {
    "created": "2018-01-09T21:21:01.648602+00:00",
    "id": 1,
    "links": {
        "self": "http://localhost:3000/kus/1"
    },
    "metadata": {
        "control_number": "1",
        "core": {
            "description": "For testing purposes",
            "displayId": "my-first-ku",
            "title": "My first ku"
        },
        "datasets": {
            "refs": [
                {
                    "id": "my cool dataset"
                }
            ]
        },
        "visibility": {
            "level": "public"
        }
    },
    "updated": "2018-01-09T21:21:01.648614+00:00"
};

fetchMock.get('/api/kus/', () => {
    return mockKuListResponse
});

fetchMock.get('/api/kus/1', () => {
    return mockKuDetailResponse
});

describe('rendering', () => {
  it('renders new without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Ku.New />, div);
  });
  it('renders list without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <MemoryRouter>
            <Ku.List />
        </MemoryRouter>
        , div);
  });
  it('renders view without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <MemoryRouter>
            <Ku.View id="1" />
        </MemoryRouter>
        , div);
  });
});

describe('helpers', () => {
  it('computes display id correctly', () => {
    expect(displayIdFromTitle("This is my Ku")).toEqual("this-is-my-ku");
  });
});

describe('new ku actions', () => {
  it('creates a core field set action', () => {
    expect(State.New.Core.set('title', 'a title')).toEqual({type: 'core', payload: {title: 'a title', displayId: 'a-title'}});
  });
  it('creates a visibility set action', () => {
    expect(State.New.Visibility.set('private')).toEqual({type: 'visibility', payload: {level: 'private'}});
  });
  it('creates a dataset append action', () => {
    expect(State.New.Datasets.append(1)).toEqual({type: 'datasets', payload: {append: {id: 1}}});
  });
  it('creates a dataset remove action', () => {
    expect(State.New.Datasets.remove(1)).toEqual({type: 'datasets', payload: {remove: {id: 1}}});
  });
  it('creates a dataset set action', () => {
    expect(State.New.Datasets.set(1)).toEqual({type: 'datasets', payload: {set: {id: 1}}});
  });
});

describe('new ku reducer', () => {
  const initialState = State.New.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"},
      datasets: { refs: [] }
    });
  });
  it('advances state', () => {
    const state1 = State.New.reducer(initialState, State.New.Core.set('title', 'new title'));
    expect(state1)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "public"},
      datasets: { refs: [] }
    });
    const state2 = State.New.reducer(state1, State.New.Visibility.set('private'));
    expect(state2)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [] }
    });
    const state3 = State.New.reducer(state2, State.New.Datasets.append(1));
    expect(state3)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{id: 1}] }
    });
    const state4 = State.New.reducer(state3, State.New.Datasets.append(2));
    expect(state4)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{id: 1}, {id: 2}] }
    });
    const state5 = State.New.reducer(state4, State.New.Datasets.remove(1));
    expect(state5)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{id: 2}] }
    });
    const state6 = State.New.reducer(state5, State.New.Datasets.set(8));
    expect(state6)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{id: 8}] }
    });
  });
});

describe('ku list actions', () => {
  it('creates a server return action', () => {
    expect(State.List.set({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}))
      .toEqual({type: 'server_return', payload: {hits: [{id: 1}], total: 1}});
  });
});

describe('ku list reducer', () => {
  const initialState = State.List.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({kus:[]});
  });
  it('advances state', () => {
    const state1 = State.List.reducer(initialState, State.List.set({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}));
    expect(state1)
    .toEqual({
      kus: [{id: 1}]
    });
  });
});

describe('ku view actions', () => {
  it('creates a server return action', () => {
    expect(State.View.setAll({metadata:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}}))
      .toEqual({type: 'server_return', payload:{metadata:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}}});
  });
});

describe('ku view reducer', () => {
  const initialState = State.View.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"},
      datasets: { refs: [] }
    });
  });
  it('advances state', () => {
    const state1 = State.View.reducer(initialState, State.View.setAll({metadata:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}}));
    expect(state1)
    .toEqual({
      core: {title: "A Title", description: "A desc", displayId: "a-title"},
      visibility: {level: "public"},
      datasets: { refs: [] }
    });
  });
});

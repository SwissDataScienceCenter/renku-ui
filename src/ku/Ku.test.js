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
import Ku from './Ku';
import State, { displayIdFromTitle } from  './Ku.state';

describe('rendering', () => {
  it('renders new without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Ku.New />, div);
  });
  // Need to mock fetch for these to work.
  // it('renders list without crashing', () => {
  //   const div = document.createElement('div');
  //   ReactDOM.render(<Ku.List />, div);
  // });
  // it('renders view without crashing', () => {
  //   const div = document.createElement('div');
  //   ReactDOM.render(<Ku.View />, div);
  // });
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
    expect(State.New.Datasets.append(1)).toEqual({type: 'datasets', payload: {append: {dataset: 1, "$ref": "/dataset/1"}}});
  });
  it('creates a dataset remove action', () => {
    expect(State.New.Datasets.remove(1)).toEqual({type: 'datasets', payload: {remove: {dataset: 1}}});
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
      datasets: { refs: [{dataset: 1, "$ref": "/dataset/1"}] }
    });
    const state4 = State.New.reducer(state3, State.New.Datasets.append(2));
    expect(state4)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{dataset: 1, "$ref": "/dataset/1"}, {dataset: 2, "$ref": "/dataset/2"}] }
    });
    const state5 = State.New.reducer(state4, State.New.Datasets.remove(1));
    expect(state5)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"},
      datasets: { refs: [{dataset: 2, "$ref": "/dataset/2"}] }
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

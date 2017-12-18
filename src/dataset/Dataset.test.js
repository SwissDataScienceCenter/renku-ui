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
 *  Dataset.test.js
 *  Tests for dataset.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Dataset from './Dataset';
import State, { displayIdFromTitle } from  './DatasetState';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Dataset.New />, div);
});

it('computes display Id correctly', () => {
  expect(displayIdFromTitle("This is my Dataset")).toEqual("this-is-my-dataset");
});

describe('new dataset state actions', () => {
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

describe('new dataset reducer', () => {
  const initialState = State.New.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"},
      data: {
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
        reference: {url_or_doi:"http://foo.bar/data.csv", author: ""},
        upload: {files: []}
      }
    });
  });
});

describe('dataset list state actions', () => {
  it('creates a server return action', () => {
    expect(State.ServerReturn.set({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}))
      .toEqual({type: 'server_return', payload: {hits: [{id: 1}], total: 1}});
  });
});

describe('dataset list reducer', () => {
  const initialState = State.ServerReturn.reduce(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({datasets:[]});
  });
  it('advances state', () => {
    const state1 = State.ServerReturn.reduce(initialState, State.ServerReturn.set({aggregations: {}, links: {}, hits: {hits: [{id: 1}], total: 1}}));
    expect(state1)
    .toEqual({
      datasets: [{id: 1}]
    });
  });
});

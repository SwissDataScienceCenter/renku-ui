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
import Dataset, { displayIdFromTitle } from './Dataset';
import State from  './DatasetState';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Dataset.New />, div);
});

it('computes display Id correctly', () => {
  expect(displayIdFromTitle("This is my Dataset")).toEqual("this-is-my-dataset");
});

describe('dataset state actions', () => {
  it('creates a core field set action', () => {
    expect(State.Core.set('title', 'a title')).toEqual({type: 'core', payload: {title: 'a title'}});
  });
  it('creates a visibility set action', () => {
    expect(State.Visibility.set('private')).toEqual({type: 'visibility', payload: {level: 'private'}});
  });
});

describe('dataset reducer', () => {
  it('returns initial state', () => {
    const initialState = State.reducer(undefined, {});
    expect(initialState).toEqual({
      core: {title: "", description: ""},
      visibility: {level: "public"}
    });
    const state1 = State.reducer(initialState, State.Core.set('title', 'new title'));
    expect(state1)
    .toEqual({
      core: {title: "new title", description: ""},
      visibility: {level: "public"}
    });
    const state2 = State.reducer(state1, State.Visibility.set('private'));
    expect(state2)
    .toEqual({
      core: {title: "new title", description: ""},
      visibility: {level: "private"}
    });
  });
});

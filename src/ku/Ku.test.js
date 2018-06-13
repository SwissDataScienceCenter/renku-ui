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
 *  Ku.test.js
 *  Tests for ku.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import Ku from './Ku';
import State from  './Ku.state';
import client from '../gitlab/test-client';
import { slugFromTitle } from '../utils/HelperFunctions';

describe('rendering', () => {
  it('renders new without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Ku.New location={ {pathname: '/projects/1/ku_new'} } />, div);
  });
  it('renders list without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Ku.List client={client}/>
      </MemoryRouter>
      , div);
  });
  it('renders view without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Ku.View id="1" client={client} />
      </MemoryRouter>
      , div);
  });
});

describe('helpers', () => {
  it('computes display id correctly', () => {
    expect(slugFromTitle("This is my Ku")).toEqual("this-is-my-ku");
  });
});

describe('new ku actions', () => {
  it('creates a core field set action', () => {
    expect(State.New.Core.set('title', 'a title')).toEqual({type: 'core', payload: {title: 'a title', displayId: 'a-title'}});
  });
  it('creates a visibility set action', () => {
    expect(State.New.Visibility.set('private')).toEqual({type: 'visibility', payload: {level: 'private'}});
  });
});

describe('new ku reducer', () => {
  const initialState = State.New.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"}
    });
  });
  it('advances state', () => {
    const state1 = State.New.reducer(initialState, State.New.Core.set('title', 'new title'));
    expect(state1)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "public"}
    });
    const state2 = State.New.reducer(state1, State.New.Visibility.set('private'));
    expect(state2)
    .toEqual({
      core: {title: "new title", description: "", displayId: "new-title"},
      visibility: {level: "private"}
    });
  });
});

describe('ku list actions', () => {
  it('creates a server return action', () => {
    expect(State.List.set({hits: [{id: 1}], total: 1}))
      .toEqual({type: 'server_return', payload: {hits: [{id: 1}], total: 1}});
  });
});

describe('ku list reducer', () => {
  const initialState = State.List.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({kus:[]});
  });
  it('advances state', () => {
    const state1 = State.List.reducer(initialState, State.List.set([{id: 1}]));
    expect(state1)
    .toEqual({
      kus: [{id: 1}]
    });
  });
});

describe('ku view actions', () => {
  it('creates a server return action', () => {
    expect(State.View.setAll({core:{title: "A Title", description: "A desc", displayId: "a-title"}}))
      .toEqual({type: 'server_return', payload:{core:{title: "A Title", description: "A desc", displayId: "a-title"}}});
  });
});

describe('ku view reducer', () => {
  const initialState = State.View.reducer(undefined, {});
  it('returns initial state', () => {
    expect(initialState).toEqual({
      core: {title: "", description: "", displayId: ""},
      visibility: {level: "public"}
    });
  });
  it('advances state', () => {
    const state1 = State.View.reducer(initialState, State.View.setAll({core: {title: "A Title", description: "A desc", displayId: "a-title"}}));
    expect(state1)
    .toEqual({
      core: {title: "A Title", description: "A desc", displayId: "a-title"},
      visibility: {level: "public"}
    });
  });
});

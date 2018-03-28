/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renga-ui
 *
 *  Model.test.js
 *  Tests for models.
 */


import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Schema, StateModel, REDUX_STORE, REACT_STATE, StateModelComponent} from './Model';
import { createStore } from 'redux';


const simpleSchema = new Schema({
  name: {initial: 'Jane Doe', mandatory: true},
  purpose: {initial: '', mandatory: false}
});

const complexSchema = new Schema({
  basics: {schema: simpleSchema, mandatory: true},
  subthing: {schema: {age: {initial: 0, mandatory: true }}, mandatory: true},
  createdAt: {initial: () => 'right now'}
});

const simpleObject = {name: 'Jane Doe', purpose: '' };

const complexObject = {
  basics: simpleObject,
  createdAt: 'right now',
  subthing: {age: 0}
};

describe('simple creation', () => {

  const emptyObject = {name: undefined, purpose: undefined };

  it('creates empty object from schema', () => {
    const emptyThing =  simpleSchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject)
  });
  it('creates initialized object from schema', () => {
    const initializedThing = simpleSchema.createInitialized();
    expect(initializedThing).toEqual(simpleObject);
  });
  it('creates initialized instance', () => {
    const store = createStore(simpleSchema.reducer());
    const simpleModel = new StateModel(simpleSchema, store, REDUX_STORE);
    expect(simpleModel.get()).toEqual((simpleObject));
  });
  it('creates instance from initial object', () => {
    const store = createStore(simpleSchema.reducer());
    const initialObject = {...simpleSchema.createInitialized(), name: 'John Doe'};
    const simpleModel = new StateModel(simpleSchema, store, REDUX_STORE, initialObject);
    expect(simpleModel.get()).toEqual(initialObject);
  });
});

describe('complex creation', () => {

  const emptyObject = {
    basics: {name: undefined, purpose: undefined},
    subthing: {age: undefined},
    createdAt: undefined
  };

  it('creates empty object from schema', () => {
    const emptyThing = complexSchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject);
  });
  it('creates initialized object from schema', () => {
    const initializedThing =  complexSchema.createInitialized();
    expect(initializedThing).toEqual(complexObject);
  });
  it('creates instance from initial object', () => {
    const store = createStore(complexSchema.reducer());
    const initialObject = {...complexSchema.createInitialized(), subthing: {age: 1}};
    const complexModel = new StateModel(complexSchema, store, REDUX_STORE, initialObject);
    expect(complexModel.get()).toEqual(initialObject);
  });
  it('creates initialized instance', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, store, REDUX_STORE);
    expect(complexModel.get()).toEqual((complexObject));
  });
});

describe('validation', () => {

  const simpleErrors = {
    result: false,
    errors: [{name: 'name must be provided and non-empty'}]
  };
  const complexErrors = {
    result: false,
    errors: [
      {name: 'name must be provided and non-empty'},
      {age: 'age must be provided and non-empty'}
    ]
  };

  it('simple empty validates false', () => {
    const initializedThing =  simpleSchema.createInitialized();
    expect(simpleSchema.validate({...initializedThing, name: ''})).toEqual(simpleErrors);
  });
  it('complex empty validates false', () => {
    const initializedThing =  complexSchema.createInitialized();
    initializedThing.subthing.age = undefined;
    initializedThing.basics.name = null;
    expect(complexSchema.validate(initializedThing)).toEqual(complexErrors);
  });
});

describe('update react state', () => {
  class TestReactStateComponent extends StateModelComponent {
    constructor(props) {
      super(props, complexSchema, REACT_STATE);
    }

    componentWillMount() {
      this.model.setOne('subthing.age', 1)
    }

    render(){
      expect(this.model.get()).toEqual({...complexObject, subthing: {age: 1}});
      return null;
    }
  }
  it('updates complex state', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <TestReactStateComponent/>, div);
  });
});

describe('update disconnected redux store', () => {
  it('updates simple instance in redux store', () => {
    const store = createStore(simpleSchema.reducer());
    const simpleModel = new StateModel(simpleSchema, store, REDUX_STORE);
    simpleModel.set({name: 'John Doe'});
    expect(simpleModel.get()).toEqual({...simpleObject, name: 'John Doe'});
  });
  it('updates complex instance in redux store', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, store, REDUX_STORE);
    complexModel.set({subthing: {age: 1}});
    expect(complexModel.get()).toEqual({...complexObject, subthing: {age: 1}});
  });
  it('updates complex instance in redux store using property accessor syntax', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, store, REDUX_STORE);
    complexModel.setOne('subthing.age', 1);
    expect(complexModel.get()).toEqual({...complexObject, subthing: {age: 1}});
  });
});

describe('update connected redux store', () => {

  class TestReduxStateComponent extends StateModelComponent {
    constructor(props) {
      super(props, complexSchema, REDUX_STORE);
    }

    componentWillMount() {
      this.model.setOne('subthing.age', 1)
    }

    render(){
      expect(this.model.get()).toEqual({...complexObject, subthing: {age: 1}});
      return null;
    }
  }

  it('updates complex state', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <TestReduxStateComponent/>, div);
  });
});

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

import {Schema, StateModel, StateKind, StateModelComponent} from './Model';
import { createStore } from 'redux';


const simpleSchema = new Schema({
  name: {initial: 'Jane Doe', mandatory: true},
  purpose: {initial: '', mandatory: false},
  numbers: {schema: [], initial: [0, 1]}
});

const simpleObject = {name: 'Jane Doe', purpose: '', numbers: [0, 1]};

const arraySchema = new Schema({
  manyLetters: {schema: [] , initial: ['a', 'b', 'c']},
  manyNumbers: {schema: []},
  manyThings: {schema: [simpleSchema], initial: [{...simpleObject}]},
});

const arrayObject = {
  manyLetters: ['a', 'b', 'c'],
  manyNumbers: [],
  manyThings: [{...simpleObject}]
};

const complexSchema = new Schema({
  basics: {schema: simpleSchema, mandatory: true},
  subthing: {schema: {age: {initial: 0, mandatory: true }}, mandatory: true},
  createdAt: {initial: () => 'right now'},
  simpleThings: {schema: [simpleSchema], initial: [{...simpleObject}, {...simpleObject, name: 'Johnny'}]}
});

const complexObject = {
  basics: {...simpleObject},
  createdAt: 'right now',
  subthing: {age: 0},
  simpleThings: [{...simpleObject}, {...simpleObject, name: 'Johnny'}]
};



describe('simple creation', () => {

  const emptyObject = {name: undefined, purpose: undefined, numbers:[]};

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
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store);
    expect(simpleModel.get()).toEqual((simpleObject));
  });
  it('creates instance from initial object', () => {
    const store = createStore(simpleSchema.reducer());
    const initialObject = {...simpleSchema.createInitialized(), name: 'John Doe', numbers: [0,1]};
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store, initialObject);
    expect(simpleModel.get()).toEqual(initialObject);
  });
});

describe('array creation', () => {

  const emptyObject = {
    manyLetters: [],
    manyNumbers: [],
    manyThings: [],
  };

  it('creates empty object from schema', () => {
    const emptyThing = arraySchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject);
  });
  it('creates initialized object from schema', () => {
    const initializedThing =  arraySchema.createInitialized();
    expect(initializedThing).toEqual(arrayObject);
  });
  it('creates instance from initial object', () => {
    const store = createStore(arraySchema.reducer());
    const initialObject = {...arraySchema.createInitialized(), manyNumbers: [0, 1, 0, 1]};
    const arrayModel = new StateModel(arraySchema, StateKind.REDUX, store, initialObject);
    expect(arrayModel.get()).toEqual(initialObject);
  });
  it('creates initialized instance', () => {
    const store = createStore(arraySchema.reducer());
    const arrayModel = new StateModel(arraySchema, StateKind.REDUX, store);
    expect(arrayModel.get()).toEqual((arrayObject));
  });
});

describe('complex creation', () => {

  const emptyObject = {
    basics: {name: undefined, purpose: undefined, numbers: []},
    subthing: {age: undefined},
    createdAt: undefined,
    simpleThings: []
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
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store, initialObject);
    expect(complexModel.get()).toEqual(initialObject);
  });
  it('creates initialized instance', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    expect(complexModel.get()).toEqual((complexObject));
  });
});



describe('validation', () => {

  const simpleErrors = {
    result: false,
    errors: [{name: 'name must be provided and non-empty'}]
  };
  const arrayErrors = {
    result: false,
    errors: [
      {manyNumbers: 'manyNumbers must be an array'},
      {manyThings: 'manyThings[1] must be an object'}
    ]
  };
  const complexErrors = {
    result: false,
    errors: [
      {name: 'name must be provided and non-empty'},
      {subthing: 'subthing must be an object'},
      {name: 'name must be provided and non-empty'}
    ]
  };

  it('simple empty validates false', () => {
    const initializedThing =  simpleSchema.createInitialized();
    expect(simpleSchema.validate({...initializedThing, name: ''})).toEqual(simpleErrors);
  });
  it('complex array validates false', () => {
    const initializedThing =  arraySchema.createInitialized();
    initializedThing.manyNumbers = 'something';
    initializedThing.manyThings[1] = 'somethingElse';
    expect(arraySchema.validate(initializedThing)).toEqual(arrayErrors);
  });
  it('complex empty validates false', () => {
    const initializedThing =  complexSchema.createInitialized();
    initializedThing.subthing = 'a string';
    initializedThing.basics.name = null;
    initializedThing.simpleThings[1].name = null;
    expect(complexSchema.validate(initializedThing)).toEqual(complexErrors);
  });
});

describe('update react state', () => {
  class TestReactStateComponent extends Component {
    constructor(props) {
      super(props);
      this.model = new StateModel(complexSchema, StateKind.REACT, this, complexSchema.createInitialized());
    }

    componentWillMount() {
      this.model.set('subthing.age', 1);
      this.model.set('simpleThings.0.numbers.2', 2)
    }

    render(){
      let updatedSimpleThings = [...complexObject.simpleThings];
      updatedSimpleThings[0] = {...complexObject.simpleThings[0], numbers: [0, 1, 2]};
      expect(this.model.get()).toEqual({...complexObject, subthing: {age: 1}, simpleThings: updatedSimpleThings});
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
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store);
    simpleModel.setObject({name: 'John Doe'});
    expect(simpleModel.get()).toEqual({...simpleObject, name: 'John Doe'});
  });
  it('updates complex instance in redux store', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    complexModel.setObject({subthing: {age: 1}, simpleThings: {1: {name: 'Jenny'}}});

    // Build the more complex comparison Object
    const comparisonObject = {...complexObject, subthing: {age: 1}};
    comparisonObject.simpleThings = [...comparisonObject.simpleThings];
    comparisonObject.simpleThings[1] = {...comparisonObject.simpleThings[1], name: 'Jenny'};

    expect(complexModel.get()).toEqual(comparisonObject);
  });
  it('updates complex instance in redux store using property accessor syntax', () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    complexModel.set('subthing.age', 1);
    expect(complexModel.get()).toEqual({...complexObject, subthing: {age: 1}});
  });
});

describe('update connected redux store', () => {

  class TestReduxStateComponent extends Component {
    constructor(props) {
      super(props);
      this.model = new StateModel(complexSchema, StateKind.REACT, this);
    }

    componentWillMount() {
      this.model.set('subthing.age', 1)
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

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

import { Schema, modelUpdateReducer } from './Model';
import { createStore, combineReducers } from 'redux';

const simpleSchema = new Schema({
  name: {initial: '', mandatory: true},
  purpose: {initial: '', mandatory: false}
});

const SimpleModel = simpleSchema.toModel();

const complexSchema = new Schema({
  basics: {schema: simpleSchema, mandatory: true},
  subthing: {schema: {age: {initial: 0, mandatory: true }}, mandatory: true},
  createdAt: {initial: () => 'right now'}
});

const ComplexModel = complexSchema.toModel();


describe('simple creation', () => {

  const simpleObject = {name: '', purpose: '' };
  const emptyObject = {name: undefined, purpose: undefined };

  it('creates empty object from schema', () => {
    const emptyThing =  simpleSchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject)
  });
  it('creates initialized object from schema', () => {
    const initializedThing = simpleSchema.createInitialized();
    expect(initializedThing).toEqual(simpleObject);
  });
  // Object containing allows for the model instances to have an uncontrolled _uuid
  it('creates empty instance', () => {
    expect(SimpleModel.createEmpty()).toEqual(expect.objectContaining(emptyObject));
  });
  it('creates initialized instance', () => {
    expect(new SimpleModel()).toEqual(expect.objectContaining(simpleObject));
  });
  it('creates initialized instance from schema', () => {
    expect(simpleSchema.modelInstance()).toEqual(expect.objectContaining(simpleObject))
  });
});

describe('complex creation', () => {

  const complexObject = {
    basics: {name: '', purpose: ''},
    createdAt: 'right now',
    subthing: {age: 0}
  };
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
  it('creates empty instance', () => {
    expect(ComplexModel.createEmpty()).toEqual(expect.objectContaining(emptyObject));
  });
  it('creates initialized instance', () => {
    expect(new ComplexModel()).toEqual(expect.objectContaining(complexObject))
  });
  it('creates initialized instance from schema', () => {
    expect(complexSchema.modelInstance()).toEqual(expect.objectContaining(complexObject))
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
    expect(simpleSchema.validate(initializedThing)).toEqual(simpleErrors);
  });
  it('complex empty validates false', () => {
    const initializedThing =  complexSchema.createInitialized();
    initializedThing.subthing.age = undefined;
    expect(complexSchema.validate(initializedThing)).toEqual(complexErrors);
  });
  it('simple empty instance validates false', () => {
    const simpleInstance =  new SimpleModel();
    expect(simpleInstance.validate()).toEqual(simpleErrors);
  });
  it('complex empty instance validates false', () => {
    const complexInstance =  new ComplexModel();
    complexInstance.subthing.age = undefined;
    expect(complexInstance.validate()).toEqual(complexErrors);
  });
});

describe('immutable updates', () => {
  it('simple instance updates correctly to new instance using set', () => {
    const simpleInstance =  new SimpleModel();
    const updatedInstance = simpleInstance.set('name', 'John Doe');
    expect(updatedInstance).toEqual({...simpleInstance, name: 'John Doe'});
    expect(updatedInstance).not.toBe(simpleInstance);
  });
  it('simple instance updates correctly to new instance original syntax', () => {
    const simpleInstance =  new SimpleModel();
    const updatedInstance = simpleInstance.update({name: {$set: 'John Doe'}});
    expect(updatedInstance).toEqual({...simpleInstance, name: 'John Doe'});
    expect(updatedInstance).not.toBe(simpleInstance);
  });
  it('complex instance updates correctly to new instance using set', () => {
    const complexInstance = new ComplexModel();
    const updatedInstance = complexInstance.set('subthing.age', 1);
    expect(updatedInstance).toEqual({...complexInstance, subthing: {age: 1}});
    expect(updatedInstance).not.toBe(complexInstance);
  });
  it('complex instance updates correctly to new instane using original syntax', () => {
    const complexInstance = new ComplexModel();
    const updatedInstance = complexInstance.update({subthing: {age: {$set: 1}}});
    expect(updatedInstance).toEqual({...complexInstance, subthing: {age: 1}});
    expect(updatedInstance).not.toBe(complexInstance);
  });
});

describe('update redux store', () => {
  it('updates simple instance in redux store', () => {
    const store = createStore(SimpleModel.getReducer());
    const simple = store.getState();
    store.dispatch(simple.setAction('name', 'John Doe'));
    expect(store.getState()).toEqual({...simple, name: 'John Doe'});
  });

  it('updates both instances in combined redux store', () => {
    const reducer = combineReducers({simple: simpleSchema.getReducer(), complex: complexSchema.getReducer()});
    const store = createStore(reducer);
    const simple = store.getState().simple;
    const complex = store.getState().complex;
    store.dispatch(simple.setAction('name', 'John Doe'));
    store.dispatch(complex.setAction('subthing.age', 1));
    expect(store.getState()).toEqual({
      simple: {...simple, name: 'John Doe'},
      complex: {...complex, subthing: {age: 1}}});
  });
});

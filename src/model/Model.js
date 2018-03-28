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
 *  renga-ui
 *
 *  Model.js
 *
 *  A schema is comprised of property definitions which are of the form:
 *    {[property name]: {initial: [initial value], mandatory: [true/false], ...}
 *
 *
 *  A model is an instance of the StateModel class, created from a schema definition.
 *  Instances of StateModel have bindings to the corresponding react state / redux store
 *  to facilitate state access, immutable updates, etc and ensure a structure of the state
 *  in accordance with the schema definition.
 *
 *  Examples for how to use the Schema / StateModel classes can be found in ./Model.example.js
 */

// TODO: Maybe use [jsdoc](http://usejsdoc.org/) here?

import immutableUpdate from 'immutability-helper';
import { Component } from 'react';
// Todo: Resolve dependency from our custom store
import { createStore } from '../utils/EnhancedState';

// Property names for the field specs.
const SCHEMA_PROP = 'schema';
const INITIAL_PROP = 'initial';
const MANDATORY_PROP = 'mandatory';
const FIELD_SPEC_PROPS = [SCHEMA_PROP, INITIAL_PROP, MANDATORY_PROP];

// Named consts for the bindings to the store.
const REDUX_STORE = 'redux_store_binding';
const REACT_STATE = 'react_state_binding';

// We need only one action type. The information about which
// part of the state has to be modified is contained in the action payload.
const UPDATE_ACTION_TYPE = 'update';

// Fields which are updating are set to this value.
const UPDATING_PROP_VAL = 'is_updating';


class FieldSpec {
  constructor(spec) {
    Object.keys(spec).forEach((prop) => {

      // We ignore properties which are not part of the known field specification properties.
      if (FIELD_SPEC_PROPS.indexOf(prop) < 0) return;

      // Sub-objects in field spec definitions are turned into schema definitions.
      if (prop === SCHEMA_PROP && !(spec[prop] instanceof Schema)) {
        this[prop] = new Schema(spec[prop]);
      }
      else {
        this[prop] = spec[prop];
      }
    });
  }
}


class Schema {
  constructor(obj) {
    Object.keys(obj).forEach((prop) => {
      this[prop] = new FieldSpec(obj[prop])
    });
  }

  createEmpty(obj) { return createEmpty(this, obj) }

  applyDefaults(obj) { return applyDefaults(this, obj)}

  createInitialized() {
    const emptyObject = this.createEmpty();
    return this.applyDefaults(emptyObject);
  }

  validate(obj) { return validate(this, obj)}

  reducer() {
    return (state=this.createEmpty(), action) => modelUpdateReducer(state, action);
  }
}

class StateModel {
  constructor(schema, stateHolder, stateBinding, initialState) {

    if (stateBinding === REDUX_STORE) {
      this.reduxStore = stateHolder;
    }
    else if (stateBinding === REACT_STATE) {
      this.reactComponent = stateHolder;
    }
    else {
      throw(`State binding ${stateBinding} not implemented`)
    }


    this.stateBinding = stateBinding;
    this.schema = schema;

    const initializedState = initialState ? initialState : schema.createInitialized();

    if (stateBinding === REACT_STATE) {
      this.reactComponent.state = initializedState;
    }
    else if (stateBinding === REDUX_STORE) {
      this.set(initializedState);
    }
  }

  get(propertyAccessorString) {
    let stateObject;
    if (this.stateBinding === REDUX_STORE) {
      stateObject = this.reduxStore.getState();
    }
    else if (this.stateBinding === REACT_STATE) {
      stateObject = this.reactComponent.state;
    }

    if (!propertyAccessorString) {
      return stateObject;
    }
    else {
      return nestedPropertyAccess(propertyAccessorString, stateObject);
    }
  }

  setOne(propertyAccessorString, value, callback) {
    const updateObj = updateObjectFromString(propertyAccessorString, value);
    this.immutableUpdate(updateObj, callback);
  }

  setUpdating(options){
    const updateObj = updateObjectFromOptions(options);
    this.immutableUpdate(updateObj);
  }

  set(obj, callback) {
    const updateObj = updateObjectFromObject(obj);
    this.immutableUpdate(updateObj, callback);
  }

  immutableUpdate(updateObj, callback) {

    const validation = this.schema.validate(immutableUpdate(this.get(), updateObj));
    if (!validation.result) {
      let errorString = 'Skipping update to prevent invalid state:';
      validation.errors.forEach((error) => {
        errorString = errorString.concat(JSON.stringify(error));
      });
      throw(errorString);
    }

    if (this.stateBinding === REACT_STATE) {
      this.reactComponent.setState((prevState) => immutableUpdate(prevState, updateObj), callback);
    }
    else if (this.stateBinding === REDUX_STORE) {
      this.reduxStore.dispatch({
        type: UPDATE_ACTION_TYPE,
        payload: updateObj,
      });

      // We provide this just to keep the interface for the react state and the redux case similar.
      if (callback) {
        console.error('Unnecessary callback: The update of the REDUX store is synchronous.');
        callback.call();
      }
    }
  }
}


// A regular react component, enriched with some stateModel boilerplate.
class StateModelComponent extends Component {

  constructor(props, schema, stateBindings, initialState) {
    super(props);
    this.schema = schema;
    if (stateBindings === REDUX_STORE) {
      this.store = createStore(this.schema.reducer());
      this.model = new StateModel(this.schema, this.store, stateBindings, initialState);
    }
    else if (stateBindings === REACT_STATE) {
      this.model = new StateModel(this.schema, this, stateBindings, initialState);
    }
  }

  mapStateToProps = (state, ownProps) => {
    return {...state, ...ownProps}
  };
}


// The following functions are not exported and probably never called directly, we use
// them to define Schema / StateModel object methods.


// Create an empty object according to the schema
// where all values are undefined
function createEmpty(schema, newObj={}) {
  Object.keys(schema).forEach((prop) => {

    if (schema[prop].hasOwnProperty(SCHEMA_PROP)) {
      newObj[prop] = createEmpty(schema[prop][SCHEMA_PROP])
    }
    else {
      newObj[prop] = undefined
    }
  });
  return newObj;
}

// Apply the defaults defined in a schema to a generic object. WE don't overwrite
// already existing values, defaults are only applied to undefined values.
function applyDefaults(schema, obj) {
  Object.keys(schema).forEach((prop) => {

    if (schema[prop][INITIAL_PROP] !== undefined) {
      if (schema[prop][INITIAL_PROP] instanceof Function) {
        obj[prop] = schema[prop][INITIAL_PROP]()
      }
      else {
        obj[prop] = schema[prop][INITIAL_PROP]
      }
    }
    else if (schema[prop].hasOwnProperty(SCHEMA_PROP)) {
      schema[prop][SCHEMA_PROP].applyDefaults(obj[prop])
    }
  });
  return obj;
}

// Validate a generic object against a schema.
function validate(schema, obj) {
  let errors = [];
  Object.keys(schema).forEach((prop) => {
    let subErrors = [];
    if (schema[prop].hasOwnProperty(SCHEMA_PROP)) {
      subErrors = schema[prop][SCHEMA_PROP].validate(obj[prop]).errors;
    }
    else {
      subErrors = validateField(prop, schema[prop], obj[prop]);
    }
    errors = errors.concat(subErrors);
  });
  const result = errors.length === 0;
  return {result, errors};
}

// Validate an individual field.
function validateField(fieldName, fieldSpec, fieldValue){
  const errors = [];
  if (fieldSpec[MANDATORY_PROP] && isEmpty(fieldValue)) {
    errors.push({[fieldName]: `${fieldName} must be provided and non-empty`});
  }
  return errors;
}

// Check if a single value is "non-empty" (depending on type).
function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (value instanceof String || typeof value === 'string') return value === '';
  if (value instanceof Number || typeof value === 'number') return false;
  return false;
}

// Create a mongodb-style update object from a dot-separated property
// accessor string and the desired value.
function updateObjectFromString(propAccessorString, value) {
  const updateObj = {};
  let leafObj = updateObj;
  propAccessorString.split('.').forEach((prop) => {
    leafObj[prop] = {};
    leafObj = leafObj[prop];
  });
  leafObj.$set = value;
  return updateObj
}

// Create a mongodb-style update object from a plain
// object containing the desired (potentially nested) values.
function updateObjectFromObject(obj){
  let updateObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] instanceof Object) {
      updateObj[prop] = updateObjectFromObject(obj[prop])
    }
    else {
      updateObj[prop] = {$set: obj[prop]}
    }
  });
  return updateObj
}

// Create a mongodb-style update object from a plain
// object containing the information about which fields are updating.
function updateObjectFromOptions(options){
  let updateObj = {};
  Object.keys(options).forEach((prop) => {
    if (options[prop] instanceof Object) {
      updateObj[prop] = updateObjectFromOptions(options[prop])
    }
    else {
      if (options[prop] === true) {
        updateObj[prop] = {$set: UPDATING_PROP_VAL}
      }
    }
  });
  return updateObj
}

// Translate nestedPropertyAccess('some.string.with.dots', obj)
// into obj[some][string][with][dots]
function nestedPropertyAccess(propAccessorString, obj) {
  let leaf = obj;
  propAccessorString.split('.').forEach((prop) => {
    leaf = leaf[prop];
  });
  return leaf;
}

// A redux reducer that will handle immutability-helper
// updates.
function modelUpdateReducer(state, action) {
  if (action.type === UPDATE_ACTION_TYPE) {
    return immutableUpdate(state, action.payload);
  }
  return state
}

export { Schema, StateModel, StateModelComponent, REDUX_STORE, REACT_STATE }

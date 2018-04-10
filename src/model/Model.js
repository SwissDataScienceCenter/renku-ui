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


const PropertyName = {
  SCHEMA: 'schema',
  INITIAL: 'initial',
  MANDATORY: 'mandatory'
};

// Named consts for the bindings to the store.
const StateKind = {
  REDUX: 'redux_store',
  REACT: 'react_State'
};

// We currently need only one action type. The information about which
// part of the state has to be modified is contained in the action payload.
const ActionType = {
  UPDATE: 'update'
};

// Fields which are updating are set to this value.
const SpecialPropVal = {
  UPDATING: 'is_updating'
};

class FieldSpec {
  constructor(spec) {
    Object.keys(spec).forEach((prop) => {

      // We ignore properties which are not part of the known field specification properties.
      if (Object.values(PropertyName).indexOf(prop) < 0) return;

      // Handle arrays in Field spec definitions
      if (prop === PropertyName.SCHEMA && spec[prop] instanceof Array) {
        if (spec[prop][0] && !(spec[prop] instanceof Schema)) {
          this[prop] = [new Schema(spec[prop][0])]
        }
        else {
          this[prop] = []
        }
      }
      // Sub-objects in field spec definitions are turned into schema definitions.
      else if (prop === PropertyName.SCHEMA && !(spec[prop] instanceof Schema)) {
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

    if (stateBinding === StateKind.REDUX) {
      this.reduxStore = stateHolder;
    }
    else if (stateBinding === StateKind.REACT) {
      this.reactComponent = stateHolder;
    }
    else {
      throw new Error(`State binding ${stateBinding} not implemented`)
    }

    this.stateBinding = stateBinding;
    this.schema = schema;

    const initializedState = initialState ? initialState : schema.createInitialized();

    if (stateBinding === StateKind.REACT) {
      this.reactComponent.state = initializedState;
    }
    else if (stateBinding === StateKind.REDUX) {
      this.set(initializedState);
    }
  }

  get(propertyAccessorString) {
    let stateObject;
    if (this.stateBinding === StateKind.REDUX) {
      stateObject = this.reduxStore.getState();
    }
    else if (this.stateBinding === StateKind.REACT) {
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
    const updateObj = updateObjectFromObject(obj, this.get());
    this.immutableUpdate(updateObj, callback);
  }

  immutableUpdate(updateObj, callback) {

    // TODO: Reconsider validation, for what and when it should be used.
    // const validation = this.schema.validate(immutableUpdate(this.get(), updateObj));
    // if (!validation.result) {
    //   let errorString = 'Skipping update to prevent invalid state:';
    //   validation.errors.forEach((error) => {
    //     errorString = errorString.concat(JSON.stringify(error));
    //   });
    //   throw(errorString);
    // }

    if (this.stateBinding === StateKind.REACT) {
      this.reactComponent.setState((prevState) => immutableUpdate(prevState, updateObj), callback);
    }
    else if (this.stateBinding === StateKind.REDUX) {
      this.reduxStore.dispatch({
        type: ActionType.UPDATE,
        payload: updateObj,
      });

      // We provide this just to keep the interface for the react state and the redux case similar.
      if (callback) {
        console.error('Unnecessary callback: The update of the REDUX store is synchronous.');
        callback.call();
      }
    }
  }

  validate() {
    return this.schema.validate(this.get())
  }
}


class SubModel {
  constructor(model, path) {
    this.get = (propAccessorString) => {
      const fullPropAccessorString = path + (propAccessorString ? '.' + propAccessorString : '');
      return model.get(fullPropAccessorString);
    };
    this.setOne = (propAccessorString, value) => model.setOne(path + '.' + propAccessorString, value);
    this.set = (obj) => {
      const fullObj = {};
      let leafObj = fullObj;
      path.split('.').forEach((prop) => {
        leafObj[prop] = {};
        leafObj = leafObj[prop];
      });
      Object.keys(obj).forEach((prop) => leafObj[prop] = obj[prop]);
      model.set(fullObj);
    };
    this.setUpdating = (options) => {
      const fullOptions = {};
      let leafOptions = fullOptions;
      path.split('.').forEach((prop) => {
        leafOptions[prop] = {};
        leafOptions = leafOptions[prop];
      });
      Object.keys(options).forEach((prop) => leafOptions[prop] = options[prop]);
      model.setUpdating(fullOptions);
    }
  }
}

// The following functions are not exported and probably never called directly, we use
// them to define schema/model object methods.

// A regular react component, enriched with some stateModel boilerplate.
class StateModelComponent extends Component {

  constructor(props, schema, stateBindings, initialState) {
    super(props);
    this.schema = schema;
    if (stateBindings === StateKind.REDUX) {
      this.store = createStore(this.schema.reducer());
      this.model = new StateModel(this.schema, this.store, stateBindings, initialState);
    }
    else if (stateBindings === StateKind.REACT) {
      this.model = new StateModel(this.schema, this, stateBindings, initialState);
    }
  }

  // We map the entire state tree to props.
  mapStateToProps = (state, ownProps) => {
    if (this.model instanceof SubModel) {
      return {...state}
    }
    else {
      return {...state, ...ownProps}
    }
  };
}

// We provide a StateModelSubComponent which must be passed a model and a path
// as props. From these, a SubModel is created which allows convenient access
// to the inherited state.
class StateModelSubComponent extends Component {
  constructor(props) {
    super(props);
    this.model = new SubModel(this.props.model, this.props.path);

    // We provide a default implementation of mapStateToProps which returns the
    // sub-region of the entire store tree.
    this.mapStateToProps = (state, ownProps) => {
      return {...nestedPropertyAccess(this.props.path, state), ...ownProps}
    }
  }
}

// The following functions are not exported and probably never called directly, we use
// them to define Schema / StateModel object methods.


// Create an empty object according to the schema
// where all values are undefined
function createEmpty(schema, newObj={}) {
  Object.keys(schema).forEach((prop) => {
    if (schema[prop].hasOwnProperty(PropertyName.SCHEMA) && schema[prop][PropertyName.SCHEMA] instanceof Array) {
      newObj[prop] = []
    }
    else if (schema[prop].hasOwnProperty(PropertyName.SCHEMA)) {
      newObj[prop] = createEmpty(schema[prop][PropertyName.SCHEMA])
    }
    else {
      newObj[prop] = undefined
    }
  });
  return newObj;
}

// Apply the defaults defined in a schema to a generic object. We don't overwrite
// already existing values, defaults are only applied to undefined values.
function applyDefaults(schema, obj) {
  Object.keys(schema).forEach((prop) => {
    const initialValue = schema[prop][PropertyName.INITIAL];
    if (initialValue !== undefined) {
      if (initialValue instanceof Function) {
        obj[prop] = initialValue()
      }
      else {
        // TODO: Add proper check here to make sure only JSON-serializable initial
        // TODO: values are accepted
        obj[prop] = JSON.parse(JSON.stringify(initialValue));
      }
    }
    // If the sub-schema is an array, we leave it empty, otherwise we apply the defaults to the sub-objects.
    else if (schema[prop].hasOwnProperty(PropertyName.SCHEMA)
      && !(schema[prop][PropertyName.SCHEMA] instanceof Array)) {
      schema[prop][PropertyName.SCHEMA].applyDefaults(obj[prop])
    }
  });
  return obj;
}

// Validate a generic object against a schema.
function validate(schema, obj) {
  if (!(obj instanceof Object)) {
    throw new Error('Only objects should be passed to this routine')
  }
  let errors = [];
  Object.keys(schema).forEach((prop) => {
    let subErrors = [];
    // schema[prop] conatains another schema but the corresponding obj property is NOT an object itself.
    if (schema[prop].hasOwnProperty(PropertyName.SCHEMA) && !(obj[prop] instanceof Object)) {
      subErrors = validateField(prop, schema[prop], obj[prop]);
    }
    // schema[prop] conatains another schema which is not an array
    else if (schema[prop].hasOwnProperty(PropertyName.SCHEMA) &&
      (schema[prop][PropertyName.SCHEMA] instanceof Schema)) {
      subErrors = schema[prop][PropertyName.SCHEMA].validate(obj[prop]).errors;
    }
    // schema[prop] contains another schema which is an array
    else if (
      schema[prop].hasOwnProperty(PropertyName.SCHEMA)
      && (schema[prop][PropertyName.SCHEMA] instanceof Array)
      && (schema[prop][PropertyName.SCHEMA].length > 0)
    ) {
      subErrors = obj[prop]
        .map((el, i) => {
          if (el instanceof Object) {
            return schema[prop][PropertyName.SCHEMA][0].validate(el).errors
          }
          else {
            return [{[prop]: `${prop}[${i}] must be an object`}];
          }
        })
        .reduce((arr1, arr2) => arr1.concat(arr2));
    }
    // schema[prop] contains no schema
    else {
      subErrors = validateField(prop, schema[prop], obj[prop]);
    }
    errors = errors.concat(subErrors);
  });
  const result = errors.length === 0;
  return {result, errors};
}

// Validate an individual field.
// TODO: Validation of mandatory sub-fields of non-mandatory fields seems to give unexpected results.
function validateField(fieldName, fieldSpec, fieldValue){
  const errors = [];
  if (fieldSpec[PropertyName.SCHEMA] instanceof Array && !(fieldValue instanceof Array)) {
    errors.push({[fieldName]: `${fieldName} must be an array`})
  }
  else if (fieldSpec[PropertyName.SCHEMA] instanceof Object && !(fieldValue instanceof Object)) {
    errors.push({[fieldName]: `${fieldName} must be an object`})
  }
  else if (fieldSpec[PropertyName.MANDATORY] && isEmpty(fieldValue)) {
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
function updateObjectFromObject(obj, currentObject){
  let updateObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] instanceof Object && currentObject[prop]) {
      updateObj[prop] = updateObjectFromObject(obj[prop], currentObject[prop])
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
        updateObj[prop] = {$set: SpecialPropVal.UPDATING}
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
  if (action.type === ActionType.UPDATE) {
    return immutableUpdate(state, action.payload);
  }
  return state
}

export { Schema, StateModel, StateModelComponent, StateKind , SubModel, StateModelSubComponent}

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
 *  A model is a class created from a schema definition. Instances of a model have
 *  methods to create, initialize, validate, update, etc. the object properties
 *  according to the schema definitions.
 *
 *  Models are created from the Model base class by overriding the getSchema method
 *
 *  class modelName extends Model {
 *    getSchema() {return someSchema}
 *  }
 *
 *  or by using a convenience method:
 *
 *  const modelName = someSchema.toModel();
 *
 *  The latter variant creates instances with a nameless constructor
 *  (instance.constructor.name = "").
 */

// TODO: Maybe use [jsdoc](http://usejsdoc.org/) here?

import immutableUpdate from 'immutability-helper';
import uuid from 'uuid';


const SCHEMA_PROP = 'schema';
const INITIAL_PROP = 'initial';
const MANDATORY_PROP = 'mandatory';

const FIELD_SPEC_PROPS = [SCHEMA_PROP, INITIAL_PROP, MANDATORY_PROP];


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

  toModel() { return modelFromSchema(this) }

  modelInstance(obj) {
    return new (modelFromSchema(this))(obj);
  }

  getReducer() {
    return (state=this.modelInstance(), action) => modelUpdateReducer(state, action);
  }
}


class Model {
  constructor(obj){

    // Check if getSchema has been overridden, raise error if not.
    if (!this.getSchema()) {
      throw(`ModelError: No schema defined for model ${this.constructor.name}`)
    }

    // We create a uuid to identify an instance in the redux store.
    if (!(obj && obj._uuid)) this._uuid = uuid.v4();

    // If an object is passed into the constructor, we use this object. Otherwise,
    // we create all the defaults according to schema.
    if(obj){
      Object.keys(obj).forEach((prop) => {
        this[prop] = obj[prop];
      });
    }
    else {
      this.getSchema().createEmpty(this);
      this.getSchema().applyDefaults(this);
    }
  }


  // We make the static method accessible on each instance.
  getSchema() { return this.constructor.getSchema() }

  // For nameless models (created though .toModel() from a schema)
  // this convenience method returns the schema name.
  getSchemaName() { return this.getSchema().constructor.name }

  // Apply the defaults to undefined properties.
  applyDefaults() { applyDefaults(this.getSchema(), this)}

  // Validate instance against the schema of its class.
  validate() { return validate(this.getSchema(), this)}

  // Immutable update: create new modified instance.
  update(updateObj){
    return new this.constructor(immutableUpdate(this, updateObj))
  }

  // Immutably set a value to a property using dot-notation syntax for
  // the property accessor.
  set(propertyAccessor, value) {
    return this.update(createUpdateObject(propertyAccessor, value))
  }

  updateActionType() { return `UPDATE-${this._uuid}`}

  updateAction(updateObj) {
    return {
      type: this.updateActionType(),
      payload: updateObj,
    }
  }

  setAction(propertyAccessor, value) {
    return this.updateAction(createUpdateObject(propertyAccessor, value))
  }

  reduce(action) { return this.update(action.payload) }

  // Dummy method. MUST be overridden in child class definition.
  static getSchema() { return undefined }

  // Alternative initialization method: Create all the properties but leave
  // them undefined.
  static createEmpty() {
    const emptyObject = this.getSchema().createEmpty();
    // 'this' refers to the class itself in static methods.
    return new this(emptyObject)
  }

  static getReducer() {
    return (state=new this(), action) => modelUpdateReducer(state, action);
  }
}

// The following functions are not exported and probably never called directly, we use
// them to define schema/model object methods.

// Create a 'nameless' model sub-class from a schema.
function modelFromSchema(schema) {
  return class extends Model{
    static getSchema() { return schema }
  }
}

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

// Convenience method to immutably set a value to a property of a deeply nested
// object using a syntax inspired by the JS dot-notation for property access.
// This function creates the updateObject from the property accessor string and
// the desired value.
function createUpdateObject(propAccessorString, value) {
  const updateObj = {};
  let leafObj = updateObj;
  propAccessorString.split('.').forEach((prop) => {
    leafObj[prop] = {};
    leafObj = leafObj[prop];
  });
  leafObj.$set = value;
  return updateObj
}

// A redux reducer that will handle updates for the part of the
// state tree corresponding to the model instance.
function modelUpdateReducer(state, action) {
  if (state.updateActionType() === action.type) {
    return state.reduce(action)
  }
  else {
    return state
  }
}

export { Schema, Model, modelUpdateReducer }

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
 *  renku-ui
 *
 *  Model.test.js
 *  Tests for models.
 */


import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-test-renderer";

import { Schema, StateModel, StateKind } from "./Model";
import { createStore } from "redux";


const simpleSchema = new Schema({
  name: { initial: "Jane Doe", mandatory: true },
  purpose: { initial: "", mandatory: false },
  numbers: { schema: [], initial: [0, 1] }
});

const simpleObject = { name: "Jane Doe", purpose: "", numbers: [0, 1] };

const arraySchema = new Schema({
  manyLetters: { schema: [], initial: ["a", "b", "c"] },
  manyNumbers: { schema: [] },
  manyThings: { schema: [simpleSchema], initial: [{ ...simpleObject }] },
});

const arrayObject = {
  manyLetters: ["a", "b", "c"],
  manyNumbers: [],
  manyThings: [{ ...simpleObject }]
};

const complexSchema = new Schema({
  basics: { schema: simpleSchema, mandatory: true },
  subThing: { schema: { age: { initial: 0, mandatory: true } }, mandatory: true },
  createdAt: { initial: () => "right now" },
  simpleThings: { schema: [simpleSchema], initial: [{ ...simpleObject }, { ...simpleObject, name: "Johnny" }] }
});

const complexObject = {
  basics: { ...simpleObject },
  createdAt: "right now",
  subThing: { age: 0 },
  simpleThings: [{ ...simpleObject }, { ...simpleObject, name: "Johnny" }]
};


describe("simple creation", () => {

  const emptyObject = { name: undefined, purpose: undefined, numbers: [] };

  it("creates empty object from schema", () => {
    const emptyThing = simpleSchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject);
  });
  it("creates initialized object from schema", () => {
    const initializedThing = simpleSchema.createInitialized();
    expect(initializedThing).toEqual(simpleObject);
  });
  it("creates initialized instance", () => {
    const store = createStore(simpleSchema.reducer());
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store);
    expect(simpleModel.get()).toEqual((simpleObject));
  });
  it("creates instance from initial object", () => {
    const store = createStore(simpleSchema.reducer());
    const initialObject = { ...simpleSchema.createInitialized(), name: "John Doe", numbers: [0, 1] };
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store, initialObject);
    expect(simpleModel.get()).toEqual(initialObject);
  });
});

describe("array creation", () => {

  const emptyObject = {
    manyLetters: [],
    manyNumbers: [],
    manyThings: [],
  };

  it("creates empty object from schema", () => {
    const emptyThing = arraySchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject);
  });
  it("creates initialized object from schema", () => {
    const initializedThing = arraySchema.createInitialized();
    expect(initializedThing).toEqual(arrayObject);
  });
  it("creates instance from initial object", () => {
    const store = createStore(arraySchema.reducer());
    const initialObject = { ...arraySchema.createInitialized(), manyNumbers: [0, 1, 0, 1] };
    const arrayModel = new StateModel(arraySchema, StateKind.REDUX, store, initialObject);
    expect(arrayModel.get()).toEqual(initialObject);
  });
  it("creates initialized instance", () => {
    const store = createStore(arraySchema.reducer());
    const arrayModel = new StateModel(arraySchema, StateKind.REDUX, store);
    expect(arrayModel.get()).toEqual((arrayObject));
  });
});

describe("complex creation", () => {

  const emptyObject = {
    basics: { name: undefined, purpose: undefined, numbers: [] },
    subThing: { age: undefined },
    createdAt: undefined,
    simpleThings: []
  };

  it("creates empty object from schema", () => {
    const emptyThing = complexSchema.createEmpty();
    expect(emptyThing).toEqual(emptyObject);
  });
  it("creates initialized object from schema", () => {
    const initializedThing = complexSchema.createInitialized();
    expect(initializedThing).toEqual(complexObject);
  });
  it("creates instance from initial object", () => {
    const store = createStore(complexSchema.reducer());
    const initialObject = { ...complexSchema.createInitialized(), subThing: { age: 1 } };
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store, initialObject);
    expect(complexModel.get()).toEqual(initialObject);
  });
  it("creates initialized instance", () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    expect(complexModel.get()).toEqual((complexObject));
  });
});


describe("validation", () => {

  const simpleErrors = {
    result: false,
    errors: [{ name: "name must be provided and non-empty" }]
  };
  const arrayErrors = {
    result: false,
    errors: [
      { manyNumbers: "manyNumbers must be an array" },
      { manyThings: "manyThings[1] must be an object" }
    ]
  };
  const complexErrors = {
    result: false,
    errors: [
      { name: "name must be provided and non-empty" },
      { subThing: "subThing must be an object" },
      { name: "name must be provided and non-empty" }
    ]
  };

  it("simple empty validates false", () => {
    const initializedThing = simpleSchema.createInitialized();
    expect(simpleSchema.validate({ ...initializedThing, name: "" })).toEqual(simpleErrors);
  });
  it("complex array validates false", () => {
    const initializedThing = arraySchema.createInitialized();
    initializedThing.manyNumbers = "something";
    initializedThing.manyThings[1] = "somethingElse";
    expect(arraySchema.validate(initializedThing)).toEqual(arrayErrors);
  });
  it("complex empty validates false", () => {
    const initializedThing = complexSchema.createInitialized();
    initializedThing.subThing = "a string";
    initializedThing.basics.name = null;
    initializedThing.simpleThings[1].name = null;
    expect(complexSchema.validate(initializedThing)).toEqual(complexErrors);
  });
});

describe("update react state", () => {
  class TestReactStateComponent extends Component {
    constructor(props) {
      super(props);
      this.model = new StateModel(complexSchema, StateKind.REACT, this, complexSchema.createInitialized());
    }

    UNSAFE_componentWillMount() {
      this.model.set("subThing.age", 1);
      this.model.set("simpleThings.0.numbers.2", 2);
    }

    render() {
      let updatedSimpleThings = [...complexObject.simpleThings];
      updatedSimpleThings[0] = { ...complexObject.simpleThings[0], numbers: [0, 1, 2] };
      // eslint-disable-next-line
      expect(this.model.get()).toEqual({ ...complexObject, subThing: { age: 1 }, simpleThings: updatedSimpleThings });
      return null;
    }
  }
  it("updates complex state", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(<TestReactStateComponent />);
    });
  });
});

describe("update disconnected redux store", () => {
  it("updates simple instance in redux store", () => {
    const store = createStore(simpleSchema.reducer());
    const simpleModel = new StateModel(simpleSchema, StateKind.REDUX, store);
    simpleModel.setObject({ name: "John Doe" });
    expect(simpleModel.get()).toEqual({ ...simpleObject, name: "John Doe" });
  });
  it("updates complex instance in redux store", () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    complexModel.setObject({ subThing: { age: 1 }, simpleThings: { 1: { name: "Jenny" } } });

    // Build the more complex comparison Object
    const comparisonObject = { ...complexObject, subThing: { age: 1 } };
    comparisonObject.simpleThings = [...comparisonObject.simpleThings];
    comparisonObject.simpleThings[1] = { ...comparisonObject.simpleThings[1], name: "Jenny" };

    expect(complexModel.get()).toEqual(comparisonObject);
  });
  it("updates complex instance in redux store using property accessor syntax", () => {
    const store = createStore(complexSchema.reducer());
    const complexModel = new StateModel(complexSchema, StateKind.REDUX, store);
    complexModel.set("subThing.age", 1);
    expect(complexModel.get()).toEqual({ ...complexObject, subThing: { age: 1 } });
  });
});

describe("update connected redux store", () => {

  class TestReduxStateComponent extends Component {
    constructor(props) {
      super(props);
      this.model = new StateModel(complexSchema, StateKind.REACT, this);
    }

    UNSAFE_componentWillMount() {
      this.model.set("subThing.age", 1);
    }

    render() {
      // eslint-disable-next-line
      expect(this.model.get()).toEqual({ ...complexObject, subThing: { age: 1 } });
      return null;
    }
  }

  it("updates complex state", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    await act(async () => {
      root.render(<TestReduxStateComponent />);
    });
  });
});

describe("update redux store using immutability-helper commands", () => {
  const schema = new Schema({ complex: { schema: complexSchema }, array: { schema: arraySchema } });
  let model = new StateModel(schema, StateKind.REDUX);

  // test object updates
  let referenceObject = { ...simpleObject };
  let updateObject;

  it("check complex object", () => {
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object without $set", () => {
    updateObject = { complex: { basics: {} } };
    // ? this doesn't overwrite the final object
    model.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object without $set", () => {
    referenceObject.name = "Max Mustermann";
    updateObject = { complex: { basics: { name: "Max Mustermann" } } };
    // ? this updates the name property without touching anything else
    model.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object with $set", () => {
    referenceObject = { name: "Max Mustermann" };
    updateObject = { complex: { basics: { $set: { name: "Max Mustermann" } } } };
    // ? this replace the `basics` object entirely
    model.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object with $set", () => {
    referenceObject = {};
    updateObject = { complex: { basics: { $set: {} } } };
    // ? this can be used also to reset an object
    model.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  // test array updates
  let referenceArray = [...arrayObject.manyLetters];
  let updateArray;

  it("check array object", () => {
    expect(model.get("array.manyLetters")).toEqual(referenceArray);
  });

  it("reset existing array without $set", () => {
    updateArray = { array: { manyLetters: [] } };
    // ? this doesn't overwrite the final array
    model.setObject(updateArray);
    expect(model.get("array.manyLetters")).toEqual(referenceArray);
  });

  it("update existing array without $set", () => {
    referenceArray[0] = "d";
    updateArray = { array: { manyLetters: ["d"] } };
    // ? this updates only the first array element without touching anything else
    model.setObject(updateArray);
    expect(model.get("array.manyLetters")).toEqual(referenceArray);
  });

  it("update existing array with $set", () => {
    referenceArray = ["d"];
    updateArray = { array: { manyLetters: { $set: ["d"] } } };
    // ? this replace the `manyLetters` array entirely
    model.setObject(updateArray);
    expect(model.get("array.manyLetters")).toEqual(referenceArray);
  });

  it("reset existing array with $set", () => {
    referenceArray = [];
    updateArray = { array: { manyLetters: { $set: [] } } };
    // ? this can be used also to reset an array
    model.setObject(updateArray);
    expect(model.get("array.manyLetters")).toEqual(referenceArray);
  });

  // multiple updates example
  it("combine multiple objects and arrays updates with and without $set", () => {
    model = new StateModel(schema, StateKind.REDUX);
    referenceObject = model.get();
    referenceObject.array.manyLetters = ["d"];
    referenceObject.complex.basics = { name: "Max Mustermann" };
    referenceObject.complex.subThing.height = 200;
    referenceObject.complex.createdAt = "before";
    // ? this mixes adding attributes to objects, resetting them, changing plain attributes
    model.setObject({
      array: {
        manyLetters: { $set: ["d"] }
      },
      complex: {
        basics: {
          $set: { name: "Max Mustermann" }
        },
        subThing: {
          height: 200
        },
        createdAt: "before"
      }
    });
    expect(model.get()).toEqual(referenceObject);

    // Unset one of the fields
    model.setObject({
      complex: {
        basics: {
          $unset: ["name"],
        }
      }
    });
    referenceObject.complex.basics = {};
    expect(model.get()).toEqual(referenceObject);
  });
});

describe("update subModel object using immutability-helper commands", () => {
  const schema = new Schema({ complex: { schema: complexSchema }, array: { schema: arraySchema } });
  let model = new StateModel(schema, StateKind.REDUX);
  const complexSubModel = model.subModel("complex");

  // test object updates
  let referenceObject = { ...simpleObject };
  let updateObject;

  it("check complex object", () => {
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object without $set", () => {
    updateObject = { basics: {} };
    // ? this doesn't overwrite the final object
    complexSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object without $set", () => {
    referenceObject.name = "Max Mustermann";
    updateObject = { basics: { name: "Max Mustermann" } };
    // ? this updates the name property without touching anything else
    complexSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object with $set", () => {
    referenceObject = { name: "Max Mustermann" };
    updateObject = { basics: { $set: { name: "Max Mustermann" } } };
    // ? this replace the `basics` object entirely
    complexSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object with $set", () => {
    referenceObject = {};
    updateObject = { basics: { $set: {} } };
    // ? this can be used also to reset an object
    complexSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });
});

describe("update layered subModel object using immutability-helper commands", () => {
  const schema = new Schema({ complex: { schema: complexSchema }, array: { schema: arraySchema } });
  let model = new StateModel(schema, StateKind.REDUX);
  const complexBasicsSubModel = model.subModel("complex.basics");

  // test object updates
  let referenceObject = { ...simpleObject };
  let updateObject;

  it("check complex object", () => {
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object without $set", () => {
    updateObject = { };
    // ? this doesn't overwrite the final object
    complexBasicsSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object without $set", () => {
    referenceObject.name = "Max Mustermann";
    updateObject = { name: "Max Mustermann" };
    // ? this updates the name property without touching anything else
    complexBasicsSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("update existing object with $set", () => {
    referenceObject = { name: "Max Mustermann" };
    updateObject = { $set: { name: "Max Mustermann" } };
    // ? this replace the `basics` object entirely
    complexBasicsSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });

  it("reset existing object with $set", () => {
    referenceObject = {};
    updateObject = { $set: {} };
    // ? this can be used also to reset an object
    complexBasicsSubModel.setObject(updateObject);
    expect(model.get("complex.basics")).toEqual(referenceObject);
  });
});

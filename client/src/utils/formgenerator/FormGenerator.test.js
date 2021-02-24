import React from "react";
import ReactDOM from "react-dom";
import { Schema } from "../../model";
import { StateModel, globalSchema } from "../../model";
import FormGenerator, { FormGenerator as FormPanel } from "./";
import { DatasetImages } from "./fields/stockimages";

let schema = new Schema({
  name: {
    initial: "",
    name: "text",
    label: "Text",
    type: FormGenerator.FieldTypes.TEXT,
    parseFun: FormGenerator.Parsers.parseOnlyLetterAndSpace,
    help: "Help text",
    edit: false,
    validators: [
      {
        id: "text-length",
        isValidFun: input => FormGenerator.Validators.isAtLeastLength(input, 3),
        alert: "Text is too short"
      }
    ]
  },
  description: {
    initial: "",
    name: "textarea",
    label: "TextArea",
    type: FormGenerator.FieldTypes.TEXT_AREA,
    edit: false,
    validators: [
      {
        id: "textarea-length",
        isValidFun: input => FormGenerator.Validators.isNotEmpty(input),
        alert: "TextArea can't be empty"
      }
    ]
  },
  files: {
    initial: [],
    name: "files",
    label: "Files",
    edit: true,
    type: FormGenerator.FieldTypes.FILES
  },
  image: {
    initial: { options: DatasetImages, selected: -1 },
    name: "image",
    label: "Image",
    edit: false,
    type: FormGenerator.FieldTypes.IMAGE
  }
});

describe("rendering on create", () => {
  let spy = null;
  const model = new StateModel(globalSchema);

  beforeEach(() => {
    // ckeditor dumps some junk to the console.error. Ignore it.
    spy = jest.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("renders create form without crashing", () => {
    const div = document.createElement("div");
    div.setAttribute("id", "FormPanelRender");
    document.body.appendChild(div);

    const submitCallback = e =>
      Object.values(schema)
        .map(m => m.label + ": " + m.value + ",\n")
        .join("");

    ReactDOM.render(
      <FormPanel title="Create Dataset" submitLoader={false} btnName="Create Dataset"
        submitCallback={submitCallback} model={schema} modelTop={model}
        formLocation="/projects/namespace/project-name/datasets/new"/>,
      div
    );
  });
});

describe("rendering on modify", () => {
  let spy = null;
  const model = new StateModel(globalSchema);

  beforeEach(() => {
    // ckeditor dumps some junk to the console.error. Ignore it.
    spy = jest.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("renders modify form without crashing", () => {
    const div = document.createElement("div");

    const submitCallback = e =>
      Object.values(schema)
        .map(m => m.label + ": " + m.value + ",\n")
        .join("");

    ReactDOM.render(
      <FormPanel title="Modify Dataset" submitLoader={false} btnName="Create Dataset"
        submitCallback={submitCallback} model={schema} edit={true} modelTop={model}
        formLocation="/projects/namespace/project-name/datasets/new"/>,
      div
    );
  });
});

describe("validators", () => {
  it("checks at least length true", () => {
    expect(FormGenerator.Validators.isAtLeastLength({ value: "Hello World" }, 3)).toEqual(true);
  });
  it("checks at least length false", () => {
    expect(FormGenerator.Validators.isAtLeastLength({ value: "He" }, 3 )).toEqual(false);
  });
  it("checks that is filled true", () => {
    expect(FormGenerator.Validators.isNotEmpty({ value: "AnyValue" })).toEqual(true);
  });
  it("checks that is filled false", () => {
    expect(FormGenerator.Validators.isNotEmpty({ value: "" })).toEqual(false);
  });
});

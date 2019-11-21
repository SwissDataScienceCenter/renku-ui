import React from "react";
import ReactDOM from "react-dom";
import { Schema } from "../../model";
import FormGenerator, { FormPanel } from "./";

let schema = new Schema({
  name: {
    initial: "",
    name: "text",
    label: "Text",
    type: "text",
    parseFun: FormGenerator.Parsers.parseOnlyLetterAndSpace,
    help: "Help text",
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
    type: "cktextarea",
    validators: [
      {
        id: "textarea-length",
        isValidFun: input => FormGenerator.Validators.isNotEmpty(input),
        alert: "TextArea can't be emtpy"
      }
    ]
  },
  files: {
    initial: [],
    name: "files",
    label: "Files",
    type: "filepond",
    validators: [
      {
        id: "files-length",
        isValidFun: input => FormGenerator.Validators.isNotEmpty(input),
        alert: "File length should be more than 1."
      }
    ]
  }
});

describe("rendering", () => {
  it("renders form without crashing", () => {
    const div = document.createElement("div");

    const submitCallback = e =>
      alert(
        Object.values(schema)
          .map(m => m.label + ": " + m.value + ",\n")
          .join("")
      );

    ReactDOM.render(
      <FormPanel title="Create Dataset" btnName="Create Dataset" submitCallback={submitCallback} model={schema} />,
      div
    );
  });
});

describe("validators", () => {
  it("checks at least length true", () => {
    expect(FormGenerator.Validators.isAtLeastLength("Hello World", 3)).toEqual(true);
  });
  it("checks at least length false", () => {
    expect(FormGenerator.Validators.isAtLeastLength("He", 3)).toEqual(false);
  });
  it("checks that is filled true", () => {
    expect(FormGenerator.Validators.isNotEmpty("asdfasdf")).toEqual(true);
  });
  it("checks that is filled false", () => {
    expect(FormGenerator.Validators.isNotEmpty("")).toEqual(false);
  });
});

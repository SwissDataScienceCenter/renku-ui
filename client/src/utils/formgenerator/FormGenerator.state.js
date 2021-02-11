/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  renku-ui
 *
 *  FormGenerator.state.js
 *  FormGenerator state code.
 */

class FormGeneratorCoordinator {

  constructor(client, model, location, locationHash) {
    this.client = client;
    this.model = model;
    this.location = location;
    this.locationHash = locationHash;
  }

  /**
   * A form drafts the following form
   *
   * locationHash : {
   *    location
   *    currentFormModel:[ --> array of fields
   *      {
   *        name,
   *        value,
   *        type,
   *        internalValues --> here we store the internal state of a field
   *       }
   *      ]
   *    ],
   *    submitLoader: {value: boolean, text: "Submitting form..."},
   *    serverErrors,
   *    serverWarnings,
   *    ...
   * }
   *
   */

  /**
   * Add a form draft to the list
   *
   * @param {string} location - is the location of the form (could be projectSlug/...  or /project/new)
   * @param {string} currentFormModel - current state of the form model
   */
  addFormDraft(currentFormModel) {
    const drafts = this.model.get("formDrafts");
    let updateObject;
    if (drafts[this.locationHash]) {
      this.model.set(`formDrafts.${this.locationHash}.currentFormModel`, currentFormModel);
    }
    else {
      const newDraft = {
        location: this.location,
        currentFormModel: currentFormModel,
        submitLoader: { value: false, text: "Please wait..." }
      };
      updateObject = { formDrafts: { $set: { ...drafts, [this.locationHash]: newDraft } } };
      this.model.setObject(updateObject);
    }
    return drafts[this.locationHash];
  }

  getFormDraft() {
    const currentDraft = this.model.get("formDrafts")[this.locationHash];
    return currentDraft === undefined ? undefined : currentDraft.currentFormModel;
  }

  removeFormDraft() {
    this.model.set(`formDrafts.${this.locationHash}`, null);
  }

  setDraftProperty(propertyName, value) {
    const drafts = this.model.get("formDrafts");
    if (drafts[this.locationHash])
      this.model.set(`formDrafts.${this.locationHash}.${propertyName}`, value);
  }

  /**
   * Property is an array and can have nested properties
   * to retrieve the value of something like {property1: {property2: {property 3: value}}}
   * Here properties is [property1, property2, property3]
   */
  getFormDraftFieldProperty(fieldName, properties) {
    const draft = this.getFormDraft();
    let currentProp = draft.find(field => field.name === fieldName);
    if (currentProp) {
      for (let i = 0; i < properties.length; i++) {
        if (currentProp)
          currentProp = currentProp[properties[i]];
      }
      return currentProp;
    }
    return undefined;
  }

  setFormDraftFieldValue(fieldName, value) {
    const formDrafts = this.model.get("formDrafts");
    const fieldIndex = formDrafts[this.locationHash] ?
      formDrafts[this.locationHash].currentFormModel.findIndex(elem=> elem.name === fieldName) : -1;
    const currentValue = formDrafts[this.locationHash].currentFormModel[fieldIndex];

    if (fieldIndex > -1) {
      if (currentValue === undefined) {
        return this.model.setObject(
          { formDrafts: { [this.locationHash]:
          { currentFormModel: { [fieldIndex]: { $set: { ...value } } } } }
          } );
      }
      return this.model.setObject(
        { formDrafts: { [this.locationHash]:
          { currentFormModel: { [fieldIndex]: { ...value } } } }
        } );
    }
  }

  /**
   * A field can have a field called internal values that can contain state specific to the field.
   * In cases like the file uploader we want to keep the state of field in case the component
   * is mounted/dismounted and it is stored here.
   */
  getFormDraftInternalValuesProperty(fieldName, property) {
    const draft = this.getFormDraft();
    let currentProp = draft ? draft.find(field => field.name === fieldName) : undefined;
    if (currentProp) {
      const internalValues = currentProp["internalValues"];
      if (internalValues)
        return internalValues[property];
    }
    return undefined;
  }

  setFormDraftInternalValuesProperty(fieldName, property, value) {
    const formDrafts = this.model.get("formDrafts");
    const fieldIndex = formDrafts[this.locationHash] ?
      formDrafts[this.locationHash].currentFormModel.findIndex(elem=> elem.name === fieldName) : -1;
    const currentValue = this.getFormDraftInternalValuesProperty(fieldName, property);
    if (fieldIndex > -1) {
      if (currentValue !== undefined) {
        return this.model.setObject(
          { formDrafts: { [this.locationHash]: { currentFormModel: { [fieldIndex]:
            { internalValues: { [property]: { $set: value } } } } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts:
            { [this.locationHash]: { currentFormModel: { [fieldIndex]:
              { internalValues: { [property]: value } } } } }
        } );
    }
  }
}

export { FormGeneratorCoordinator };

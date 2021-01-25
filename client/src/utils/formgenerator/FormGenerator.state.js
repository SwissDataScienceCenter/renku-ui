class FormGeneratorCoordinator {

  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  /**
   * Add a form draft to the list
   *
   * @param {string} location - is the location of the form (could be projectSlug/...  or /project/new)
   * @param {string} currentFormModel - current state of the form model
   */
  addFormDraft(location, currentFormModel, mounted) {
    const drafts = this.model.get("formDrafts");
    let currentDraft = drafts.find(draft => draft.location === location);
    let newList;
    if (currentDraft) {
      if (mounted !== undefined)
        currentDraft.mounted = mounted;
      if (currentFormModel !== undefined)
        currentDraft.currentFormModel = currentFormModel;
      newList = drafts.map(draft => draft.location === location ?
        currentDraft
        : draft);
    }
    else {
      currentDraft = {
        location: location,
        currentFormModel: currentFormModel,
        mounted: true
      };
      newList = [...drafts, currentDraft];
    }
    let updateObject = { formDrafts: { $set: newList } };
    this.model.setObject(updateObject);
    return currentDraft;
  }

  getFormDraft(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    return currentDraft === undefined ? undefined : currentDraft.currentFormModel;
  }

  isMounted(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.mounted;
    return true;
  }

  getFormDraftProperty(location, fieldName, properties) {
    const draft = this.getFormDraft(location);
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

  getFormDraftFieldValue(location, fieldName) {
    const draft = this.getFormDraft(location);
    let currentProp = draft.find(field => field.name === fieldName);
    console.log(currentProp);
    return currentProp.value;
    // if (currentProp) {
    //   for (let i = 0; i < properties.length; i++) {
    //     if (currentProp)
    //       currentProp = currentProp[properties[i]];
    //   }
    //   return currentProp;
    // }
    // return undefined;
  }

  getFormDraftInternalValuesProperty(location, fieldName, property) {
    const draft = this.getFormDraft(location);
    let currentProp = draft ? draft.find(field => field.name === fieldName) : undefined;
    if (currentProp) {
      const internalValues = currentProp["internalValues"];
      if (internalValues)
        return internalValues[property];
    }
    return undefined;
  }

  setFormDraftInternalValuesProperty(location, fieldName, property, value) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    const fieldIndex = currentFormDraft ?
      currentFormDraft.currentFormModel.findIndex(elem=> elem.name === fieldName) : -1;
    const currentValue = this.getFormDraftInternalValuesProperty(location, fieldName, property);
    if (fieldIndex > -1) {
      if (currentValue !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { currentFormModel: { [fieldIndex]:
            { internalValues: { [property]: { $set: value } } } } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts:
            { [draftIndex]: { currentFormModel: { [fieldIndex]:
              { internalValues: { [property]: value } } } } }
        } );

    }
  }

  /**
   * Remove a form draft from the list
   *
   * @param {string} location - is the location of the form that should be removed
   */
  removeFormDraft(location) {
    const drafts = this.model.get("formDrafts");
    let updateObject = { formDrafts: { $set: [...drafts.filter(draft => draft.location !== location)] } };
    this.model.setObject(updateObject);
  }
}

export { FormGeneratorCoordinator };

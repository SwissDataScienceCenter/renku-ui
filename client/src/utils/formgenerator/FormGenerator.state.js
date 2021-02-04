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
        mounted: true,
        submitLoader: { value: false, text: "Please wait..." }
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

  getSubmitLoader(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.submitLoader;
    return true;
  }

  setSubmitLoader(location, submitLoader) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    if (currentFormDraft) {
      if (currentFormDraft.submitLoader !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { submitLoader: { $set: submitLoader } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts: { [draftIndex]: { submitLoader: submitLoader } }
        } );
    }
  }

  getSecondaryButtonText(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.secondaryButton;
    return;
  }

  setSecondaryButtonText(location, text) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    if (currentFormDraft) {
      if (currentFormDraft.text !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { secondaryButton: { $set: text } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts: { [draftIndex]: { secondaryButton: text } }
        } );
    }
  }

  getServerErrors(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.serverErrors;
    return;
  }

  setServerErrors(location, serverErrors) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    if (currentFormDraft) {
      if (currentFormDraft.serverErrors !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { serverErrors: { $set: serverErrors } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts: { [draftIndex]: { serverErrors: serverErrors } }
        } );
    }
  }

  getServerWarnings(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.serverWarnings;
    return;
  }

  setServerWarnings(location, serverWarnings) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    if (currentFormDraft) {
      if (currentFormDraft.serverWarnings !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { serverWarnings: { $set: serverWarnings } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts: { [draftIndex]: { serverWarnings: serverWarnings } }
        } );
    }
  }

  getDisableAll(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    if (currentDraft) return currentDraft.disableAll;
    return false;
  }

  setDisableAll(location, disableAll) {
    const formDrafts = this.model.get("formDrafts");
    const draftIndex = formDrafts ? formDrafts.findIndex(elem=> elem.location === location) : -1;
    const currentFormDraft = draftIndex > -1 ? formDrafts[draftIndex] : undefined;
    if (currentFormDraft) {
      if (currentFormDraft.disableAll !== undefined) {
        return this.model.setObject(
          { formDrafts: { [draftIndex]: { disableAll: { $set: disableAll } } }
          } );
      }
      //else
      return this.model.setObject(
        { formDrafts: { [draftIndex]: { disableAll: disableAll } }
        } );
    }
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
    return currentProp.value;
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

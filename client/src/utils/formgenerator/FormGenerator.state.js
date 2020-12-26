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
  addFormDraft(location, currentFormModel) {
    const formDraft = {
      location: location,
      currentFormModel: currentFormModel
    };
    const drafts = this.model.get("formDrafts"); //filter form
    let updateObject = { formDrafts: { $set: [...drafts, formDraft] } };
    this.model.setObject(updateObject);
    return formDraft;
  }

  getFormDraft(location) {
    const drafts = this.model.get("formDrafts");
    const currentDraft = drafts.find(draft => draft.location === location);
    return currentDraft === undefined ? undefined : currentDraft.currentFormModel;
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

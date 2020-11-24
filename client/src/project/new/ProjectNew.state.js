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
 *  ProjectNew.state.js
 *  New project controller code.
 */

import { CUSTOM_REPO_NAME } from "./ProjectNew.container";
import { newProjectSchema } from "../../model/RenkuModels";
import { slugFromTitle, verifyTitleCharacters } from "../../utils/HelperFunctions";

class NewProjectCoordinator {
  constructor(client, model, projectsModel) {
    this.client = client;
    this.model = model;
    this.projectsModel = projectsModel;
  }

  _setTemplateVariables(currentInput, value) {
    const templates = currentInput.userRepo ?
      this.model.get("meta.userTemplates") :
      this.model.get("templates");
    const template = templates.all.filter(t => t.id === value)[0];
    const variables = template && template.variables ?
      Object.keys(template.variables) :
      [];

    // preserve already set values
    const oldValues = currentInput.template ?
      currentInput.variables :
      {};
    const oldVariables = Object.keys(oldValues);
    const values = variables.reduce((values, variable) => {
      const text = oldVariables.includes(variable) ?
        oldValues[variable] :
        "";
      return { ...values, [variable]: text };
    }, {});
    return values;
  }

  resetInput() {
    const pristineInput = newProjectSchema.createInitialized().input;
    this.model.setObject({ input: pristineInput });
  }

  setProperty(property, value) {
    const currentInput = this.model.get("input");

    // check if the value needs to be updated
    if (currentInput[property] === value)
      return;
    let updateObj = { input: { [property]: value } };
    if (currentInput[`${property}Pristine`])
      updateObj.input[`${property}Pristine`] = false;

    // reset knowledgeGraph when needed
    if (property === "visibility")
      updateObj.input.knowledgeGraph = true;

    // unset template when changing source
    if (property === "userRepo")
      updateObj.input.template = "";

    // pre-set variables and reset when needed
    if (property === "template")
      updateObj.input.variables = { $set: this._setTemplateVariables(currentInput, value) };

    // validate current state and update model
    updateObj["meta"] = { validation: this.validate(updateObj.input) };
    this.model.setObject(updateObj);
  }

  getSlugAndReset() {
    const creation = this.model.get("meta.creation");
    const pristineCreation = newProjectSchema.createInitialized().meta.creation;
    this.model.setObject({ meta: { creation: pristineCreation } });
    return `${creation.newNamespace}/${creation.newName}`;
  }

  setVariable(variable, value) {
    this.model.set(`input.variables.${variable}`, value);
  }

  setTemplateProperty(property, value) {
    const currentInput = this.model.get("meta.userTemplates");

    // check if the value needs to be updated
    if (currentInput[property] === value)
      return;
    this.model.set(`meta.userTemplates.${property}`, value);
    let updateObj = { meta: { userTemplates: { [property]: value, fetched: false } } };
    this.model.setObject(updateObj);
  }

  setConfig(custom, repositories) {
    let updateObject = {
      config: {
        custom,
        repositories: { $set: repositories }
      }
    };

    // set the user repo to false if not allowed to change it
    if (!custom)
      updateObject.input = { userRepo: false };

    this.model.setObject(updateObject);
  }

  /**
   * Put the template data in the proper object in the store and validate them.
   *
   * @param {object} templateData - template data
   * @param {boolean} [userRepo] - whether or not it's a user custom repo
   */
  createTemplatesObject(templateData, userRepo = false) {
    const validation = this.validate(null, templateData);
    const updateObject = userRepo ?
      { meta: { userTemplates: templateData, validation } } :
      { templates: templateData, meta: { validation } };
    return updateObject;
  }

  /**
   * Fetch all the templates listed in the sources
   *
   * @param {object[]} [sources] - List of sources in the format { url, ref, name }. If not provided,
   *   the list in model.config.repositories will be used instead.
   * @param {boolean} [userRepo] - whether or not it's a user custom repo
   */
  async getTemplates(sources = null, userRepo = false) {
    // use deployment repositories if nothing else is provided
    if (!sources || !sources.length)
      sources = this.model.get("config.repositories");

    // verify sources and set fetching status
    if (!sources || !sources.length) {
      const errorText = "No project templates are available in this RenkuLab deployment. Please notify a RenkuLab " +
        "administrator and ask them to configure a project template repository.";
      const templatesObject = {
        fetched: false,
        fetching: false,
        all: { $set: [] },
        errors: { $set: [{ "global": errorText }] }
      };
      this.model.setObject(this.createTemplatesObject(templatesObject, userRepo));
      throw errorText;
    }

    this.model.setObject(this.createTemplatesObject({ fetching: true }, userRepo));

    // fetch manifest and collect templates and errors
    let errors = [], templates = [];
    for (const source of sources) {
      const answer = await this.getTemplate(source.url, source.ref);
      if (Array.isArray(answer)) {
        for (const template of answer) {
          templates.push({
            parentRepo: source.name,
            parentTemplate: template.folder,
            id: `${source.name}/${template.folder}`,
            name: template.name,
            description: template.description,
            variables: template.variables
          });
        }
      }
      else {
        errors.push({ [source.name]: answer });
      }
    }

    const templatesObject = {
      fetched: new Date(),
      fetching: false,
      errors: { $set: errors },
      all: { $set: templates }
    };
    const valObj = this.createTemplatesObject(templatesObject, userRepo);
    this.model.setObject(valObj);
    return templates;
  }

  /**
   * Fetch single template and return manifest array or error message.
   *
   * @param {string} url - Target template repository url
   * @param {string} ref - Target ref (tag, commit or branch)
   */
  async getTemplate(url, ref) {
    const resp = await this.client.getTemplatesManifest(url, ref);
    if (resp.error)
      return resp.error.reason;
    else if (resp.result.templates && resp.result.templates.length)
      return resp.result.templates;
    return "No templates available in this repo.";
  }

  async getVisibilities(namespace) {
    // function to compute available visibilities based on the current group visibility
    const computeVisibilities = (max) => {
      if (max === "private")
        return ["private"];
      else if (max === "internal")
        return ["private", "internal"];
      return ["private", "internal", "public"];
    };

    let visibilities, updateObject = { meta: { namespace: {} } };
    if (namespace.kind === "user") {
      visibilities = computeVisibilities("public");
      updateObject.meta.namespace = {
        visibility: "public",
        visibilities: { $set: visibilities },
      };
    }
    else {
      // temporarily reset visibility metadata
      this.model.setObject({
        meta: {
          namespace: {
            fetched: null,
            fetching: true,
            id: namespace.full_path,
            visibility: null,
            visibilities: { $set: [] },
          }
        }
      });
      // verify group visibility
      const group = await this.client.getGroupByPath(namespace.full_path).then(r => r.data);
      visibilities = computeVisibilities(group.visibility);
      updateObject.meta.namespace = {
        visibility: group.visibility,
        visibilities: { $set: visibilities },
      };
    }

    // set common properties
    updateObject.meta.namespace.fetched = new Date();
    updateObject.meta.namespace.fetching = false;
    updateObject.meta.namespace.id = namespace.full_path;

    // save the model and invoke the normal setProperty
    this.model.setObject(updateObject);
    this.setProperty("visibility", visibilities[visibilities.length - 1]);
    return visibilities;
  }

  /**
   * Post a project to the target repository, manage visibility and KG.
   *
   * @param {string} repositoryUrl - target url repository.
   */
  async postProject(repositoryUrl) {
    const input = this.model.get("input");

    // set backend project details
    let newProjectData = {
      project_repository: repositoryUrl,
      project_namespace: input.namespace,
      project_name: input.title
    };

    // add template details
    if (!input.userRepo) {
      const templates = this.model.get("templates.all");
      const referenceTemplate = templates.filter(t => t.id === input.template)[0];
      newProjectData.identifier = referenceTemplate.parentTemplate;
      const repositories = this.model.get("config.repositories");
      const referenceRepository = repositories.filter(r => r.name === referenceTemplate.parentRepo)[0];
      newProjectData.url = referenceRepository.url;
      newProjectData.ref = referenceRepository.ref;
    }
    else {
      const userTemplates = this.model.get("meta.userTemplates");
      newProjectData.identifier = input.template.replace(CUSTOM_REPO_NAME + "/", "");
      newProjectData.url = userTemplates.url;
      newProjectData.ref = userTemplates.ref;
    }

    // add variables
    let parameters = [];
    for (let variable of Object.keys(input.variables))
      parameters.push({ key: variable, value: input.variables[variable] });
    newProjectData.parameters = parameters;

    // reset all previous creation progresses and invoke the project creation API
    const pristineCreation = newProjectSchema.createInitialized().meta.creation;
    let modelUpdates = { meta: { creation: pristineCreation } };
    modelUpdates.meta.creation.creating = true;
    this.model.setObject(modelUpdates);
    const projectResult = await this.client.postNewProject(newProjectData);
    modelUpdates.meta.creation.creating = false;
    if (projectResult.error) {
      modelUpdates.meta.creation.created = false;
      modelUpdates.meta.creation.createError = projectResult.error.reason;
      this.model.setObject(modelUpdates);
      return modelUpdates;
    }
    modelUpdates.meta.creation.created = true;
    modelUpdates.meta.creation.newName = projectResult.result.name;
    modelUpdates.meta.creation.newNamespace = projectResult.result.namespace;
    modelUpdates.meta.creation.newUrl = projectResult.result.url;
    const slug = `${projectResult.result.namespace}/${projectResult.result.name}`;

    // update project details like visibility and name
    modelUpdates.meta.creation.projectError = "";
    if (input.visibility !== "private" || projectResult.result.name !== input.title) {
      modelUpdates.meta.creation.projectUpdating = true;
      this.model.setObject(modelUpdates);
      let projectObject = {};
      if (input.visibility !== "private")
        projectObject["visibility"] = input.visibility;
      if (projectResult.result.name !== input.title)
        projectObject["name"] = input.title;
      try {
        await this.client.putProjectField(encodeURIComponent(slug), projectObject);
        modelUpdates.meta.creation.projectUpdated = true;
      }
      catch (error) {
        modelUpdates.meta.creation.projectError = error.message ? error.message : error;
      }
      modelUpdates.meta.creation.projectUpdating = false;
      this.model.setObject(modelUpdates);
    }
    else {
      modelUpdates.meta.creation.projectUpdated = true;
    }

    // activate knowledge graph
    modelUpdates.meta.creation.kgError = "";
    if (input.knowledgeGraph) {
      modelUpdates.meta.creation.kgUpdating = true;
      this.model.setObject(modelUpdates);

      // get project id for the KG query
      try {
        const result = await this.client.getProject(slug);
        const succeeded = await this.client.createGraphWebhook(result.data.all.id);
        if (succeeded)
          modelUpdates.meta.creation.kgUpdated = true;
        else
          modelUpdates.meta.creation.kgError = "Knowledge Graph activation failed on server side.";
      }
      catch (error) {
        modelUpdates.meta.creation.kgError = error.message ? error.message : "Unknown error.";
      }
      modelUpdates.meta.creation.kgUpdating = false;
    }
    else {
      modelUpdates.meta.creation.kgUpdated = true;
    }

    // reset all the input/errors if creation was successful
    const { creation } = modelUpdates.meta;
    if (!creation.createError && !creation.kgError && !creation.projectError) {
      const pristineModel = newProjectSchema.createInitialized();
      modelUpdates.input = pristineModel.input;
      modelUpdates.meta.validation = pristineModel.meta.validation;
    }

    this.model.setObject(modelUpdates);
    return modelUpdates;
  }

  invalidatePristine() {
    const input = this.model.get("input");
    const pristineProps = Object.keys(input).filter(prop => prop.endsWith("Pristine") && input[prop]);
    if (pristineProps.length) {
      const inputObj = pristineProps.reduce((obj, prop) => ({ ...obj, [prop]: false }), {});
      this.model.setObject({ input: inputObj });
      return true;
    }
    return false;
  }

  getValidation() {
    return this.model.get("meta.validation");
  }

  /**
   * Perform client-side validation. Optional input and templates objects can be passed with updated values.
   * That will be assigned to the current input/templates.
   *
   * @param {Object} [newInput] - input object containing only the updated fields.
   * @param {Object} [newTemplates] - templates object containing only the updated fields.
   * @param {bool} [update] - set true to update the values inside the function.
   * @param {Object} [projectsObject] - optionally provide the projects object
   */
  validate(newInput, newTemplates, update, projectsObject) {
    // get all the necessary data
    let model = this.model.get();
    let { templates, input, meta } = model;
    let projects = null;
    if (projectsObject)
      projects = projectsObject;
    else if (this.projectsModel)
      projects = this.projectsModel.get("");
    const projectsPaths = projects && projects.featured.member && projects.featured.member.length ?
      projects.featured.member.map(project => project.path_with_namespace.toLowerCase()) :
      [];

    // assign input changes-to-be
    if (newInput)
      input = Object.assign({}, input, newInput);
    const { userRepo } = input;

    // assign templates changes-to-be
    if (userRepo)
      templates = meta.userTemplates;
    if (newTemplates)
      templates = Object.assign({}, templates, newTemplates);

    // ? reference https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names
    const reservedNames = ["badges", "blame", "blob", "builds", "commits", "create", "create_dir",
      "edit", "environments/folders", "files", "find_file", "gitlab-lfs/objects", "info/lfs/objects",
      "new", "preview", "raw", "refs", "tree", "update", "wikis"];
    let errors = {}, warnings = {};

    // check warnings: temporary problems
    if (projects && projects.namespaces.fetching)
      warnings["namespace"] = "Fetching namespaces.";

    if (meta.namespace.fetching)
      warnings["visibility"] = "Verifying visibility constraints.";

    if (templates.fetching)
      warnings["template"] = "Fetching templates.";
    else if (!templates.fetched)
      warnings["template"] = "Must get the templates first.";

    // check errors: require user intervention. Skip if there is a warning
    const slugExpl = " that is already taken in the selected namespace." +
      " Please select a different title or namespace.";
    if (!input.title || !input.title.length)
      errors["title"] = "Title is missing.";
    else if (reservedNames.includes(input.title))
      errors["title"] = "Reserved title name.";
    else if (input.title.length && ["_", "-", " ", "."].includes(input.title[0]))
      errors["title"] = "Title must start with a letter or a number.";
    else if (!verifyTitleCharacters(input.title))
      errors["title"] = "Title can contain only letters, digits, '_', '.', '-' or spaces.";
    else if (input.title && !slugFromTitle(input.title, true))
      errors["title"] = "Title must contain at least one letter (without any accents) or a number.";
    else if (projects && projectsPaths.includes(`${input.namespace}/${slugFromTitle(input.title, true)}`))
      errors["title"] = `Title produces a project identifier (${slugFromTitle(input.title, true)})${slugExpl}`;

    if (!warnings["namespace"] && !input.namespace)
      errors["namespace"] = "Select namespace.";

    if (!warnings["visibility"] && !input.visibility)
      errors["visibility"] = "Select visibility.";

    if (!warnings["template"] && !input.template)
      errors["template"] = "Select a template.";

    // create validation object and update model directly or return it;
    const validation = {
      warnings: { $set: warnings },
      errors: { $set: errors },
    };
    if (update)
      this.model.setObject({ meta: { validation } });
    return validation;
  }
}

export { NewProjectCoordinator };

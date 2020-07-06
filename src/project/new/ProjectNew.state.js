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

import { newProjectSchema } from "../../model/RenkuModels";
import { slugFromTitle } from "../../utils/HelperFunctions";

class NewProjectCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  _setVisibility(value) {
    this.model.setObject({
      input: {
        visibility: value,
        knowledgeGraph: true
      }
    });
  }

  _setTemplate(currentInput, value) {
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
    this.model.setObject({
      input: {
        template: value,
        variables: { $set: values }
      },
      meta: { validation: { client: { errorDict: { template: null } } } }
    });
  }

  setProperty(property, value) {
    const currentInput = this.model.get("input");
    if (currentInput[property] === value) return;

    // reset knowledgeGraph when needed
    if (property === "visibility")
      return this._setVisibility(value);

    // pre-set variables and reset when needed
    if (property === "template")
      return this._setTemplate(currentInput, value);

    // Set the property and clear any errors for this prop
    const updateObj = {
      input: { [property]: value },
      meta: { validation: { client: { errorDict: { [property]: null } } } }
    };
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
   * Fetch all the templates listed in the sources
   *
   * @param {*} [sources] - List of sources in the format { url, ref, name }. If not provided,
   *   the list in model.config.repositories will be used instead.
   */
  async getTemplates(sources = null) {
    // use deployment repositories if nothing else is provided
    if (!sources || !sources.length)
      sources = this.model.get("config.repositories");

    // verify sources and set fetching status
    if (!sources || !sources.length) {
      const errorText = "No project templates are available in this RenkuLab deployment. Please notify a RenkuLab " +
        "administrator and ask them to configure a project template repository.";
      this.model.setObject({
        templates: {
          fetched: false,
          fetching: false,
          all: { $set: [] },
          errors: { $set: [{ "global": errorText }] }
        }
      });
      throw errorText;
    }
    this.model.set("templates.fetching", true);

    // fetch manifest and collect templates and errors
    let errors = [], templates = [];
    for (const source of sources) {
      const answer = await this.getTemplate(source.url, source.template);
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

    // update the state
    this.model.setObject({
      templates: {
        fetched: new Date(),
        fetching: false,
        errors: { $set: errors },
        all: { $set: templates }
      }
    });
    return templates;

    //return this.client.getTemplatesManifest("https://github.com/SwissDataScienceCenter/renku-project-template");
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

    // verify current visibility and knowledgeGraph and adjust it if needed
    const currentInput = this.model.get("input");
    if (!visibilities.includes(currentInput.visibility))
      // pick the most generous visibility
      updateObject.input = { visibility: visibilities[visibilities.length - 1] };

    // save model and return values
    this.model.setObject(updateObject);
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
      project_name: slugFromTitle(input.title, true)
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
      // TODO: custom template data goes here
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
    this.model.setObject(modelUpdates);
    return modelUpdates;
  }

  /**
   * Clear any previous errors and perform client-side validation.
   */
  validate() {
    const client = newProjectSchema.validate(this.model.get());
    const errorDict = {};
    client.errors.forEach((d) => { Object.keys(d).forEach(k => errorDict[k] = d[k]); });
    client["errorDict"] = errorDict;
    const server = [];
    this.model.set("meta.validation", { client, server });
    return { client, server };
  }
}

export { NewProjectCoordinator };

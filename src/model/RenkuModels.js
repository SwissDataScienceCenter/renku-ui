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
 *  renku-ui
 *
 *  RenkuModels.js
 *
 */

import { Schema, PropertyName as Prop } from "./Model";
import FormGenerator from "../utils/formgenerator/";

const userSchema = new Schema({
  fetched: { initial: null, mandatory: true },
  fetching: { initial: false, mandatory: true },
  logged: { initial: false, mandatory: true },
  data: { initial: {}, mandatory: true }
});

const projectsSchema = new Schema({
  featured: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      starred: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      member: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
    })
  },
  namespaces: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
    })
  }
});

const metaSchema = new Schema({
  id: { initial: "", mandatory: false },
  projectNamespace: { initial: {}, mandatory: false },
  visibility: { initial: "public", mandatory: true },
  optoutKg: { initial: false, mandatory: false },
});

const forkDisplaySchema = new Schema({
  title: { initial: "", mandatory: true },
  description: { initial: "", mandatory: true },
  displayId: { initial: "", mandatory: false },
  slug: { initial: "", mandatory: true },
  loading: { initial: false, mandatory: false },
  errors: { initial: [], mandatory: false },

  statuses: { initial: [] },
  namespaces: { initial: [] },
  namespaceGroup: { initial: null },
  namespacesFetched: { initial: false }
});

const forkProjectSchema = new Schema({
  meta: { schema: metaSchema, mandatory: true },
  display: { schema: forkDisplaySchema, mandatory: true }
});

const projectSchema = new Schema({
  core: {
    schema: {
      available: { initial: null },
      created_at: { initial: null, },
      last_activity_at: { initial: null, },
      id: { initial: null, },
      description: { initial: "no description", mandatory: true },
      displayId: { initial: "", },
      title: { initial: "no title", mandatory: true },
      external_url: { initial: "", },
      path_with_namespace: { initial: null },
      owner: { initial: null },
    }
  },
  visibility: {
    schema: {
      level: { initial: "private", mandatory: true },
      accessLevel: { initial: 0, mandatory: true }
    }
  },
  data: {
    schema: {
      reference: {
        schema: {
          url_or_doi: { initial: "" },
          author: { initial: "" }
        },
      },
      upload: {
        schema: {
          files: { schema: [] }
        }
      },
      readme: {
        schema: {
          text: { initial: "", mandatory: false }
        }
      }
    },
  },
  system: {
    schema: {
      tag_list: { schema: [] },
      star_count: { initial: 0, mandatory: true },
      forks_count: { initial: 0, mandatory: true },
      forked_from_project: { initial: {} },
      ssh_url: { initial: "", },
      http_url: { initial: "", },
      merge_requests: { schema: [], initial: [] },
      branches: { schema: [], initial: [] },
      autosaved: { schema: [], initial: [] },
    }
  },
  files: {
    schema: {
      notebooks: { schema: [] },
      data: { schema: [] },
      modifiedFiles: { initial: {}, mandatory: true }
    }
  },
  statistics: {
    schema: {
      "commit_count": { initial: 0 },
      "storage_size": { initial: 0 },
      "repository_size": { initial: 0 },
      "lfs_objects_size": { initial: 0 },
      "job_artifacts_size": { initial: 0 }
    },
  },
  transient: {
    schema: {
      requests: { initial: {} },
      forkModalOpen: { initial: false }
    }
  },
  webhook: {
    schema: {
      status: { initial: null },
      created: { initial: null },
      possible: { initial: null },
      stop: { initial: null },
      progress: { initial: null }
    }
  }
});

const newProjectSchema = new Schema({
  config: {
    [Prop.SCHEMA]: new Schema({
      custom: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      repositories: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true } // contains only { url, ref, name }
    })
  },
  templates: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      errors: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }, // contains only { "name": "desc" }
      all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
    })
  },
  input: {
    [Prop.SCHEMA]: new Schema({
      title: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      namespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      visibility: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      userRepo: { [Prop.INITIAL]: false, [Prop.MANDATORY]: false },
      knowledgeGraph: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      template: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      variables: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true }, // contains pairs "var1": "value1"
    })
  },
  meta: {
    [Prop.SCHEMA]: new Schema({
      namespace: {
        [Prop.SCHEMA]: new Schema({
          id: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
          visibility: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          visibilities: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
        })
      },
      // TODO: support custom user templates
      userTemplates: {
        [Prop.SCHEMA]: new Schema({
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: false },
          error: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false }, // contains "desc"
          url: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false },
          ref: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false },
          all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false }
        })
      },
      validation: {
        [Prop.SCHEMA]: new Schema({
          client: {
            [Prop.SCHEMA]: new Schema({
              result: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
              errors: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
              errorDict: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
            })
          },
          server: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false },
        })
      },
      creation: {
        [Prop.SCHEMA]: new Schema({
          creating: { [Prop.INITIAL]: false },
          created: { [Prop.INITIAL]: false },
          createError: { [Prop.INITIAL]: "" },
          visibilityUpdating: { [Prop.INITIAL]: false },
          visibilityUpdated: { [Prop.INITIAL]: false },
          visibilityError: { [Prop.INITIAL]: "" },
          kgUpdating: { [Prop.INITIAL]: false },
          kgUpdated: { [Prop.INITIAL]: false },
          kgError: { [Prop.INITIAL]: "" },
          newName: { [Prop.INITIAL]: "" },
          newNamespace: { [Prop.INITIAL]: "" },
          newUrl: { [Prop.INITIAL]: "" },
        })
      }
    })
  }
});

const projectGlobalSchema = new Schema({
  metadata: {
    schema: {
      exists: { initial: null, mandatory: true },

      id: { initial: null, mandatory: true }, // id
      namespace: { initial: null, mandatory: true }, // namespace.full_path
      path: { initial: null, mandatory: true }, // path
      pathWithNamespace: { initial: null, mandatory: true }, // path_with_namespace
      repositoryUrl: { initial: null, mandatory: true }, // web_url

      fetched: { initial: null },
      fetching: { initial: false },
    }
  },
  commits: {
    schema: {
      list: { initial: [], mandatory: true },

      fetched: { initial: null },
      fetching: { initial: false },
    }
  },
  filters: {
    schema: {
      branch: { initial: { name: "master" }, mandatory: true },
      commit: { initial: { id: "latest" }, mandatory: true },
    }
  }
});

const notebooksSchema = new Schema({
  notebooks: {
    schema: {
      all: { initial: {} },
      poller: { initial: null },
      fetched: { initial: null },
      fetching: { initial: false },
      lastParameters: { initial: null }
    }
  },
  filters: {
    schema: {
      namespace: { initial: null },
      project: { initial: null },
      branch: { initial: {} },
      commit: { initial: {} },
      discard: { initial: false },
      options: { initial: {} },

      includeMergedBranches: { initial: false },
      displayedCommits: { initial: 10 },
    }
  },
  options: {
    schema: {
      global: { initial: {} },

      project: { initial: {} },
      fetched: { initial: null },
      fetching: { initial: false },
      warnings: { initial: [] }
    }
  },
  pipelines: {
    schema: {
      main: { initial: {} },
      poller: { initial: null },
      fetched: { initial: null },
      fetching: { initial: false },
      type: { initial: null },

      lastParameters: { initial: null },
      lastMainId: { initial: null },
    }
  },
  data: {
    schema: {
      commits: { initial: [] }, // ! TODO: move to Project pages, shouldn't be here
      fetched: { initial: null },
      fetching: { initial: false },
    }
  },
  logs: {
    schema: {
      data: { initial: [] },
      fetched: { initial: null },
      fetching: { initial: false },
    }
  }
});

const datasetFormSchema = new Schema({
  name: {
    initial: "",
    name: "name",
    label: "Name",
    edit: false,
    type: FormGenerator.FieldTypes.TEXT,
    parseFun: expression => FormGenerator.Parsers.slugFromTitle(expression),
    validators: [{
      id: "name-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Name is too short"
    }]
  },
  description: {
    initial: "",
    name: "description",
    label: "Description",
    edit: false,
    type: FormGenerator.FieldTypes.TEXT_EDITOR,
    outputType: "markdown",
    help: "Basic markdown styling tags are allowed in this field.",
    validators: [{
      id: "name-length",
      //  isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression, 3),
      alert: "Description can't be emtpy"
    }]
  },
  files: {
    initial: [],
    name: "files",
    label: "Files",
    edit: true,
    type: FormGenerator.FieldTypes.FILES,
    uploadFileFunction: undefined,
    filesOnUploader: undefined,
    validators: [{
      id: "files-length",
      isValidFun: expression => FormGenerator.Validators.filesReady(expression),
      alert: "Some queued files have not finished uploading. Please see the status messages and reply to any questions."
    }]
  }
});

const issueFormSchema = new Schema({
  name: {
    initial: "",
    name: "title",
    label: "Title",
    type: FormGenerator.FieldTypes.TEXT,
    placeholder: "A brief name to identify the issue",
    validators: [{
      id: "text-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Text is too short"
    }]
  },
  description: {
    initial: "",
    name: "textarea",
    label: "Description",
    type: FormGenerator.FieldTypes.TEXT_EDITOR,
    outputType: "markdown",
    placeholder: "A brief name to identify the issue",
    help: "A description of the issue helps users understand it and is highly recommended.",
    validators: [{
      id: "textarea-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Description can't be emtpy"
    }]
  },
  visibility: {
    initial: "public",
    name: "visibility",
    label: "Visibility",
    type: FormGenerator.FieldTypes.SELECT,
    options: [
      { value: "public", name: "Public" },
      { value: "restricted", name: "Restricted" }
    ],
    validators: []
  }
});

const datasetImportFormSchema = new Schema({
  uri: {
    initial: "",
    name: "uri",
    label: "Renku dataset URL; Dataverse or Zenodo dataset URL or DOI",
    edit: false,
    type: FormGenerator.FieldTypes.TEXT,
    // parseFun: expression => FormGenerator.Parsers.slugFromTitle(expression),
    validators: [{
      id: "uri-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "URI is too short"
    }]
  }
});

const addDatasetToProjectSchema = new Schema({
  project: {
    initial: "",
    name: "project",
    label: "Project",
    placeholder: "Select a project...",
    type: FormGenerator.FieldTypes.SELECTAUTOSUGGEST,
    options: [
    ],
    validators: [
      {
        id: "valid-option",
        isValidFun: expression => FormGenerator.Validators.optionExists(expression),
        alert: "Selected project is not valid"
      }
    ]
  }
});


export {
  userSchema, metaSchema, newProjectSchema, projectSchema, forkProjectSchema, notebooksSchema,
  projectsSchema, datasetFormSchema, issueFormSchema, datasetImportFormSchema, projectGlobalSchema,
  addDatasetToProjectSchema
};

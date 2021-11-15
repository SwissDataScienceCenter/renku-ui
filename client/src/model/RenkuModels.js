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
  error: { initial: null, mandatory: true },
  logged: { initial: false, mandatory: true },
  data: { initial: {}, mandatory: true }
});

const projectsSchema = new Schema({
  featured: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      member: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      starred: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
    })
  },
  landingProjects: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
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
  optoutKg: { initial: false, mandatory: false }, // eslint-disable-line
});

const forkDisplaySchema = new Schema({
  title: { initial: "", mandatory: true },
  description: { initial: "", mandatory: true },
  displayId: { initial: "", mandatory: false },
  slug: { initial: "", mandatory: true },
  loading: { initial: false, mandatory: false },
  searchId: { initial: "", mandatory: false },
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
      id: { initial: null, },
      description: { initial: "no description", mandatory: true },
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
      }
    },
  },
  system: {
    schema: {
      branches: { schema: [], initial: [] },
      autosaved: { schema: [], initial: [] },
    }
  },
  transient: {
    schema: {
      requests: { initial: {} },
    }
  },
  migration: {
    schema: {
      migration_required: { initial: null },
      project_supported: { initial: null },
      docker_update_possible: { initial: null }, //boolean
      latest_version: { initial: null }, //string
      project_version: { initial: null }, //string
      template_update_possible: { initial: null }, //boolean
      migrating: { initial: false },
      migration_status: { initial: null },
      migration_error: { initial: null },
      check_error: { initial: null }
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
      title: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      titlePristine: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      description: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      namespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      namespacePristine: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      visibility: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      visibilityPristine: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      userRepo: { [Prop.INITIAL]: false, [Prop.MANDATORY]: false },
      knowledgeGraph: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      template: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
      templatePristine: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      variables: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true }, // contains pairs "var1": "value1"
    })
  },
  automated: {
    [Prop.SCHEMA]: new Schema({
      received: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      valid: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      data: {
        [Prop.SCHEMA]: new Schema({
          title: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          description: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true },
          namespace: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          visibility: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          template: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          url: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          ref: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          variables: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
        })
      },
      step: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true }, // TODO: remove if not useful
      finished: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
      warnings: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false },
      manuallyReset: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
    })
  },
  meta: {
    [Prop.SCHEMA]: new Schema({
      namespace: {
        [Prop.SCHEMA]: new Schema({
          id: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
          visibilities: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }
        })
      },
      userTemplates: {
        [Prop.SCHEMA]: new Schema({
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: false },
          errors: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false }, // contains "desc"
          url: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          ref: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false }
        })
      },
      validation: {
        [Prop.SCHEMA]: new Schema({
          warnings: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
          errors: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
        })
      },
      creation: {
        [Prop.SCHEMA]: new Schema({
          creating: { [Prop.INITIAL]: false },
          created: { [Prop.INITIAL]: false },
          createError: { [Prop.INITIAL]: "" },
          projectUpdating: { [Prop.INITIAL]: false },
          projectUpdated: { [Prop.INITIAL]: false },
          projectError: { [Prop.INITIAL]: "" },
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

const projectStatisticsSchema = new Schema({
  commit_count: { [Prop.INITIAL]: null },
  storage_size: { [Prop.INITIAL]: null },
  repository_size: { [Prop.INITIAL]: null },
  wiki_size: { [Prop.INITIAL]: null },
  lfs_objects_size: { [Prop.INITIAL]: null },
  job_artifacts_size: { [Prop.INITIAL]: null }
});

const projectGlobalSchema = new Schema({
  branches: {
    [Prop.SCHEMA]: new Schema({
      standard: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      autosaved: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    })
  },
  commits: {
    [Prop.SCHEMA]: new Schema({
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    })
  },
  commitsReadme: {
    [Prop.SCHEMA]: new Schema({
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    })
  },
  config: {
    [Prop.SCHEMA]: new Schema({
      data: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },

      initial: { [Prop.INITIAL]: {} },
      input: { [Prop.INITIAL]: {} }
    })
  },
  data: {
    [Prop.SCHEMA]: new Schema({
      readme: { [Prop.INITIAL]: {} }
    })
  },
  datasets: {
    [Prop.SCHEMA]: new Schema({
      datasets_kg: { [Prop.INITIAL]: [] },
      core: { [Prop.INITIAL]: {
        datasets: null,
        error: null
      } }
    })
  },
  files: {
    [Prop.SCHEMA]: new Schema({
      notebooks: { [Prop.INITIAL]: [] },
      data: { [Prop.INITIAL]: [] },
      modifiedFiles: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true }
    })
  },
  filesTree: {
    [Prop.SCHEMA]: new Schema({
      hash: { [Prop.INITIAL]: {} },
      loaded: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true }
    })
  },
  filters: {
    [Prop.SCHEMA]: new Schema({
      branch: { [Prop.INITIAL]: { name: null }, [Prop.MANDATORY]: true },
      commit: { [Prop.INITIAL]: { id: "latest" }, [Prop.MANDATORY]: true },
    })
  },
  forkedFromProject: { [Prop.INITIAL]: {} },
  metadata: {
    [Prop.SCHEMA]: new Schema({
      avatarUrl: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // avatar_url
      accessLevel: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true }, // visibility.access_level
      createdAt: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // created_at
      defaultBranch: { [Prop.INITIAL]: null }, // default_branch
      description: { [Prop.INITIAL]: "" },
      exists: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      externalUrl: { [Prop.INITIAL]: "" }, // external_url
      forksCount: { [Prop.INITIAL]: null }, // forks_count
      httpUrl: { [Prop.INITIAL]: "", }, // http_url
      id: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // id
      lastActivityAt: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // last_activity_at
      namespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // namespace.full_path
      owner: { [Prop.INITIAL]: null },
      path: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      pathWithNamespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // path_with_namespace
      repositoryUrl: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // web_url
      sshUrl: { [Prop.INITIAL]: "", }, // ssh_url
      starCount: { [Prop.INITIAL]: null }, // star_count
      tagList: { [Prop.INITIAL]: [] }, // tag_list
      title: { [Prop.INITIAL]: "" },
      visibility: { [Prop.INITIAL]: "private", [Prop.MANDATORY]: true }, // visibility.level

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    })
  },
  statistics: {
    [Prop.SCHEMA]: new Schema({
      data: { schema: projectStatisticsSchema },

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    })
  },
  transient: {
    [Prop.SCHEMA]: new Schema({
      requests: { [Prop.INITIAL]: {} }
    })
  },
  webhook: {
    [Prop.SCHEMA]: {
      status: { [Prop.INITIAL]: null },
      created: { [Prop.INITIAL]: null },
      possible: { [Prop.INITIAL]: null },
      stop: { [Prop.INITIAL]: null },
      progress: { [Prop.INITIAL]: null }
    }
  },
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
      displayedCommits: { initial: 25 },
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
  logs: {
    schema: {
      data: { initial: [] },
      fetched: { initial: null },
      fetching: { initial: false },
    }
  },
  data: {
    schema: {
      commits: { initial: {} }, // use it as a dictionary where the key is the full commit sha
    }
  }
});

const datasetFormSchema = new Schema({
  title: {
    initial: "",
    name: "title",
    label: "Title",
    required: true,
    type: FormGenerator.FieldTypes.TEXT,
    validators: [{
      id: "title-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Title is too short"
    }],
    help: "The title is displayed in listings of datasets."
  },
  name: {
    initial: "",
    name: "name",
    label: "Name",
    edit: false,
    editOnClick: true,
    required: true,
    type: FormGenerator.FieldTypes.TEXT,
    parseFun: expression => FormGenerator.Parsers.slugFromTitle(expression),
    validators: [{
      id: "name-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Name is too short"
    }],
    help: "The *name* is automatically derived from the title, but can be changed. " +
      " It is used as an identifier in renku commands."
  },
  creators: {
    initial: [],
    name: "creators",
    label: "Creators",
    type: FormGenerator.FieldTypes.CREATORS,
    validators: [{
      id: "creator-valid",
      isValidFun: expression => FormGenerator.Validators.creatorIsValid(expression),
      alert: "Creator name and email cannot be empty"
    }]
    //shall we pre-validate that an email is an email with regex? --> yes and it should not be empty also...
  },
  keywords: {
    initial: [],
    name: "keywords",
    label: "Keywords",
    help: "To insert a keyword, type it and press enter.",
    type: FormGenerator.FieldTypes.KEYWORDS,
    validators: []
  },
  description: {
    initial: "",
    name: "description",
    label: "Description",
    type: FormGenerator.FieldTypes.TEXT_EDITOR,
    outputType: "markdown",
    help: "Basic markdown styling tags are allowed in this field.",
    validators: [{
      id: "name-length",
      //  isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression, 3),
      alert: "Description can't be empty"
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
    notifyFunction: undefined,
    internalValues: undefined,
    validators: [{
      id: "files-length",
      isValidFun: expression => FormGenerator.Validators.filesReady(expression),
      alert: "Some queued files have not finished uploading. Please see the status messages and reply to any questions."
    }]
  },
  image: {
    name: "image",
    label: "Image",
    edit: false, // for now images can't be edited :(
    type: FormGenerator.FieldTypes.IMAGE,
    maxSize: 200 * 1024,
    format: "image/png,image/jpeg,image/gif,image/tiff",
    value: {
      options: [],
      selected: -1
    },
    validators: [],
    modes: ["Choose File"]
  }
});

const issueFormSchema = new Schema({
  title: {
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
    name: "description",
    label: "Description",
    type: FormGenerator.FieldTypes.TEXT_EDITOR,
    outputType: "markdown",
    placeholder: "A brief name to identify the issue",
    help: "A description of the issue helps users understand it and is highly recommended.",
    validators: [{
      id: "textarea-length",
      isValidFun: expression => FormGenerator.Validators.isNotEmpty(expression),
      alert: "Description can't be empty"
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

const environmentSchema = new Schema({
  fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
  fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
  data: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
  timeout: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
});

/**
 * Schema for information from statuspage.io. Used by the statuspage module.
 */
const statuspageSchema = new Schema({
  retrieved_at: { initial: null },
  statuspage: { initial: null },
  error: { initial: null }
});

const notificationsSchema = new Schema({
  unread: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true },
  all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
  dropdown: {
    [Prop.SCHEMA]: new Schema({
      enabled: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
    })
  },
  toast: {
    [Prop.SCHEMA]: new Schema({
      enabled: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      timeout: { [Prop.INITIAL]: 7500, [Prop.MANDATORY]: true },
      position: { [Prop.INITIAL]: "top-right", [Prop.MANDATORY]: true },
    })
  }
});

const formGeneratorSchema = new Schema({
  formDrafts: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true }
});

export {
  userSchema, metaSchema, newProjectSchema, projectSchema, forkProjectSchema, notebooksSchema,
  projectsSchema, datasetFormSchema, issueFormSchema, datasetImportFormSchema, projectGlobalSchema,
  addDatasetToProjectSchema, statuspageSchema, notificationsSchema, formGeneratorSchema, environmentSchema
};

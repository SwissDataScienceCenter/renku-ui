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

const userSchema = new Schema({
  fetched: { initial: null, mandatory: true },
  fetching: { initial: false, mandatory: true },
  error: { initial: null, mandatory: true },
  logged: { initial: false, mandatory: true },
  data: { initial: {}, mandatory: true },
});

const projectsSchema = new Schema({
  featured: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      member: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      starred: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
    }),
  },
  landingProjects: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      lastVisited: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
    }),
  },
  namespaces: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
    }),
  },
});

const newProjectSchema = new Schema({
  config: {
    [Prop.SCHEMA]: new Schema({
      custom: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      repositories: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }, // contains only { url, ref, name }
    }),
  },
  templates: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      errors: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true }, // contains only { "name": "desc" }
      all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
    }),
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
    }),
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
        }),
      },
      step: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true }, // TODO: remove if not useful
      finished: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
      warnings: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false },
      manuallyReset: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
    }),
  },
  meta: {
    [Prop.SCHEMA]: new Schema({
      namespace: {
        [Prop.SCHEMA]: new Schema({
          id: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
          visibilities: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
        }),
      },
      userTemplates: {
        [Prop.SCHEMA]: new Schema({
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: false },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: false },
          errors: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false }, // contains "desc"
          url: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          ref: { [Prop.INITIAL]: "", [Prop.MANDATORY]: false },
          all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: false },
        }),
      },
      validation: {
        [Prop.SCHEMA]: new Schema({
          warnings: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
          errors: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
        }),
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
        }),
      },
    }),
  },
});

const webSocketSchema = new Schema({
  open: { [Prop.INITIAL]: false },
  error: { [Prop.INITIAL]: false },
  errorObject: { [Prop.INITIAL]: {} },
  lastPing: { [Prop.INITIAL]: null },
  lastReceived: { [Prop.INITIAL]: null },
  reconnect: {
    [Prop.SCHEMA]: new Schema({
      retrying: { [Prop.INITIAL]: false },
      attempts: { [Prop.INITIAL]: 0 },
      lastTime: { [Prop.INITIAL]: null },
    }),
  },
});

const projectSchema = new Schema({
  branches: {
    [Prop.SCHEMA]: new Schema({
      standard: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      autosaved: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    }),
  },
  commits: {
    [Prop.SCHEMA]: new Schema({
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    }),
  },
  commitsReadme: {
    [Prop.SCHEMA]: new Schema({
      list: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: null },

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    }),
  },
  config: {
    [Prop.SCHEMA]: new Schema({
      data: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
      error: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },

      initial: { [Prop.INITIAL]: {} },
      input: { [Prop.INITIAL]: {} },
    }),
  },
  data: {
    [Prop.SCHEMA]: new Schema({
      readme: { [Prop.INITIAL]: {} },
    }),
  },
  datasets: {
    [Prop.SCHEMA]: new Schema({
      core: {
        [Prop.INITIAL]: {
          datasets: null,
          error: null,
        },
      },
    }),
  },
  files: {
    [Prop.SCHEMA]: new Schema({
      notebooks: { [Prop.INITIAL]: [] },
      data: { [Prop.INITIAL]: [] },
      modifiedFiles: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
    }),
  },
  filesTree: {
    [Prop.SCHEMA]: new Schema({
      hash: { [Prop.INITIAL]: {} },
      loaded: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
    }),
  },
  filters: {
    [Prop.SCHEMA]: new Schema({
      branch: { [Prop.INITIAL]: { name: null }, [Prop.MANDATORY]: true },
      commit: { [Prop.INITIAL]: { id: "latest" }, [Prop.MANDATORY]: true },
    }),
  },
  forkedFromProject: { [Prop.INITIAL]: {} },
  lockStatus: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
      error: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },

      locked: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
    }),
  },
  metadata: {
    [Prop.SCHEMA]: new Schema({
      accessLevel: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true }, // visibility.access_level
      avatarUrl: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // avatar_url
      createdAt: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // created_at
      defaultBranch: { [Prop.INITIAL]: null }, // default_branch
      description: { [Prop.INITIAL]: "" },
      exists: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      externalUrl: { [Prop.INITIAL]: "" }, // external_url
      forksCount: { [Prop.INITIAL]: null }, // forks_count
      httpUrl: { [Prop.INITIAL]: "" }, // http_url
      id: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // id
      lastActivityAt: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // last_activity_at
      namespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // namespace.full_path
      owner: { [Prop.INITIAL]: null },
      path: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      pathWithNamespace: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // path_with_namespace
      repositoryUrl: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // web_url
      sshUrl: { [Prop.INITIAL]: "" }, // ssh_url
      starCount: { [Prop.INITIAL]: null }, // star_count
      tagList: { [Prop.INITIAL]: [] }, // tag_list
      title: { [Prop.INITIAL]: "" },
      visibility: { [Prop.INITIAL]: "private", [Prop.MANDATORY]: true }, // visibility.level

      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
      pendingRefresh: { [Prop.INITIAL]: false },
    }),
  },
  migration: {
    [Prop.SCHEMA]: new Schema({
      check: {
        [Prop.INITIAL]: {
          core_renku_version: undefined,
          project_supported: undefined,
          project_renku_version: undefined,
          core_compatibility_status: {
            project_metadata_version: undefined,
            migration_required: undefined,
            current_metadata_version: undefined,
          },
          dockerfile_renku_status: {
            latest_renku_version: undefined,
            dockerfile_renku_version: undefined,
            automated_dockerfile_update: undefined,
            newer_renku_available: undefined,
          },
          template_status: {
            newer_template_available: undefined,
            template_id: undefined,
            automated_template_update: undefined,
            template_ref: undefined,
            project_template_version: undefined,
            template_source: undefined,
            latest_template_version: undefined,
          },
        },
        migrating: { [Prop.INITIAL]: false },
        migration_status: { [Prop.INITIAL]: null },
        migration_error: { [Prop.INITIAL]: null },
      },
      core: {
        [Prop.SCHEMA]: new Schema({
          versionUrl: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          backendAvailable: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },

          error: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
          fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
        }),
      },
    }),
  },
  statistics: {
    [Prop.SCHEMA]: new Schema({
      data: {
        schema: new Schema({
          commit_count: { [Prop.INITIAL]: null },
          storage_size: { [Prop.INITIAL]: null },
          repository_size: { [Prop.INITIAL]: null },
          wiki_size: { [Prop.INITIAL]: null },
          lfs_objects_size: { [Prop.INITIAL]: null },
          job_artifacts_size: { [Prop.INITIAL]: null },
        }),
      },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
    }),
  },
  transient: {
    [Prop.SCHEMA]: new Schema({
      requests: { [Prop.INITIAL]: {} },
    }),
  },
});

const datasetSchema = new Schema({
  metadata: {
    [Prop.SCHEMA]: new Schema({
      name: { [Prop.INITIAL]: "" }, // dataset_core.name
      title: { [Prop.INITIAL]: "" }, // dataset_core.title
      description: { [Prop.INITIAL]: "" }, // dataset_core.description
      created: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // dataset_core.created_at
      published: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      identifier: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // dataset_core.identifier
      keywords: { [Prop.INITIAL]: "", [Prop.MANDATORY]: true }, // dataset_core.keywords
      hasPart: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      mediaContent: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true }, // dataset_core.mediaContent
      url: { [Prop.INITIAL]: null }, // dataset_kg.url
      sameAs: { [Prop.INITIAL]: null }, // dataset_kg.sameAs
      usedIn: { [Prop.INITIAL]: null }, // dataset_kg.usedIn
      insideKg: { [Prop.INITIAL]: null }, //  true if dataset is in the KG
      exists: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetched: { [Prop.INITIAL]: null },
      fetching: { [Prop.INITIAL]: false },
      fetchError: { [Prop.INITIAL]: null },
    }),
  },
  files: {
    [Prop.SCHEMA]: new Schema({
      fetching: { [Prop.INITIAL]: false },
      fetchError: { [Prop.INITIAL]: null },
      fetched: { [Prop.INITIAL]: null },
      hasPart: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
    }),
  },
});

const environmentSchema = new Schema({
  uiVersion: {
    [Prop.SCHEMA]: new Schema({
      webSocket: { [Prop.INITIAL]: null },
      lastValue: { [Prop.INITIAL]: null },
      lastReceived: { [Prop.INITIAL]: null },
    }),
  },
  coreVersions: {
    [Prop.SCHEMA]: new Schema({
      available: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
      unavailable: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
    }),
  },
  services: {
    [Prop.SCHEMA]: new Schema({
      fetched: { [Prop.INITIAL]: null, [Prop.MANDATORY]: true },
      fetching: { [Prop.INITIAL]: false, [Prop.MANDATORY]: true },
      // each value has the structure {name: string, versions: [{version, data}]}
      list: { [Prop.INITIAL]: [] },
    }),
  },
});

/**
 * Schema for information from statuspage.io. Used by the statuspage module.
 */
const statuspageSchema = new Schema({
  retrieved_at: { initial: null },
  statuspage: { initial: null },
  error: { initial: null },
});

const notificationsSchema = new Schema({
  unread: { [Prop.INITIAL]: 0, [Prop.MANDATORY]: true },
  all: { [Prop.INITIAL]: [], [Prop.MANDATORY]: true },
  dropdown: {
    [Prop.SCHEMA]: new Schema({
      enabled: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
    }),
  },
  toast: {
    [Prop.SCHEMA]: new Schema({
      enabled: { [Prop.INITIAL]: true, [Prop.MANDATORY]: true },
      timeout: { [Prop.INITIAL]: 7500, [Prop.MANDATORY]: true },
      position: { [Prop.INITIAL]: "top-right", [Prop.MANDATORY]: true },
    }),
  },
});

const formGeneratorSchema = new Schema({
  formDrafts: { [Prop.INITIAL]: {}, [Prop.MANDATORY]: true },
});

export {
  datasetSchema,
  environmentSchema,
  formGeneratorSchema,
  newProjectSchema,
  notificationsSchema,
  projectSchema,
  projectsSchema,
  statuspageSchema,
  userSchema,
  webSocketSchema,
};

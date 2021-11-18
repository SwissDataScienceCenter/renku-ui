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
 *  incubator-renku-ui
 *
 *  Project.state.js
 *  Redux-based state-management code.
 */

import { ACCESS_LEVELS, API_ERRORS } from "../api-client";
import { StateModel, SpecialPropVal, projectSchema, projectGlobalSchema } from "../model";
import { splitAutosavedBranches } from "../utils/HelperFunctions";


const GraphIndexingStatus = {
  NO_WEBHOOK: -2,
  NO_PROGRESS: -1,
  MIN_VALUE: 0,
  MAX_VALUE: 100
};

const MigrationStatus = {
  MIGRATING: "MIGRATING",
  FINISHED: "FINISHED",
  ERROR: "ERROR"
};

class ProjectModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(projectSchema, stateBinding, stateHolder, initialState);
  }

  fetchMigrationCheck(client) {
    return client.getProjectIdFromService(this.get("system.http_url"))
      .then((response)=>{
        if (response.data && response.data.error !== undefined) {
          this.set("migration.check_error", response.data.error.reason);
        }
        else {
          client.performMigrationCheck(response)
            .then((response)=>{
              if (response.data && response.data.error !== undefined) {
                this.set("migration.check_error", response.data.error);
              }
              else {
                this.set("migration.migration_required", response.data.result.migration_required);
                this.set("migration.project_supported", response.data.result.project_supported);
                this.set("migration.docker_update_possible", response.data.result.docker_update_possible);
                this.set("migration.latest_version", response.data.result.latest_version);
                this.set("migration.project_version", response.data.result.project_version);
                this.set("migration.template_update_possible", response.data.result.template_update_possible);
                this.set("migration.latest_template_version", response.data.result.latest_template_version);
                this.set("migration.current_template_version", response.data.result.current_template_version);
              }
            });
        }
      });
  }

  migrateProject(client, params) {
    if (this.get("migration.migration_status") === MigrationStatus.MIGRATING)
      return;
    this.set("migration.migration_status", MigrationStatus.MIGRATING);
    client.getProjectIdFromService(this.get("system.http_url"))
      .then((projectId)=>{
        client.performMigration(projectId, params)
          .then((response)=>{
            if (response.data.error) {
              this.set("migration.migration_status", MigrationStatus.ERROR);
              this.set("migration.migration_error", response.data.error);
            }
            else {
              this.fetchMigrationCheck(client).then(response => {
                this.set("migration.migration_status", MigrationStatus.FINISHED);
                this.set("migration.migration_error", null);
              });
            }
          });
      });
  }

  setProjectData(data, statistics = false) {
    const updatedState = {
      core: { ...data.metadata.core, available: true },
      system: {
        ...data.metadata.system,
        tag_list: { $set: data.metadata.system.tag_list } // fix empty tag_list not updating
      },
      visibility: data.metadata.visibility
    };
    this.setObject(updatedState);
    return data;
  }

  fetchProjectDatasetsFromKg(client) { //from KG
    if (this.get("core.datasets_kg") === SpecialPropVal.UPDATING) return;
    this.setUpdating({ core: { datasets_kg: true } });
    return client.getProjectDatasetsFromKG(this.get("core.path_with_namespace"))
      .then(datasets => {
        const updatedState = { datasets_kg: { $set: datasets }, transient: { requests: { datasets_kg: false } } };
        this.setObject({ core: updatedState });
        return datasets;
      })
      .catch(err => {
        const datasets = [];
        const updatedState = { datasets_kg: { $set: datasets }, transient: { requests: { datasets_kg: false } } };
        this.setObject({ core: updatedState });
      });
  }


  fetchProjectDatasets(client, forceReFetch) {
    let datasets = this.get("core.datasets");
    if (datasets === SpecialPropVal.UPDATING) return;
    if (datasets && datasets.error === undefined && !forceReFetch) return datasets;
    this.setUpdating({ core: { datasets: true } });
    return client.listProjectDatasetsFromCoreService(this.get("system.http_url"), this.get("core.id"))
      .then(response => {
        let responseDs = response.data.error ? response.data : response.data.result.datasets;
        const updatedState = { datasets: { $set: responseDs }, transient: { requests: { datasets: false } } };
        this.setObject({ core: updatedState });
        return responseDs;
      })
      .catch(err => {
        const updatedState = { datasets: { $set: { error: err } }, transient: { requests: { datasets: false } } };
        this.setObject({ core: updatedState });
      });
  }

  // TODO: migrate branches to ProjectCoordinator and use a pattern similar to fetchCommits
  fetchBranches(client) {
    const branches = this.get("system.branches");
    if (branches === SpecialPropVal.UPDATING)
      return;
    this.setUpdating({ system: { branches: true } });
    return client.getBranches(this.get("core.id"))
      .then(resp => resp.data)
      .then(data => {
        // split away autosaved branches and add external url
        const { standard, autosaved } = splitAutosavedBranches(data);
        const externalUrl = this.get("core.external_url");
        const autosavedUrl = autosaved.map(branch => {
          const url = `${externalUrl}/tree/${branch.name}`;
          branch.autosave.url = url;
          return branch;
        });
        this.setObject({
          system: {
            branches: { $set: standard },
            autosaved: { $set: autosavedUrl }
          }
        });

        return standard;
      });
  }

  setTags(client, tags) {
    this.setUpdating({ system: { tag_list: [true] } });
    client.setTags(this.get("core.id"), tags)
      .then(() => { this.fetchProject(client, this.get("core.id")); });
  }

  setDescription(client, description) {
    this.setUpdating({ core: { description: true } });
    client.setDescription(this.get("core.id"), description).then(() => {
      this.fetchProject(client, this.get("core.id"));
    });
  }

  setAvatar(client, avatarFile) {
    // this.setUpdating({ core: { avatar_url: [true] } });
    return client.setAvatar(this.get("core.id"), avatarFile)
      .then(() => { this.fetchProject(client, this.get("core.id")); });
  }
}

const FileTreeMixin = {
  fetchProjectFilesTree(client, openFilePath, openFolder) {
    if (this.get("transient.requests.filesTree") === SpecialPropVal.UPDATING) return;
    const oldTree = this.get("filesTree");
    openFilePath = this.cleanFilePathUrl(openFilePath);
    if (oldTree.loaded === false)
      return this.initialFetchProjectFilesTree(client, openFilePath, openFolder);

    if (openFolder !== undefined && oldTree.hash[openFolder].childrenLoaded === false)
      return this.deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree);

    return oldTree;
  },
  setProjectOpenFolder(client, folderPath) {
    let filesTree = this.model.get("filesTree");
    if (filesTree.hash[folderPath].childrenLoaded === false)
      this.fetchProjectFilesTree(client, "", folderPath);

    filesTree.hash[folderPath].childrenOpen = !filesTree.hash[folderPath].childrenOpen;
    this.model.set("filesTree", filesTree);
  },
  saveProjectLastNode(nodeData) {
    this.model.set("filesTree.last", nodeData);
  },
  initialFetchProjectFilesTree(client, openFilePath, openFolder ) {
    this.model.setUpdating({ transient: { requests: { filesTree: true } } });
    return client.getProjectFilesTree(this.get("metadata.id"), this.get("metadata.defaultBranch"), openFilePath)
      .then(d => {
        const updatedState = { filesTree: d, transient: { requests: { filesTree: false } } };
        this.model.setObject(updatedState);
        this.model.set("filesTree", d);
        this.model.set("filesTree.loaded", true);
        return d;
      })
      .then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  },
  deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree) {
    this.model.setUpdating({ transient: { requests: { filesTree: true } } });
    return client.getProjectFilesTree(this.get("metadata.id"), this.get("metadata.defaultBranch"),
      openFilePath, openFolder, oldTree.lfsFiles)
      .then(d => {
        const updatedState = this.insertInParentTree(oldTree, d, openFolder);
        this.model.setObject(updatedState);
        this.model.set("filesTree", oldTree);
        return oldTree;
      }).then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  },
  returnTreeOrFetchNext(client, openFilePath, openFolder, tree) {
    if (openFilePath !== undefined && openFilePath.split("/").length > 1) {
      const openFilePathArray = openFilePath.split("/");
      const goTo = openFolder !== undefined ?
        openFolder + "/" + openFilePathArray[0]
        : openFilePathArray[0];
      return this.fetchProjectFilesTree(client, openFilePath.replace(openFilePathArray[0], ""), goTo);
    }
    return tree;
  },
  cleanFilePathUrl(openFilePath) {
    if (openFilePath.startsWith("/"))
      return openFilePath = openFilePath.substring(1);
    return openFilePath;
  },
  insertInParentTree(parentTree, newTree, openFolder) {
    parentTree.hash[openFolder].treeRef.children = newTree.tree;
    parentTree.hash[openFolder].childrenLoaded = true;
    parentTree.hash[openFolder].childrenOpen = true;
    for (const node in newTree.hash)
      parentTree.hash[node] = newTree.hash[node];
    return { filesTree: parentTree, transient: { requests: { filesTree: false } } };
  }
};

const StarMixin = {
  async star(client, starred) {
    return client.starProject(this.get("metadata.id"), starred)
      .then((resp) => resp.data);
  },

  setStars(num) {
    this.set("metadata.starCount", num);
  }
};

class ProjectCoordinator {
  constructor(client, model, notifications = null) {
    this.client = client;
    this.model = model;
    this.notifications = notifications;
  }

  checkGraphWebhook(client) {
    if (this.get("metadata.exists") !== true) {
      this.model.set("webhook.possible", false);
      return;
    }

    // check user permissions and fetch webhook status
    const webhookCreator = this.get("metadata.accessLevel") >= ACCESS_LEVELS.MAINTAINER ?
      true :
      false;
    this.model.set("webhook.possible", webhookCreator);
    if (webhookCreator)
      this.fetchGraphWebhookStatus(client);
  }

  get(component = "") {
    return this.model.get(component);
  }

  resetProject() {
    const emptyModel = projectGlobalSchema.createInitialized();
    this.model.baseModel.setObject({
      [this.model.baseModelPath]: { $set: emptyModel }
    });
  }

  set(component, value) {
    return this.model.set(component, value);
  }

  setUpdating(options) {
    this.model.setUpdating(options);
  }

  fetchProject(client, projectPathWithNamespace) {
    this.setUpdating({ metadata: { exists: true } });
    return client.getProject(projectPathWithNamespace, { statistics: true })
      .then(resp => resp.data)
      .then(d => {
        this.setProjectData(d, true);
        return d;
      })
      .catch(err => {
        if (err.case === API_ERRORS.notFoundError)
          this.set("metadata.exists", false);

        else throw err;
      });
  }

  setProjectData(data, statistics = false) {
    let metadata, statsObject, filtersObject;

    // set metadata
    if (!data) {
      metadata = {
        $set: {
          ...projectGlobalSchema.createInitialized().metadata,
          exists: false,
          fetched: new Date(),
          fetching: false
        }
      };
      statsObject = {
        $set: {
          ...projectGlobalSchema.createInitialized().statistics,
          fetched: new Date(),
          fetching: false
        }
      };
      filtersObject = {
        ...projectGlobalSchema.createInitialized().filters,
        fetched: new Date(),
        fetching: false
      };
    }
    else {
      metadata = {
        accessLevel: data.metadata.visibility.accessLevel, // this is computed in carveProject
        defaultBranch: data.metadata.core.default_branch,
        exists: true,
        forksCount: data.all.forks_count,
        id: data.all.id,
        namespace: data.all.namespace.full_path,
        owner: data.metadata.core.owner,
        path: data.all.path,
        pathWithNamespace: data.all.path_with_namespace,
        repositoryUrl: data.all.web_url,
        starCount: data.all.star_count,
        visibility: data.metadata.visibility.level, // this is computed in carveProject

        fetched: new Date(),
        fetching: false
      };


      // set statistics
      if (statistics) {
        const stats = data.all && data.all.statistics ?
          data.all.statistics :
          projectGlobalSchema.createInitialized().statistics.data;
        statsObject = {
          data: { $set: stats },
          fetched: new Date(),
          fetching: false
        };
      }

      // set filters
      const filtersData = data.filters ? data.filters :
        projectGlobalSchema.createInitialized().filters.data;
      filtersObject = {
        branch: { $set: filtersData.branch },
        commit: { $set: filtersData.commit },
        fetched: new Date(),
        fetching: false
      };
    }

    this.model.setObject({ metadata: metadata,
      statistics: statsObject,
      filters: filtersObject,
      _transition: data
    });
    return metadata;
  }

  async fetchCommits(customFilters = null) {
    const projectId = this.model.get("metadata.id");
    if (!projectId)
      return {};
    const branch = customFilters ?
      customFilters.branch :
      this.model.get("filters.branch.name");

    // start fetching
    this.model.set("commits.fetching", true);
    let response = null, date = null, commits = [], error = null;
    try {
      response = await this.client.getCommits(projectId, branch);
      if (response.data)
        commits = response.data;
      error = response.error;
      date = new Date();
    }
    catch (commitsError) {
      error = commitsError;
    }

    if (error && this.notifications) {
      // Add warning when something fails. It's not needed when the problem is the commits number.
      const errorMex = error.message ?
        error.message :
        JSON.stringify(error);
      if (!errorMex.startsWith("Cannot iterate more than")) {
        const projectName = this.model.get("metadata.pathWithNamespace");
        this.notifications.addWarning(
          this.notifications.Topics.PROJECT_API,
          "There was an error while fetching the project commits.",
          null, null, [],
          `Error for branch "${branch}" on project "${projectName}": ${errorMex}`
        );
      }
    }
    this.model.setObject({
      commits: {
        fetching: false,
        fetched: date,
        list: { $set: commits },
        error: error
      }
    });
    return commits;
  }

  fetchGraphStatus(client) {
    return client.checkGraphStatus(this.get("metadata.id"))
      .then((resp) => {
        let progress;
        if (resp.progress == null)
          progress = GraphIndexingStatus.NO_PROGRESS;

        if (resp.progress === 0 || resp.progress)
          progress = resp.progress;
        this.set("webhook.progress", progress);
        return progress;
      })
      .catch((err) => {
        if (err.case === API_ERRORS.notFoundError) {
          const progress = GraphIndexingStatus.NO_WEBHOOK;
          this.set("webhook.progress", progress);
          return progress;
        }

        throw err;

      });
  }

  fetchGraphWebhook(client, user) {
    if (!user) {
      this.set("webhook.possible", false);
      return;
    }
    const userIsOwner = this.get("metadata.owner.id") === user.data.id;
    this.set("webhook.possible", userIsOwner);
    if (userIsOwner)
      this.fetchGraphWebhookStatus(client, this.get("metadata.id"));
  }

  fetchGraphWebhookStatus(client) {
    this.model.set("webhook.created", false);
    this.model.setUpdating({ webhook: { status: true } });
    return client.checkGraphWebhook(this.get("metadata.id"))
      .then((resp) => {
        this.model.set("webhook.status", resp);
      })
      .catch((err) => {
        this.model.set("webhook.status", err);
      });
  }

  createGraphWebhook(client) {
    this.model.setUpdating({ webhook: { created: true } });
    return client.createGraphWebhook(this.get("metadata.id"))
      .then((resp) => {
        this.model.set("webhook.created", resp);
      })
      .catch((err) => {
        this.model.set("webhook.created", err);
      });
  }

  async fetchProjectConfig(repositoryUrl, branch = null) {
    let configObject = {
      error: { $set: {} },
      fetching: true,
    };
    this.model.setObject({ config: configObject });
    const response = await this.client.getProjectConfig(repositoryUrl, branch);
    configObject.fetching = false;
    configObject.fetched = new Date();
    if (response.data && response.data.error) {
      configObject.error = response.data.error;
      this.model.setObject({ config: configObject });
      return response.data.error;
    }
    configObject.data = { $set: response.data.result };
    this.model.setObject({ config: configObject });
    return response.data.result;
  }

  fetchReadme(client) {
    // Do not fetch if a fetch is in progress
    if (this.get("transient.requests.readme") === SpecialPropVal.UPDATING) return;

    this.model.setUpdating({ transient: { requests: { readme: true } } });
    client.getProjectReadme(this.model.get("metadata.id"), this.model.get("metadata.defaultBranch"))
      .then(d => this.model.set("data.readme.text", d.text))
      .catch(error => {
        if (error.case === API_ERRORS.notFoundError)
          this.model.set("data.readme.text", "No readme file found.");

      })
      .finally(() => this.model.set("transient.requests.readme", false));
  }

  fetchModifiedFiles(client) {
    client.getModifiedFiles(this.get("metadata.id"))
      .then(d => {
        this.set("files.modifiedFiles", d);
      });
  }

  async fetchStatistics(pathWithNamespace) {
    if (this.model.get("statistics.fetching"))
      return;
    if (!pathWithNamespace)
      pathWithNamespace = this.model.get("metadata.pathWithNamespace");
    if (!pathWithNamespace)
      return;
    this.model.set("statistics.fetching", true);
    const resp = await this.client.getProject(pathWithNamespace, { statistics: true });
    const stats = resp.data.all.statistics ?
      resp.data.all.statistics :
      projectGlobalSchema.createInitialized().statistics.data;
    const statsObject = {
      fetching: false,
      fetched: new Date(),
      data: { $set: stats }
    };
    this.model.setObject({ statistics: statsObject });
    return stats;
  }
}

Object.assign(ProjectCoordinator.prototype, FileTreeMixin);
Object.assign(ProjectCoordinator.prototype, StarMixin);

export { ProjectModel, GraphIndexingStatus, ProjectCoordinator, MigrationStatus };

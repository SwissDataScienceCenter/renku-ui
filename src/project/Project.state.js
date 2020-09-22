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

import { API_ERRORS } from "../api-client";
import { StateModel, SpecialPropVal, projectSchema, projectGlobalSchema } from "../model";
import { isNullOrUndefined } from "util";
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

  fetchMigrationCheck(client, user) {
    client.getProjectIdFromService(this.get("system.http_url"))
      .then((response)=>{
        if (response.data && response.data.error !== undefined) {
          this.set("migration.check_error", response.data.error.reason);
        }
        else {
          client.performMigrationCheck(response)
            .then((response)=>{
              if (response.data && response.data.error !== undefined) {
                this.set("migration.check_error", response.data.error.reason);
              }
              else {
                this.set("migration.migration_required", response.data.result.migration_required);
                this.set("migration.project_supported", response.data.result.project_supported);
              }
            });
        }
      });
  }

  migrateProject(client) {
    if (this.get("migration.migration_status") === MigrationStatus.MIGRATING)
      return;
    this.set("migration.migration_status", MigrationStatus.MIGRATING);
    client.getProjectIdFromService(this.get("system.http_url"))
      .then((projectId)=>{
        client.performMigration(projectId)
          .then((response)=>{
            if (response.data.error) {
              this.set("migration.migration_status", MigrationStatus.ERROR);
              this.set("migration.migration_error", response.data.error.reason);
            }
            else {
              this.fetchMigrationCheck(client);
              this.set("migration.migration_status", MigrationStatus.FINISHED);
              this.set("migration.migration_error", undefined);
            }
          });
      });
  }

  stopCheckingWebhook() {
    this.set("webhook.stop", true);
  }

  fetchGraphWebhook(client, user) {
    if (!user) {
      this.set("webhook.possible", false);
      return;
    }
    const userIsOwner = this.get("core.owner.id") === user.data.id;
    this.set("webhook.possible", userIsOwner);
    if (userIsOwner)
      this.fetchGraphWebhookStatus(client, this.get("core.id"));
  }

  fetchGraphStatus(client) {
    return client.checkGraphStatus(this.get("core.id"))
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

  fetchGraphWebhookStatus(client) {
    this.set("webhook.created", false);
    this.setUpdating({ webhook: { status: true } });
    return client.checkGraphWebhook(this.get("core.id"))
      .then((resp) => {
        this.set("webhook.status", resp);
      })
      .catch((err) => {
        this.set("webhook.status", err);
      });
  }

  createGraphWebhook(client) {
    this.setUpdating({ webhook: { created: true } });
    return client.createGraphWebhook(this.get("core.id"))
      .then((resp) => {
        this.set("webhook.created", resp);
      })
      .catch((err) => {
        this.set("webhook.created", err);
      });
  }

  // TODO: Do we really want to re-fetch the entire project on every change?
  fetchProject(client, projectPathWithNamespace) {
    this.setUpdating({ core: { available: true } });
    return client.getProject(projectPathWithNamespace, { statistics: true })
      .then(resp => resp.data)
      .then(d => {
        const updatedState = {
          core: { ...d.metadata.core, available: true },
          system: {
            ...d.metadata.system,
            tag_list: { $set: d.metadata.system.tag_list } // fix empty tag_list not updating
          },
          visibility: d.metadata.visibility,
          statistics: d.metadata.statistics
        };
        this.setObject(updatedState);
        return d;
      })
      .catch(err => {
        if (err.case === API_ERRORS.notFoundError)
          this.set("core.available", false);

        else throw err;
      });
  }

  initialFetchProjectFilesTree(client, openFilePath, openFolder ) {
    this.setUpdating({ transient: { requests: { filesTree: true } } });
    return client.getProjectFilesTree(this.get("core.id"), openFilePath)
      .then(d => {
        const updatedState = { filesTree: d, transient: { requests: { filesTree: false } } };
        this.setObject(updatedState);
        this.set("filesTree", d);
        return d;
      })
      .then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  }

  deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree) {
    this.setUpdating({ transient: { requests: { filesTree: true } } });
    return client.getProjectFilesTree(this.get("core.id"), openFilePath, openFolder, oldTree.lfsFiles)
      .then(d => {
        const updatedState = this.insertInParentTree(oldTree, d, openFolder);
        this.setObject(updatedState);
        this.set("filesTree", oldTree);
        return oldTree;
      }).then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  }

  returnTreeOrFetchNext(client, openFilePath, openFolder, tree) {
    if (openFilePath !== undefined && openFilePath.split("/").length > 1) {
      const openFilePathArray = openFilePath.split("/");
      const goto = openFolder !== undefined ?
        openFolder + "/" + openFilePathArray[0]
        : openFilePathArray[0];
      return this.fetchProjectFilesTree(client, openFilePath.replace(openFilePathArray[0], ""), goto);
    }
    return tree;

  }

  cleanFilePathUrl(openFilePath) {
    if (openFilePath.startsWith("/"))
      return openFilePath = openFilePath.substring(1);
    return openFilePath;
  }

  insertInParentTree(parentTree, newTree, openFolder) {
    parentTree.hash[openFolder].treeRef.children = newTree.tree;
    parentTree.hash[openFolder].childrenLoaded = true;
    parentTree.hash[openFolder].childrenOpen = true;
    for (const node in newTree.hash)
      parentTree.hash[node] = newTree.hash[node];
    return { filesTree: parentTree, transient: { requests: { filesTree: false } } };
  }

  fetchProjectFilesTree(client, openFilePath, openFolder) {
    if (this.get("transient.requests.filesTree") === SpecialPropVal.UPDATING) return;
    const oldTree = this.get("filesTree");
    openFilePath = this.cleanFilePathUrl(openFilePath);
    if (isNullOrUndefined(oldTree))
      return this.initialFetchProjectFilesTree(client, openFilePath, openFolder);

    if (openFolder !== undefined && oldTree.hash[openFolder].childrenLoaded === false)
      return this.deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree);

    return oldTree;


  }

  setProjectOpenFolder(client, folderPath) {
    let filesTree = this.get("filesTree");
    if (filesTree.hash[folderPath].childrenLoaded === false)
      this.fetchProjectFilesTree(client, "", folderPath);

    filesTree.hash[folderPath].childrenOpen = !filesTree.hash[folderPath].childrenOpen;
    this.set("filesTree", filesTree);
  }

  fetchProjectDatasets(client) { //from KG
    if (this.get("core.datasets") === SpecialPropVal.UPDATING) return;
    this.setUpdating({ core: { datasets: true } });
    return client.getProjectDatasetsFromKG(this.get("core.path_with_namespace"))
      .then(datasets => {
        const updatedState = { datasets: datasets, transient: { requests: { datasets: false } } };
        this.set("core.datasets", datasets);
        this.setObject(updatedState);
        return datasets;
      })
      .catch(err => {
        const datasets = [];
        const updatedState = { datasets: datasets, transient: { requests: { datasets: false } } };
        this.set("core.datasets", datasets);
        this.setObject(updatedState);
      });
  }

  fetchProjectDatasetsFromMetadata(client) {
    if (this.get("transient.requests.datasets") === SpecialPropVal.UPDATING) return;
    this.setUpdating({ transient: { requests: { datasets: true } } });

    return client.getProjectDatasets(this.get("core.id"))
      .then(datasets => {
        datasets = datasets.map(dataset => {
          dataset.identifier = dataset.identifier.split("-").join("");
          return dataset;
        } );
        const updatedState = { datasets: datasets, transient: { requests: { datasets: false } } };
        this.set("core.datasets", datasets);
        this.setObject(updatedState);
        return datasets;
      });
  }

  fetchModifiedFiles(client) {
    client.getModifiedFiles(this.get("core.id"))
      .then(d => {
        this.set("files.modifiedFiles", d);
      });
  }

  fetchMergeRequests(client) {
    client.getMergeRequests(this.get("core.id"))
      .then(resp => resp.data)
      .then(d => {
        this.set("system.merge_requests", d);
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

  fetchReadme(client) {
    // Do not fetch if a fetch is in progress
    if (this.get("transient.requests.readme") === SpecialPropVal.UPDATING) return;

    this.setUpdating({ transient: { requests: { readme: true } } });
    client.getProjectReadme(this.get("core.id"))
      .then(d => this.set("data.readme.text", d.text))
      .catch(error => {
        if (error.case === API_ERRORS.notFoundError)
          this.set("data.readme.text", "No readme file found.");

      })
      .finally(() => this.set("transient.requests.readme", false));
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

  toggleForkModal() {
    const forkModalOpen = this.get("transient.forkModalOpen");
    const forkModalFlipped = forkModalOpen === false ? true : false;
    this.set("transient.forkModalOpen", forkModalFlipped);
  }

  star(client, starred) {
    return client.starProject(this.get("core.id"), starred)
      .then((resp) => resp.data);
  }

  setStars(num) {
    this.set("system.star_count", num);
  }
}

class ProjectCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  resetProject() {
    this.model.setObject({
      metadata: { $set: projectGlobalSchema.createInitialized().metadata }
    });
  }

  setProjectData(data) {
    let metadata;
    if (!data) {
      metadata = {
        $set: {
          ...projectGlobalSchema.createInitialized().metadata,
          exists: false,
          fetched: new Date(),
          fetching: false
        }
      };
    }
    else {
      metadata = {
        exists: true,
        id: data.all.id,
        namespace: data.all.namespace.full_path,
        path: data.all.path,
        pathWithNamespace: data.all.path_with_namespace,
        repositoryUrl: data.all.web_url,
        fetched: new Date(),
        fetching: false
      };
    }
    this.model.setObject({ metadata: metadata });
    return metadata;
  }

  async fetchCommits(customFilters = null) {
    const projectId = this.model.get("metadata.id");
    if (!projectId)
      return {};
    this.model.set("commits.fetching", true);

    const branch = customFilters ?
      customFilters.branch :
      this.model.get("filters.branch.name");
    const response = await this.client.getCommits(projectId, branch);
    // add at least a notification on response.error (waiting for #991).
    // Some data may be avialable, verify it before choosing the proper notification.
    const commits = response.data;
    this.model.setObject({
      commits: {
        fetching: false,
        fetched: new Date(),
        list: { $set: commits },
        error: response.error
      }
    });
    return commits;
  }
}

export { ProjectModel, GraphIndexingStatus, ProjectCoordinator, MigrationStatus };

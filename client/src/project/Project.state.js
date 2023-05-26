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
import { SpecialPropVal, projectSchema } from "../model";
import {
  refreshIfNecessary,
  splitAutosavedBranches,
} from "../utils/helpers/HelperFunctions";

const MigrationStatus = {
  MIGRATING: "MIGRATING",
  FINISHED: "FINISHED",
  ERROR: "ERROR",
};

const CoreServiceProjectMixin = {
  async fetchProjectLockStatus(logged = true) {
    // Set project unlocked for anonymous users
    if (!logged) {
      this.setObject({
        fetching: false,
        fetched: new Date(),
        locked: false,
        error: null,
      });
      return false;
    }

    const fetchLockStatus = async () => {
      const client = this.client;
      const gitUrl = this.get("metadata.httpUrl");
      let lockStatusObject = { fetching: true, error: null };
      this.setObject({ lockStatus: lockStatusObject });
      const lockStatus = await client.getProjectLockStatus(gitUrl);
      if (lockStatus?.data?.error)
        lockStatusObject.error = lockStatus.data.error;
      else lockStatusObject.locked = lockStatus?.data?.result?.locked;
      lockStatusObject.fetching = false;
      lockStatusObject.fetched = new Date();
      this.setObject({ lockStatus: lockStatusObject });

      return lockStatus.error ? lockStatus.error : lockStatus.locked;
    };

    // prevent re-fetching too soon
    const current = this.get("lockStatus");
    return await refreshIfNecessary(
      current.fetching,
      current.fetched,
      fetchLockStatus,
      1
    );
  },
};

const DatasetsMixin = {
  fetchProjectDatasetsFromKg(client) {
    //from KG
    if (this.get("datasets.datasets_kg") === SpecialPropVal.UPDATING) return;
    this.setUpdating({ datasets: { datasets_kg: true } });
    return client
      .getProjectDatasetsFromKG(this.get("metadata.pathWithNamespace"))
      .then((datasets) => {
        const updatedState = {
          datasets_kg: { $set: datasets },
          transient: { requests: { datasets_kg: false } },
        };
        this.setObject({ datasets: updatedState });
        return datasets;
      })
      .catch(() => {
        const datasets = [];
        const updatedState = {
          datasets_kg: { $set: datasets },
          transient: { requests: { datasets_kg: false } },
        };
        this.setObject({ datasets: updatedState });
      });
  },
  fetchProjectDatasets(client, forceReFetch) {
    let core = this.get("datasets.core");
    if (core === SpecialPropVal.UPDATING) return;
    if (core.datasets && core.error == null && !forceReFetch) return core;
    this.setUpdating({ datasets: { core: true } });
    // ! TODO get versionUrl as param
    const migration = this.model.get("migration.core");
    if (migration.backendAvailable === false) return false;
    const versionUrl = migration.versionUrl;
    const gitUrl = this.get("metadata.httpUrl");
    return client
      .listProjectDatasetsFromCoreService(gitUrl, versionUrl)
      .then((response) => {
        let responseDs = response.data.error
          ? response.data
          : response.data.result.datasets;
        const updatedState = {
          core: { $set: { datasets: responseDs } },
          transient: { requests: { datasets: false } },
        };
        this.setObject({ datasets: updatedState });
        return responseDs;
      })
      .catch((err) => {
        const updatedState = {
          core: { datasets: null, error: { $set: err } },
          transient: { requests: { datasets: false } },
        };
        this.setObject({ datasets: updatedState });
      });
  },
};

const FileTreeMixin = {
  fetchProjectFilesTree(client, openFilePath, openFolder) {
    if (this.get("transient.requests.filesTree") === SpecialPropVal.UPDATING)
      return;
    const oldTree = this.get("filesTree");
    openFilePath = this.cleanFilePathUrl(openFilePath);
    if (oldTree.loaded === false)
      return this.initialFetchProjectFilesTree(
        client,
        openFilePath,
        openFolder
      );

    if (
      openFolder !== undefined &&
      oldTree.hash[openFolder]?.childrenLoaded === false
    )
      return this.deepFetchProjectFilesTree(
        client,
        openFilePath,
        openFolder,
        oldTree
      );

    return oldTree;
  },
  setProjectOpenFolder(client, folderPath) {
    let filesTree = this.model.get("filesTree");
    if (filesTree.hash[folderPath].childrenLoaded === false)
      this.fetchProjectFilesTree(client, "", folderPath);

    filesTree.hash[folderPath].childrenOpen =
      !filesTree.hash[folderPath].childrenOpen;
    this.model.set("filesTree", filesTree);
  },
  saveProjectLastNode(nodeData) {
    this.model.set("filesTree.last", nodeData);
  },
  initialFetchProjectFilesTree(client, openFilePath, openFolder) {
    this.model.setUpdating({ transient: { requests: { filesTree: true } } });
    return client
      .getProjectFilesTree(
        this.get("metadata.id"),
        this.get("metadata.defaultBranch"),
        openFilePath
      )
      .then((d) => {
        const updatedState = {
          filesTree: d,
          transient: { requests: { filesTree: false } },
        };
        this.model.setObject(updatedState);
        this.model.set("filesTree", d);
        this.model.set("filesTree.loaded", true);
        return d;
      })
      .then((d) => {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  },
  deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree) {
    this.model.setUpdating({ transient: { requests: { filesTree: true } } });
    return client
      .getProjectFilesTree(
        this.get("metadata.id"),
        this.get("metadata.defaultBranch"),
        openFilePath,
        openFolder,
        oldTree.lfsFiles
      )
      .then((d) => {
        const updatedState = this.insertInParentTree(oldTree, d, openFolder);
        this.model.setObject(updatedState);
        this.model.set("filesTree", oldTree);
        return oldTree;
      })
      .then((d) => {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d);
      });
  },
  returnTreeOrFetchNext(client, openFilePath, openFolder, tree) {
    if (openFilePath !== undefined && openFilePath.split("/").length > 1) {
      const openFilePathArray = openFilePath.split("/");
      const goTo =
        openFolder !== undefined
          ? openFolder + "/" + openFilePathArray[0]
          : openFilePathArray[0];
      return this.fetchProjectFilesTree(
        client,
        openFilePath.replace(openFilePathArray[0], ""),
        goTo
      );
    }
    return tree;
  },
  cleanFilePathUrl(openFilePath) {
    if (openFilePath.startsWith("/"))
      return (openFilePath = openFilePath.substring(1));
    return openFilePath;
  },
  insertInParentTree(parentTree, newTree, openFolder) {
    parentTree.hash[openFolder].treeRef.children = newTree.tree;
    parentTree.hash[openFolder].childrenLoaded = true;
    parentTree.hash[openFolder].childrenOpen = true;
    for (const node in newTree.hash) parentTree.hash[node] = newTree.hash[node];
    return {
      filesTree: parentTree,
      transient: { requests: { filesTree: false } },
    };
  },
};

const ProjectAttributesMixin = {
  setAvatar(client, avatarFile) {
    // this.setUpdating({ core: { avatar_url: [true] } });
    return client.setAvatar(this.get("metadata.id"), avatarFile).then(() => {
      this.set("metadata.pendingRefresh", true);
    });
  },
  setDescription(client, description) {
    this.set("metadata.description", { updating: true });
    return client
      .setDescription(this.get("metadata.id"), description)
      .then(() => {
        this.set("metadata.description", description); // to refresh view
        this.set("metadata.pendingRefresh", true);
      });
  },
  setTags(client, tags) {
    this.set("metadata.tagList.updating", true);
    const currentTags = tags.trim();
    const temporalTags =
      currentTags.length === 0 ? [] : tags.split(",").map((tag) => tag.trim());

    return client.setTags(this.get("metadata.id"), tags).then(() => {
      this.set("metadata.tagList", temporalTags); // to refresh view
      this.set("metadata.pendingRefresh", true);
    });
  },
};

const RepoMixin = {
  async fetchBranches() {
    const client = this.client;
    if (this.get("branches.fetching") === SpecialPropVal.UPDATING) return;
    this.setUpdating({ branches: { fetching: true } });
    let standard = [],
      autosaved = [],
      date = null,
      error = null;
    try {
      const resp = await client.getBranches(this.get("metadata.id"));
      if (resp.data) {
        const data = resp.data;
        error = resp.error;
        date = new Date();
        // split away autosaved branches and add external url
        ({ standard, autosaved } = splitAutosavedBranches(data));
        const externalUrl = this.get("metadata.externalUrl");
        autosaved.map((branch) => {
          const url = `${externalUrl}/tree/${branch.name}`;
          branch.autosave.url = url;
          return branch;
        });
      }
    } catch (e) {
      error = e;
    }

    const branches = {
      fetching: false,
      fetched: date,
      standard,
      autosaved,
      error: error,
    };
    this.model.setObject({
      branches: { $set: branches },
    });

    return standard;
  },
  async fetchCommits(customFilters = null, customProjectId = null) {
    const projectId = customProjectId
      ? customProjectId
      : this.model.get("metadata.id");
    if (!projectId) return {};
    const branch = customFilters
      ? customFilters.branch
      : this.model.get("filters.branch.name");

    // start fetching
    const alreadyFetching = this.model.get("commits.fetching");
    if (alreadyFetching) return {};
    this.model.set("commits.fetching", true);
    let response = null,
      date = null,
      commits = [],
      error = null;
    try {
      response = await this.client.getCommits(projectId, branch);
      if (response.data) commits = response.data;
      error = response.error;
      date = new Date();
    } catch (commitsError) {
      error = commitsError;
    }

    if (error && this.notifications) {
      // Add warning when something fails. It's not needed when the problem is the commits number.
      const errorMex = error.message ? error.message : JSON.stringify(error);
      if (!errorMex.startsWith("Cannot iterate more than")) {
        const projectName = this.model.get("metadata.pathWithNamespace");
        this.notifications.addWarning(
          this.notifications.Topics.PROJECT_API,
          "There was an error while fetching the project commits.",
          null,
          null,
          [],
          `Error for branch "${branch}" on project "${projectName}": ${errorMex}`
        );
      }
    }
    this.model.setObject({
      commits: {
        fetching: false,
        fetched: date,
        list: { $set: commits },
        error: error,
      },
    });
    return commits;
  },
};

function metadataFromData(data) {
  if (!data) return {};
  return {
    avatarUrl: data.metadata.core.avatar_url,
    accessLevel: data.metadata.visibility.accessLevel, // this is computed in carveProject
    createdAt: data.metadata.core.created_at,
    defaultBranch: data.metadata.core.default_branch,
    description: data.metadata.core.description,
    exists: true,
    externalUrl: data.metadata.core.external_url,
    forksCount: data.all.forks_count,
    httpUrl: data.metadata.system.http_url,
    id: data.all.id,
    lastActivityAt: data.metadata.core.last_activity_at,
    namespace: data.all.namespace.full_path,
    owner: data.metadata.core.owner ?? data.all.namespace,
    path: data.all.path,
    pathWithNamespace: data.all.path_with_namespace,
    repositoryUrl: data.all.web_url,
    sshUrl: data.metadata.system.ssh_url,
    tagList: { $set: data.metadata.system.tag_list }, // fix empty tag_list not updating
    title: data.metadata.core.title,
    visibility: data.metadata.visibility.level, // this is computed in carveProject

    fetched: new Date(),
    fetching: false,
  };
}

class ProjectCoordinator {
  constructor(client, model, notifications = null) {
    this.client = client;
    this.model = model;
    this.notifications = notifications;
  }

  get(component = "") {
    return this.model.get(component);
  }

  resetProject() {
    const emptyModel = projectSchema.createInitialized();
    this.model.baseModel.setObject({
      [this.model.baseModelPath]: { $set: emptyModel },
    });
  }

  set(component, value) {
    return this.model.set(component, value);
  }

  setUpdating(options) {
    this.model.setUpdating(options);
  }

  setObject(value) {
    this.model.setObject(value);
  }

  resetFilesTree() {
    this.set("filesTree.hash", {});
    this.set("filesTree.loaded", false);
  }

  fetchProject(client, projectPathWithNamespace) {
    const identifier = !projectPathWithNamespace
      ? this.get("metadata.id")
      : projectPathWithNamespace;

    this.setUpdating({ metadata: { exists: true } });
    this.resetFilesTree();
    return client
      .getProject(identifier, { statistics: true })
      .then((resp) => resp.data)
      .then((d) => {
        this.setProjectData(d, true);
        return d;
      })
      .catch((err) => {
        if (err.case === API_ERRORS.notFoundError)
          this.set("metadata.exists", false);
        else throw err;
      });
  }

  setProjectData(data, statistics = false) {
    let metadata, statsObject, filtersObject, forkedFromProject;

    // set metadata
    if (!data) {
      metadata = {
        $set: {
          ...projectSchema.createInitialized().metadata,
          exists: false,
          fetched: new Date(),
          fetching: false,
        },
      };
      forkedFromProject = {};
      statsObject = {
        $set: {
          ...projectSchema.createInitialized().statistics,
          fetched: new Date(),
          fetching: false,
        },
      };
      filtersObject = {
        ...projectSchema.createInitialized().filters,
        fetched: new Date(),
        fetching: false,
      };
    } else {
      metadata = metadataFromData(data);
      forkedFromProject = metadataFromData(
        data.metadata.system.forked_from_project
      );

      // set statistics
      if (statistics) {
        const stats =
          data.all && data.all.statistics
            ? data.all.statistics
            : projectSchema.createInitialized().statistics.data;
        statsObject = {
          data: { $set: stats },
          fetched: new Date(),
          fetching: false,
        };
      }

      // set filters
      const filtersData = data.filters
        ? data.filters
        : projectSchema.createInitialized().filters.data;
      filtersObject = {
        branch: { $set: filtersData.branch },
        commit: { $set: filtersData.commit },
        fetched: new Date(),
        fetching: false,
      };
    }

    this.model.setObject({
      metadata,
      filters: filtersObject,
      forkedFromProject: { $set: forkedFromProject },
      statistics: statsObject,
    });
    return metadata;
  }

  async fetchReadmeCommits() {
    // Do not fetch if a fetch is in progress
    if (this.get("commitsReadme.fetching") === SpecialPropVal.UPDATING) return;
    this.model.setUpdating({
      transient: { requests: { commitsReadme: true } },
    });
    const projectId = this.model.get("metadata.id");

    // bring only 2 commits just to validate if the user already edit the readme file
    try {
      const request = await this.client.getCommits(
        projectId,
        this.model.get("metadata.defaultBranch"),
        2,
        "README.md",
        1
      );
      this.model.setObject({
        commitsReadme: {
          fetching: false,
          fetched: new Date(),
          list: request.data,
        },
      });
      return request.data.length;
    } catch (error) {
      if (error.case === API_ERRORS.notFoundError) {
        this.model.setObject({
          commitsReadme: {
            fetching: false,
            fetched: null,
            list: [],
          },
        });
      }
    }
    return null;
  }

  async fetchProjectConfig(repositoryUrl, versionUrl = "", branch = null) {
    const fetching = this.model.get("config.fetching");
    if (fetching) return false;
    // const versionUrl = this.model.get("migration.core.versionUrl");
    let configObject = {
      error: { $set: {} },
      fetching: true,
    };
    this.model.setObject({ config: configObject });
    const response = await this.client.getProjectConfig(
      repositoryUrl,
      versionUrl,
      branch
    );
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
    if (this.get("transient.requests.readme") === SpecialPropVal.UPDATING)
      return;

    this.model.setUpdating({ transient: { requests: { readme: true } } });
    client
      .getProjectReadme(
        this.model.get("metadata.id"),
        this.model.get("metadata.defaultBranch")
      )
      .then((d) => this.model.set("data.readme.text", d.text))
      .catch((error) => {
        if (error.case === API_ERRORS.notFoundError)
          this.model.set("data.readme.text", "No readme file found.");
      })
      .finally(() => this.model.set("transient.requests.readme", false));
  }

  fetchModifiedFiles(client) {
    client.getModifiedFiles(this.get("metadata.id")).then((d) => {
      this.set("files.modifiedFiles", d);
    });
  }

  async fetchStatistics(pathWithNamespace) {
    if (this.model.get("statistics.fetching")) return;
    if (!pathWithNamespace)
      pathWithNamespace = this.model.get("metadata.pathWithNamespace");
    if (!pathWithNamespace) return;
    this.model.set("statistics.fetching", true);
    const resp = await this.client.getProject(pathWithNamespace, {
      statistics: true,
    });
    const stats = resp.data.all.statistics
      ? resp.data.all.statistics
      : projectSchema.createInitialized().statistics.data;
    const statsObject = {
      fetching: false,
      fetched: new Date(),
      data: { $set: stats },
    };
    this.model.setObject({ statistics: statsObject });
    return stats;
  }
}

Object.assign(ProjectCoordinator.prototype, CoreServiceProjectMixin);
Object.assign(ProjectCoordinator.prototype, DatasetsMixin);
Object.assign(ProjectCoordinator.prototype, FileTreeMixin);
Object.assign(ProjectCoordinator.prototype, ProjectAttributesMixin);
Object.assign(ProjectCoordinator.prototype, RepoMixin);

export { ProjectCoordinator, MigrationStatus };

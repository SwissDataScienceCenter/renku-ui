/* eslint-disable max-len */
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

import { fetchJson } from "./utils";
import yaml from "yaml-js";

function getApiUrlFromRepoUrl(url) {
  const urlArray = url.split("/");
  urlArray.splice(urlArray.length - 2, 0, "repos");
  url = urlArray.join("/");
  if (url.includes("https://"))
    return url.replace("https://", "https://api.");
  if (url.includes("http://"))
    return url.replace("http://", "http://api.");
}

function buildTreeLazy(name, treeNode, jsonObj, hash, currentPath, gitAttributes, openFilePath) {
  if (name.length === 0)
    return;

  currentPath = jsonObj.path;
  let nodeName = name;
  let nodeType = jsonObj.type; // "tree" "blob" "commit"
  const isLfs = gitAttributes ? gitAttributes.includes(currentPath + " filter=lfs diff=lfs merge=lfs -text") : false;
  let newNode = {
    "name": nodeName,
    "children": [],
    "jsonObj": jsonObj,
    "path": currentPath,
    "isLfs": isLfs,
    "type": nodeType
  };
  hash[newNode.path] = {
    "name": nodeName,
    "selected": false,
    "childrenOpen": false,
    "childrenLoaded": false,
    "path": currentPath,
    "isLfs": isLfs,
    "type": nodeType,
    "treeRef": newNode
  };
  treeNode.push(newNode);
}

function getFilesTreeLazy(client, branchName, files, projectId, openFilePath, lfsFiles) {
  let tree = [];
  let hash = {};
  let lfs = files.filter((treeObj) => treeObj.path === ".gitattributes"); // eslint-disable-line

  if (lfs.length > 0) {
    return client.getRepositoryFile(projectId, lfs[0].path, branchName, "raw")
      .then(json => {
        for (let i = 0; i < files.length; i++)
          buildTreeLazy(files[i].name, tree, files[i], hash, "", json, openFilePath);

        const treeObj = { tree: tree, hash: hash, lfsFiles: json };
        return treeObj;
      });
  }
  for (let i = 0; i < files.length; i++)
    buildTreeLazy(files[i].name, tree, files[i], hash, "", lfsFiles, openFilePath);

  const treeObj = { tree: tree, hash: hash, lfsFiles: lfsFiles };
  return treeObj;

}

function addProjectMethods(client) {

  client.getRecentProjects = async (count) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/last-projects/${count}`, {
      method: "GET",
      headers,
    });
  };

  client.getProjects = async (queryParams = {}) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects`, {
      method: "GET",
      headers,
      queryParams,
    });
  };

  client.getAllProjects = async (queryParams = {}) => {
    let projects = [];
    let page = 1;
    let finished = false;

    while (!finished) {
      const resp = await client.getProjects({ ...queryParams, page });
      projects = [...projects, ...resp.data];

      if (!resp.pagination.nextPageLink)
        finished = true;
      else
        page = resp.pagination.nextPage;
    }

    return projects;
  };

  /**
   * Use the graphQL endpoint to get minimal information for a project
   * @returns A query response promise
   * @param queryParams The query params, should have a key "query"
   */
  client.getProjectsGraphQL = async (queryParams = {}) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const resp = await client.clientFetch(`${client.baseUrl}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify(queryParams),
    });
    return resp?.data?.data?.projects;
  };

  /**
   * Get all the projects that match the query parameters, but just
   * return some minimal information, not the full information.
   * @param {object} queryParams The query params, should have a key "per_page"
   * @returns A query response promise.
   */
  client.getAllProjectsGraphQL = async (queryParams = {}) => {
    let projects = [];
    let finished = false;
    let endCursor = "";
    const params = { "variables": null, "operationName": null };

    while (!finished) {
      let query = `{
        projects(membership: true, first:${queryParams.per_page}, after:"${endCursor}") {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            name
            fullPath
            namespace {
              fullPath
            }
            path,
            httpUrlToRepo,
            userPermissions {
              adminProject,
              pushCode,
              removeProject
            }
          }
        }
      }`;
      const resp = await client.getProjectsGraphQL({ ...params, query });
      projects = [...projects, ...resp?.nodes];

      if (!resp?.pageInfo?.hasNextPage)
        finished = true;
      else
        endCursor = resp?.pageInfo?.endCursor;
    }

    return projects;
  };

  client.getAvatarForNamespace = (namespaceId = {}) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/groups/${namespaceId}`, {
      method: "GET",
      headers
    }).then(response => response.data.avatar_url);
  };

  client.getProject = async (projectPathWithNamespace, options = {}) => {
    const headers = client.getBasicHeaders();
    const queryParams = {
      statistics: options.statistics || false,
      doNotTrack: options.doNotTrack,
    };
    return client.clientFetch(`${client.baseUrl}/projects/${encodeURIComponent(projectPathWithNamespace)}`, {
      method: "GET",
      headers,
      queryParams
    }).then(resp => {
      return { ...resp, data: carveProject(resp.data) };
    });
  };

  client.getProjectById = (projectId, options = {}) => {
    const headers = client.getBasicHeaders();
    const queryParams = {
      statistics: options.statistics || false
    };
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}`, {
      method: "GET",
      headers,
      queryParams
    }).then(resp => {
      return { ...resp, data: carveProject(resp.data) };
    });
  };

  client.getProjectsBy = (searchIn, userOrGroupId, queryParams) => {
    if (searchIn === "groups")
      queryParams.include_subgroups = true;
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/${searchIn}/${userOrGroupId}/projects`, {
      method: "GET",
      headers,
      queryParams
    });
  };

  client.searchUsersOrGroups = (queryParams, searchIn) => {
    let headers = client.getBasicHeaders();
    if (searchIn === "groups")
      queryParams.all_available = true;
    if (!queryParams.per_page)
      queryParams.per_page = 100; // ? Consider using `clientIterableFetch` it more than 100 are needed
    return client.clientFetch(`${client.baseUrl}/${searchIn}`, {
      method: "GET",
      headers,
      queryParams
    }).then(result => result.data);
  };


  client.getProjectFilesTree = (projectId, branchName = "master", openFilePath, currentPath = "", lfsFiles) => {
    return client.getRepositoryTree(projectId, { path: currentPath, recursive: false }).then((tree) => {
      const fileStructure = getFilesTreeLazy(client, branchName, tree, projectId, openFilePath, lfsFiles);
      return fileStructure;
    });
  };

  client.getEmptyProjectObject = () => { return { folder: "empty-project-template", name: "Empty Project" }; };

  client.getProjectStatus = async (projectId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/import`, {
      method: "GET",
      headers: headers
    }).then(resp => {
      return resp.data.import_status;
    }).catch((error) => "error");
  };

  client.forkProject = async (sourceId, targetTitle, targetPath, targetNamespace) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    // Fork the project
    const urlFork = `${client.baseUrl}/projects/${sourceId}/fork`;
    const bodyFork = { id: sourceId, name: targetTitle, path: targetPath, namespace_path: targetNamespace };

    const forkedProject = await client.clientFetch(urlFork, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyFork)
    });

    // Wait 1 second before starting the pipeline to prevent errors
    await new Promise(r => setTimeout(r, 1000));

    // Start pipeline -- no need to wait for the outcome, the new session page handles this
    let pipeline;
    try {
      pipeline = await client.runPipeline(forkedProject.data.id,
        forkedProject.data.forked_from_project.default_branch);
    }
    catch (error) {
      pipeline = error;
    }

    // Create KG webhook
    let webhook;
    try {
      webhook = await client.createGraphWebhook(forkedProject.data.id);
    }
    catch (error) {
      webhook = error;
    }

    return { project: forkedProject.data, pipeline, webhook };
  };

  client.setTags = (projectId, tags) => {
    return client.putProjectField(projectId, "tag_list", tags);
  };

  client.setDescription = (projectId, description) => {
    return client.putProjectField(projectId, "description", description);
  };

  client.setAvatar = (projectId, avatarFile) => {
    // https://docs.gitlab.com/ee/api/projects.html#upload-a-project-avatar

    // There is no documented API for removing the avatar
    if (avatarFile == null)
      return;
    return client.putProjectFieldFormData(projectId, "avatar", avatarFile);
  };

  client.setVisibility = (projectId, visibility) => {
    return client.putProjectField(projectId, "visibility", visibility);
  };

  client.starProject = (projectId, starred) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const endpoint = starred ? "unstar" : "star";

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/${endpoint}`, {
      method: "POST",
      headers: headers,
    });

  };

  client.putProjectField = async (projectId, fieldNameOrObject, fieldValue) => {
    let data;
    if (typeof fieldNameOrObject !== "string" && !fieldValue)
      data = { ...fieldNameOrObject, id: projectId };
    else
      data = { id: projectId, [fieldNameOrObject]: fieldValue };
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data)
    });
  };

  /**
   * Put the data as a multipart/form-data.
   * @param {*} projectId
   * @param {*} fieldNameOrObject
   * @param {*} fieldValue
   */
  client.putProjectFieldFormData = async (projectId, fieldNameOrObject, fieldValue) => {
    const headers = client.getBasicHeaders();

    const formData = new FormData();
    formData.append(fieldNameOrObject, fieldValue);

    // Do not do this! See Warning: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
    // headers.append("Content-Type", "multipart/form-data");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}`, {
      method: "PUT",
      headers: headers,
      body: formData
    });
  };

  client.getProjectTemplates = (renkuTemplatesUrl, renkuTemplatesRef) => {
    const formattedApiURL = getApiUrlFromRepoUrl(renkuTemplatesUrl);
    return fetchJson(`${formattedApiURL}/git/trees/${renkuTemplatesRef}`)
      .then(data => data.tree.filter(obj => obj.path === "manifest.yaml")[0]["sha"])
      .then(manifestSha => fetchJson(`${formattedApiURL}/git/blobs/${manifestSha}`))
      .then(data => { return yaml.load(atob(data.content)); })
      .then(data => { data.push(client.getEmptyProjectObject()); return data; });
  };

  client.fetchDatasetFromKG = async (id) => {
    const url = `${client.baseUrl}/kg/datasets/${id}`;
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, { method: "GET", headers }).then(dataset => dataset.data);
  };

  client.getProjectDatasetsFromKG = (projectPath) => {
    const url = `${client.baseUrl}/kg/projects/${projectPath}/datasets`;
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, { method: "GET", headers }).then(resp => resp.data);
  };

  /**
   * Get project config file data
   * @see {@link https://github.com/SwissDataScienceCenter/renku-python/blob/master/renku/service/views/config.py}
   * @param {string} projectRepositoryUrl - external repository full url.
   * @param {string} [versionUrl] - project version url.
   * @param {string} [branch] - target branch.
   */
  client.getProjectConfig = async (projectRepositoryUrl, versionUrl = null, branch = null) => {
    const url = client.versionedCoreUrl("config.show", versionUrl);
    let queryParams = { git_url: projectRepositoryUrl };
    if (branch)
      queryParams.branch = branch;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    });
  };

  /**
   * Set project config data
   * @see {@link https://github.com/SwissDataScienceCenter/renku-python/blob/master/renku/service/views/config.py}
   * @param {string} projectRepositoryUrl - external repository full url.
   * @param {object} config - config object in the form {key: value}. A null value removes the key.
   * @param {string} [versionUrl] - project version url.
   * @param {string} [branch] - target branch.
   */
  client.setProjectConfig = async (projectRepositoryUrl, config, versionUrl = null, branch = null) => {
    const url = client.versionedCoreUrl("config.set", versionUrl);
    let body = { git_url: projectRepositoryUrl, config };
    if (branch)
      body.branch = branch;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  };


  /**
   * Find out if a project is locked
   * @see {@link https://github.com/SwissDataScienceCenter/renku-python/blob/master/renku/service/controllers/project_lock_status.py}
   * @param {string} projectRepositoryUrl - external repository full url.
   * @param {string} [versionUrl] - project version url.
   */
  client.getProjectLockStatus = async (projectRepositoryUrl, versionUrl = null) => {
    const url = client.versionedCoreUrl("project.lock_status", versionUrl);
    const queryParams = { git_url: projectRepositoryUrl };
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    });
  };
}


function carveProject(projectJson) {
  const result = { metadata: { core: {}, visibility: {}, system: {}, statistics: {} },
    filters: { branch: {}, commit: {} }, all: projectJson };
  result["metadata"]["visibility"]["level"] = projectJson["visibility"];

  let accessLevel = 0;
  if (projectJson.permissions && projectJson.permissions.project_access)
    accessLevel = Math.max(accessLevel, projectJson.permissions.project_access.access_level);

  if (projectJson.permissions && projectJson.permissions.group_access)
    accessLevel = Math.max(accessLevel, projectJson.permissions.group_access.access_level);

  result["metadata"]["visibility"]["accessLevel"] = accessLevel;


  result["metadata"]["core"]["created_at"] = projectJson["created_at"];
  result["metadata"]["core"]["last_activity_at"] = projectJson["last_activity_at"];
  result["metadata"]["core"]["id"] = projectJson["id"];
  result["metadata"]["core"]["description"] = projectJson["description"];
  result["metadata"]["core"]["displayId"] = projectJson["path_with_namespace"];
  result["metadata"]["core"]["title"] = projectJson["name"];
  result["metadata"]["core"]["external_url"] = projectJson["web_url"];
  result["metadata"]["core"]["path_with_namespace"] = projectJson["path_with_namespace"];
  result["metadata"]["core"]["owner"] = projectJson["owner"];
  result["metadata"]["core"]["namespace_path"] = projectJson["namespace"]["full_path"];
  result["metadata"]["core"]["project_path"] = projectJson["path"];
  result["metadata"]["core"]["avatar_url"] = projectJson["avatar_url"];
  result["metadata"]["core"]["default_branch"] = projectJson["default_branch"] ?
    projectJson["default_branch"] : "master";


  result["metadata"]["system"]["tag_list"] = projectJson["tag_list"];
  result["metadata"]["system"]["star_count"] = projectJson["star_count"];
  result["metadata"]["system"]["forks_count"] = projectJson["forks_count"];
  result["metadata"]["system"]["ssh_url"] = projectJson["ssh_url_to_repo"];
  result["metadata"]["system"]["http_url"] = projectJson["http_url_to_repo"];
  result["metadata"]["system"]["forked_from_project"] = (projectJson["forked_from_project"] != null) ?
    carveProject(projectJson["forked_from_project"]) :
    null;

  if (projectJson.statistics != null) {
    result["metadata"]["statistics"]["commit_count"] = projectJson["statistics"]["commit_count"];
    result["metadata"]["statistics"]["storage_size"] = projectJson["statistics"]["storage_size"];
    result["metadata"]["statistics"]["repository_size"] = projectJson["statistics"]["repository_size"];
    result["metadata"]["statistics"]["lfs_objects_size"] = projectJson["statistics"]["lfs_objects_size"];
  }

  result["filters"]["branch"]["name"] = projectJson["default_branch"] ?
    projectJson["default_branch"] : "master";
  result["filters"]["commit"]["id"] = "latest";

  return result;
}


export default addProjectMethods;
export { carveProject };

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

const FileCategories = {
  data: (path) => path.startsWith("data"),
  notebooks: (path) => path.endsWith("ipynb"),
  workflows: (path) => path.startsWith(".renku/workflow/"),
};

function getApiUrlFromRepoUrl(url) {
  const urlArray = url.split("/");
  urlArray.splice(urlArray.length - 2, 0, "repos");
  url = urlArray.join("/");
  if (url.includes("https://"))
    return url.replace("https://", "https://api.");
  if (url.includes("http://"))
    return url.replace("http://", "http://api.");
}

function groupedFiles(files, projectFiles) {
  projectFiles = (projectFiles != null) ? projectFiles : {};
  Object.keys(FileCategories).forEach((cat) => {
    projectFiles[cat] = files.filter(FileCategories[cat]);
  });
  projectFiles["all"] = files;
  return projectFiles;
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

function getFilesTreeLazy(client, files, projectId, openFilePath, lfsFiles) {
  let tree = [];
  let hash = {};
  let lfs = files.filter((treeObj) => treeObj.path === ".gitattributes"); // eslint-disable-line

  if (lfs.length > 0) {
    return client.getRepositoryFile(projectId, lfs[0].path, "master", "raw")
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
      statistics: options.statistics || false
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

  client.getProjectFiles = (projectId, path = "") => {
    return client.getRepositoryTree(projectId, { path: path, recursive: true }).then((tree) => {
      const files = tree
        .filter((treeObj) => treeObj.type === "blob")
        .map((treeObj) => treeObj.path);
      return groupedFiles(files, {});
    });
  };

  client.getProjectFilesTree = (projectId, openFilePath, currentPath = "", lfsFiles) => {
    return client.getRepositoryTree(projectId, { path: currentPath, recursive: false }).then((tree) => {
      const fileStructure = getFilesTreeLazy(client, tree, projectId, openFilePath, lfsFiles);
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
    // Start pipeline -- no need to wait for the outcome, the environment page handles this
    const pipeline = await client.runPipeline(forkedProject.data.id);

    // Create KG webhook
    const webhook = await client.createGraphWebhook(forkedProject.data.id);
    return { project: forkedProject.data, pipeline, webhook };
  };

  client.setTags = (projectId, tags) => {
    return client.putProjectField(projectId, "tag_list", tags);
  };

  client.setDescription = (projectId, description) => {
    return client.putProjectField(projectId, "description", description);
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

  client.getArtifactsUrl = (projectId, job, branch = "master") => {
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/jobs`, {
      method: "GET",
      headers: headers
    })
      .then(resp => resp.data)
      .then(jobs => {
        if (!jobs) return;
        const filteredJobs = jobs.filter(j => j.name === job && j.ref === branch);
        if (filteredJobs.length < 1)
          throw new Error(`There are no artifacts for project/job (${projectId}/${job}) because there are no jobs`);
        // Sort in reverse finishing order and take the most recent
        const jobObj =
          filteredJobs
            .sort((a, b) => (a.finished_at > b.finished_at) ? -1 : +(a.finished_at < b.finished_at))[0];
        return `${client.baseUrl}/projects/${projectId}/jobs/${jobObj.id}/artifacts`;
      });
  };

  client.getArtifact = (projectId, job, artifact, branch = "master") => {
    const options = { method: "GET", headers: client.getBasicHeaders() };
    return client.getArtifactsUrl(projectId, job, branch)
      .then(url => {
        // If the url is undefined, we return an object with a dummy text() method.
        if (!url) return ["", { text: () => "" }];
        const resourceUrl = `${url}/${artifact}`;
        return Promise.all([resourceUrl, client.clientFetch(resourceUrl, options, client.returnTypes.full)]);
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

  client.getDatasetJson = (projectId, datasetId) => {
    return client.getRepositoryFile(projectId, `.renku/datasets/${datasetId}/metadata.yml`, "master", "raw")
      .then(result => yaml.load(result));
  };

  client.fetchDatasetFromKG = (datasetLink) => {
    const headers = client.getBasicHeaders();
    const datasetPromise = client.clientFetch(datasetLink, { method: "GET", headers });
    return Promise.resolve(datasetPromise)
      .then(dataset => dataset.data);
  };

  client.getProjectDatasetsFromKG = (projectPath) => {
    let url = `${client.baseUrl}/knowledge-graph/projects/${projectPath}/datasets`;
    url = url.replace("/api", "");//The url should change in the backend so we don't have to do this
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, { method: "GET", headers }).then((resp) => {
      return resp.data;
    }).then(resp => {
      let fullDatasets = resp.map(dataset =>
        client.fetchDatasetFromKG(dataset._links[0].href));
      return Promise.all(fullDatasets).then(datasets => {
        //in case one of the dataset fetch fails we return the ones that didn't fail
        return datasets.filter(dataset => dataset !== "error");
      });
    });
  };

  //in the future we will get all the info we need for the dataset list from this call...
  client.getProjectDatasetsFromKG_short = (projectPath) => {
    let url = `${client.baseUrl}/knowledge-graph/projects/${projectPath}/datasets`;
    url = url.replace("/api", "");//The url should change in the backend so we don't have to do this
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, { method: "GET", headers }).then((resp) => {
      return resp.data;
    });
  };

  client.getProjectDatasets = (projectId) => {
    const datasetsPromise = client.getRepositoryTree(projectId, { path: ".renku/datasets", recursive: true })
      .then(data =>
        data.filter(treeObj => treeObj.type === "blob" && treeObj.name === "metadata.yml")
          .map(dataset =>
            client.getRepositoryFile(projectId, dataset.path, "master", "raw").then(result => yaml.load(result))
          )
      );

    return Promise.resolve(datasetsPromise)
      .then(datasetsContent => Promise.all(datasetsContent));
  };
}


function carveProject(projectJson) {
  const result = { metadata: { core: {}, visibility: {}, system: {}, statistics: {} }, all: projectJson };
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
  return result;
}


export default addProjectMethods;
export { carveProject };

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

import { fetchJson } from './utils';
import yaml from 'yaml-js';

const FileCategories = {
  data: (path) => path.startsWith('data'),
  notebooks: (path) => path.endsWith('ipynb'),
  workflows: (path) => path.startsWith('.renku/workflow/'),
};

const TemplatesReposUrl = {
  TREES: 'https://api.github.com/repos/SwissDataScienceCenter/renku-project-template/git/trees/',
  TREES_MASTER: 'https://api.github.com/repos/SwissDataScienceCenter/renku-project-template/git/trees/master',
  BLOBS: 'https://api.github.com/repos/SwissDataScienceCenter/renku-project-template/git/blobs/'
}

function groupedFiles(files, projectFiles) {
  projectFiles = (projectFiles != null) ? projectFiles : {};
  Object.keys(FileCategories).forEach((cat) => {
    projectFiles[cat] = files.filter(FileCategories[cat])
  });
  projectFiles['all'] = files;
  return projectFiles
}

function buildTreeLazy(name, treeNode, jsonObj, hash, currentPath, gitattributes, openFilePath) {
  if (name.length === 0) {
    return;
  }
  currentPath = jsonObj.path;
  let nodeName = name;
  let nodeType = jsonObj.type;  // "tree" "blob" "commit"
  const isLfs = gitattributes ? gitattributes.includes(currentPath+" filter=lfs diff=lfs merge=lfs -text") : false;
  let newNode =  { 'name': nodeName, 'children': [], 'jsonObj': jsonObj, 'path': currentPath ,'isLfs': isLfs , 'type': nodeType};
  hash[newNode.path] = {'name':nodeName, 'selected': false, 'childrenOpen': false , 'childrenLoaded':false , 'path': currentPath, 'isLfs': isLfs, 'type': nodeType , 'treeRef': newNode};
  treeNode.push(newNode);
}

function getFilesTreeLazy(client, files, projectId, openFilePath, lfsFiles) {
  let tree = [];
  let hash = {};
  let lfs = files.filter((treeObj) => treeObj.path === '.gitattributes');

  if(lfs.length > 0){
    return client.getRepositoryFile(projectId, lfs[0].path, 'master', 'raw')
      .then(json => {
        for (let i = 0; i < files.length; i++) {
          buildTreeLazy(files[i].name, tree, files[i] , hash, "", json, openFilePath);
        }
        const treeObj = { tree:tree , hash:hash , lfsFiles: json }
        return treeObj;
      });
  } else {
    for (let i = 0; i < files.length; i++) {
      buildTreeLazy(files[i].name, tree, files[i] , hash, "", lfsFiles , openFilePath);
    }
    const treeObj = { tree:tree , hash:hash, lfsFiles: lfsFiles }
    return treeObj;
  }
}

function addProjectMethods(client) {

  client.getProjects = (queryParams = {}) => {
    let headers = client.getBasicHeaders();

    return client.clientFetch(`${client.baseUrl}/projects`, {
      method: 'GET',
      headers,
      queryParams,
    })
  }

  client.getProject = (projectId, options = {}) => {
    const headers = client.getBasicHeaders();
    const queryParams = {
      statistics: options.statistics || false
    };
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}`, {
      method: 'GET',
      headers,
      queryParams
    }).then(resp => {
      return { ...resp, data: carveProject(resp.data) };
    });
  }

  client.getProjectFiles = (projectId) => {
    return client.getRepositoryTree(projectId, { path: '', recursive: true }).then((tree) => {
      const files = tree
        .filter((treeObj) => treeObj.type === 'blob')
        .map((treeObj) => treeObj.path);
      return groupedFiles(files, {});
    })
  }

  client.getProjectFilesTree = (projectId, openFilePath, currentPath = '', lfsFiles) => {
    return client.getRepositoryTree(projectId, { path: currentPath, recursive: false }).then((tree) => {
      const fileStructure = getFilesTreeLazy(client, tree, projectId, openFilePath, lfsFiles);
      return fileStructure;
    });
  }

  client.getEmptyProjectObject = () => { return {folder:'empty-project-template', name:"Empty Project"} }

  client.postProject = (renkuProject) => {
    const gitlabProject = {
      name: renkuProject.display.title,
      description: renkuProject.display.description,
      visibility: renkuProject.meta.visibility
    };
    if (renkuProject.meta.projectNamespace != null) gitlabProject.namespace_id = renkuProject.meta.projectNamespace.id;
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    if(renkuProject.meta.template === client.getEmptyProjectObject().folder){
      let createGraphWebhookPromise;
      const newProjectPromise = client.clientFetch(`${client.baseUrl}/projects`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(gitlabProject)
      }).then(resp => {
        if (!renkuProject.meta.optoutKg) {
          createGraphWebhookPromise = client.createGraphWebhook(resp.data.id);
        }
        return resp.data;
      });

      let promises = [newProjectPromise];
      if (createGraphWebhookPromise) {
        promises = promises.concat(createGraphWebhookPromise);
      }

      return Promise.all(promises)
        .then(([data, payload]) => {
          if (data.errorData)
            return Promise.reject(data);
          return Promise.resolve(data).then(() => data) ;
        });

    } else {
      let createGraphWebhookPromise;
      const newProjectPromise = client.clientFetch(`${client.baseUrl}/projects`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(gitlabProject)
      }).then(resp => {
        if (!renkuProject.meta.optoutKg) {
          createGraphWebhookPromise = client.createGraphWebhook(resp.data.id);
        }
        return resp.data;
      });
      
      // When the provided version does not exist, we log an error and uses latest.
      // Maybe this should raise a more prominent alarm?
      const payloadPromise = getPayload(gitlabProject.name, client.renkuVersion, renkuProject.meta.template)
        .catch(error => {
          console.error(`Problem when retrieving project template ${client.renkuVersion}`);
          console.error(error);
          console.error('Trying again with \'latest\'');
          return getPayload(gitlabProject.name, 'latest', renkuProject.meta.template)
        });
      let promises = [newProjectPromise, payloadPromise];

      if (createGraphWebhookPromise) {
        promises = promises.concat(createGraphWebhookPromise);
      }

      return Promise.all(promises)
        .then(([data, payload]) => {
          if (data.errorData)
            return Promise.reject(data);
          return client.postCommit(data.id, payload).then(() => data);
        });
    }
  }

  client.getProjectStatus = (projectId) =>{
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/import`, {
      method: 'GET',
      headers: headers
    }).then(resp => {
      return resp.data.import_status;
    }).catch((error) => "error");
  } 

  function runPipeline(projectId){
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    return  client.clientFetch(`${client.baseUrl}/projects/${projectId}/pipeline`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        ref: "master"
      })
    })
  }

  client.startPipeline =  (projectId) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    let pipelineStarted = false;
    let counter= 0;
    const projectStatusTimeout = setTimeout(() => {
      if(pipelineStarted === true || counter === 10) 
        clearTimeout(projectStatusTimeout);
      else {
        client.getProjectStatus(projectId).then((forkProjectStatus) => {
          if(forkProjectStatus === 'finished'){
            runPipeline(projectId).then(resp => {
              pipelineStarted = true;
              clearTimeout(projectStatusTimeout);
            });    
          } else if(forkProjectStatus === 'failed' || forkProjectStatus === 'error'){
            clearTimeout(projectStatusTimeout);
          } else {
            counter++;
          }
        })
      }
    }, 3000);
  }

  function redirectWhenForkFinished(projectId, history){
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    let redirected = false;
    let counter= 0;
    const projectStatusTimeout = setTimeout(() => {
      if(redirected === true || counter === 200) 
        clearTimeout(projectStatusTimeout);
      else {
        client.getProjectStatus(projectId).then((forkProjectStatus) => {
          if(forkProjectStatus === 'finished'){
            redirected = true;
            clearTimeout(projectStatusTimeout);
            history.push(`/projects/${projectId}`);
          } else if(forkProjectStatus === 'failed' || forkProjectStatus === 'error'){
            clearTimeout(projectStatusTimeout);
          } else {
            counter++;
          }
        })
      }
    }, 3000);
  }

  client.forkProject = (projectMeta, history) => {
    const gitlabProject = {
      id: projectMeta.id
    };
    if (projectMeta.projectNamespace != null) gitlabProject.namespace = projectMeta.projectNamespace.id;
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    let createGraphWebhookPromise, startPipelinePromise;
    const newProjectPromise = client.clientFetch(`${client.baseUrl}/projects/${projectMeta.id}/fork`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(gitlabProject)
    }).then(resp => {
      if (!projectMeta.optoutKg) {
        createGraphWebhookPromise = client.createGraphWebhook(resp.data.id);
      }
      return resp;
    }).then(resp => {
      client.startPipeline(resp.data.id);
      return resp;
    });

    let promises = [newProjectPromise];
    if (createGraphWebhookPromise) {
      promises = promises.concat(createGraphWebhookPromise);
    }    

    promises = promises.concat(startPipelinePromise);

    return Promise.all(promises)
      .then((results) => {
        if (results.errorData)
          return Promise.reject(results);
        return Promise.resolve(results).then(() => redirectWhenForkFinished(results[0].data.id, history));
      });
  }

  client.setTags = (projectId, name, tags) => {
    return client.putProjectField(projectId, name, 'tag_list', tags);
  }


  client.setDescription = (projectId, name, description) => {
    return client.putProjectField(projectId, name, 'description', description);
  }


  client.starProject = (projectId, starred) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const endpoint = starred ? 'unstar' : 'star';

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/${endpoint}`, {
      method: 'POST',
      headers: headers,
    })

  }


  client.putProjectField = (projectId, name, field_name, field_value) => {
    const putData = { id: projectId, name, [field_name]: field_value };
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(putData)
    })

  }


  // TODO: This method should not return the notebook server API.
  client.getNotebookServerUrl = async (projectId, projectPath, commitSha = 'latest', ref = 'master') => {
    if (commitSha === 'latest') {
      commitSha = await (client.getCommits(projectId).then(resp => resp.data[0].id));
    }
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/notebooks/${projectPath}/${commitSha}`, {
      method: 'GET',
      headers: headers
    })
      .then(resp => resp.data)
      .then(server => {
        return {
          notebookServerUrl: server.url ? server.url : null,
          notebookServerAPI: `${client.baseUrl}/notebooks/${projectPath}/${commitSha}`
        }
      })
  }


  client.getArtifactsUrl = (projectId, job, branch = 'master') => {
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/jobs`, {
      method: 'GET',
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
            .sort((a, b) => (a.finished_at > b.finished_at) ? -1 : +(a.finished_at < b.finished_at))[0]
        return `${client.baseUrl}/projects/${projectId}/jobs/${jobObj.id}/artifacts`;
      })
  }


  client.getArtifact = (projectId, job, artifact, branch = 'master') => {
    const options = { method: 'GET', headers: client.getBasicHeaders() };
    return client.getArtifactsUrl(projectId, job, branch)
      .then(url => {
        // If the url is undefined, we return an object with a dummy text() method.
        if (!url) return ['', { text: () => '' }];
        const resourceUrl = `${url}/${artifact}`;
        return Promise.all([resourceUrl, client.clientFetch(resourceUrl, options, client.returnTypes.full)])
      })
  }


  client.getJobs = (projectId) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/jobs`, {
      method: 'GET',
      headers,
      queryParams: { per_page: 100 }
    }, 'json', false)
  }

  client.getProjectTemplates = () => {
    return fetchJson(TemplatesReposUrl.TREES_MASTER)
      .then(data => data.tree.filter(obj => obj.path === 'manifest.yaml')[0]['sha'])
      .then(manifestSha => fetchJson(`${TemplatesReposUrl.BLOBS}${manifestSha}`))
      .then(data => {return yaml.load(atob(data.content))})
      .then(data => {data.push(client.getEmptyProjectObject()); return data;});
  }
}


function carveProject(projectJson) {
  const result = { metadata: { core: {}, visibility: {}, system: {}, statistics: {} }, all: projectJson };
  result['metadata']['visibility']['level'] = projectJson['visibility'];

  let accessLevel = 0;
  if (projectJson.permissions && projectJson.permissions.project_access) {
    accessLevel = Math.max(accessLevel, projectJson.permissions.project_access.access_level)
  }
  if (projectJson.permissions && projectJson.permissions.group_access) {
    accessLevel = Math.max(accessLevel, projectJson.permissions.group_access.access_level)
  }
  result['metadata']['visibility']['accessLevel'] = accessLevel;


  result['metadata']['core']['created_at'] = projectJson['created_at'];
  result['metadata']['core']['last_activity_at'] = projectJson['last_activity_at'];
  result['metadata']['core']['id'] = projectJson['id'];
  result['metadata']['core']['description'] = projectJson['description'];
  result['metadata']['core']['displayId'] = projectJson['path_with_namespace'];
  result['metadata']['core']['title'] = projectJson['name'];
  result['metadata']['core']['external_url'] = projectJson['web_url'];
  result['metadata']['core']['path_with_namespace'] = projectJson['path_with_namespace'];
  result['metadata']['core']['owner'] = projectJson['owner'];

  result['metadata']['system']['tag_list'] = projectJson['tag_list'];
  result['metadata']['system']['star_count'] = projectJson['star_count'];
  result['metadata']['system']['forks_count'] = projectJson['forks_count'];
  result['metadata']['system']['ssh_url'] = projectJson['ssh_url_to_repo'];
  result['metadata']['system']['http_url'] = projectJson['http_url_to_repo'];
  result['metadata']['system']['forked_from_project'] = (projectJson['forked_from_project'] != null) ?
    carveProject(projectJson['forked_from_project']) :
    null;

  if (projectJson.statistics != null) {
    result['metadata']['statistics']['commit_count'] = projectJson['statistics']['commit_count'];
    result['metadata']['statistics']['storage_size'] = projectJson['statistics']['storage_size'];
    result['metadata']['statistics']['repository_size'] = projectJson['statistics']['repository_size'];
    result['metadata']['statistics']['lfs_objects_size'] = projectJson['statistics']['lfs_objects_size'];
    result['metadata']['statistics']['job_artificats_size'] = projectJson['statistics']['job_artificats_size'];
  }
  return result;
}


// NOTE: An unregistered user can do 60 GitHub api requests per hour max meaning,
//       that this approach fails when trying to create more than 30 projects
//       per hour. I think we can live with that for the moment. However, it might
//       make sense at some point to serve the project template from the GitLab
//       instance we're working with.

function getPayload(projectName, renkuVersion, projectTemplate) {
  // Promise which will resolve into the repository sub-tree
  // which matches the desired version of the renku project template.
  const subTreePromise = fetchJson(TemplatesReposUrl.TREES_MASTER)
    .then(data => data.tree.filter(obj => obj.path === projectTemplate)[0]['sha'])
    .then(treeSha => fetchJson(`${TemplatesReposUrl.TREES}${treeSha}?recursive=1`));

  // Promise which will resolve into a list of file creation actions
  // ready to be passed to the GitLab API.
  const actionsPromise = subTreePromise.then(subtree => {
    const actionPromises = subtree.tree
      .filter(treeObject => treeObject.type === 'blob')
      .map(treeObject => getActionPromise(treeObject, projectName));
    return Promise.all(actionPromises);
  })

  // We finally return a promise which will resolve into the full
  // payload for the first commit to the newly created project.
  return actionsPromise.then((resolvedActions) => {
    return {
      'branch': 'master',
      'commit_message': 'init renku repository',
      'actions': resolvedActions
    }
  });

  function getActionPromise(treeObject, projectName) {

    return fetchJson(treeObject.url)
      .then(data => atob(data.content))
      .then(fileContent => {
        return {
          'action': 'create',
          'file_path': treeObject.path,
          'content': evaluateTemplate(fileContent, projectName)
        }
      });
  }

  function evaluateTemplate(content, projectName) {

    const now = new Date();
    const templatedVariables = {
      'name': projectName,
      'date-updated': now.toISOString(),
      'date-created': now.toISOString(),
    };

    const newContent = content.replace(/{{\s?([^\s]*)\s?}}/g, (match, group) => {
      return templatedVariables[group]
    });
    return newContent;
  }

}

export default addProjectMethods;
export { carveProject };

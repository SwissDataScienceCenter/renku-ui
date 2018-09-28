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

const FileCategories = {
  data: (path) => path.startsWith('data'),
  notebooks: (path) => path.endsWith('ipynb'),
  workflows: (path) => path.startsWith('.renku/workflow/'),
};

function groupedFiles(files, projectFiles) {
  projectFiles = (projectFiles != null) ? projectFiles : {};
  Object.keys(FileCategories).forEach((cat) => {
    projectFiles[cat] = files.filter(FileCategories[cat])
  });
  projectFiles['all'] = files;
  return projectFiles
}


function addProjectMethods(client) {

  client.getProjects = (queryParams={}) => {
    let headers = client.getBasicHeaders();

    return client.clientFetch(`${client.apiUrl}/projects`, {
      method: 'GET',
      headers,
      queryParams,
    })
  }


  client.getProject = (projectId, options={}) => {
    let headers = client.getBasicHeaders();
    const apiPromises = [
      client.clientFetch(`${client.apiUrl}/projects/${projectId}`, {
        method: 'GET',
        headers: headers
      })
        .then(resp => {
          return {...resp, data: carveProject(resp.data)};
        })
    ];

    if (Object.keys(options).length > 0) {
      apiPromises.push(client.getRepositoryTree(projectId, {path:'', recursive: true}));
    }

    return Promise.all(apiPromises).then((vals) => {

      let project = vals[0];
      if (vals.length > 1) {
        const files = vals[1]
          .filter((treeObj) => treeObj.type === 'blob')
          .map((treeObj) => treeObj.path);

        project.data.files = groupedFiles(files, project.data.files);
      }
      return project;
    })
  }


  client.postProject = (renkuProject) => {
    const gitlabProject = {
      name: renkuProject.display.title,
      description: renkuProject.display.description,
      visibility: renkuProject.meta.visibility === 'public' ? 'public' : 'private'
    };
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    const newProjectPromise = client.clientFetch(`${client.apiUrl}/projects`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(gitlabProject)
    })
      .then(resp => resp.data);

    // When the provided version does not exist, we log an error and uses latest.
    // Maybe this should raise a more prominent alarm?
    const payloadPromise = getPayload(gitlabProject.name, client.renkuVersion)
      .catch(error => {
        console.error(`Problem when retrieving project template ${client.renkuVersion}`);
        console.error(error);
        console.error('Trying again with \'latest\'');
        return getPayload(gitlabProject.name, 'latest')
      });

    return Promise.all([newProjectPromise, payloadPromise])
      .then(([data, payload]) => {
        return client.postCommit(data.id, payload).then(() => data);
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

    return client.clientFetch(`${client.apiUrl}/projects/${projectId}/${endpoint}`, {
      method: 'POST',
      headers: headers,
    })

  }


  client.putProjectField = (projectId, name, field_name, field_value) => {
    const putData = { id: projectId, name, [field_name]: field_value };
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.apiUrl}/projects/${projectId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(putData)
    })

  }


  // TODO: Once the gateway is up and running, the client should not need to be aware of the
  // TODO: JUPYTERHUB_URL anymore but simply query the notebook url from the gateway
  client.getNotebookServerUrl = async (projectId, projectPath, commitSha='latest', ref='master') => {
    if (commitSha === 'latest') {
      commitSha = await (client.getCommits(projectId).then(resp => resp.data[0].id));
    }
    return `${client.jupyterhubUrl}/services/notebooks/${projectPath}/${commitSha}`
  }


  client.getDeploymentUrl = (projectId, envName, branchName = 'master') => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.apiUrl}/projects/${projectId}/environments`, {
      method: 'GET',
      headers: headers
    })
      .then(envs => envs.filter(env => env.name === `${envName}/${branchName}`)[0])
      .then(env => {
        if (!env) return undefined;
        return `${env.external_url}`;
      })
  }


  client.getArtifactsUrl = (projectId, job, branch='master') => {
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.apiUrl}/projects/${projectId}/jobs`, {
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
        return `${client.apiUrl}/projects/${projectId}/jobs/${jobObj.id}/artifacts`;
      })
  }


  client.getArtifact = (projectId, job, artifact, branch='master') => {
    const options = { method: 'GET', headers: client.getBasicHeaders() };
    return client.getArtifactsUrl(projectId, job, branch)
      .then(url => {
        // If the url is undefined, we return an object with a dummy text() method.
        if (!url) return ['', {text: () => ''}];
        const resourceUrl = `${url}/${artifact}`;
        return Promise.all([resourceUrl, client.clientFetch(resourceUrl, options, client.returnTypes.full)])
      })
  }


  client.getJobs = (projectId) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.apiUrl}/projects/${projectId}/jobs`, {
      method: 'GET',
      headers,
      queryParams: {per_page: 100}
    }, 'json', false)
  }
}


function carveProject(projectJson) {
  const result = {metadata: {core: {}, visibility: {}, system: {}}, all: projectJson};
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

  return result;
}


// NOTE: An unregistered user can do 60 GitHub api requests per hour max meaning,
//       that this approach fails when trying to create more than 30 projects
//       per hour. I think we can live with that for the moment. However, it might
//       make sense at some point to serve the project template from the GitLab
//       instance we're working with.

function getPayload(projectName, renkuVersion){

  const TEMPLATE_REPO_URL = 'https://api.github.com/repos/SwissDataScienceCenter/renku-project-template/git/trees/'

  // Promise which will resolve into the repository sub-tree
  // which matches the desired version of the renku project template.
  const subTreePromise = fetchJson(TEMPLATE_REPO_URL + 'master')
    .then(data => data.tree.filter(obj => obj.path === renkuVersion)[0]['sha'])
    .then(treeSha => fetchJson(`${TEMPLATE_REPO_URL}${treeSha}?recursive=1`));

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

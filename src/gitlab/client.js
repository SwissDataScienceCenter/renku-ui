import {alertAPIErrors, API_ERRORS, renkuFetch} from './errors';

const SPECIAL_FOLDERS = {
  data: 'data',
  notebooks: 'notebooks',
  workflows: 'workflows',
};


class GitlabClient {

  // GitLab api client for Renku. Note that we do some
  // renaming of GitLab resources within this client:
  //
  // Renku      GitLab
  // -----------------
  // ku    -->  issue


  constructor(baseUrl, token, tokenType, jupyterhub_url) {
    this._baseUrl = baseUrl;
    this._token = token;
    this._tokenType = tokenType;
    this._jupyterhub_url = jupyterhub_url;
  }

  getBasicHeaders() {
    let headers = {
      'Accept': 'application/json'
    };
    if (!this._token) return new Headers(headers);
    if (this._tokenType === 'private') headers['Private-Token'] = this._token;
    if (this._tokenType === 'bearer') headers['Authorization'] = `Bearer ${this._token}`;
    return new Headers(headers);
  }

  getProjects(queryParams={}) {
    let headers = this.getBasicHeaders();
    const url = new URL(this._baseUrl + 'projects');
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    return renkuFetch(url, {
      method: 'GET',
      headers: headers
    })
  }

  getProject(projectId, options={}) {
    let headers = this.getBasicHeaders();
    const apiPromises = [
      renkuFetch(this._baseUrl + `projects/${projectId}`, {
        method: 'GET',
        headers: headers
      })
        .then(d => carveProject(d))
    ];


    if (Object.keys(options).length > 0) {
      apiPromises.push(this.getRepositoryTree(projectId, {path:'', recursive: true}));
    }

    return Promise.all(apiPromises).then((vals) => {

      let project = vals[0];
      if (vals.length > 1) {
        let projectFiles = (project.files != null) ? project.files : {};

        const files = vals[1]
          .filter((treeObj) => treeObj.type === 'blob')
          .map((treeObj) => treeObj.path);

        Object.keys(SPECIAL_FOLDERS)
          .filter((key) => options[key])
          .forEach((folderKey) => {
            projectFiles[folderKey] = files.filter((filePath) => filePath.indexOf(folderKey) === 0)
          });
        project.files = projectFiles;
      }
      return project;
    })
  }

  postProject(renkuProject) {
    const gitlabProject = {
      name: renkuProject.display.title,
      description: renkuProject.display.description,
      visibility: renkuProject.meta.visibility === 'public' ? 'public' : 'private'
    };
    const headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + 'projects', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(gitlabProject)
    })

  }

  setTags(projectId, name, tags) {
    return this.putProjectField(projectId, name, 'tag_list', tags);
  }

  setDescription(projectId, name, description) {
    return this.putProjectField(projectId, name, 'description', description);
  }

  starProject(projectId, starred) {
    const headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const endpoint = starred ? 'unstar' : 'star';

    return renkuFetch(this._baseUrl + `projects/${projectId}/${endpoint}`, {
      method: 'POST',
      headers: headers,
    })

  }

  putProjectField(projectId, name, field_name, field_value) {
    const putData = { id: projectId, name, [field_name]: field_value };
    const headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(putData)
    })

  }


  getProjectReadme(projectId) {
    return this.getRepositoryFile(projectId, 'README.md', 'master', 'raw')
      .then(text => {
        return {text: text || 'Could not find a README.md file. Why don\'t you add one to the repository?'}
      });
  }


  getProjectFile(projectId, path) {
    let headers = this.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return renkuFetch(this._baseUrl + `projects/${projectId}/repository/files/${encodedPath}/raw?ref=master`, {
      method: 'GET',
      headers: headers
    }, 'text')
  }

  getProjectKus(projectId) {
    let headers = this.getBasicHeaders();

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues?scope=all`, {
      method: 'GET',
      headers: headers
    })

  }

  postProjectKu(projectId, ku) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(ku)
    })

  }

  getProjectKu(projectId, kuIid) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/`, {
      method: 'GET',
      headers: headers,
    })

  }

  getCommits(projectId, ref='master') {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    return renkuFetch(this._baseUrl + `projects/${projectId}/repository/commits?ref_name=${ref}`, {
      method: 'GET',
      headers: headers
    })
      .then(commits => {
        if (commits.length > 0) {
          return commits;
        }
        else {
          throw API_ERRORS.notFoundError;
        }
      })
  }

  getContributions(projectId, kuIid) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/notes`, {
      method: 'GET',
      headers: headers
    })

  }

  postContribution(projectId, kuIid, contribution) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/notes`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({body: contribution})
    })

  }

  // TODO: Once the gateway is up and running, the client should not need to be aware of the
  // TODO: JUPYTERHUB_URL anymore but simply query the notebook url from the gateway
  async getNotebookServerUrl(projectId, projectPath, filePath, commitSha='latest', ref='master') {
    if (commitSha === 'latest') {
      commitSha = await (this.getCommits(projectId).then(commits => commits[0].id));
    }
    return `${this._jupyterhub_url}/services/notebooks/${projectPath}/${commitSha}/${filePath}?branch=${ref}`
  }

  _modifiyIssue(projectId, issueIid, body) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return renkuFetch(this._baseUrl + `projects/${projectId}/issues/${issueIid}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body)
    })

  }

  closeKu(projectId, kuIid) {
    return this._modifiyIssue(projectId, kuIid, {state_event: 'close'})
  }

  reopenKu(projectId, kuIid) {
    return this._modifiyIssue(projectId, kuIid, {state_event: 'reopen'})
  }

  getRepositoryFile(projectId, path, ref='master', encoding='base64') {
    let headers = this.getBasicHeaders();
    const pathEncoded = encodeURIComponent(path);
    const raw = encoding === 'raw' ? '/raw' : '';
    return renkuFetch(this._baseUrl + `projects/${projectId}/repository/files/${pathEncoded}${raw}?ref=${ref}`, {
      method: 'GET',
      headers: headers
    }, 'fullResponse', false)
      .then(response => {
        if (encoding === 'raw') return response.text();
        if (encoding === 'base64') return response.json();
      })
      // .catch((error) => {
      //   if (error.case === API_ERRORS.notFoundError) {
      //     console.error(`Attempted to access non-existing repository file ${path}`)
      //     return undefined;
      //   }
      // })
  }

  getRepositoryTree(projectId, {path='', recursive=false, per_page=100, page = 1, previousResults=[]} = {}) {
    let headers = this.getBasicHeaders();
    const queryParams = {
      path,
      recursive,
      per_page,
      page
    };

    const url = new URL(this._baseUrl + `projects/${projectId}/repository/tree`);
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    // TODO: Think about general pagination strategy for API client.
    return renkuFetch(url, {
      method: 'GET',
      headers: headers
    }, 'fullResponse', false)
      .then(response => {
        if(response.headers.get('X-Next-Page')) {
          return response.json().then(data => {
            return this.getRepositoryTree(projectId, {
              path,
              recursive,
              per_page,
              previousResults: previousResults.concat(data),
              page: response.headers.get('X-Next-Page')
            }, 'fullResponse', false)
          });
        }
        else {
          return response.json().then(data => {
            return previousResults.concat(data)
          });
        }
      })
      .catch((error) => {
        if (error.case === API_ERRORS.notFoundError) {
          return []
        }
        else {
          alertAPIErrors(error);
        }
      })
  }

  getDeploymentUrl(projectId, envName, branchName = 'master') {
    let headers = this.getBasicHeaders();
    return renkuFetch(this._baseUrl + `projects/${projectId}/environments`, {
      method: 'GET',
      headers: headers
    })
      .then(envs => envs.filter(env => env.name === `${envName}/${branchName}`)[0])
      .then(env => {
        if (!env) return undefined;
        return `${env.external_url}`;
      })
  }

  getArtifactsUrl(projectId, job, branch='master') {
    const headers = this.getBasicHeaders();
    return renkuFetch(`${this._baseUrl}projects/${projectId}/jobs`, {
      method: 'GET',
      headers: headers
    })

      .then(jobs => {
        if (!jobs) return;
        const filteredJobs = jobs.filter(j => j.name === job && j.ref === branch);
        if (filteredJobs.length < 1)
          throw new Error(`There are no artifacts for project/job (${projectId}/${job}) because there are no jobs`);
        // Sort in reverse finishing order and take the most recent
        const jobObj =
          filteredJobs
            .sort((a, b) => (a.finished_at > b.finished_at) ? -1 : +(a.finished_at < b.finished_at))[0]
        return `${this._baseUrl}projects/${projectId}/jobs/${jobObj.id}/artifacts`;
      })
  }

  getArtifact(projectId, job, artifact, branch='master') {
    const options = { method: 'GET', headers: this.getBasicHeaders() };
    return this.getArtifactsUrl(projectId, job, branch)
      .then(url => {
        // If the url is undefined, we return an object with a dummy text() method.
        if (!url) return ['', {text: () => ''}];
        const resourceUrl = `${url}/${artifact}`;
        return Promise.all([resourceUrl, renkuFetch(resourceUrl, options, 'fullResponse')])
      })
  }

  getUser() {
    let headers = this.getBasicHeaders();
    return renkuFetch(this._baseUrl + 'user', {
      method: 'GET',
      headers: headers
    })

  }
}


function carveProject(projectJson) {
  const result = {metadata: {core: {}, visibility: {}, system: {}}, all: projectJson};
  result['metadata']['visibility']['level'] = projectJson['visibility'];

  // We use try and catch here because the command can go wrong at various levels permissions, project_access, ...
  try {
    result['metadata']['visibility']['accessLevel'] = projectJson.permissions.project_access.access_level
  }
  catch (TypeError) {
    result['metadata']['visibility']['accessLevel'] = 0
  }


  result['metadata']['core']['created_at'] = projectJson['created_at'];
  result['metadata']['core']['last_activity_at'] = projectJson['last_activity_at'];
  result['metadata']['core']['id'] = projectJson['id'];
  result['metadata']['core']['description'] = projectJson['description'];
  result['metadata']['core']['displayId'] = projectJson['path_with_namespace'];
  result['metadata']['core']['title'] = projectJson['name'];
  result['metadata']['core']['external_url'] = projectJson['web_url'];
  result['metadata']['core']['path_with_namespace'] = projectJson['path_with_namespace'];

  result['metadata']['system']['tag_list'] = projectJson['tag_list'];
  result['metadata']['system']['star_count'] = projectJson['star_count'];
  result['metadata']['system']['forks_count'] = projectJson['forks_count'];
  result['metadata']['system']['ssh_url'] = projectJson['ssh_url_to_repo'];
  result['metadata']['system']['http_url'] = projectJson['http_url_to_repo'];

  return result;
}

export { GitlabClient, carveProject };

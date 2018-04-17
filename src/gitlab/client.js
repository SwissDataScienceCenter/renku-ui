const SPECIAL_FOLDERS = {
  data: 'data',
  notebooks: 'notebooks',
  workflows: 'workflows',
};


export default class GitlabClient {

  // GitLab api client for Renga. Note that we do some
  // renaming of GitLab resources within this client:
  //
  // Renga      GitLab
  // -----------------
  // ku    -->  issue


  constructor(baseUrl, token, tokenType) {
    this._baseUrl = baseUrl;
    this._token = token;
    this._tokenType = tokenType;
  }

  getBasicHeaders() {
    let headers = {
      'Accept': 'application/json'
    };
    if (this._tokenType === 'private') headers['Private-Token'] = this._token;
    if (this._tokenType === 'bearer') headers['Authorization'] = `Bearer ${this._token}`;

    return  new Headers(headers)
  }

  getProjects(queryParams={}) {
    let headers = this.getBasicHeaders();

    const url = new URL(this._baseUrl + 'projects');
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    return fetch(url, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  getProject(projectId, options={}) {
    let headers = this.getBasicHeaders();

    const apiPromises = [
      fetch(this._baseUrl + `projects/${projectId}`, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
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

  postProject(rengaProject) {
    const gitlabProject = {
      name: rengaProject.display.title,
      description: rengaProject.display.description,
      visibility: rengaProject.meta.visibility === 'public' ? 'public' : 'private'
    };
    const headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + 'projects', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(gitlabProject)
    })
      .then(response => response.json())
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

    return fetch(this._baseUrl + `projects/${projectId}/${endpoint}`, {
      method: 'POST',
      headers: headers,
    })
      .then(response => response.json())
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
      .then(response => response.json())
  }


  getProjectReadme(projectId) {
    return this.getRepositoryFile(projectId, 'README.md', 'master', 'raw')
      .then(text => ({text}))
  }

  getProjectFile(projectId, path) {
    let headers = this.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return fetch(this._baseUrl + `projects/${projectId}/repository/files/${encodedPath}/raw?ref=master`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.text())
  }

  getProjectKus(projectId) {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + `projects/${projectId}/issues`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  postProjectKu(projectId, ku) {
    console.log(ku);
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(ku)
    })
      .then(response => response.json())
  }

  getProjectKu(projectId, kuIid) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/`, {
      method: 'GET',
      headers: headers,
    })
      .then(response => response.json())
  }

  getContributions(projectId, kuIid) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/notes`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  postContribution(projectId, kuIid, contribution) {
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues/${kuIid}/notes`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({body: contribution})
    })
      .then(response => response.json())
  }

  _modifiyIssue(projectId, issueIid, body) {
    console.log(body);
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues/${issueIid}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(response => response.json())
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
    return fetch(this._baseUrl + `projects/${projectId}/repository/files/${pathEncoded}${raw}?ref=${ref}`, {
      method: 'GET',
      headers: headers
    })
      .then(response => {
        if (encoding === 'raw') return response.text();
        if (encoding === 'base64') return response.json();
        console.error('Unknown encoding');
      })
      .catch(error => {console.log(error)})
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
    return fetch(url, {
      method: 'GET',
      headers: headers
    })
      .then(response => {
        // I think the expected behaviour for the absence
        // of a tree should be an empty array.
        if (response.status === 404) {
          return [];
        }
        else {
          if(response.headers.get('X-Next-Page')) {
            return response.json().then(data => {
              return this.getRepositoryTree(projectId, {
                path,
                recursive,
                per_page,
                previousResults: previousResults.concat(data),
                page: response.headers.get('X-Next-Page')
              })
            });
          }
          else {
            return response.json().then(data => {
              return previousResults.concat(data)
            });
          }
        }
      })
  }

  getDeploymentUrl(projectId, envName, branchName = 'master') {
    let headers = this.getBasicHeaders();
    return fetch(this._baseUrl + `projects/${projectId}/environments`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(envs => envs.filter(env => env.name === `${envName}/${branchName}`)[0])
      .then(env => {
        if (!env) return undefined;
        // TODO: Add the path to the actual notebook file once the CI/CD part
        // TODO: has stabilized.
        return `${env.external_url}`;
      })
  }

  getArtifactsUrl(projectId, job, branch='master') {
    const headers = this.getBasicHeaders();
    return fetch(`${this._baseUrl}projects/${projectId}/jobs`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(jobs => {
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
        const resourceUrl = `${url}/${artifact}`;
        return Promise.all([resourceUrl, fetch(resourceUrl, options)])
      })
  }

  getUser() {
    let headers = this.getBasicHeaders();
    return fetch(this._baseUrl + 'user', {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }
}


function carveProject(projectJson) {
  const result = {metadata: {core: {}, visibility: {}, system: {}}, all: projectJson};
  result['metadata']['visibility']['level'] = projectJson['visibility'];

  result['metadata']['core']['created_at'] = projectJson['created_at'];
  result['metadata']['core']['last_activity_at'] = projectJson['last_activity_at'];
  result['metadata']['core']['id'] = projectJson['id'];
  result['metadata']['core']['description'] = projectJson['description'];
  result['metadata']['core']['displayId'] = projectJson['path_with_namespace'];
  result['metadata']['core']['title'] = projectJson['name'];
  result['metadata']['core']['external_url'] = projectJson['web_url'];

  result['metadata']['system']['tag_list'] = projectJson['tag_list'];
  result['metadata']['system']['star_count'] = projectJson['star_count'];
  result['metadata']['system']['forks_count'] = projectJson['forks_count'];
  result['metadata']['system']['ssh_url'] = projectJson['ssh_url_to_repo'];
  result['metadata']['system']['http_url'] = projectJson['http_url_to_repo'];

  return result;
}

export { carveProject };

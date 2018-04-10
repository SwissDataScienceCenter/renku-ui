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
    console.log('called constructor on api client');
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

  getProjects() {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + 'projects/', {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  getProject(projectId, options={}) {
    let headers = this.getBasicHeaders();

    const projectPromise = fetch(this._baseUrl + `projects/${projectId}`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(d => carveProject(d));

    const treePromise = this.getRepositoryTree(projectId, {path:'', recursive: true});

    return Promise.all([projectPromise, treePromise]).then((vals) => {

      let project = vals[0];

      const files = vals[1]
        .filter((treeObj) => treeObj.type==='blob')
        .map((treeObj) => treeObj.path);

      Object.keys(SPECIAL_FOLDERS)
        .filter((key) => options[key])
        .forEach((folderKey) => {
          project[folderKey] = files.filter((filePath) => filePath.indexOf(folderKey) === 0)
        });
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
      })
  }

  getDeploymentUrl(projectId, notebookPath, branchName = 'master') {
    let headers = this.getBasicHeaders();
    return fetch(this._baseUrl + `projects/${projectId}/environments`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(envs => envs.filter(env => env.name === `review/${branchName}`)[0])
      .then(env => {
        if (!env) return undefined;
        // TODO: Add the path to the actual notebook file once the CI/CD part
        // TODO: has stabilized.
        return `${env.external_url}`;
      })
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

  return result;
}

export { carveProject };

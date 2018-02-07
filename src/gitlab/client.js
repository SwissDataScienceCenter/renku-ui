export default class GitlabClient {

  // GitLab api client for Renga. Note that we do some
  // renaming of GitLab resources within this client:
  //
  // Renga      GitLab
  // -----------------
  // ku    -->  issue


  constructor(baseUrl, privateToken) {
    console.log('called constructor on api client');
    this._baseUrl = baseUrl;
    this._privateToken = privateToken;
  }

  getBasicHeaders() {
    return  new Headers({
      'Accept': 'application/json',
      'Private-Token': this._privateToken
    })
  }

  getProjects() {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + 'projects/', {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  getProject(projectId) {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + `projects/${projectId}`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(d => carveProject(d))
  }

  getProjectReadme(projectId) {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + `projects/${projectId}/repository/files/README.md/raw?ref=master`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.text())
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

}


function carveProject(projectJson) {
  const result = {metadata: {core: {}, visibility: {}}, all: projectJson};
  result['metadata']['visibility']['level'] = projectJson['visibility'];

  result['metadata']['core']['created_at'] = projectJson['created_at'];
  result['metadata']['core']['id'] = projectJson['id'];
  result['metadata']['core']['description'] = projectJson['description'];
  result['metadata']['core']['displayId'] = projectJson['path_with_namespace'];
  result['metadata']['core']['title'] = projectJson['name'];
  result['metadata']['core']['external_url'] = projectJson['web_url'];

  return result;
}

export { carveProject };

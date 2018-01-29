export default class GitlabClient {
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

  getProjectIssues(projectId) {
    let headers = this.getBasicHeaders();

    return fetch(this._baseUrl + `projects/${projectId}/issues`, {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
  }

  postProjectIssue(projectId, issue) {
    console.log(issue);
    let headers = this.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return fetch(this._baseUrl + `projects/${projectId}/issues`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(issue)
    })
      .then(response => response.json())
  }
}

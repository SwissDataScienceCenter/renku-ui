export default function addMigrationMethods(client) {

  client.getProjectIdFromService = async (projectUrl) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    // If the project is in the cache, get the id from the cache
    let projectsList = await client.clientFetch(`${client.baseUrl}/renku/cache.project_list`, {
      method: "GET",
      headers: headers
    });

    if (projectsList.data != null && projectsList.data.error == null) {
      const project = projectsList.data.result.projects
        .find(project => project.git_url === projectUrl);
      if (project != null)
        return project.project_id;
    }

    // Otherwise clone it and get the id
    let project = await client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        depth: 1,
        git_url: projectUrl
      })
    });

    if (project.data !== undefined && project.data.error !== undefined)
      return project;
    return project.data.result.project_id;
  };

  client.performMigrationCheck = (projectId) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/cache.migrations_check?project_id=${projectId}`, {
      method: "GET",
      headers: headers,
    }).then(response => {
      return response.data;
    }).catch((error)=>
      ({ data: { error: { reason: error.case } }
      }));
  };

  client.performMigration = (projectId) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/cache.migrate`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ project_id: projectId })
    }).catch((error)=>
      ({ data: { error: { reason: error.case } }
      }));
  };

}

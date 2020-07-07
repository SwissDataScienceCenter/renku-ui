export default function addMigrationMethods(client) {

  client.getProjectIdFromSvc = (projectUrl) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/cache.project_list`, {
      method: "GET",
      headers: headers
    }).then(response => {
      if (response.data.error !== undefined)
        return response;

      return response.data.result.projects.find(project => project.git_url === projectUrl);
    }).then( response => {

      if (response !== undefined) {
        if (response.data !== undefined && response.data.error !== undefined)
          return response;
        return response.project_id;
      }

      return client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          depth: 1,
          git_url: projectUrl
        })

      }).then(response => {
        if (response.data && response.data.error !== undefined)
          return response;
        return response.data.result.project_id;
      });
    });
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
    });
  };

  client.performMigration = (projectId) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    //  headers.append("credentials", "same-origin");

    return client.clientFetch(`${client.baseUrl}/renku/cache.migrate`, {
      method: "POST",
      headers: headers,
      //  query_string: JSON.stringify({ project_id: projectId })
      body: JSON.stringify({ project_id: projectId })
    });
  };

}

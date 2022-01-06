export default function addMigrationMethods(client) {

  // TODO: merge this with getProjectIdFromCoreService
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

  // TODO: switch to git_url + branch for migrations. Requires SwissDataScienceCenter/renku-python#2541
  client.checkMigration = async (git_url, branch) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const url = `${client.baseUrl}/renku/cache.migrations_check`;
    const queryParams = { git_url, branch };

    return await client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    });
  };

  client.performMigrationCheck = async (projectId) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const url = `${client.baseUrl}/renku/cache.migrations_check`;
    const queryParams = { project_id: projectId };

    try {
      return await client.clientFetch(url, {
        method: "GET",
        headers,
        queryParams
      });
    }
    catch (error) {
      return { data: { error: { reason: error.case } } };
    }
  };

  /**
   * Performs project migrations
   *
   * - force_template_update: set to true to update the template even
   * if automated_template_update is not set on the template (probably not a good idea...)
   * - skip_template_update: don't try to update the template (superseedes force_template_update)
   * - skip_docker_update: don't try to update the Dockerfile.
   * - skip_migrations: don't execute migrations.
   */

  client.performMigration = (projectId,
    { force_template_update = false,
      skip_template_update = false,
      skip_docker_update = false,
      skip_migrations = false }
  ) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/cache.migrate`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        project_id: projectId,
        force_template_update,
        skip_template_update,
        skip_docker_update,
        skip_migrations
      })
    }).catch((error)=>
      ({ data: { error: { reason: error.case } }
      }));
  };

}

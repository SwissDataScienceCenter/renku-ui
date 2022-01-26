export default function addMigrationMethods(client) {

  /**
   * Check migration status of a project.
   *
   * @param {string} git_url - Project repository URL.
   * @param {string} [branch] - Target branch.
   * @returns {object} migration data.
   */
  client.checkMigration = async (git_url, branch = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const url = `${client.baseUrl}/renku/cache.migrations_check`;
    let queryParams = { git_url };
    if (branch)
      queryParams.branch = branch;

    return await client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    }).then(response => response?.data ? response.data : response);
  };


  /**
   * Migrate target project.
   *
   * @param {string} git_url - Project repository URL.
   * @param {string} [branch] - Target branch.
   * @param {object} [options] - Migration options.
   * @param {boolean} [options.force_template_update] - set to true to update the template even
   *  if automated_template_update is not set on the template (usually not a good idea)
   * @param {boolean} [options.skip_template_update] - do not update the template
   *  (superseedes force_template_update)
   * @param {boolean} [options.skip_docker_update] - do not update the Dockerfile.
   * @param {boolean} [options.skip_migrations] - do not execute migrations
   * @returns {object} migration data.
   */
  client.migrateProject = async (git_url, branch = null, options = {
    force_template_update: false,
    skip_template_update: false,
    skip_docker_update: false,
    skip_migrations: false
  }) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const url = `${client.baseUrl}/renku/cache.migrate`;
    let body = {
      git_url,
      force_template_update: options.force_template_update,
      skip_template_update: options.skip_template_update,
      skip_docker_update: options.skip_docker_update,
      skip_migrations: options.skip_migrations
    };
    if (branch)
      body.branch = branch;

    return await client.clientFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
      .then(response => response?.data ? response.data : response)
      .catch(error => ({ error: { reason: error.case } }));
  };
}

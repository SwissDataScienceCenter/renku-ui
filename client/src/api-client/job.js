
export default function addJobMethods(client) {

  /**
   * Get status for the target job in the core service
   * @param {string} job_id - core job id
   * @param {string} versionUrl - target core version to identify the proper jobs queue
   */
  client.getJobStatus = (job_id, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("jobs", versionUrl);
    return client.clientFetch(`${url}/${job_id}`, {
      method: "GET",
      headers: headers
    }).then(response => {
      return response.data?.result;
    });
  };

  /**
   * Get list of all jobs from the core service.
   * @param {string} versionUrl - target core version to identify the proper jobs queue
   */
  client.getAllJobStatus = (versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("jobs", versionUrl);
    return client.clientFetch(url, {
      method: "GET",
      headers: headers
    }).then(response => {
      return response.data?.result;
    });
  };
}

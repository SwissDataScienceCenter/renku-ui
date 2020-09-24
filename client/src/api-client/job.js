
export default function addJobMethods(client) {

  client.getJobStatus = (job_id) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/jobs/${job_id}`, {
      method: "GET",
      headers: headers
    }).then(response => {
      return response.data.result;
    });
  };

  client.getAllJobStatus = () => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/jobs`, {
      method: "GET",
      headers: headers
    }).then(response => {
      return response.data.result;
    });
  };
}

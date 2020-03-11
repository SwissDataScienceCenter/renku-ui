export default function addDatasetMethods(client) {

  client.searchDatasets = (queryParams = { query: "" }) => {
    const url = `${client.baseUrl.replace("/api", "")}/knowledge-graph/datasets`;
    const headers = client.getBasicHeaders();

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    });
  };

  client.uploadFile = (file, controller) => {
    const data = new FormData();
    data.append("file", file);
    data.append("file_name", file.name);

    let headers = new Headers({
      "credentials": "same-origin",
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    });

    let queryParams = {
      method: "POST",
      headers: headers,
      body: data,
      processData: false
    };

    if (controller) queryParams.signal = controller.signal;

    return fetch(`${client.baseUrl}/renku/cache.files_upload?override_existing=true`, queryParams)
      .then(response => {
        if (controller !== undefined)
          response.controller = controller;
        return response;
      });
  };

  client.addFilesToDataset = (projectUrl, datasetName, filesList) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let queryParams = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        depth: 1,
        git_url: projectUrl
      }),
    };

    return client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`,
      queryParams
    ).then(response => {
      if (response.data.error) { return response; }
      else
      if (filesList.length > 0) {
        return client.clientFetch(`${client.baseUrl}/renku/datasets.add`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            "dataset_name": datasetName,
            "files": filesList,
            "project_id": response.data.result.project_id
          })
        });
      } return response;
    });
  };

  client.postDataset = (projectUrl, renkuDataset) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        depth: 1,
        git_url: projectUrl
      })
    }).then(response => {
      if (response.data.error !== undefined)
        return response;

      project_id = response.data.result.project_id;

      return client.clientFetch(`${client.baseUrl}/renku/datasets.create`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          "dataset_name": renkuDataset.name,
          "description": renkuDataset.description,
          "project_id": project_id
        })
      });
    })
      .then(response => {
        if (response.data.error) { return response; }
        else
        if (renkuDataset.files.length > 0) {
          return client.clientFetch(`${client.baseUrl}/renku/datasets.add`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              "dataset_name": renkuDataset.name,
              "files": renkuDataset.files,
              "project_id": project_id
            })
          });
        } return response;
      });
  };

  client.datasetImport = (projectUrl, renkuDataset) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        depth: 1,
        git_url: projectUrl
      })
    }).then(response => {
      if (response.data.error !== undefined)
        return response;

      project_id = response.data.result.project_id;

      return client.clientFetch(`${client.baseUrl}/renku/datasets.import`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          "dataset_uri": renkuDataset.uri,
          "project_id": project_id
        })
      });

    });
  };


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
}

export default function addDatasetMethods(client) {

  client.searchDatasets = (queryParams = { query: "" }) => {
    const url = `${client.baseUrl}/kg/datasets`;
    const headers = client.getBasicHeaders();

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    });
  };

  client.uploadFile = (file, unpack_archive = false, setFileProgress, thenCallback, onErrorCallback,
    setController, onFileUploadEnd) => {
    const data = new FormData();
    data.append("file", file);
    data.append("file_name", file.name);
    data.append("processData", false);

    let currentPercentCompleted = -1;
    let httpRequest = new XMLHttpRequest();
    const url = `${client.baseUrl}/renku/cache.files_upload?override_existing=true&unpack_archive=${unpack_archive}`;

    httpRequest.open("POST", url);
    httpRequest.setRequestHeader("credentials", "same-origin");
    httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    httpRequest.setRequestHeader("Accept", "application/json");

    httpRequest.upload.addEventListener("progress", function(e) {
      let percent_completed = Math.round((e.loaded / e.total) * 100).toFixed();
      if (currentPercentCompleted !== percent_completed) {
        currentPercentCompleted = percent_completed;
        setFileProgress(file, percent_completed);
      }
    });

    httpRequest.onloadstart = function() {
      setController(file, httpRequest);
    };

    // eslint-disable-next-line
    httpRequest.onloadend = function() {
      if (httpRequest.status === 200 && httpRequest.response) {
        if (onFileUploadEnd) onFileUploadEnd();
        let jsonResponse = JSON.parse(httpRequest.response);

        if (jsonResponse.error)
          setFileProgress(file, 400, jsonResponse.error);
        else
          setFileProgress(file, 101);
        thenCallback(jsonResponse);
      }
      else if (httpRequest.status >= 400) {
        setFileProgress(file, 400, { error: { reason: "Server Error " + httpRequest.status } });
        if (onFileUploadEnd) onFileUploadEnd();
        onErrorCallback({ code: httpRequest.status });
      }
    };

    return httpRequest.send(data);
  };

  client.uploadSingleFile = async (file, unpack_archive = false) => {
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

    return client.clientFetch(
      `${client.baseUrl}/renku/cache.files_upload?override_existing=true&unpack_archive=${unpack_archive}`,
      queryParams);
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
            "name": datasetName,
            "files": filesList,
            "project_id": response.data.result.project_id
          })
        });
      } return response;
    });
  };

  /**
   * This method checks weather the dataset is or not in the cache.
   * In case the project is already there it returns the id of the project in the cache.
   * If the project is not there, it clones the project and returns the id of the project in the cache.
   *
   * projectUrl is the http project in gitlab
   * example: https://dev.renku.ch/gitlab/virginiafriedrich/project-11.git
  */
  client.getProjectIdFromCoreService = (projectUrl) => {
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
    }).then( cloned_project => {
      if (cloned_project !== undefined)
        return cloned_project.project_id;

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

        return response.data.result.project_id;

      }).then(project_id => {
        return Promise.resolve(project_id);
      });
    });
  };

  client.postDataset = (projectUrl, renkuDataset, edit = false) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.getProjectIdFromCoreService(projectUrl)
      .then(response => {

        if (response.data !== undefined && response.data.error !== undefined)
          return response;

        project_id = response;

        let postUrl = edit ? `${client.baseUrl}/renku/datasets.edit` : `${client.baseUrl}/renku/datasets.create`;
        let body = {
          "name": renkuDataset.name,
          "title": renkuDataset.title,
          "description": renkuDataset.description,
          "creators": renkuDataset.creators,
          "keywords": renkuDataset.keywords,
          "project_id": project_id
        };

        if (renkuDataset.images)
          body.images = renkuDataset.images;

        return client.clientFetch(postUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body)
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
              "name": renkuDataset.name,
              "files": renkuDataset.files,
              "project_id": project_id
            })
          });
        } return response;
      });
  };

  client.datasetImport = (projectUrl, datasetUrl) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.getProjectIdFromCoreService(projectUrl)
      .then(response => {

        if (response.data !== undefined && response.data.error !== undefined)
          return response;

        project_id = response;

        return client.clientFetch(`${client.baseUrl}/renku/datasets.import`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            "dataset_uri": datasetUrl,
            "project_id": project_id
          })
        });

      });
  };

  client.listProjectDatasetsFromCoreService = (git_url) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/datasets.list?git_url=${git_url}`, {
      method: "GET",
      headers: headers,
    }).then((response)=>{
      if (response.data.result && response.data.result.datasets.length > 0) {
        response.data.result.datasets.map((dataset)=>{
          dataset.mediaContent = git_url.substring(0, git_url.length - 4) + "/-/raw/master/"
          + dataset.images[0].content_url;
          return dataset;
        });
      }
      return response;
    })
      .catch((error) =>
        ({
          data: { error: { reason: error.case } }
        }));
  };

  client.fetchDatasetFilesFromCoreService = (name, git_url) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const filesPromise = client.clientFetch(
      `${client.baseUrl}/renku/datasets.files_list?git_url=${git_url}&name=${name}`, {
        method: "GET",
        headers: headers,
      }).catch((error) =>
      ({
        data: { error: { reason: error.case } }
      }));
    return Promise.resolve(filesPromise);
  };

  client.deleteDataset = (projectUrl, datasetName) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.getProjectIdFromCoreService(projectUrl)
      .then(response => {

        if (response.data !== undefined && response.data.error !== undefined)
          return response;

        project_id = response;

        return client.clientFetch(`${client.baseUrl}/renku/datasets.remove`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            "name": datasetName,
            "project_id": project_id
          })
        });
      }).catch((error) =>
        ({
          data: { error: { reason: error.case } }
        }));
  };
}


/**
 * Add the URL for the marquee image to the dataset. Modifies the dataset object.
 * @param {string} gitUrl
 * @param {object} dataset
 */
function addMarqueeImageToDataset(gitUrl, dataset) {
  const urlRoot = gitUrl.substring(0, gitUrl.length - 4) + "/-/raw/master";
  let mediaUrl = null;
  if (dataset.images && dataset.images.length > 0)
    mediaUrl = `${urlRoot}/${dataset.images[0].content_url}`;

  dataset.mediaContent = mediaUrl;
  return dataset;
}

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

  function createFileUploadFormData(file) {
    const data = new FormData();
    data.append("file", file);
    data.append("file_name", file.name);
    return data;
  }

  const uploadFileHeaders = {
    "credentials": "same-origin",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json"
  };

  client.uploadFile = (file, unpack_archive = false, setFileProgress, thenCallback, onErrorCallback,
    setController, onFileUploadEnd) => {
    const data = createFileUploadFormData(file);
    data.append("processData", false);

    let currentPercentCompleted = -1;
    let httpRequest = new XMLHttpRequest();
    const url = `${client.baseUrl}/renku/cache.files_upload?override_existing=true&unpack_archive=${unpack_archive}`;

    httpRequest.open("POST", url);
    for (const [key, value] of Object.entries(uploadFileHeaders))
      httpRequest.setRequestHeader(key, value);


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
    const data = createFileUploadFormData(file);

    let headers = new Headers(uploadFileHeaders);

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

  client.cloneProjectInCache = (projectUrl, branch) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const payload = { depth: 1,
      git_url: projectUrl };
    if (branch) payload.ref = branch;

    return client.clientFetch(`${client.baseUrl}/renku/cache.project_clone`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    }).then(response => {
      if (response.data.error !== undefined)
        return response;
      return response.data.result.project_id;

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

      const currentProjects = response.data.result.projects.find(project => project.git_url === projectUrl);
      // We need to do this because there is a BUG in the CORE SERVICE!!!
      // ref is missing from the list of cloned projects and that makes it impossible for us
      // to know which project id to use, in this case we need to clone the project
      // for every operation we do on master
      // ----->    :(     :(       :(
      if (currentProjects.length > 1)
        return undefined;
      return currentProjects;
    }).then( cloned_project => {
      if (cloned_project !== undefined)
        return cloned_project.project_id;

      return client.cloneProjectInCache(projectUrl).then(project_id => {
        return Promise.resolve(project_id);
      });
    });
  };

  client.addFilesToDataset = (project_id, renkuDataset) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.clientFetch(`${client.baseUrl}/renku/datasets.add`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "name": renkuDataset.name,
        "files": renkuDataset.files,
        "project_id": project_id
      })
    }).then(response =>
      response.data.error ?
        { data: { error: { reason: response.data.error.reason, errorOnFileAdd: true } } }
        : response
    );
  };

  client.postDataset = (projectUrl, renkuDataset, defaultBranch, edit = false) => {
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
        if (response.data.error) return response;

        if (response.data.result.remote_branch !== defaultBranch) {
          if (renkuDataset.files.length > 0) {
            return client.cloneProjectInCache(projectUrl, response.data.result.remote_branch)
              .then(newProjectId => {
                if (newProjectId.data && newProjectId.data.error)
                  return { data: { error: { reason: newProjectId.data.error.reason, errorOnFileAdd: true } } };
                if (renkuDataset.files.length > 0) {
                  return client.addFilesToDataset(newProjectId, renkuDataset)
                    .then(response=> {
                      if (response.data.error)
                        return { data: { error: { reason: response.data.error.reason, errorOnFileAdd: true } } };
                      return response;
                    });
                }
              });
          }
        }
        else
        if (renkuDataset.files.length > 0) {
          return client.addFilesToDataset(project_id, renkuDataset);
        }
        return response;
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
    })
      .then((response) => {
        if (response.data.result && response.data.result.datasets.length > 0)
          response.data.result.datasets.map((d) => addMarqueeImageToDataset(git_url, d));

        return response;
      })
      .catch((error) =>
        ({
          data: { error: { reason: error.case } }
        })
      );
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

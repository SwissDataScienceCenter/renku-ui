
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

/**
 * Remove dashes from the dataset identifier
 * @param {object} dataset
 */
function cleanDatasetId(dataset) {
  if (dataset.identifier)
    dataset.identifier = dataset.identifier.replace(/-/g, "");
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

  client.uploadFile = (
    versionUrl = null,
    file,
    unpack_archive = false,
    setFileProgress,
    thenCallback,
    onErrorCallback,
    setController,
    onFileUploadEnd,
  ) => {
    const data = createFileUploadFormData(file);
    data.append("processData", false);

    let currentPercentCompleted = -1;
    let httpRequest = new XMLHttpRequest();

    const urlString = client.versionedCoreUrl("cache.files_upload", versionUrl);
    const url = new URL(urlString);
    url.search = new URLSearchParams({ override_existing: true, unpack_archive }).toString();

    httpRequest.open("POST", url);
    for (const [key, value] of Object.entries(uploadFileHeaders))
      httpRequest.setRequestHeader(key, value);


    httpRequest.upload.addEventListener("progress", function (e) {
      let percent_completed = Math.round((e.loaded / e.total) * 100).toFixed();
      if (currentPercentCompleted !== percent_completed) {
        currentPercentCompleted = percent_completed;
        setFileProgress(file, percent_completed);
      }
    });

    httpRequest.onloadstart = function () {
      setController(file, httpRequest);
    };

    httpRequest.onloadend = function () {
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

  client.uploadSingleFile = async (file, unpack_archive = false, versionUrl = null) => {
    const headers = new Headers(uploadFileHeaders);
    const data = createFileUploadFormData(file);
    const queryParams = {
      override_existing: true,
      unpack_archive: unpack_archive
    };

    const url = client.versionedCoreUrl("cache.files_upload", versionUrl);
    return client.clientFetch(url, {
      method: "POST",
      headers,
      body: data,
      queryParams,
      processData: false,
    });
  };

  client.cloneProjectInCache = (projectUrl, branch, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const url = client.versionedCoreUrl("cache.project_clone", versionUrl);

    const payload = {
      depth: 1,
      git_url: projectUrl
    };
    if (branch)
      payload.ref = branch;

    return client.clientFetch(url, {
      method: "POST",
      headers,
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
  client.getProjectIdFromCoreService = (projectUrl, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("cache.project_list", versionUrl);
    return client.clientFetch(url, {
      method: "GET",
      headers
    }).then(response => {
      if (response.data.error !== undefined)
        return response;

      const cleanUrl = (url) => url.replace(".git", "");

      const currentProjects = response.data.result.projects
        .find(project => cleanUrl(project.git_url) === cleanUrl(projectUrl));
      // We need to do this because there is a BUG in the CORE SERVICE!!!
      // ref is missing from the list of cloned projects and that makes it impossible for us
      // to know which project id to use, in this case we need to clone the project
      // for every operation we do on master
      // ----->    :(     :(       :(
      if (currentProjects?.length > 1)
        return Promise.resolve(undefined);
      return Promise.resolve(currentProjects);
    }).then(cloned_project => {
      if (cloned_project && cloned_project?.project_id !== undefined)
        return cloned_project.project_id;

      return client.cloneProjectInCache(projectUrl, null, versionUrl).then(project_id => {
        return Promise.resolve(project_id);
      });
    }).catch(response => response);
  };

  client.addFilesToDataset = (project_id, renkuDataset, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("datasets.add", versionUrl);

    return client.clientFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        "name": renkuDataset.name,
        "files": renkuDataset.files,
        "project_id": project_id
      })
    }).then(response => response.data.error ?
      { data: { error: { ...response.data.error, errorOnFileAdd: true } } } :
      response
    );
  };

  client.postDataset = (projectUrl, renkuDataset, defaultBranch, edit = false, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    let project_id;

    return client.getProjectIdFromCoreService(projectUrl, versionUrl)
      .then(response => {

        if (response.data !== undefined && response.data.error !== undefined)
          return response;

        project_id = response;

        const url = client.versionedCoreUrl("datasets", versionUrl);
        const postUrl = edit ? `${url}.edit` : `${url}.create`;
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
          headers,
          body: JSON.stringify(body)
        });
      })
      .then(response => {
        if (response.data.error) return response;

        if (response.data.result.remote_branch !== defaultBranch) {
          if (renkuDataset.files.length > 0) {
            return client.cloneProjectInCache(projectUrl, response.data.result.remote_branch, versionUrl)
              .then(newProjectId => {
                if (newProjectId?.data?.error)
                  return { data: { error: { ...newProjectId.data.error, errorOnFileAdd: true } } };
                if (renkuDataset.files.length > 0) {
                  return client.addFilesToDataset(newProjectId, renkuDataset, versionUrl)
                    .then(response => {
                      if (response.data.error)
                        return { data: { error: { ...newProjectId.data.error, errorOnFileAdd: true } } };
                      return response;
                    });
                }
              });
          }
        }
        else if (renkuDataset.files.length > 0) {
          return client.addFilesToDataset(project_id, renkuDataset, versionUrl);
        }
        return response;
      });
  };

  client.datasetImport = (projectUrl, datasetUrl, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("datasets.import", versionUrl);

    return client.clientFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        "dataset_uri": datasetUrl,
        "git_url": projectUrl,
      })
    });
  };

  client.listProjectDatasetsFromCoreService = (git_url, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("datasets.list", versionUrl);
    const queryParams = { git_url };

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    }).then((response) => {
      if (response.data.result && response.data.result.datasets.length > 0) {
        response.data.result.datasets.map((d) =>
          addMarqueeImageToDataset(git_url, cleanDatasetId(d))
        );
      }

      return response;
    }).catch(error => ({
      data: { error: { reason: error.case } }
    }));
  };

  client.fetchDatasetFilesFromCoreService = (name, git_url, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url = client.versionedCoreUrl("datasets.files_list", versionUrl);
    const queryParams = { git_url, name };

    const filesPromise = client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams
    }).catch(error => ({
      data: { error: { reason: error.case } }
    }));
    return Promise.resolve(filesPromise);
  };

  client.deleteDataset = (projectUrl, datasetName, versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    return client.getProjectIdFromCoreService(projectUrl, versionUrl)
      .then(response => {
        if (response.data !== undefined && response.data.error !== undefined)
          return response;
        const project_id = response;

        const url = client.versionedCoreUrl("datasets.remove", versionUrl);

        return client.clientFetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            "name": datasetName,
            "project_id": project_id
          })
        });
      })
      .catch(error => ({
        data: { error: { reason: error.case } }
      }));
  };
}

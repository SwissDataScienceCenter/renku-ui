export default function addDatasetMethods(client) {

  client.searchDatasets = (query) => {
    let url = `${client.baseUrl}/knowledge-graph/datasets?query=${query}`;
    url = url.replace('/api','');//The url should change in the backend so we don't have to do this
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, {method:'GET', headers}).then((resp) => {
      return resp.data;
    });
  }
}

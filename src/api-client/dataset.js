export default function addDatasetMethods(client) {

  client.searchDatasets = (queryParams = { query: '' }) => {
    const url = `${client.baseUrl.replace('/api', '')}/knowledge-graph/datasets`;
    const headers = client.getBasicHeaders();

    return client.clientFetch(url, {
      method: 'GET',
      headers,
      queryParams
    })
  }
}

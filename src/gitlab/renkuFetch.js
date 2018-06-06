class APIError extends Error {
  constructor(arg){
    super(arg || 'GitLab API error')
  }
}


const API_ERRORS = {
  permissionError: 'NO_PERMISSION',
  notFoundError: 'NOT_FOUND',
  internalServerError: 'SERVER_ERROR',
  networkError: 'NETWORK_PROBLEM'
};

// Wrapper around fetch which will throw exceptions on all non 20x responses.
// Adapted from https://github.com/github/fetch/issues/155
function renkuFetch(url, options, returnType='json', alert=true) {

  // Add query parameters to URL instance. This will also work
  // if url is already an instance of URL. Note that this also encodes the URL
  // and the parameters.

  const URLobject = new URL(url);
  if (options.queryParams) {
    Object.keys(options.queryParams).forEach((key) => {
      URLobject.searchParams.append(key, options.queryParams[key])
    });
  }

  return fetch(URLobject, options)
    .catch((fetchError) => {
      const networkError = new APIError();
      networkError.case = API_ERRORS.networkError;
      networkError.error = fetchError;
      return Promise.reject(networkError);
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {

        switch (returnType) {
        case 'json':
          return response.json();
        case 'text':
          return response.text();
        case 'fullResponse':
          return response;
        default:
          return response.json();
        }

      } else {
        return throwAPIErrors(response)
      }
    })
    // We alert on most errors already here, yet allow to turn this off.
    .catch((error) => {
      if (alert) {
        alertAPIErrors(error);
      }
      else {
        return Promise.reject(error);
      }
    })
}



function throwAPIErrors(response) {
  let error;

  switch (response.status) {
  case 401:
  case 403:
    error = new APIError();
    error.case = API_ERRORS.permissionError;
    break;
  case 404:
    error = new APIError();
    error.case = API_ERRORS.notFoundError;
    break;
  case 500:
    error = new APIError();
    error.case = API_ERRORS.internalServerError;
    break;
  default:
    error = new APIError();
  }
  error.response = response;
  return Promise.reject(error);
}


function alertAPIErrors(error) {
  switch (error.case) {
  case API_ERRORS.permissionError:
    alert('You don\'t have the necessary permission to view this information or perform this action.');
    break;
  case API_ERRORS.notFoundError:
    alert('We could not find the requested resource on the server.');
    break;
  case API_ERRORS.internalServerError:
    alert('There is a problem with the server - please try again later.');
    break;
  case API_ERRORS.networkError:
    alert('There seems to be problem with your network connection. Please check and try again.');
    break;
  default:
    // No alert on default exception
  }
}

export { renkuFetch, APIError, API_ERRORS, alertAPIErrors}

import config from "../config";
import fetch, { Headers, Request } from "cross-fetch";
import logger from "../logger";

export const RETURN_TYPES = {
  json: "json",
  text: "text",
  full: "full"
};

export const FETCH_DEFAULT = {
  options: {
    headers: new Headers()
  },
  returnType: RETURN_TYPES.json,
};

type QueryParams = {
  [key: string]: string
}

interface FetchOptions {
  headers?: Headers;
  queryParams?: QueryParams;
  credentials?: RequestCredentials;
}

class APIClient {

  gatewayUrl: string;

  constructor() {
    this.gatewayUrl = config.deployment.gatewayUrl;
  }

  /**
   * Fetch session status
   *
   */
  async sessionStatus(authHeathers: Record<string, string>): Promise<Response> {
    const sessionsUrl = `${this.gatewayUrl}/notebooks/servers`;
    logger.info(`Fetching session status `, sessionsUrl);
    const options = {
      headers: authHeathers as unknown as Headers ?? new Headers(),
    };
    return this.clientFetch(sessionsUrl, options, RETURN_TYPES.json);
  }

  /**
   * A fetch method which is attached to an API client instance
   * Optional arguments default values are set from FETCH_DEFAULT.
   *
   * @param {string} url - Target API url
   * @param {object} [options] - Fetch options, like method, headers, body, ... Default only include basic headers.
   * @param {string} [returnType] - Expected content type. Allowed values are "json" (default), "text" and "full".
   */
  async clientFetch(
    url: string,
    options = FETCH_DEFAULT.options,
    returnType = FETCH_DEFAULT.returnType,
  ): Promise<Response> {
    return this._renkuFetch(url, options)
      .catch((error: unknown) => {
        return Promise.reject(error);
      })
      .then((response: Response) => {
        if (!response)
          return null;
        switch (returnType) {
          case RETURN_TYPES.json:
            try {
              return response.json();
            }
            catch (e) {
              return Promise.reject(e);
            }
          case RETURN_TYPES.text:
            return response.text();
          case RETURN_TYPES.full:
            return response;
          default:
            return response;
        }
      });
  }

  _renkuFetch(url: string, options: FetchOptions): Promise<Response> {
    const urlObject = new URL(url);
    if (options?.queryParams) {
      Object.keys(options.queryParams).forEach((key) => {
        urlObject.searchParams.append(key, options.queryParams[key]);
      });
    }

    // This is the default behavior for most browsers.
    options["credentials"] = "same-origin";
    const request = new Request(urlObject.toString());

    return fetch(request, options)
      .catch((fetchError) => {
        return Promise.reject(fetchError);
      })
      .then((response) => {
        if (response.status >= 200 && response.status < 300)
          return response;
        return Promise.reject(response);
      });
  }
}

export default APIClient;

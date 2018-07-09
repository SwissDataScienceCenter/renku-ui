import { APIError, alertAPIErrors } from './renkuFetch';
import { GitlabClient } from './client';

const ACCESS_LEVELS = {
  GUEST: 10,
  REPORTER: 20,
  DEVELOPER: 30,
  MAINTAINER: 40,
  OWNER: 50,
};

export default GitlabClient;
export { alertAPIErrors, APIError, ACCESS_LEVELS };

import { APIError, alertAPIErrors } from './errors';
import { GitlabClient } from './client';

const ACCESS_LEVELS = {
  GUEST: 10,
  REPORTER: 20,
  DEVELOPER: 30,
  MASTER: 40,
  OWNER: 50,
};

export default GitlabClient;
export { alertAPIErrors, APIError, ACCESS_LEVELS };

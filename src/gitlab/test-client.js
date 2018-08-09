import * as samples from './test-samples'
import { carveProject } from './client';

const methods = {
  getProjects: {
    responseData: samples.projects
  },
  getProject: {
    responseData: carveProject(samples.projects[0])
  },
  getProjectReadme: {
    responseData: samples.projectReadme
  },
  getProjectFile: {
    responseData: samples.projectNotebookFile
  },
  getProjectKus: {
    responseData: samples.kus
  },
  getProjectKu: {
    responseData: samples.kus[0]
  },
  getModifiedFiles: {
    responseData: []
  },
  getContributions: {
    responseData: []
  },
  getRepositoryTree: {
    responseData: []
  },
  getMergeRequests: {
    responseData: []
  },
  getBranches: {
    responseData: []
  },
  getJobs: {
    responseData: []
  },
};

let client = {};
for (let key in methods) {
  client[key] = function(){
    return new Promise(resolve => {
      resolve(methods[key].responseData)
    });
  }
}

export default client;

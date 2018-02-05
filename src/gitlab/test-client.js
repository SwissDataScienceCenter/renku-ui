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
  getProjectKus: {
    responseData: samples.kus
  },
  getProjectKu: {
    responseData: samples.kus[0]
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

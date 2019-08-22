/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as samples from './test-samples'
import { carveProject } from './project';

const methods = {
  getProjects: {
    response: {
      data: samples.projects,
      pagination: {
        currentPage: 1,
        totalItems: 1,
      }
    }
  },
  getProject: {
    response: {
      data: carveProject(samples.projects[0])
    }
  },
  getProjectReadme: {
    response: {
      data: samples.projectReadme
    }
  },
  getProjectFile: {
    response: samples.projectNotebookFile
  },
  getProjectKus: {
    response: {
      data: samples.kus
    }
  },
  getProjectKu: {
    response: {
      data: samples.kus[0]
    }
  },
  getModifiedFiles: {
    response: {
      data: []
    }
  },
  getContributions: {
    response: {
      data: []
    }
  },
  getRepositoryTree: {
    response: []
  },
  getMergeRequests: {
    response: {
      data: []
    }
  },
  getBranches: {
    response: {
      data: []
    }
  },
  getNamespaces: {
    response: {
      data: samples.namespaces
    }
  },
  getUser: {
    response: {
      data: samples.user
    }
  },
  getNotebookServers: {
    response: {
      data: []
    }
  },
  getRepositoryFile: {
    response: null
  },
  getNotebookServerUrl: {
    response: null
  },
  getProjectTemplates: {
    response: []
  },
  getNotebookServerOptions: {
    response: {}
  }
};

let client = {};
for (let key in methods) {

  client[key] = function(){
    return new Promise(resolve => {
      resolve(methods[key].response)
    });
  }
}

export default client;

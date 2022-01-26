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

import * as samples from "./test-samples";
import { carveProject } from "./project";

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
  getProjectById: {
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
  getProjectIssues: {
    response: {
      data: samples.issues
    }
  },
  getProjectIssue: {
    response: {
      data: samples.issues[0]
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
  getProjectTemplates: {
    response: []
  },
  getNotebookServerOptions: {
    response: {}
  },
  getCommits: {
    response: {
      data: []
    }
  },
  getGroupByPath: {
    response: {
      data: {}
    }
  },
  getUserByPath: {
    response: {
      data: []
    }
  },
  getAllProjects: {
    response: {
      data: []
    }
  },
  getAllProjectsGraphQL: {
    response: {
      data: []
    }
  },
  getTemplatesManifest: {
    response: {
      result: {
        templates: []
      }
    }
  },
  searchDatasets: {
    response: {
      data: []
    }
  },
  fetchDatasetFromKG: {
    "name": "test-dataset-name",
    "title": "Test dataset title",
    "description": "some description for a dataset",
    "published": {
      "creator": [{
        "name": "First, Creator",
        "email": null,
        "affiliation": "Some Affiliation"
      }],
      "datePublished": "01/01/2001",
    },
    "identifier": "79215657-4319-4fcf-82b9-58267f2a1db8", // eslint-disable-line
    "keywords": ["test1", "test2", "test3"],
    "hasPart": [
      { "name": "Data file 1.xls", "atLocation": "data/test_dataset/Data file 1.xls" }
    ],
    "url": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "sameAs": "https://dev.renku.ch/datasets/79215657-4319-4fcf-82b9-58267f2a1db8",
    "usedIn": []
  },
  isValidUrlForIframe: {
    response: true
  }
};

let client = {};
for (let key in methods) {
  client[key] = function() {
    return new Promise(resolve => {
      resolve(methods[key].response);
    });
  };
}
client.baseUrl = "some-url";
client.uiserverUrl = "https://dev.renku.ch/ui-server";

export default client;

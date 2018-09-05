/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fetchJson } from './renkuFetch';


// NOTE: An unregistered user can do 60 GitHub api requests per hour max meaning,
//       that this approach fails when trying to create more than 30 projects
//       per hour. I think we can live with that for the moment. However, it might
//       make sense at some point to serve the project template from the GitLab
//       instance we're working with.

function getPayload(projectName, renkuVersion){

  const TEMPLATE_REPO_URL = 'https://api.github.com/repos/SwissDataScienceCenter/renku-project-template/git/trees/'

  // Promise which will resolve into the repository sub-tree
  // which matches the desired version of the renku project template.
  const subTreePromise = fetchJson(TEMPLATE_REPO_URL + 'master')
    .then(data => data.tree.filter(obj => obj.path === renkuVersion)[0]['sha'])
    .then(treeSha => fetchJson(`${TEMPLATE_REPO_URL}${treeSha}?recursive=1`));

  // Promise which will resolve into a list of file creation actions
  // ready to be passed to the GitLab API.
  const actionsPromise = subTreePromise.then(subtree => {
    const actionPromises = subtree.tree
      .filter(treeObject => treeObject.type === 'blob')
      .map(treeObject => getActionPromise(treeObject, projectName));
    return Promise.all(actionPromises);
  })

  // We finally return a promise which will resolve into the full
  // payload for the first commit to the newly created project.
  return actionsPromise.then((resolvedActions) => {
    return {
      'branch': 'master',
      'commit_message': 'init renku repository',
      'actions': resolvedActions
    }
  });
}


function getActionPromise(treeObject, projectName) {

  return fetchJson(treeObject.url)
    .then(data => atob(data.content))
    .then(fileContent => {
      return {
        'action': 'create',
        'file_path': treeObject.path,
        'content': evaluateTemplate(fileContent, projectName)
      }
    });
}


function evaluateTemplate(content, projectName) {

  const now = new Date();
  const templatedVariables = {
    'name': projectName,
    'date-updated': now.toISOString(),
    'date-created': now.toISOString(),
  };

  const newContent = content.replace(/{{\s?([^\s]*)\s?}}/g, (match, group) => {
    return templatedVariables[group]
  });
  return newContent;
}

export { getPayload }

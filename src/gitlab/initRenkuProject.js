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

function getPayload(projectName){

  const TEMPLATE_URL = 'https://raw.githubusercontent.com/SwissDataScienceCenter/renku-project-template/master/latest/';

  const actions = [
    {
      'action': 'create',
      'file_path': '.gitlab-ci.yml',
    },
    {
      'action': 'create',
      'file_path': '.gitignore',
    },
    {
      'action': 'create',
      'file_path': '.renku/metadata.yml',
    },
    {
      'action': 'create',
      'file_path': 'Dockerfile',
    },
    {
      'action': 'create',
      'file_path': 'requirements.txt',
    },
    {
      'action': 'create',
      'file_path': 'README.md',
    }
  ];


  const actionPromises = actions.map((action) => {
    return fetch(`${TEMPLATE_URL}${action.file_path}`)
      .then((resp) => resp.text())
      .then((content) => {
        return {...action, 'content': evaluateTemplate(content, projectName)}
      });
  });

  return Promise.all(actionPromises).then((resolvedActions) => {
    return {
      'branch': 'master',
      'commit_message': 'init renku repository',
      'actions': resolvedActions
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

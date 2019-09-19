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

// title.Author: Alex K. - https://stackoverflow.com/users/246342/alex-k
// Source: https://stackoverflow.com/questions/6507056/replace-all-whitespace-characters/6507078#6507078
import showdown from 'showdown';
import DOMPurify from 'dompurify';

const AUTOSAVED_PREFIX = "renku/autosave/";

const slugFromTitle = (title) => title.replace(/\s/g, '-').toLowerCase();

function getActiveProjectPathWithNamespace(currentPath) {
  try {
    if(currentPath.includes('/projects/') && currentPath.split('/').length > 3 ){
      return currentPath.split('/')[1]+'/'+currentPath.split('/')[2]
    } return null;
  } catch(TypeError) {
    return null
  }
}

function splitAutosavedBranches(branches) {
  const autosaved = branches
    .filter(branch => branch.name.startsWith(AUTOSAVED_PREFIX))
    .map(branch => {
      let autosave = {}
      const autosaveData = branch.name.replace(AUTOSAVED_PREFIX, "").split("/");
      [ autosave.namespace, autosave.branch, autosave.commit, autosave.finalCommit ] = autosaveData;
      return {...branch, autosave};
    });
  const standard = branches.filter(branch => !branch.name.startsWith(AUTOSAVED_PREFIX));
  return { standard, autosaved };
}

function sanitizedHTMLFromMarkdown(markdown) {
  const converter = new showdown.Converter();
  const htmlFromMarkdown = converter.makeHtml(markdown);
  return DOMPurify.sanitize(htmlFromMarkdown)
}

export { slugFromTitle, getActiveProjectPathWithNamespace, splitAutosavedBranches, sanitizedHTMLFromMarkdown }

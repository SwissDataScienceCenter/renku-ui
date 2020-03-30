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
import showdown from "showdown";
import DOMPurify from "dompurify";

const AUTOSAVED_PREFIX = "renku/autosave/";

const slugFromTitle = (title) => title.replace(/\s/g, "-").toLowerCase();

function getActiveProjectPathWithNamespace(currentPath) {
  try {
    if (currentPath.includes("/projects/") && currentPath.split("/").length > 3 )
      return currentPath.split("/")[2] + "/" + currentPath.split("/")[3];
    return null;
  }
  catch (TypeError) {
    return null;
  }
}

function splitAutosavedBranches(branches) {
  const autosaved = branches
    .filter(branch => branch.name.startsWith(AUTOSAVED_PREFIX))
    .map(branch => {
      let autosave = {};
      const autosaveData = branch.name.replace(AUTOSAVED_PREFIX, "").split("/");
      [ autosave.namespace, autosave.branch, autosave.commit, autosave.finalCommit ] = autosaveData;
      return { ...branch, autosave };
    });
  const standard = branches.filter(branch => !branch.name.startsWith(AUTOSAVED_PREFIX));
  return { standard, autosaved };
}

function sanitizedHTMLFromMarkdown(markdown) {
  // Reference: https://github.com/showdownjs/showdown/wiki/Showdown-Options
  const showdownOptions = {
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    disableForced4SpacesIndentedSublists: true,
    emoji: true
  };
  const showdownClasses = {
    table: "table"
  };
  // Reference: https://github.com/showdownjs/showdown/wiki/Add-default-classes-for-each-HTML-element
  const bindings = Object.keys(showdownClasses).map(key => ({
    type: "output",
    regex: new RegExp(`<${key}(.*?)(?:(class="([^"]*)")(.*))?>`, "g"),
    replace: `<${key} $1 class="$3 ${showdownClasses[key]}" $4>`
  }));

  const converter = new showdown.Converter({ ...showdownOptions, extensions: [...bindings] });
  const htmlFromMarkdown = converter.makeHtml(markdown);
  return DOMPurify.sanitize(htmlFromMarkdown);
}

function simpleHash(str) {
  let i, l, hval = 0x0128a9d4;
  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
}

function parseINIString(data) {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
  };
  const lines = data.split(/[\r\n]+/);
  let section = null;
  let value = {};
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return;
    }
    else if (regex.param.test(line)) {
      let match = line.match(regex.param);
      if (section)
        value[section][match[1]] = match[2];
      else
        value[match[1]] = match[2];

    }
    else if (regex.section.test(line)) {
      let match = line.match(regex.section);
      value[match[1]] = {};
      section = match[1];
    }
    else if (line.length === 0 && section) {
      section = null;
    }
  });
  return value;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export { slugFromTitle, getActiveProjectPathWithNamespace, splitAutosavedBranches, sanitizedHTMLFromMarkdown };
export { simpleHash, parseINIString, formatBytes };

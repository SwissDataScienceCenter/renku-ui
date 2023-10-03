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

import XRegExp from "xregexp";

const AUTOSAVED_PREFIX = "renku/autosave/";

function convertUnicodeToAscii(string) {
  // eslint-disable-next-line
  // ? REF: https://github.com/gitlabhq/gitlabhq/blob/7942fe679107b5e73e0b359f000946dbbf2feb35/app/assets/javascripts/lib/utils/text_utility.js#L278-L351
  const unicodeConversion = [
    [/[ÀÁÂÃÅĀĂĄ]/g, "A"],
    [/[Æ]/g, "AE"],
    [/[ÇĆĈĊČ]/g, "C"],
    [/[ÈÉÊËĒĔĖĘĚ]/g, "E"],
    [/[ÌÍÎÏĨĪĬĮİ]/g, "I"],
    [/[Ððĥħ]/g, "h"],
    [/[ÑŃŅŇŉ]/g, "N"],
    [/[ÒÓÔÕØŌŎŐ]/g, "O"],
    [/[ÙÚÛŨŪŬŮŰŲ]/g, "U"],
    [/[ÝŶŸ]/g, "Y"],
    [/[Þñþńņň]/g, "n"],
    [/[ßŚŜŞŠ]/g, "S"],
    [/[àáâãåāăąĸ]/g, "a"],
    [/[æ]/g, "ae"],
    [/[çćĉċč]/g, "c"],
    [/[èéêëēĕėęě]/g, "e"],
    [/[ìíîïĩīĭį]/g, "i"],
    [/[òóôõøōŏő]/g, "o"],
    [/[ùúûũūŭůűų]/g, "u"],
    [/[ýÿŷ]/g, "y"],
    [/[ĎĐ]/g, "D"],
    [/[ďđ]/g, "d"],
    [/[ĜĞĠĢ]/g, "G"],
    [/[ĝğġģŊŋſ]/g, "g"],
    [/[ĤĦ]/g, "H"],
    [/[ıśŝşš]/g, "s"],
    [/[Ĳ]/g, "IJ"],
    [/[ĳ]/g, "ij"],
    [/[Ĵ]/g, "J"],
    [/[ĵ]/g, "j"],
    [/[Ķ]/g, "K"],
    [/[ķ]/g, "k"],
    [/[ĹĻĽĿŁ]/g, "L"],
    [/[ĺļľŀł]/g, "l"],
    [/[Œ]/g, "OE"],
    [/[œ]/g, "oe"],
    [/[ŔŖŘ]/g, "R"],
    [/[ŕŗř]/g, "r"],
    [/[ŢŤŦ]/g, "T"],
    [/[ţťŧ]/g, "t"],
    [/[Ŵ]/g, "W"],
    [/[ŵ]/g, "w"],
    [/[ŹŻŽ]/g, "Z"],
    [/[źżž]/g, "z"],
    [/ö/g, "oe"],
    [/ü/g, "ue"],
    [/ä/g, "ae"],
    [/Ö/g, "Oe"],
    [/Ü/g, "Ue"],
    [/Ä/g, "Ae"],
  ];

  let convertedString = string;

  unicodeConversion.forEach(([regex, replacer]) => {
    convertedString = convertedString.replace(regex, replacer);
  });

  return convertedString;
}

/**
 * Create the project slug from the project name. This should be kept in line with the GitLab slugify function
 *
 * @param {string} title - the project name
 * @param {bool} lower - convert to lowercase
 * @param {string} separator - string to replace invalid characters
 */
function slugFromTitle(
  title,
  lower = false,
  unicodeConversion = false,
  separator = "-"
) {
  // eslint-disable-next-line
  // ? REF: https://github.com/gitlabhq/gitlabhq/blob/7942fe679107b5e73e0b359f000946dbbf2feb35/app/assets/javascripts/lib/utils/text_utility.js#L48-L65
  const rawProjectName = lower ? title.trim().toLowerCase() : title.trim();
  const convertedString = unicodeConversion
    ? convertUnicodeToAscii(rawProjectName)
    : rawProjectName;
  const slug = convertedString
    .replace(/[^a-zA-Z0-9-]+/g, separator) // remove invalid chars
    .split(separator)
    .filter(Boolean)
    .join(separator); // remove separators duplicates

  if (slug === separator) return "";
  return slug;
}

function verifyTitleCharacters(title) {
  const regexPattern = XRegExp("^(\\pL|\\d|\\_|\\-|\\.|\\ )*$");
  return regexPattern.test(title);
}

function getActiveProjectPathWithNamespace(currentPath) {
  try {
    if (currentPath.includes("/projects/") && currentPath.split("/").length > 3)
      return currentPath.split("/")[2] + "/" + currentPath.split("/")[3];
    return null;
  } catch (TypeError) {
    return null;
  }
}

function splitAutosavedBranches(branches) {
  const autosaved = branches
    .filter((branch) => branch.name.startsWith(AUTOSAVED_PREFIX))
    .map((branch) => {
      let autosave = {};
      const autosaveData = branch.name.replace(AUTOSAVED_PREFIX, "").split("/");
      [
        autosave.username,
        autosave.branch,
        autosave.commit,
        autosave.finalCommit,
      ] = autosaveData;
      return { ...branch, autosave };
    });
  const standard = branches.filter(
    (branch) => !branch.name.startsWith(AUTOSAVED_PREFIX)
  );
  return { standard, autosaved };
}

function simpleHash(str) {
  let i,
    l,
    hVal = 0x0128a9d4;
  for (i = 0, l = str.length; i < l; i++) {
    hVal ^= str.charCodeAt(i);
    hVal +=
      (hVal << 1) + (hVal << 4) + (hVal << 7) + (hVal << 8) + (hVal << 24);
  }
  return ("0000000" + (hVal >>> 0).toString(16)).substr(-8);
}

function parseINIString(data) {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/,
  };
  const lines = data.split(/[\r\n]+/);
  let section = null;
  let value = {};
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return;
    } else if (regex.param.test(line)) {
      let match = line.match(regex.param);
      if (section) value[section][match[1]] = match[2];
      else value[match[1]] = match[2];
    } else if (regex.section.test(line)) {
      let match = line.match(regex.section);
      value[match[1]] = {};
      section = match[1];
    } else if (line.length === 0 && section) {
      section = null;
    }
  });
  return value;
}

/**
 * Return a human readable number of bytes or its power.
 *
 * @param {number} bytes - Number to render as human readable
 * @param {number} decimals - Number of decimals
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  // this prevents the function to break on negative numbers, even if they are not particularly interesting
  let sign = "";
  if (bytes < 0) {
    sign = "-";
    bytes = -bytes;
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (isNaN(i)) return i.toString();

  return (
    sign + parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

/**
 * Function to group an array per key getter, returns a grouped map
 * @param {*} list array to be grouped
 * @param {*} keyGetter function that returns the key from an item inside the list
 */
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) map.set(key, [item]);
    else collection.push(item);
  });
  return map;
}

function gitLabUrlFromProfileUrl(webUrl) {
  const comps = webUrl.split("/");
  comps.pop();
  return comps.join("/");
}

function isURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

function hasSpecialCharacters(text) {
  const spCharts = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/; // eslint-disable-line
  return spCharts.test(text);
}

/**
 * Refresh the data when they are not available or older than `tolerance`, preventing simultaneous invokations.
 *
 * @param {boolean} fetching - whether any fetching operation is currently ongoing.
 * @param {date} fetched - last fetcheing date.
 * @param {function} action -function to invoke to refresh the data. That should automatically change
 *   `fetched` and `fetching`
 * @param {number} [tolerance] - Maximum age (in seconds) of the data before refreshing them. Default is 10.
 */
function refreshIfNecessary(fetching, fetched, action, tolerance = 10) {
  if (fetching) return;
  const now = new Date();
  if (!fetched || now - fetched > tolerance * 1000) return action();
}

/**
 * Simulate a sleep function.
 * @param {number} seconds - length of the sleep time span in seconds
 * @example await sleep(0.5) // sleep for 0.5 seconds
 */
async function sleep(seconds) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}

/**
 * Generate a .zip file and save it
 * @param {object} files - files to include in the .zip, It has the format  [{ name, content }...]
 * for the files name and content
 * @param {string} name -  name for the .zip file
 */
const generateZip = async (files, name) => {
  if (!files.length && !name) return;

  const JSZip = await require("jszip");
  const { saveAs } = await require("file-saver");
  const zip = new JSZip();

  for (const file of files) zip.file(file?.name, file?.content);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${name}.zip`);
};

/**
 * Capitalize the first character of all words in a string
 * @param {string} text - text to capitalize
 * @example capitalizeFirstLetter("hello world!") returns "Hello World"
 */
const capitalizeFirstLetter = (text) =>
  text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);

/**
 * Capitalize a string.
 * @param {string} aString
 */
function toCapitalized(aString) {
  return aString.charAt(0).toUpperCase() + aString.slice(1);
}

/**
 * computeVisibilities.
 * @param {string[]} options
 */
const computeVisibilities = (options) => {
  if (options.includes("private")) {
    return {
      visibilities: ["private"],
      disabled: ["public", "internal"],
      default: "private",
    };
  } else if (options.includes("internal")) {
    return {
      visibilities: ["private", "internal"],
      disabled: ["public"],
      default: "internal",
    };
  }
  return {
    visibilities: ["private", "internal", "public"],
    disabled: [],
    default: "public",
  };
};

function stylesByItemType(itemType) {
  switch (itemType) {
    case "project":
      return {
        colorText: "text-rk-green",
        bgColor: "rk-green",
      };
    case "dataset":
      return {
        colorText: "text-rk-pink",
        bgColor: "rk-pink",
      };
    case "workflow":
      return {
        colorText: "text-rk-yellow",
        bgColor: "rk-yellow",
      };
    default:
      return {
        colorText: "text-rk-green",
        bgColor: "rk-green",
      };
  }
}

/**
 * Display a file with some metadata. Has the following parameters:
 *
 * @param {ImagesLinks[]} images - Images link arrays
 */
function getEntityImageUrl(images) {
  try {
    // images could contain previous image url, so we get the last in the array.
    const index = images?.length - 1;
    return images[index]["_links"][0].href;
  } catch {
    return undefined;
  }
}

export {
  capitalizeFirstLetter,
  generateZip,
  computeVisibilities,
  slugFromTitle,
  getActiveProjectPathWithNamespace,
  splitAutosavedBranches,
  simpleHash,
  parseINIString,
  formatBytes,
  getEntityImageUrl,
  groupBy,
  gitLabUrlFromProfileUrl,
  isURL,
  verifyTitleCharacters,
  convertUnicodeToAscii,
  refreshIfNecessary,
  sleep,
  toCapitalized,
  stylesByItemType,
  AUTOSAVED_PREFIX,
  hasSpecialCharacters,
};

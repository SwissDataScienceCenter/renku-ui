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

const AUTOSAVED_PREFIX = "renku/autosave/";

function convertUnicodeToAscii(string) {
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

/**
 * Generate a .zip file and save it
 * @param {object} files - files to include in the .zip, It has the format  [{ name, content }...]
 * for the files name and content
 * @param {string} name -  name for the .zip file
 */
const generateZip = async (files, name) => {
  if (!files.length && !name) return;

  const JSZip = (await import("jszip")).default;
  const { saveAs } = (await import("file-saver")).default;
  const zip = new JSZip();

  for (const file of files) zip.file(file?.name, file?.content);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${name}.zip`);
};

export { generateZip, slugFromTitle, convertUnicodeToAscii };

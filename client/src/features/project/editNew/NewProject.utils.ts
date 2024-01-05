import { Url } from "../../../utils/helpers/url";
import { btoaUTF8 } from "../../../utils/helpers/Encoding";
import { TemplateVariable } from "./NewProject.types";
import {
  slugFromTitle,
  verifyTitleCharacters,
} from "../../../utils/helpers/HelperFunctions";
import { GitlabProjectResponse } from "../Project";
import { NewProjectFormFields } from "../projectKg.types";
import { UseFormSetError } from "react-hook-form";
import { useHistory } from "react-router-dom";

// ? reference https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names
const RESERVED_TITLE_NAMES = [
  "badges",
  "blame",
  "blob",
  "builds",
  "commits",
  "create",
  "create_dir",
  "edit",
  "sessions/folders",
  "files",
  "find_file",
  "gitlab-lfs/objects",
  "info/lfs/objects",
  "new",
  "preview",
  "raw",
  "refs",
  "tree",
  "update",
  "wikis",
];

export async function redirectAfterSubmit(
  history: ReturnType<typeof useHistory>,
  projectPathWithNamespace: string,
  state: unknown
) {
  history.push({
    pathname: `/projects/${projectPathWithNamespace}`,
    state,
  });
}

export const createEncodedNewProjectUrl = (data: Record<string, unknown>) => {
  if (!data || !Object.keys(data).length)
    return Url.get(Url.pages.project.new, {}, true);
  const encodedContent = btoaUTF8(JSON.stringify(data));
  return Url.get(Url.pages.project.new, { data: encodedContent }, true);
};

export function getDefaultTemplateVariables(
  variables: Record<string, TemplateVariable>
) {
  const defaultValues: Record<string, unknown> = {};
  Object.keys(variables).map((variableKey) => {
    defaultValues[variableKey] =
      variables && variables[variableKey].default_value;
  });
  return defaultValues;
}

/**
 * Verify whether the title is valid.
 *
 * @param {string} title - title to validate.
 * @returns {string} error description or null if the string is valid.
 */
export function validateTitle(title: string) {
  if (!title || !title.length) return "Title is missing.";
  else if (RESERVED_TITLE_NAMES.includes(title)) return "Reserved title name.";
  else if (title.length && ["_", "-", " ", "."].includes(title[0]))
    return "Title must start with a letter or a number.";
  else if (!verifyTitleCharacters(title))
    return "Title can contain only letters, digits, '_', '.', '-' or spaces.";
  else if (title && !slugFromTitle(title, true))
    return "Title must contain at least one letter (without any accents) or a number.";
  return null;
}

/**
 * Verify whether the title and namespace will produce a duplicate.
 *
 * @param {string} title - current title.
 * @param {string} namespace - current namespace.
 * @param {string[]} projectsPaths - list of current own projects paths.
 * @returns {boolean} whether the title would create a duplicate or not.
 */
export function checkTitleDuplicates(
  title: string,
  namespace: string,
  projectsPaths: string[]
) {
  if (!title || !namespace || !projectsPaths || !projectsPaths.length)
    return false;

  const expectedTitle = slugFromTitle(title, true);
  const expectedSlug = `${namespace}/${expectedTitle}`;
  if (projectsPaths.includes(expectedSlug)) return true;

  return false;
}

export function validateNewProjectName(
  name: string,
  namespace: string,
  userProjects: GitlabProjectResponse[],
  setError: UseFormSetError<NewProjectFormFields>
) {
  const titleNotValid = validateTitle(name);
  if (titleNotValid) {
    setError("name", { type: "custom", message: titleNotValid });
  } else {
    const projectWithFullPaths = userProjects?.map(
      (p: GitlabProjectResponse) => p.path_with_namespace
    );
    const isDuplicate = checkTitleDuplicates(
      name,
      namespace,
      projectWithFullPaths
    );
    if (isDuplicate) {
      setError("name", {
        type: "custom",
        message:
          "Title produces a project identifier (" +
          slugFromTitle(name, true) +
          ") that is already taken in the selected namespace. " +
          "Please select a different title or namespace.",
      });
    }
  }
}

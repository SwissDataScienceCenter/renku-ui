/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { groupBy } from "lodash-es";

const projectIdRegex = /^\d+$/;

interface SplitProjectSubRouteResult {
  namespace: string | null;
  projectPathWithNamespace: string | null;
  projectId: string | null;
  baseUrl: string | null;
}

const subRoutes = {
  overview: "overview",
  stats: "overview/stats",
  overviewDatasets: "overview/datasets",
  overviewCommits: "overview/commits",
  datasets: "datasets",
  datasetsAdd: "datasets/new",
  dataset: "datasets/:datasetId",
  datasetEdit: "datasets/:datasetId/modify",
  files: "files",
  fileContent: "blob",
  notebook: "files/blob/:filePath([^.]+.ipynb)",
  lineages: "files/lineage",
  lineage: "files/lineage/:filePath+",
  data: "files/data",
  workflow: "workflows/:id",
  workflowSingle: "workflow/:id",
  workflows: "workflows",
  settings: "settings",
  settingsSessions: "settings/sessions",
  settingsStorage: "settings/storage",
  sessions: "sessions",
  sessionNew: "sessions/new",
  showSession: "sessions/show/:server",
};

const srMap = groupBy(Object.values(subRoutes), (v) => v.split("/").length);
const maxSrMapDepth = Math.max(
  ...Object.keys(srMap).map((k) => Number.parseInt(k))
);

function accumulateIntoProjectPath(
  projectPathWithNamespace: string,
  comps: string[]
) {
  if (comps.length === 0) return projectPathWithNamespace;

  // check if any of these match
  const routes = srMap[Math.min(comps.length, maxSrMapDepth)];
  for (let i = 0; i < routes.length; ++i) {
    const routeComps = routes[i].split("/");
    let matches = true;
    for (let j = 0; j < routeComps.length && matches; ++j) {
      if (routeComps[j].startsWith(":")) continue;
      if (routeComps[j] !== comps[j]) matches = false;
    }
    if (matches) return projectPathWithNamespace;
  }
  // Add one level to the projectPathWithNamespace
  return accumulateIntoProjectPath(
    `${projectPathWithNamespace}/${comps[0]}`,
    comps.slice(1)
  );
}

function splitProjectSubRoute(subUrl: string): SplitProjectSubRouteResult {
  const result: SplitProjectSubRouteResult = {
    namespace: null,
    projectPathWithNamespace: null,
    projectId: null,
    baseUrl: null,
  };
  if (subUrl == null) return result;

  const baseUrl = subUrl.endsWith("/") ? subUrl.slice(0, -1) : subUrl;
  const projectSubRoute = baseUrl.startsWith("/projects/")
    ? baseUrl.slice(10)
    : baseUrl;
  const comps = projectSubRoute.split("/");
  if (comps.length < 1) return result;

  // This could be a route that just provides a projectId
  if (projectIdRegex.test(comps[0])) {
    result.projectId = comps[0];
    result.baseUrl = `/projects/${result.projectId}`;
    return result;
  }
  if (comps.length < 2) {
    result.namespace = comps[0];
    return result;
  }

  result.projectPathWithNamespace = comps.slice(0, 2).join("/");
  if (comps.length > 2) {
    // We need to check if we need to accumulate more components into the projectPathWithNamespace
    result.projectPathWithNamespace = accumulateIntoProjectPath(
      result.projectPathWithNamespace,
      comps.slice(2)
    );
  }

  if (result.projectId != null) {
    result.baseUrl = `/projects/${result.projectId}`;
  } else {
    result.baseUrl = `/projects/${result.projectPathWithNamespace}`;
    result.namespace = result.projectPathWithNamespace.slice(
      0,
      result.projectPathWithNamespace.lastIndexOf("/")
    );
  }

  return result;
}

/** Helper function to convert renkulab URLs into source URLs */
export function locationPathnameToSourceUrl(
  pathname: string
): string | undefined {
  const urlInfo = splitProjectSubRoute(pathname);
  if (urlInfo.baseUrl == null) return undefined;
  return encodeURIComponent(urlInfo.baseUrl);
}

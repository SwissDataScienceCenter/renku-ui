/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useRecentlyViewedEntitiesQuery } from "../../features/kgSearch/kgSearch.api";
import { Session } from "../helpers/SessionFunctions";

/**
 *  useGetRecentlyVisitedProjects custom hook
 *
 *  useGetRecentlyVisitedProjects.ts
 *  hook to fetch recently visited projects and filter out those that have a session to avoid duplication
 */
function useGetRecentlyVisitedProjects(
  projectsCount: number,
  currentSessions: Session[]
) {
  // number of projects to fetch according to current sessions to avoid duplication
  const totalProjectsToRequest =
    currentSessions.length >= projectsCount
      ? currentSessions.length + 3
      : projectsCount;
  const totalProjectsToReturn =
    currentSessions.length >= projectsCount
      ? 3
      : projectsCount - currentSessions.length;

  const { data, isFetching, refetch } = useRecentlyViewedEntitiesQuery({
    limit: totalProjectsToRequest,
    types: { project: true },
  });

  let projectsToShow = data;
  if (
    !isFetching &&
    data != null &&
    data.length > 0 &&
    currentSessions.length > 0
  ) {
    const sessionProjectIds = currentSessions.map(
      (session) =>
        `${session.annotations["namespace"]}/${session.annotations["projectName"]}`
    );
    projectsToShow = data
      .filter((project) => !sessionProjectIds.includes(`${project.slug}`))
      .splice(0, totalProjectsToReturn);
  }
  return {
    projects: projectsToShow,
    isFetchingProjects: isFetching,
    refetchProjects: refetch,
  };
}

export default useGetRecentlyVisitedProjects;

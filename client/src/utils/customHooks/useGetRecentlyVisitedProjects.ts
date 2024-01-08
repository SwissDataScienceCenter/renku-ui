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

import { useMemo } from "react";
import { useGetRecentlyVisitedProjectsQuery } from "../../features/projects/projects.api";
import { Session } from "../helpers/SessionFunctions";

interface UseGetRecentlyVisitedProjectsArgs {
  projectsCount: number;
  currentSessions: Session[];
  pinnedProjectSlugs: string[];
  skip?: boolean;
}

/**
 *  useGetRecentlyVisitedProjects custom hook
 *
 *  useGetRecentlyVisitedProjects.ts
 *  hook to fetch recently visited projects and filter out those that have a session to avoid duplication
 */
function useGetRecentlyVisitedProjects({
  currentSessions,
  pinnedProjectSlugs,
  projectsCount,
  skip,
}: UseGetRecentlyVisitedProjectsArgs) {
  const totalProjectsToRequest =
    projectsCount + pinnedProjectSlugs.length + currentSessions.length;

  const queryResult = useGetRecentlyVisitedProjectsQuery(
    totalProjectsToRequest,
    { skip }
  );

  const projectsToShow = useMemo(() => {
    if (queryResult.data == null || queryResult.data.length == 0) {
      return queryResult.data;
    }

    const sessionProjectIds = currentSessions.map(
      (session: Session) => session.annotations["gitlabProjectId"]
    );
    return queryResult.data
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (project: Record<string, any>) =>
          !sessionProjectIds.includes(`${project.id}`)
      )
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (project: Record<string, any>) =>
          !pinnedProjectSlugs.find(
            (slug) =>
              slug.toLowerCase() ===
              project["path_with_namespace"].toLowerCase()
          )
      )
      .slice(0, projectsCount);
  }, [currentSessions, pinnedProjectSlugs, projectsCount, queryResult.data]);

  return {
    ...queryResult,
    data: projectsToShow,
  };
}

export default useGetRecentlyVisitedProjects;

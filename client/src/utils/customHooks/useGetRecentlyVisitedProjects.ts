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

import { useGetRecentlyVisitedProjectsQuery } from "../../features/projects/projectsApi";
import { Session } from "../helpers/SessionFunctions";

interface UseGetRecentlyVisitedProjectsArgs {
  projectsCount: number;
  currentSessions: Session[];
  skip?: boolean;
}

/**
 *  useGetRecentlyVisitedProjects custom hook
 *
 *  useGetRecentlyVisitedProjects.ts
 *  hook to fetch recently visited projects and filter out those that have a session to avoid duplication
 */
export default function useGetRecentlyVisitedProjects({
  currentSessions,
  projectsCount,
  skip,
}: UseGetRecentlyVisitedProjectsArgs) {
  // number of projects to fetch according to current sessions to avoid duplication
  const totalProjectsToRequest =
    currentSessions.length >= projectsCount
      ? currentSessions.length + 3
      : projectsCount;
  const totalProjectsToReturn =
    currentSessions.length >= projectsCount
      ? 3
      : projectsCount - currentSessions.length;

  const { data, isFetching, refetch } = useGetRecentlyVisitedProjectsQuery(
    totalProjectsToRequest,
    { skip }
  );

  let projectsToShow = data;
  if (!isFetching && data?.length > 0 && currentSessions.length > 0) {
    const sessionProjectIds = currentSessions.map(
      (session: Session) => session.annotations["gitlabProjectId"]
    );
    projectsToShow = data
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (project: Record<string, any>) =>
          !sessionProjectIds.includes(`${project.id}`)
      )
      .splice(0, totalProjectsToReturn);
  }
  return {
    projects: projectsToShow,
    isFetchingProjects: isFetching,
    refetchProjects: refetch,
  };
}

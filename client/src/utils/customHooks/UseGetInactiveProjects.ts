/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { useEffect, useState } from "react";
import { useGetInactiveKgProjectsQuery } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import { InactiveKgProjects } from "../../features/inactiveKgProjects/InactiveKgProjects";

const PROJECTS_PER_PAGE = 100;
/**
 *  useGetInactiveProjects custom hook
 *
 *  UseGetInactiveProjects.ts
 *  hook to fetch inactive projects in KG
 */
function useGetInactiveProjects(userId: number) {
  const [projects, setProjects] = useState<InactiveKgProjects[]>([]);
  const [page, setPage] = useState(1);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const { data, isFetching, isLoading, error } = useGetInactiveKgProjectsQuery(
    { userId, perPage: PROJECTS_PER_PAGE, page: page }, { skip: !userId });

  // continue fetching if there is more data
  useEffect(() => {
    if (isFetching) {
      setIsFetchingProjects(isFetching);
      return;
    }

    if (data?.nextPage && data?.nextPage !== page)
      setPage(data.nextPage);
    else
      setIsFetchingProjects(isFetching);
  }, [ data?.nextPage, isFetching ]); //eslint-disable-line

  useEffect(() => {
    if (isFetching)
      return;
    if (data?.page === 1) {
      setProjects(data.data || []);
    }
    else {
      const newProjects = data?.data ?? [];
      setProjects([...projects, ...newProjects]);
    }
  }, [ data?.data, isFetching, data?.page ]); //eslint-disable-line

  return { data: projects, isFetching: isFetchingProjects, isLoading, error };
}

export default useGetInactiveProjects;

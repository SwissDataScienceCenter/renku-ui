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
import { useGetMemberProjectsQuery } from "../../features/projects/ProjectApi";

/**
 *  useGetProjects custom hook
 *
 *  UseGetProjects.ts
 *  hook to fetch member projects
 */
function useGetUserProjects() {
  const [projectsMember, setProjectsMembers] = useState<any[]>([]);
  const [endCursor, setEndCursor] = useState("");
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const { data, isFetching } = useGetMemberProjectsQuery({ per_page: 100, endCursor });

  // continue fetching if there is more data
  useEffect(() => {
    if (data) {
      if (data?.hasNextPage)
        setEndCursor(data.endCursor);
      else
        setIsFetchingProjects(isFetching);
    }
    else {
      setIsFetchingProjects(isFetching);
    }
  }, [ data?.hasNextPage, data?.endCursor, isFetching ]); //eslint-disable-line

  // concat projects if is endCursor is not an initial value
  useEffect(() => {
    if (isFetching)
      return;
    if (endCursor === "")
      setProjectsMembers(data.data);
    else
      setProjectsMembers([...projectsMember, ...data.data]);
  }, [ data?.data, isFetching, endCursor ]); //eslint-disable-line

  return { projectsMember, isFetchingProjects };
}

export default useGetUserProjects;

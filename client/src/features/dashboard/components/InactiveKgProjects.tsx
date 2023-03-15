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
import { RootStateOrAny, useSelector } from "react-redux";
import { useInactiveProjectSelector } from "../../inactiveKgProjects/inactiveKgProjectsSlice";
import useGetInactiveProjects from "../../../utils/customHooks/UseGetInactiveProjects";
import { WarnAlert } from "../../../components/Alert";
import { Link } from "react-router-dom";
import React from "react";

export function ProjectsInactiveKGWarning() {
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectList = useInactiveProjectSelector(
    (state) => state.kgInactiveProjects
  );
  const { data, isFetching, isLoading } = useGetInactiveProjects(user?.data?.id);

  if (!user.logged)
    return null;

  if (isLoading || isFetching || data?.length === 0)
    return null;

  let totalProjects;
  if (projectList.length > 0) {
    totalProjects = projectList.filter( p => p.progressActivation !== 100).length;
    if (totalProjects === 0)
      return null;
  }
  else {
    totalProjects = data?.length;
  }

  return <WarnAlert>
    <div data-cy="inactive-kg-project-alert">
      You have {totalProjects} projects that are not in the Knowledge Graph.{" "}
      <Link to="/inactive-kg-projects">Activate your projects</Link> to make them searchable on Renku.
    </div>
  </WarnAlert>;
}

export default ProjectsInactiveKGWarning;

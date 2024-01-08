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
import { Link } from "react-router-dom";

import { WarnAlert } from "../../../components/Alert";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useGetInactiveKgProjectsQuery } from "../../inactiveKgProjects/InactiveKgProjectsApi";

function InactiveProjectsWarning({
  isEstimate,
  totalProjects,
}: {
  isEstimate: boolean;
  totalProjects: number;
}) {
  const projectsText =
    totalProjects === 1 ? "1 project" : `${totalProjects} projects`;
  const totalProjectsText = isEstimate
    ? `at least ${projectsText}`
    : projectsText;
  return (
    <WarnAlert>
      <div data-cy="inactive-kg-project-alert">
        Metadata indexing is not activated on {totalProjectsText}.{" "}
        <Link to="/inactive-kg-projects">
          Activate indexing on your projects
        </Link>{" "}
        to properly integrate them with Renku.
      </div>
    </WarnAlert>
  );
}

const PROJECTS_PER_PAGE = 10;

function EstimatedInactiveProjectsWarning({ userId }: { userId: number }) {
  const { data, isFetching, isLoading } = useGetInactiveKgProjectsQuery({
    userId,
    perPage: PROJECTS_PER_PAGE,
    page: 1,
  });

  const totalProjects = data?.data.length;
  if (isLoading || isFetching || totalProjects == null || totalProjects === 0)
    return null;

  const isEstimate = totalProjects === PROJECTS_PER_PAGE;
  return (
    <InactiveProjectsWarning
      isEstimate={isEstimate}
      totalProjects={totalProjects}
    />
  );
}

export function ProjectsInactiveKGWarning() {
  const user = useLegacySelector((state) => state.stateModel.user);
  const projectList = useAppSelector(
    ({ kgInactiveProjects }) => kgInactiveProjects.inactiveProjects
  );
  if (!user.logged) return null;

  if (projectList.length < 1)
    return <EstimatedInactiveProjectsWarning userId={user?.data?.id} />;

  const totalProjects = projectList.filter(
    (p) => p.progressActivation !== 100
  ).length;
  if (totalProjects === 0) return null;

  return (
    <InactiveProjectsWarning isEstimate={false} totalProjects={totalProjects} />
  );
}

export default ProjectsInactiveKGWarning;

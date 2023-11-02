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

import { SshModal } from "../../components/ssh/ssh";
import { useGetUserPreferencesQuery } from "../user/userPreferences.api";
import DashboardMessage from "./components/DashboardMessage";
import { DatasetDashboard } from "./components/DatasetsDashboard";
import ProjectsInactiveKGWarning from "./components/InactiveKgProjects";
import { ProjectsDashboard } from "./components/ProjectsDashboard";

import "./Dashboard.scss";

export function Dashboard() {
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);

  return (
    <div className="rk-dashboard">
      <h1 data-cy="dashboard-title">Renku Dashboard - {user.data.name}</h1>
      <DashboardMessage />
      <ProjectsInactiveKGWarning />
      <PinnedProjects />
      <ProjectsDashboard userName={user.data.name} />
      <DatasetDashboard userName={user.data.name} />
      <SshModal />
    </div>
  );
}

function PinnedProjects() {
  const {
    data: userPreferences,
    isLoading,
    isError,
  } = useGetUserPreferencesQuery();

  return (
    <div>
      <pre>{JSON.stringify(userPreferences, null, 2)}</pre>
      <pre>{JSON.stringify({ isLoading, isError }, null, 2)}</pre>
    </div>
  );
}

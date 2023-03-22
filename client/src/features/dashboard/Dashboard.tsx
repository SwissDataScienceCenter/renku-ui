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

import React, { Component } from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ProjectsDashboard } from "./components/ProjectsDashboard";
import ProjectsInactiveKGWarning from "./components/InactiveKgProjects";
import { DatasetDashboard } from "./components/DatasetsDashboard";
import { NotebooksCoordinator } from "../../notebooks";
import { SshModal } from "../../components/ssh/ssh";

import "./Dashboard.scss";

class DashboardWrapper extends Component {
  // ? Temporary wrapper to fetch sessions at least once when opening the dashboard.
  constructor(props: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    super(props);
    const notebooksModel = props.model.subModel("notebooks");
    const userModel = props.model.subModel("user");
    const notebookCoordinator = new NotebooksCoordinator(props.client, notebooksModel, userModel);
    notebookCoordinator.fetchNotebooks();
  }

  render() {
    return <Dashboard />;
  }
}

function Dashboard() {
  const user = useSelector( (state: RootStateOrAny) => state.stateModel.user);

  return (
    <div className="rk-dashboard">
      <h1 data-cy="dashboard-title">Renku Dashboard - {user.data.name}</h1>
      <ProjectsInactiveKGWarning />
      <ProjectsDashboard userName={user?.data.name} />
      <DatasetDashboard userName={user?.data.name} />
      <SshModal />
    </div>
  );
}

export { DashboardWrapper as Dashboard };

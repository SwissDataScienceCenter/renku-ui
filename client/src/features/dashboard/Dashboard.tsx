import { RootStateOrAny, useSelector } from "react-redux";
import React from "react";
import { ProjectsDashboard } from "./components/ProjectsDashboard";
import "./Dashboard.scss";
import ProjectsInactiveKGWarning from "./components/InactiveKgProjects";

function Dashboard() {
  const user = useSelector( (state: RootStateOrAny) => state.stateModel.user);

  return (
    <div className="rk-dashboard">
      <h1 data-cy="dashboard-title">Renku Dashboard - {user.data.name}</h1>
      <ProjectsInactiveKGWarning />
      <ProjectsDashboard userName={user?.data.name} />
    </div>
  );
}

export default Dashboard;

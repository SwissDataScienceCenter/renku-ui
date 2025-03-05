/**
 * @file ProjectV2.tsx
 * New implementation of the Project component in TypeScript.
 */

import { useLocation, useNavigate } from "react-router-dom-v5-compat";

import ProjectV1 from "./Project";

interface ProjectViewProps {
  client: unknown;
  params: unknown;
  model: unknown;
  user: unknown;
  blockAnonymous: boolean;
  notifications: unknown;
  socket: unknown;
}

function ProjectView(props: ProjectViewProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ProjectV1.View
      client={props.client}
      params={props.params}
      model={props.model}
      user={props.user}
      blockAnonymous={props.blockAnonymous}
      notifications={props.notifications}
      socket={props.socket}
      location={location}
      navigate={navigate}
    />
  );
}

export default ProjectView;

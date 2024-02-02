/**
 * @file ProjectV2.tsx
 * New implementation of the Project component in TypeScript.
 */

import {
  useHistory,
  type RouteComponentProps,
  type StaticContext,
  useRouteMatch,
} from "react-router";

import ProjectV1 from "./Project";

type RouterProps = RouteComponentProps<
  {
    subUrl: string;
  },
  StaticContext,
  unknown
>;

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
  const history = useHistory();
  const match = useRouteMatch();

  return (
    <ProjectV1.View
      client={props.client}
      params={props.params}
      model={props.model}
      user={props.user}
      blockAnonymous={props.blockAnonymous}
      notifications={props.notifications}
      socket={props.socket}
      history={history}
      location={history.location}
      match={match}
    />
  );
}

export default ProjectView;

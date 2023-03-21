/**
 * @file ProjectV2.tsx
 * New implementation of the Project component in TypeScript.
 */

import React from "react";
import type { RouteComponentProps, StaticContext } from "react-router";

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
  history: Pick<RouterProps, "history">;
  location: Pick<RouterProps, "location">;
  match: Pick<RouterProps, "match">;
  staticContext?: Pick<RouterProps, "staticContext">;
}

function ProjectView(props: ProjectViewProps) {
  return (
    <ProjectV1.View
      client={props.client}
      params={props.params}
      model={props.model}
      user={props.user}
      blockAnonymous={props.blockAnonymous}
      notifications={props.notifications}
      socket={props.socket}
      history={props.history}
      location={props.location}
      match={props.match}
      staticContext={props.staticContext}
    />
  );
}

export default ProjectView;

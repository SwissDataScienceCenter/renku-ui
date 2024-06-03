/**
 * @file ProjectV2.tsx
 * New implementation of the Project component in TypeScript.
 */

// import { useHistory, useRouteMatch } from "react-router";
import ProjectV1 from "./Project";
import AppContext from "../utils/context/appContext";
import { useContext } from "react";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import { useLocation, useNavigate } from "react-router-dom-v5-compat";
import { DEFAULT_APP_PARAMS } from "../utils/context/appParams.constants";
import { useRouteMatch } from "react-router";

function ProjectView() {
  const location = useLocation();
  const navigate = useNavigate();
  const match = useRouteMatch();

  console.log({ match });

  const { client, model, notifications, params, webSocket } =
    useContext(AppContext);

  const user = useLegacySelector((state) => state.stateModel.user);

  // check anonymous sessions settings
  const anonymousSessions =
    params?.ANONYMOUS_SESSIONS ?? DEFAULT_APP_PARAMS.ANONYMOUS_SESSIONS;
  const blockAnonymous = !user.logged && !anonymousSessions;

  return (
    <ProjectV1.View
      client={client}
      params={params}
      model={model}
      user={user}
      blockAnonymous={blockAnonymous}
      notifications={notifications}
      socket={webSocket}
      location={location}
      navigate={navigate}
      match={match}
    />
  );
}

export default ProjectView;

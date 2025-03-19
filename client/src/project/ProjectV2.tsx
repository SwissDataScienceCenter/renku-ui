/**
 * @file ProjectV2.tsx
 * New implementation of the Project component in TypeScript.
 */

import { useContext, useMemo } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";
import AppContext from "../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../utils/context/appParams.constants";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import ProjectV1 from "./Project";

function ProjectView() {
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch("/projects/*");

  const { client, model, notifications, params, webSocket } =
    useContext(AppContext);

  const user = useLegacySelector((state) => state.stateModel.user);

  const subUrl = useMemo(() => match?.params["*"] ?? "", [match?.params]);

  // check anonymous sessions settings
  const blockAnonymous = useMemo(() => {
    const anonymousSessions =
      params?.ANONYMOUS_SESSIONS ?? DEFAULT_APP_PARAMS.ANONYMOUS_SESSIONS;
    return !user.logged && !anonymousSessions;
  }, [params?.ANONYMOUS_SESSIONS, user.logged]);

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
      subUrl={subUrl}
    />
  );
}

export default ProjectView;

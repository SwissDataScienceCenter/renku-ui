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

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useContext } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { User } from "../../../model/RenkuModels";
import cx from "classnames";
import AppContext from "../../../utils/context/appContext";
import AnonymousSessionsDisabledNotice from "./AnonymousSessionsDisabledNotice";
import { GoBackBtn } from "../../../notebooks/components/SessionButtons";
import { Url } from "../../../utils/helpers/url";
import { Button, Row, UncontrolledTooltip } from "reactstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import PullSessionModal from "./PullSessionModal";
import { useGetSessionsQuery } from "../sessions.api";
import { useParams } from "react-router";

export default function ShowSession() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled = !!(
    params as { ANONYMOUS_SESSIONS?: boolean }
  ).ANONYMOUS_SESSIONS;

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const { server } = useParams<{ server: string }>();

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <Row>
        <AnonymousSessionsDisabledNotice />
      </Row>
    );
  }

  return (
    <Row>
      <ShowSessionFullscreen sessionName={server} />
    </Row>
  );
}

interface ShowSessionFullscreenProps {
  sessionName: string;
}

function ShowSessionFullscreen({ sessionName }: ShowSessionFullscreenProps) {
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const namespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const path = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );

  const sessionsListUrl = Url.get(Url.pages.project.session, {
    namespace: "",
    path: pathWithNamespace,
  });

  const { data: sessions } = useGetSessionsQuery({ namespace, project: path });
  const thisSession = useMemo(() => {
    if (sessions == null) {
      return undefined;
    }
    return Object.values(sessions).find(({ name }) => name === sessionName);
  }, [sessionName, sessions]);

  // const { filters, notebook, urlBack, projectName, handlers } = props;
  // const [sessionStatus, setSessionStatus] = useState<SessionStatusData>();
  const [isTheSessionReady, setIsTheSessionReady] = useState(false);
  // const [showModalAboutData, setShowModalAboutData] = useState(false);
  // const toggleModalAbout = () => setShowModalAboutData(!showModalAboutData);

  // const [showModalResourcesData, setShowModalResourcesData] = useState(false);
  // const toggleModalResources = () =>
  //   setShowModalResourcesData(!showModalResourcesData);
  // const [activeResourcesTab, setActiveResourcesTab] = useState<string>(
  //   SESSION_TABS.commands
  // );

  // const [showModalStopSession, setShowModalStopSession] = useState(false);
  // const toggleStopSession = () =>
  //   setShowModalStopSession(!showModalStopSession);

  // const [showModalSaveSession, setShowModalSaveSession] = useState(false);
  // const toggleSaveSession = () =>
  //   setShowModalSaveSession(!showModalSaveSession);

  const [showModalPullSession, setShowModalPullSession] = useState(false);
  const togglePullSession = useCallback(
    () => setShowModalPullSession((show) => !show),
    []
  );
  // const togglePullSession = () =>
  //   setShowModalPullSession(!showModalPullSession);

  // const { height } = useWindowSize();
  // const ref = useRef<any>(null);
  // const iframeHeight = height ? height - 42 : 800;

  // const history = useHistory();
  // const location = useLocation();
  // const urlList = Url.get(Url.pages.project.session, {
  //   namespace: filters.namespace,
  //   path: filters.project,
  // });

  useEffect(() => {
    if (thisSession?.status.state === "running") {
      setIsTheSessionReady(true);
      return;
    }
    setIsTheSessionReady(false);
  }, [thisSession?.status.state]);

  // const pullSessionModal = (
  //   <PullSession
  //     isSessionReady={isTheSessionReady}
  //     notebook={notebook}
  //     closeModal={togglePullSession}
  //     urlList={urlList}
  //     isOpen={showModalPullSession}
  //   />
  // );
  const pullSessionModal = (
    <PullSessionModal
      isOpen={showModalPullSession}
      isSessionReady={isTheSessionReady}
      sessionName={sessionName}
      toggleModal={togglePullSession}
    />
  );

  return (
    <div className={cx("bg-white", "p-0")}>
      <div className={cx("d-lg-flex", "flex-column")}>
        <div className={cx("fullscreen-header", "d-flex", "gap-3")}>
          <div
            className={cx(
              "d-flex",
              "gap-3",
              "flex-grow-0",
              "align-items-center"
            )}
          >
            <GoBackBtn urlBack={sessionsListUrl} />
            <PullSessionBtn togglePullSession={togglePullSession} />
            {/* <SaveSessionBtn toggleSaveSession={toggleSaveSession} /> */}
            {/* <ResourcesBtn toggleModalResources={toggleModalResources} /> */}
            {/* <StopSessionBtn toggleStopSession={toggleStopSession} /> */}
          </div>
        </div>
        <div /*ref={ref}*/ className={cx("fullscreen-content", "w-100")}>
          {/* {content}
          {sessionView} */}
        </div>
      </div>
      {/* modals */}
      {pullSessionModal}
    </div>
  );
}

interface PullSessionBtnProps {
  togglePullSession: () => void;
}

function PullSessionBtn({ togglePullSession }: PullSessionBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        data-cy="pull-changes-button"
        className={cx(
          "border-0",
          "bg-transparent",
          "text-dark",
          "p-0",
          "no-focus"
        )}
        id="pull-changes-button"
        innerRef={ref}
        onClick={togglePullSession}
      >
        <ArrowClockwise className="text-rk-dark" title="pull" />
      </Button>
      <UncontrolledTooltip placement="bottom" target={ref}>
        Pull changes
      </UncontrolledTooltip>
    </div>
  );
}

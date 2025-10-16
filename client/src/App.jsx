/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

/**
 *  incubator-renku-ui
 *
 *  App.js
 *  Coordinator for the application.
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Route, Routes, useLocation } from "react-router";
import { ToastContainer } from "react-toastify";
import { LoginHelper } from "./authentication";
import { Loader } from "./components/Loader";
import LazyAdminPage from "./features/admin/LazyAdminPage";
import { Favicon } from "./features/favicon/Favicon";
import LazyAnonymousHome from "./features/landing/LazyAnonymousHome";
import {
  FooterNavbar,
  RenkuNavBar,
} from "./features/landing/components/NavBar/NavBar";
import LegacyDatasetAddToProject from "./features/legacy/LegacyDatasetAddToProject";
import LegacyDatasets from "./features/legacy/LegacyDatasets";
import LegacyProjectView from "./features/legacy/LegacyProjectView";
import LegacyRoot from "./features/legacy/LegacyRoot";
import LegacyShowDataset from "./features/legacy/LegacyShowDataset";
import LoginHandler from "./features/loginHandler/LoginHandler";
import { Unavailable } from "./features/maintenance/Maintenance";
import LazyRootV2 from "./features/rootV2/LazyRootV2";
import { useGetUserQueryState } from "./features/usersV2/api/users.api";
import NotificationsManager from "./notifications/NotificationsManager";
import Cookie from "./privacy/Cookie";
import AppContext from "./utils/context/appContext";
import useLegacySelector from "./utils/customHooks/useLegacySelector.hook";
import { setupWebSocket } from "./websocket";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

export const ContainerWrap = ({ children, fullSize = false }) => {
  const classContainer = !fullSize
    ? "container-xxl py-4 mt-2 renku-container"
    : "w-100";
  return <div className={classContainer}>{children}</div>;
};

function CentralContentContainer({ user }) {
  const { data: userInfo } = useGetUserQueryState(
    user.logged ? undefined : skipToken
  );

  return (
    <div className="d-flex flex-grow-1">
      <Helmet>
        <title>Reproducible Data Science | Open Research | Renku</title>
      </Helmet>
      <Routes>
        <Route
          index
          element={
            user.logged ? (
              <LazyRootV2 />
            ) : (
              <div className="w-100">
                <LazyAnonymousHome />
              </div>
            )
          }
        />
        <Route path="/projects/*" element={<LegacyProjectView />} />
        <Route
          path="/datasets/:identifier/add"
          element={<LegacyDatasetAddToProject />}
        />
        <Route
          path="/datasets/:identifier"
          element={<LegacyShowDataset userInfo={userInfo} />}
        />
        <Route path="/datasets" element={<LegacyDatasets />} />
        <Route path="/v1/*" element={<LegacyRoot />} />
        {userInfo?.isLoggedIn && userInfo.is_admin && (
          <Route
            path="/admin"
            element={
              <ContainerWrap>
                <LazyAdminPage />
              </ContainerWrap>
            }
          />
        )}
        <Route path="*" element={<LazyRootV2 />} />
      </Routes>
    </div>
  );
}

function App(props) {
  const location = useLocation();
  const locationRef = useRef(location);

  const [webSocket, setWebSocket] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const getLocation = () => locationRef.current;
    const notificationManager = new NotificationsManager(
      props.model,
      props.client
    );
    setNotifications(notificationManager);

    // Setup authentication listeners and notifications
    LoginHelper.setupListener();
    LoginHelper.triggerNotifications(notificationManager);

    // Setup WebSocket channel
    let webSocketUrl = props.client.uiserverUrl + "/ws";
    if (webSocketUrl.startsWith("http"))
      webSocketUrl = "ws" + webSocketUrl.substring(4);
    // ? adding a small delay to allow session cookie to be saved to local browser before sending requests
    setWebSocket(
      setupWebSocket(
        webSocketUrl,
        props.model,
        getLocation,
        props.client,
        notificationManager
      )
    );
    // ! Ignoring the rule of hooks creates issues, we should refactor this hook
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Avoid rendering the application while authenticating the user
  const user = useLegacySelector((state) => state.stateModel.user);
  if (!user?.fetched && user?.fetching) {
    return (
      <section className="py-5">
        <h3 className="text-center">Checking user data</h3>
        <Loader />
      </section>
    );
  } else if (user.error) {
    return (
      <Unavailable model={props.model} statuspageId={props.statuspageId} />
    );
  }
  const { coreApiVersionedUrlConfig, socket } = props;
  const appContext = {
    client: props.client,
    coreApiVersionedUrlConfig,
    location: props.location,
    model: props.model,
    notifications,
    params: props.params,
    webSocket: socket,
  };

  return (
    <Fragment>
      <Favicon />
      <AppContext.Provider value={appContext}>
        <RenkuNavBar user={user} />
        <CentralContentContainer user={user} socket={webSocket} />
        <FooterNavbar />
        <LoginHandler />
      </AppContext.Provider>
      <Cookie />
      <ToastContainer />
    </Fragment>
  );
}

export default App;

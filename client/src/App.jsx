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
import { Fragment, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useLocation } from "react-router";
import { Route, Switch } from "react-router-dom";
import { CompatRoute } from "react-router-dom-v5-compat";
import { ToastContainer } from "react-toastify";

import { LoginHelper } from "./authentication";
import { Loader } from "./components/Loader";
import LazyDatasetAddToProject from "./dataset/addtoproject/LazyDatasetAddToProject";
import { DatasetCoordinator } from "./dataset/Dataset.state";
import LazyShowDataset from "./dataset/LazyShowDataset";
import LazyAdminPage from "./features/admin/LazyAdminPage";
import { Favicon } from "./features/favicon/Favicon";
import { Unavailable } from "./features/maintenance/Maintenance";
import LazyRootV1 from "./features/rootV1/LazyRootV1";
import LazyRootV2 from "./features/rootV2/LazyRootV2";
import { useGetUserQuery } from "./features/usersV2/api/users.api";
import LazyAnonymousHome from "./landing/LazyAnonymousHome";
import { FooterNavbar, RenkuNavBar } from "./landing/NavBar";
import NotificationsManager from "./notifications/NotificationsManager";
import Cookie from "./privacy/Cookie";
import LazyProjectView from "./project/LazyProjectView";
import { ABSOLUTE_ROUTES } from "./routing/routes.constants";
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

function CentralContentContainer({ user, socket }) {
  const { params, model, client, notifications } = useContext(AppContext);

  const { data: userInfo } = useGetUserQuery(
    user.logged ? undefined : skipToken
  );

  // check anonymous sessions settings
  const blockAnonymous = !user.logged && !params["ANONYMOUS_SESSIONS"];

  return (
    <div className="d-flex flex-grow-1">
      <Helmet>
        <title>Reproducible Data Science | Open Research | Renku</title>
      </Helmet>
      <Switch>
        <CompatRoute exact path="/">
          {user.logged ? (
            <ContainerWrap fullSize={true}>
              <LazyRootV2 />
            </ContainerWrap>
          ) : (
            <div className="w-100">
              <LazyAnonymousHome />
            </div>
          )}
        </CompatRoute>
        <Route path="/projects/:subUrl+">
          <LazyProjectView
            client={client}
            params={params}
            model={model}
            user={user}
            blockAnonymous={blockAnonymous}
            notifications={notifications}
            socket={socket}
          />
        </Route>
        <Route path="/datasets/:identifier/add">
          <LazyDatasetAddToProject insideProject={false} model={model} />
        </Route>
        <CompatRoute path="/datasets/:identifier">
          <LazyShowDataset
            insideProject={false}
            client={client}
            projectsUrl="/projects"
            datasetCoordinator={
              new DatasetCoordinator(client, model.subModel("dataset"))
            }
            logged={user.logged}
            model={model}
          />
        </CompatRoute>
        <CompatRoute path="/datasets">
          <Redirect to={`${ABSOLUTE_ROUTES.v1.search}?type=dataset`} />
        </CompatRoute>
        <CompatRoute path="/v1">
          <LazyRootV1 user={user} />
        </CompatRoute>
        {userInfo?.isLoggedIn && userInfo.is_admin && (
          <CompatRoute path="/admin">
            <ContainerWrap>
              <LazyAdminPage />
            </ContainerWrap>
          </CompatRoute>
        )}
        <Route path="/*">
          <LazyRootV2 />
        </Route>
      </Switch>
    </div>
  );
}

function App(props) {
  const location = useLocation();

  const [webSocket, setWebSocket] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    const getLocation = () => location;
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
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

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
      </AppContext.Provider>
      <FooterNavbar />
      <Cookie />
      <ToastContainer />
    </Fragment>
  );
}

export default App;

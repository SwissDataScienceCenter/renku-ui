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
import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useLocation } from "react-router";
import { Route, Switch } from "react-router-dom";
import { CompatRoute } from "react-router-dom-v5-compat";
import { ToastContainer } from "react-toastify";

import { LoginHelper } from "./authentication";
import { DashboardBanner } from "./components/earlyAccessBanner/EarlyAccessBanner";
import { Loader } from "./components/Loader";
import LazyDatasetAddToProject from "./dataset/addtoproject/LazyDatasetAddToProject";
import { DatasetCoordinator } from "./dataset/Dataset.state";
import LazyShowDataset from "./dataset/LazyShowDataset";
import LazyAdminPage from "./features/admin/LazyAdminPage";
import LazyDashboard from "./features/dashboard/LazyDashboard";
import { Favicon } from "./features/favicon/Favicon";
import LazyInactiveKGProjectsPage from "./features/inactiveKgProjects/LazyInactiveKGProjectsPage";
import LazySearchPage from "./features/kgSearch/LazySearchPage";
import { Unavailable } from "./features/maintenance/Maintenance";
import LazyRootV2 from "./features/rootV2/LazyRootV2";
import LazySecrets from "./features/secrets/LazySecrets";
import LazyAnonymousSessionsList from "./features/session/components/LazyAnonymousSessionsList";
import { useGetUserQuery } from "./features/usersV2/api/users.api";
import LazyHelp from "./help/LazyHelp";
import LazyAnonymousHome from "./landing/LazyAnonymousHome";
import { FooterNavbar, RenkuNavBar } from "./landing/NavBar";
import LazyNotFound from "./not-found/LazyNotFound";
import LazyNotificationsPage from "./notifications/LazyNotificationsPage";
import NotificationsManager from "./notifications/NotificationsManager";
import Cookie from "./privacy/Cookie";
import LazyProjectView from "./project/LazyProjectView";
import LazyProjectList from "./project/list/LazyProjectList";
import LazyNewProject from "./project/new/LazyNewProject";
import LazyStyleGuide from "./styleguide/LazyStyleGuide";
import AppContext from "./utils/context/appContext";
import useLegacySelector from "./utils/customHooks/useLegacySelector.hook";
import { Url } from "./utils/helpers/url";
import { setupWebSocket } from "./websocket";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

export const ContainerWrap = ({ children, fullSize = false }) => {
  const classContainer = !fullSize
    ? "container-xxl py-4 mt-2 renku-container"
    : "w-100";
  return <div className={classContainer}>{children}</div>;
};

function CentralContentContainer(props) {
  const { coreApiVersionedUrlConfig, notifications, socket, user } = props;

  const { data: userInfo } = useGetUserQuery(
    props.user.logged ? undefined : skipToken
  );

  const appContext = {
    client: props.client,
    coreApiVersionedUrlConfig,
    location: props.location,
    model: props.model,
    notifications,
    params: props.params,
    webSocket: socket,
  };

  // check anonymous sessions settings
  const blockAnonymous = !user.logged && !props.params["ANONYMOUS_SESSIONS"];

  return (
    <div className="d-flex flex-grow-1">
      <AppContext.Provider value={appContext}>
        <Helmet>
          <title>Reproducible Data Science | Open Research | Renku</title>
        </Helmet>
        <Switch>
          <CompatRoute exact path="/">
            {props.user.logged ? (
              <ContainerWrap>
                <LazyDashboard />
              </ContainerWrap>
            ) : (
              <div className="w-100">
                <LazyAnonymousHome />
              </div>
            )}
          </CompatRoute>
          <CompatRoute path="/help">
            <ContainerWrap>
              <LazyHelp />
            </ContainerWrap>
          </CompatRoute>
          <CompatRoute path="/search">
            <ContainerWrap>
              <LazySearchPage />
            </ContainerWrap>
          </CompatRoute>
          <CompatRoute path="/inactive-kg-projects">
            {props.user.logged ? (
              <ContainerWrap>
                <LazyInactiveKGProjectsPage />
              </ContainerWrap>
            ) : (
              <LazyNotFound />
            )}
          </CompatRoute>
          {["/projects", "/projects/starred", "/projects/all"].map((path) => (
            <CompatRoute key={path} exact path={path}>
              <ContainerWrap>
                <LazyProjectList />
              </ContainerWrap>
            </CompatRoute>
          ))}
          <CompatRoute exact path="/projects/new">
            <ContainerWrap>
              <LazyNewProject />
            </ContainerWrap>
          </CompatRoute>
          <Route path="/projects/:subUrl+">
            <LazyProjectView
              client={props.client}
              params={props.params}
              model={props.model}
              user={props.user}
              blockAnonymous={blockAnonymous}
              notifications={notifications}
              socket={socket}
            />
          </Route>
          <Route exact path={Url.get(Url.pages.sessions)}>
            {!user.logged ? <LazyAnonymousSessionsList /> : <Redirect to="/" />}
          </Route>
          <Route path="/datasets/:identifier/add">
            <LazyDatasetAddToProject
              insideProject={false}
              model={props.model}
            />
          </Route>
          <CompatRoute path="/datasets/:identifier">
            <LazyShowDataset
              insideProject={false}
              client={props.client}
              projectsUrl="/projects"
              datasetCoordinator={
                new DatasetCoordinator(
                  props.client,
                  props.model.subModel("dataset")
                )
              }
              logged={props.user.logged}
              model={props.model}
            />
          </CompatRoute>
          <CompatRoute path="/datasets">
            <Redirect to="/search?type=dataset" />
          </CompatRoute>
          <CompatRoute path="/notifications">
            <ContainerWrap>
              <LazyNotificationsPage />
            </ContainerWrap>
          </CompatRoute>
          <CompatRoute path="/v2">
            <LazyRootV2 />
          </CompatRoute>
          <CompatRoute path="/style-guide">
            <ContainerWrap>
              <LazyStyleGuide />
            </ContainerWrap>
          </CompatRoute>
          {userInfo?.isLoggedIn && userInfo.is_admin && (
            <CompatRoute path="/admin">
              <ContainerWrap>
                <LazyAdminPage />
              </ContainerWrap>
            </CompatRoute>
          )}
          <CompatRoute path="/secrets">
            <ContainerWrap>
              <LazySecrets />
            </ContainerWrap>
          </CompatRoute>
          <Route path="/*">
            <LazyNotFound />
          </Route>
        </Switch>
      </AppContext.Provider>
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

  return (
    <Fragment>
      <Favicon />
      <RenkuNavBar {...props} notifications={notifications} />
      <DashboardBanner user={props.user} />
      <CentralContentContainer
        notifications={notifications}
        socket={webSocket}
        location={location}
        {...props}
      />
      <FooterNavbar params={props.params} />
      <Cookie />
      <ToastContainer />
    </Fragment>
  );
}

export default App;

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
import { Navigate, Route, Routes, useLocation } from "react-router";
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

  console.log(coreApiVersionedUrlConfig);

  const { data: userInfo } = useGetUserInfoQuery(undefined, {
    skip: !props.user.logged,
  });

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
    <div className="d-flex flex-grow-1">
      <AppContext.Provider value={appContext}>
        <Helmet>
          <title>Reproducible Data Science | Open Research | Renku</title>
        </Helmet>
        <Routes>
          <Route
            path="/"
            element={
              props.user.logged ? (
                <ContainerWrap>
                  <LazyDashboard />
                </ContainerWrap>
              ) : (
                <div className="w-100">
                  <LazyAnonymousHome />
                </div>
              )
            }
          />
          <Route
            path="/help/*"
            element={
              <ContainerWrap>
                <LazyHelp />
              </ContainerWrap>
            }
          />
          <Route
            path="/search"
            element={
              <ContainerWrap>
                <LazySearchPage />
              </ContainerWrap>
            }
          />
          <Route
            path="/inactive-kg-projects"
            element={
              props.user.logged ? (
                <ContainerWrap>
                  <LazyInactiveKGProjectsPage />
                </ContainerWrap>
              ) : (
                <LazyNotFound />
              )
            }
          />
          {["/projects", "/projects/starred", "/projects/all"].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ContainerWrap>
                  <LazyProjectList />
                </ContainerWrap>
              }
            />
          ))}
          <Route
            path="/projects/new"
            element={
              <ContainerWrap>
                <LazyNewProject />
              </ContainerWrap>
            }
          />
          <Route path="/projects/*" element={<LazyProjectView />} />
          <Route
            path="/sessions"
            element={
              !user.logged ? (
                <LazyAnonymousSessionsList />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/datasets/:identifier/add"
            element={
              <LazyDatasetAddToProject
                insideProject={false}
                model={props.model}
              />
            }
          />
          <Route
            path="/datasets/:identifier"
            element={
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
            }
          />
          <Route
            path="/datasets"
            element={<Navigate to="/search?type=dataset" replace />}
          />
          <Route
            path="/notifications"
            element={
              <ContainerWrap>
                <LazyNotificationsPage />
              </ContainerWrap>
            }
          />
          <Route path="/v2/*" element={<LazyRootV2 />} />
          <Route
            path="/style-guide"
            element={
              <ContainerWrap>
                <LazyStyleGuide />
              </ContainerWrap>
            }
          />
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
          <Route
            path="/secrets"
            element={
              <ContainerWrap>
                <LazySecrets />
              </ContainerWrap>
            }
          />
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
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

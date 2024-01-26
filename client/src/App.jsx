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

import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { LoginHelper, LoginRedirect } from "./authentication";
import { Loader } from "./components/Loader";
import { DatasetCoordinator } from "./dataset/Dataset.state";
import LazyShowDataset from "./dataset/LazyShowDataset";
import LazyDatasetAddToProject from "./dataset/addtoproject/LazyDatasetAddToProject";
import LazyAdminPage from "./features/admin/LazyAdminPage";
import LazyDashboard from "./features/dashboard/LazyDashboard";
import LazyInactiveKGProjectsPage from "./features/inactiveKgProjects/LazyInactiveKGProjectsPage";
import LazySearchPage from "./features/kgSearch/LazySearchPage";
import { Unavailable } from "./features/maintenance/Maintenance";
import LazyAnonymousSessionsList from "./features/session/components/LazyAnonymousSessionsList";
import { useGetUserInfoQuery } from "./features/user/keycloakUser.api";
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
  };

  if (
    !props.user.logged &&
    props.location.pathname === Url.get(Url.pages.landing)
  ) {
    return (
      <AppContext.Provider value={appContext}>
        <LazyAnonymousHome
          client={props.client}
          homeCustomized={props.params["HOMEPAGE"]}
          user={props.user}
          model={props.model}
          location={props.location}
          params={props.params}
        />
      </AppContext.Provider>
    );
  }

  // check anonymous sessions settings
  const blockAnonymous = !user.logged && !props.params["ANONYMOUS_SESSIONS"];

  return (
    <div className="d-flex flex-grow-1">
      <AppContext.Provider value={appContext}>
        <Helmet>
          <title>Reproducible Data Science | Open Research | Renku</title>
        </Helmet>
        <Switch>
          <Route
            exact
            path="/login"
            render={(p) => (
              <ContainerWrap fullSize>
                <LoginRedirect key="login" {...p} {...props} />
              </ContainerWrap>
            )}
          />
          <Route
            exact
            path={Url.get(Url.pages.landing)}
            render={() =>
              props.user.logged ? (
                <ContainerWrap>
                  <LazyDashboard />
                </ContainerWrap>
              ) : null
            }
          />
          <Route
            path={Url.get(Url.pages.help)}
            render={(p) => (
              <ContainerWrap>
                <LazyHelp key="help" {...p} {...props} />
              </ContainerWrap>
            )}
          />
          <Route
            path={Url.get(Url.pages.search)}
            render={() => (
              <ContainerWrap>
                <LazySearchPage
                  key="kg-search"
                  userName={props.user?.data?.name}
                  isLoggedUser={props.user.logged}
                  model={props.model}
                />
              </ContainerWrap>
            )}
          />
          <Route
            path={Url.get(Url.pages.inactiveKgProjects)}
            render={(p) =>
              props.user?.logged ? (
                <ContainerWrap>
                  <LazyInactiveKGProjectsPage
                    key="-inactive-kg-projects"
                    socket={socket}
                  />
                </ContainerWrap>
              ) : (
                <LazyNotFound {...p} />
              )
            }
          />
          <Route
            exact
            path={[
              Url.get(Url.pages.projects),
              Url.get(Url.pages.projects.starred),
              Url.get(Url.pages.projects.all),
            ]}
            render={(p) => (
              <ContainerWrap>
                <LazyProjectList
                  key="projects"
                  user={props.user}
                  client={props.client}
                  statusSummary={props.statusSummary}
                  {...p}
                />
              </ContainerWrap>
            )}
          />
          <Route
            exact
            path={Url.get(Url.pages.project.new)}
            render={(p) => (
              <ContainerWrap>
                <LazyNewProject
                  key="newProject"
                  model={props.model}
                  user={props.user}
                  client={props.client}
                  {...p}
                />
              </ContainerWrap>
            )}
          />
          <Route
            path="/projects/:subUrl+"
            render={(p) => (
              <LazyProjectView
                key="project/view"
                client={props.client}
                params={props.params}
                model={props.model}
                user={props.user}
                blockAnonymous={blockAnonymous}
                notifications={notifications}
                socket={socket}
                {...p}
              />
            )}
          />
          <Route exact path={Url.get(Url.pages.sessions)}>
            {!user.logged ? <LazyAnonymousSessionsList /> : <Redirect to="/" />}
          </Route>
          <Route
            path="/datasets/:identifier/add"
            render={(p) => (
              <LazyDatasetAddToProject
                key="addDatasetNew"
                insideProject={false}
                identifier={p.match.params?.identifier?.replaceAll("-", "")}
                datasets={p.datasets}
                model={props.model}
              />
            )}
          />
          <Route
            path="/datasets/:identifier"
            render={(p) => (
              <LazyShowDataset
                key="datasetPreview"
                {...p}
                insideProject={false}
                identifier={p.match.params?.identifier?.replaceAll("-", "")}
                client={props.client}
                projectsUrl="/projects"
                selectedDataset={p.match.params.datasetId}
                datasetCoordinator={
                  new DatasetCoordinator(
                    props.client,
                    props.model.subModel("dataset")
                  )
                }
                logged={props.user.logged}
                model={props.model}
              />
            )}
          />
          <Route path="/datasets">
            <Redirect to="/search?type=dataset" />
          </Route>
          <Route
            path="/notifications"
            render={(p) => (
              <ContainerWrap>
                <LazyNotificationsPage
                  key="notifications"
                  client={props.client}
                  model={props.model}
                  notifications={notifications}
                  {...p}
                />
              </ContainerWrap>
            )}
          />
          <Route
            path="/style-guide"
            render={(p) => (
              <ContainerWrap>
                <LazyStyleGuide
                  key="style-guide"
                  baseUrl="/style-guide"
                  {...p}
                />
              </ContainerWrap>
            )}
          />
          {userInfo?.isAdmin && (
            <Route path="/admin">
              <ContainerWrap>
                <LazyAdminPage />
              </ContainerWrap>
            </Route>
          )}
          <Route path="*" render={(p) => <LazyNotFound {...p} />} />
        </Switch>
      </AppContext.Provider>
    </div>
  );
}

function App(props) {
  const [webSocket, setWebSocket] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    const getLocation = () => props.location;
    const notificationManager = new NotificationsManager(
      props.model,
      props.client,
      getLocation
    );
    setNotifications(notificationManager);

    // Setup authentication listeners and notifications
    LoginHelper.setupListener();
    LoginHelper.triggerNotifications(notifications);

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
  }, []); // eslint-disable-line

  // Avoid rendering the application while authenticating the user
  const user = useLegacySelector((state) => state.stateModel.user);
  if (!user?.fetched && user?.fetching) {
    return (
      <section className="jumbotron-header rounded px-3 px-sm-4 py-3 py-sm-5 text-center mb-3">
        <h3 className="text-center text-primary">Checking user data</h3>
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
      <Route
        render={(p) =>
          user.logged || p.location.pathname !== Url.get(Url.pages.landing) ? (
            <RenkuNavBar {...p} {...props} notifications={notifications} />
          ) : null
        }
      />
      <CentralContentContainer
        notifications={notifications}
        socket={webSocket}
        {...props}
      />
      <Route
        render={(propsRoute) => (
          <FooterNavbar {...propsRoute} params={props.params} />
        )}
      />
      <Route
        render={(propsRoute) => (
          <Cookie {...propsRoute} params={props.params} />
        )}
      />
      <ToastContainer />
    </Fragment>
  );
}

export default App;

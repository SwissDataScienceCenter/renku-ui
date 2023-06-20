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

import React, { useEffect, useState, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";

import { LoginHelper } from "./authentication";
import { NotificationsManager } from "./notifications";
import { Url } from "./utils/helpers/url";
import { Unavailable } from "./Maintenance";
import { Loader } from "./components/Loader";
import { DatasetCoordinator } from "./dataset/Dataset.state";
import AppContext from "./utils/context/appContext";
import { setupWebSocket } from "./websocket";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

// Lazily-loaded components
const AnonymousHome = lazy(() =>
  import("./landing").then((module) => ({
    default: module.AnonymousHome,
  }))
);
const Cookie = lazy(() =>
  import("./privacy").then((module) => ({
    default: module.Cookie,
  }))
);
const Dashboard = lazy(() =>
  import("./features/dashboard/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);
const DatasetAddToProject = lazy(() =>
  import("./dataset/addtoproject/DatasetAddToProject")
);
const DatasetList = lazy(() => import("./dataset/list/DatasetList.container"));
const FooterNavbar = lazy(() =>
  import("./landing").then((module) => ({
    default: module.FooterNavbar,
  }))
);
const Help = lazy(() => import("./help"));
const InactiveKGProjectsPage = lazy(() =>
  import("./features/inactiveKgProjects/InactiveKgProjects")
);
const Login = lazy(() =>
  import("./authentication").then((module) => ({
    default: module.Login,
  }))
);
const NewProject = lazy(() =>
  import("./project/new").then((module) => ({
    default: module.NewProject,
  }))
);
const Notebooks = lazy(() =>
  import("./notebooks").then((module) => ({
    default: module.Notebooks,
  }))
);
const NotificationsPage = lazy(() =>
  import("./notifications").then((module) => ({
    default: module.NotificationsPage,
  }))
);
const NotFound = lazy(() =>
  import("./not-found").then((module) => ({
    default: module.NotFound,
  }))
);
const Privacy = lazy(() =>
  import("./privacy").then((module) => ({
    default: module.Privacy,
  }))
);
const ProjectList = lazy(() =>
  import("./project/list").then((module) => ({
    default: module.ProjectList,
  }))
);
const ProjectView = lazy(() =>
  import("./project").then((module) => ({
    default: module.Project.View,
  }))
);
const RenkuNavBar = lazy(() =>
  import("./landing").then((module) => ({
    default: module.RenkuNavBar,
  }))
);
const SearchPage = lazy(() => import("./features/kgSearch/KgSearchPage"));
const ShowDataset = lazy(() => import("./dataset/Dataset.container"));
const StyleGuide = lazy(() =>
  import("./styleguide").then((module) => ({
    default: module.StyleGuide,
  }))
);
const ToastContainer = lazy(() =>
  import("react-toastify").then((module) => ({
    default: module.ToastContainer,
  }))
);

export const ContainerWrap = ({ children, fullSize = false }) => {
  const classContainer = !fullSize
    ? "container-xxl py-4 mt-2 renku-container"
    : "w-100";
  return <div className={classContainer}>{children}</div>;
};

function CentralContentContainer(props) {
  const { notifications, user, socket } = props;

  if (
    !props.user.logged &&
    props.location.pathname === Url.get(Url.pages.landing)
  ) {
    return (
      <Suspense fallback={<Loader />}>
        <AnonymousHome
          client={props.client}
          homeCustomized={props.params["HOMEPAGE"]}
          user={props.user}
          model={props.model}
          location={props.location}
          params={props.params}
        />
      </Suspense>
    );
  }

  // check anonymous sessions settings
  const blockAnonymous = !user.logged && !props.params["ANONYMOUS_SESSIONS"];

  const appContext = {
    client: props.client,
    params: props.params,
    location: props.location,
  };

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
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <Login key="login" {...p} {...props} />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            exact
            path={Url.get(Url.pages.landing)}
            render={() =>
              props.user.logged ? (
                <ContainerWrap>
                  <Suspense fallback={<Loader />}>
                    <Dashboard
                      model={props.model}
                      user={props.user}
                      client={props.client}
                    />
                  </Suspense>
                </ContainerWrap>
              ) : null
            }
          />
          <Route
            path={Url.get(Url.pages.help)}
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <Help key="help" {...p} {...props} />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path={Url.get(Url.pages.search)}
            render={() => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <SearchPage
                    key="kg-search"
                    userName={props.user?.data?.name}
                    isLoggedUser={props.user.logged}
                    model={props.model}
                  />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path={Url.get(Url.pages.inactiveKgProjects)}
            render={(p) =>
              props.user?.logged ? (
                <ContainerWrap>
                  <Suspense fallback={<Loader />}>
                    <InactiveKGProjectsPage
                      key="-inactive-kg-projects"
                      socket={socket}
                    />
                  </Suspense>
                </ContainerWrap>
              ) : (
                <Suspense fallback={<Loader />}>
                  <NotFound {...p} />
                </Suspense>
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
                <Suspense fallback={<Loader />}>
                  <ProjectList
                    key="projects"
                    user={props.user}
                    client={props.client}
                    statusSummary={props.statusSummary}
                    {...p}
                  />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            exact
            path={Url.get(Url.pages.project.new)}
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <NewProject
                    key="newProject"
                    model={props.model}
                    user={props.user}
                    client={props.client}
                    {...p}
                  />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path="/projects/:subUrl+"
            render={(p) => (
              <Suspense fallback={<Loader />}>
                <ProjectView
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
              </Suspense>
            )}
          />
          <Route
            exact
            path="/sessions"
            render={(p) =>
              !user.logged ? (
                <ContainerWrap>
                  <Suspense fallback={<Loader />}>
                    <Notebooks
                      key="sessions"
                      standalone={true}
                      client={props.client}
                      model={props.model}
                      blockAnonymous={blockAnonymous}
                      {...p}
                    />
                  </Suspense>
                </ContainerWrap>
              ) : (
                <Redirect to="/" />
              )
            }
          />
          <Route
            path="/datasets/:identifier/add"
            render={(p) => (
              <Suspense fallback={<Loader />}>
                <DatasetAddToProject
                  key="addDatasetNew"
                  insideProject={false}
                  identifier={p.match.params?.identifier?.replaceAll("-", "")}
                  datasets={p.datasets}
                  model={props.model}
                />
              </Suspense>
            )}
          />
          <Route
            path="/datasets/:identifier"
            render={(p) => (
              <Suspense fallback={<Loader />}>
                <ShowDataset
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
              </Suspense>
            )}
          />
          <Route
            path="/datasets"
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <DatasetList
                    key="datasets"
                    client={props.client}
                    model={props.model}
                    {...p}
                  />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path="/privacy"
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <Privacy key="privacy" params={props.params} {...p} />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path="/notifications"
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <NotificationsPage
                    key="notifications"
                    client={props.client}
                    model={props.model}
                    notifications={notifications}
                    {...p}
                  />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path="/style-guide"
            render={(p) => (
              <ContainerWrap>
                <Suspense fallback={<Loader />}>
                  <StyleGuide key="style-guide" baseUrl="/style-guide" {...p} />
                </Suspense>
              </ContainerWrap>
            )}
          />
          <Route
            path="*"
            render={(p) => (
              <Suspense fallback={<Loader />}>
                <NotFound {...p} />
              </Suspense>
            )}
          />
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
  const user = useSelector((state) => state.stateModel.user);
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
    <Suspense fallback={<Loader />}>
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
    </Suspense>
  );
}

export default App;

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

import React, { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Project from "./project/Project";
import { ProjectList } from "./project/list";
import { NewProject } from "./project/new";
import DatasetList from "./dataset/list/DatasetList.container";
import { AnonymousHome, Landing, RenkuNavBar, FooterNavbar } from "./landing";
import { Notebooks } from "./notebooks";
import { Login, LoginHelper } from "./authentication";
import Help from "./help";
import NotFound from "./not-found";
import ShowDataset from "./dataset/Dataset.container";
import { Cookie, Privacy } from "./privacy";
import { NotificationsManager, NotificationsPage } from "./notifications";
import { StyleGuide } from "./styleguide";
import { Url } from "./utils/helpers/url";
import { Unavailable } from "./Maintenance";
import "./App.css";
import { Loader } from "./utils/components/Loader";
import { AddDataset } from "./dataset/addtoproject/DatasetAdd.container";
import { DatasetCoordinator } from "./dataset/Dataset.state";
import AppContext from "./utils/context/appContext";
import { setupWebSocket } from "./websocket";
import SearchPage from "./features/kgSearch/KgSearchPage";
import InactiveKGProjectsPage from "./features/inactiveKgProjects/InactiveKgProjects";
import { useSelector } from "react-redux";

export const ContainerWrap = ({ children, fullSize = false }) => {
  const classContainer = !fullSize ? "container-xxl py-4 mt-2 renku-container" : "w-100";
  return <div className={classContainer}>{children}</div>;
};

function CentralContentContainer(props) {
  const { notifications, user, socket } = props;

  if (!props.user.logged && (props.location.pathname === Url.get(Url.pages.landing))) {
    return <AnonymousHome client={props.client}
      homeCustomized={props.params["HOMEPAGE"]}
      user={props.user}
      model={props.model}
      location={props.location}
      params={props.params} />;
  }

  // check anonymous sessions settings
  const blockAnonymous = !user.logged && !props.params["ANONYMOUS_SESSIONS"];

  const appContext = {
    client: props.client,
    params: props.params,
    location: props.location,
  };

  return <div className="d-flex flex-grow-1">
    <AppContext.Provider value={appContext}>
      <Helmet>
        <title>Reproducible Data Science | Open Research | Renku</title>
      </Helmet>
      <Switch>
        <Route exact path="/login" render={
          p => <ContainerWrap><Login key="login" {...p} {...props} /></ContainerWrap>} />
        <Route exact path={Url.get(Url.pages.landing)} render={
          p => (props.user.logged) ?
            <ContainerWrap>
              <Landing.Home
                key="landing" welcomePage={props.params["WELCOME_PAGE"]}
                user={props.user}
                client={props.client}
                model={props.model}
                {...p} />
            </ContainerWrap> : null
        } />
        <Route path={Url.get(Url.pages.help)} render={
          p => <ContainerWrap><Help key="help" {...p} {...props} /></ContainerWrap>} />
        <Route path={Url.get(Url.pages.search)} render={
          () => <ContainerWrap>
            <SearchPage
              key="kg-search" userName={props.user?.data?.name} isLoggedUser={props.user.logged} model={props.model} />
          </ContainerWrap>} />
        <Route path={Url.get(Url.pages.inactiveKgProjects)} render={
          (p) => props.user?.logged ?
            <ContainerWrap>
              <InactiveKGProjectsPage key="-inactive-kg-projects" socket={socket} />
            </ContainerWrap> : <NotFound {...p} />
        } />
        <Route exact
          path={[Url.get(Url.pages.projects), Url.get(Url.pages.projects.starred), Url.get(Url.pages.projects.all)]}
          render={p => <ContainerWrap><ProjectList
            key="projects"
            user={props.user}
            client={props.client}
            statusSummary={props.statusSummary}
            {...p}
          /></ContainerWrap>}
        />
        <Route exact path={Url.get(Url.pages.project.new)} render={
          p => <ContainerWrap><NewProject
            key="newProject"
            model={props.model}
            user={props.user}
            {...p}
          /></ContainerWrap>}
        />
        <Route path="/projects/:subUrl+" render={
          p => <Project.View
            key="project/view"
            client={props.client}
            params={props.params}
            model={props.model}
            user={props.user}
            blockAnonymous={blockAnonymous}
            notifications={notifications}
            {...p}
          />}
        />
        <Route exact path="/sessions" render={
          p => <ContainerWrap><Notebooks
            key="sessions"
            standalone={true}
            client={props.client}
            model={props.model}
            blockAnonymous={blockAnonymous}
            {...p}
          /></ContainerWrap>}
        />
        <Route path="/datasets/:identifier/add" render={
          p => <AddDataset
            key="addDatasetNew"
            insideProject={false}
            identifier={p.match.params?.identifier?.replaceAll("-", "")}
            datasets={p.datasets}
            model={props.model}
          />}
        />
        <Route path="/datasets/:identifier" render={
          p => <ShowDataset
            key="datasetPreview" {...p}
            insideProject={false}
            identifier={p.match.params?.identifier?.replaceAll("-", "")}
            client={props.client}
            projectsUrl="/projects"
            selectedDataset={p.match.params.datasetId}
            datasetCoordinator={new DatasetCoordinator(props.client, props.model.subModel("dataset"))}
            logged={props.user.logged}
            model={props.model}
          />}
        />
        <Route path="/datasets" render={
          p => <ContainerWrap><DatasetList key="datasets"
            client={props.client}
            model={props.model}
            {...p}
          /></ContainerWrap>}
        />
        <Route path="/privacy" render={
          p => <ContainerWrap><Privacy key="privacy"
            params={props.params}
            {...p}
          /></ContainerWrap>}
        />
        <Route path="/notifications" render={
          p => <ContainerWrap><NotificationsPage key="notifications"
            client={props.client}
            model={props.model}
            notifications={notifications}
            {...p}
          /></ContainerWrap>}
        />
        <Route path="/style-guide" render={
          p => <ContainerWrap><StyleGuide key="style-guide"
            baseUrl="/style-guide"
            {...p}
          /></ContainerWrap>}
        />
        <Route path="*" render={p => <NotFound {...p} />} />
      </Switch>
    </AppContext.Provider>
  </div>;
}

function App(props) {
  const [webSocket, setWebSocket] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    const getLocation = () => props.location;
    const notificationManager = new NotificationsManager(props.model, props.client, getLocation);
    setNotifications(notificationManager);

    // Setup authentication listeners and notifications
    LoginHelper.setupListener();
    LoginHelper.triggerNotifications(notifications);

    // Setup WebSocket channel
    let webSocketUrl = props.client.uiserverUrl + "/ws";
    if (webSocketUrl.startsWith("http"))
      webSocketUrl = "ws" + webSocketUrl.substring(4);
    // ? adding a small delay to allow session cookie to be saved to local browser before sending requests
    setWebSocket(setupWebSocket(webSocketUrl, props.model, notificationManager));
  }, []); // eslint-disable-line

  // Avoid rendering the application while authenticating the user
  const user = useSelector(state => state.stateModel.user);
  if (!user?.fetched && user?.fetching) {
    return (
      <section className="jumbotron-header rounded px-3 px-sm-4 py-3 py-sm-5 text-center mb-3">
        <h3 className="text-center text-primary">Checking user data</h3>
        <Loader />
      </section>
    );
  }
  else if (user.error) {
    return (<Unavailable model={props.model} statuspageId={props.statuspageId} />);
  }

  return (
    <Fragment>
      <Route render={p =>
        (user.logged) || (p.location.pathname !== Url.get(Url.pages.landing)) ?
          <RenkuNavBar {...p} {...props} notifications={notifications} /> :
          null
      } />
      <CentralContentContainer notifications={notifications} socket={webSocket} {...props} />
      <Route render={propsRoute => <FooterNavbar {...propsRoute} params={props.params} />} />
      <Route render={propsRoute => <Cookie {...propsRoute} params={props.params} />} />
      <ToastContainer />
    </Fragment>
  );
}

export default App;

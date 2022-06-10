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

import React, { Component, Fragment } from "react";
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

function CentralContentContainer(props) {
  const { notifications, user } = props;

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

  return <div className="container-xxl pt-4 mt-2 renku-container">
    <AppContext.Provider value={appContext}>
      <Helmet>
        <title>Reproducible Data Science | Open Research | Renku</title>
      </Helmet>
      <Switch>
        <Route exact path="/login" render={
          p => <Login key="login" {...p} {...props} />} />
        <Route exact path={Url.get(Url.pages.landing)} render={
          p => (props.user.logged) ?
            <Landing.Home
              key="landing" welcomePage={props.params["WELCOME_PAGE"]}
              user={props.user}
              client={props.client}
              model={props.model}
              {...p} /> : null
        } />
        <Route path={Url.get(Url.pages.help)} render={
          p => <Help key="help" {...p} {...props} />} />
        <Route exact
          path={[Url.get(Url.pages.projects), Url.get(Url.pages.projects.starred), Url.get(Url.pages.projects.all)]}
          render={p => <ProjectList
            key="projects"
            user={props.user}
            client={props.client}
            statusSummary={props.statusSummary}
            {...p}
          />}
        />
        <Route exact path={Url.get(Url.pages.project.new)} render={
          p => <NewProject
            key="newProject"
            model={props.model}
            user={props.user}
            {...p}
          />}
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
          p => <Notebooks
            key="sessions"
            standalone={true}
            client={props.client}
            model={props.model}
            blockAnonymous={blockAnonymous}
            {...p}
          />}
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
          p => <DatasetList key="datasets"
            client={props.client}
            model={props.model}
            {...p}
          />}
        />
        <Route path="/privacy" render={
          p => <Privacy key="privacy"
            params={props.params}
            {...p}
          />}
        />
        <Route path="/notifications" render={
          p => <NotificationsPage key="notifications"
            client={props.client}
            model={props.model}
            notifications={notifications}
            {...p}
          />}
        />
        <Route path="/style-guide" render={
          p => <StyleGuide key="style-guide"
            baseUrl="/style-guide"
            {...p}
          />}
        />
        <Route path="*" render={p => <NotFound {...p} />} />
      </Switch>
    </AppContext.Provider>
  </div>;
}

class App extends Component {
  constructor(props) {
    super(props);

    // Setup notification system
    const getLocation = () => this.props.location;
    this.notifications = new NotificationsManager(this.props.model, this.props.client, getLocation);

    // Setup authentication listeners and notifications
    LoginHelper.setupListener();
    LoginHelper.triggerNotifications(this.notifications);
  }

  render() {
    // Avoid rendering the application while authenticating the user
    const { user } = this.props;
    if (!user.fetched && user.fetching) {
      return (
        <section className="jumbotron-header rounded px-3 px-sm-4 py-3 py-sm-5 text-center mb-3">
          <h3 className="text-center text-primary">Checking user data</h3>
          <Loader />
        </section>
      );
    }
    else if (user.error) {
      return (<Unavailable />);
    }

    return (
      <Fragment>
        <Route render={p =>
          (this.props.user.logged) || (p.location.pathname !== Url.get(Url.pages.landing)) ?
            <RenkuNavBar {...p} {...this.props} notifications={this.notifications} /> :
            null
        } />
        <CentralContentContainer notifications={this.notifications} {...this.props} />
        <Route render={props => <FooterNavbar {...props} params={this.props.params} />} />
        <Route render={props => <Cookie {...props} params={this.props.params} />} />
        <ToastContainer />
      </Fragment>
    );

  }
}

export default App;

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
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Container } from "reactstrap";

import Project from "./project/Project";
import { ProjectList } from "./project/list";
import { NewProject } from "./project/new";
import DatasetList from "./dataset/list/DatasetList.container";
import { Landing, RenkuNavBar, FooterNavbar } from "./landing";
import { Notebooks } from "./notebooks";
import { Login, LoginHelper } from "./authentication";
import Help from "./help";
import NotFound from "./not-found";
import ShowDataset from "./dataset/Dataset.container";
import { Loader } from "./utils/UIComponents";
import { Cookie, Privacy } from "./privacy";
import { NotificationsManager, NotificationsPage } from "./notifications";
import { Url } from "./utils/url";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";


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

    // check anonymous sessions settings
    const blockAnonymous = !user.logged && !this.props.params["ANONYMOUS_SESSIONS"];

    return (
      <Fragment>
        <Route render={props =>
          <RenkuNavBar {...props} {...this.props} notifications={this.notifications} />
        } />
        <Container className="container renku-container pt-4">
          <Switch>
            <Route exact path="/login" render={
              p => <Login key="login" {...p} {...this.props} />} />
            <Route exact path={Url.get(Url.pages.landing)} render={
              p => <Landing.Home
                key="landing" welcomePage={this.props.params["WELCOME_PAGE"]}
                user={this.props.user}
                client={this.props.client}
                model={this.props.model}
                statuspageId={this.props.statuspageId}
                {...p} />} />
            <Route path={Url.get(Url.pages.help)} render={
              p => <Help key="help" {...p} statuspageId={this.props.statuspageId} {...this.props} />} />
            <Route exact
              path={[Url.get(Url.pages.projects), Url.get(Url.pages.projects.starred), Url.get(Url.pages.projects.all)]}
              render={p => <ProjectList
                key="projects"
                user={this.props.user}
                client={this.props.client}
                statusSummary={this.props.statusSummary}
                {...p}
              />}
            />
            <Route exact path={Url.get(Url.pages.project.new)} render={
              p => <NewProject
                key="newProject"
                client={this.props.client}
                model={this.props.model}
                user={this.props.user}
                templates={this.props.params["TEMPLATES"]}
                {...p}
              />}
            />
            <Route path="/projects/:subUrl+" render={
              p => <Project.View
                key={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                projectPathWithNamespace={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                client={this.props.client}
                params={this.props.params}
                model={this.props.model}
                user={this.props.user}
                blockAnonymous={blockAnonymous}
                notifications={this.notifications}
                {...p}
              />}
            />
            <Route exact path="/environments" render={
              p => <Notebooks
                key="environments"
                standalone={true}
                client={this.props.client}
                model={this.props.model}
                blockAnonymous={blockAnonymous}
                {...p}
              />}
            />
            <Route path="/datasets/:identifier" render={
              p => <ShowDataset
                key="datasetPreview" {...p}
                insideProject={false}
                identifier={`${p.match.params.identifier}`}
                client={this.props.client}
                projectsUrl="/projects"
                selectedDataset={p.match.params.datasetId}
                logged={this.props.user.logged}
                model={this.props.model}
              />}
            />
            <Route path="/datasets" render={
              p => <DatasetList key="datasets"
                client={this.props.client}
                model={this.props.model}
                {...p}
              />}
            />
            <Route path="/privacy" render={
              p => <Privacy key="privacy"
                params={this.props.params}
                {...p}
              />}
            />
            <Route path="/notifications" render={
              p => <NotificationsPage key="notifications"
                client={this.props.client}
                model={this.props.model}
                notifications={this.notifications}
                {...p}
              />}
            />
            <Route path="*" render={p => <NotFound {...p} />} />
          </Switch>
        </Container>
        <Route render={props => <FooterNavbar {...props} params={this.props.params} />} />
        <Route render={props => <Cookie {...props} params={this.props.params} />} />
        <ToastContainer />
      </Fragment>
    );

  }
}

export default App;

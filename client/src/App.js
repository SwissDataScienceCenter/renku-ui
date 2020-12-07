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
import { Jumbotron } from "reactstrap";
import { Route, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Project from "./project/Project";
import DatasetList from "./dataset/list/DatasetList.container";
import { Landing, RenkuNavBar, FooterNavbar } from "./landing";
import { Notebooks } from "./notebooks";
import { Login } from "./authentication";
import Help from "./help";
import NotFound from "./not-found";
import ShowDataset from "./dataset/Dataset.container";
import { Loader } from "./utils/UIComponents";
import { Cookie, Privacy } from "./privacy";
import { NotificationsManager, NotificationsPage } from "./notifications";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";


class App extends Component {
  render() {
    // Avoid rendering the application while authenticating the user
    const { user } = this.props;
    if (!user.fetched && user.fetching) {
      return (
        <Jumbotron className="bg-white">
          <h3 className="text-center text-primary">Checking user data</h3>
          <Loader />
        </Jumbotron>
      );
    }

    // check anonymous sessions settings
    const blockAnonymous = !user.logged && !this.props.params["ANONYMOUS_SESSIONS"];

    // setup notification system
    const getLocation = () => this.props.location;
    const notifications = new NotificationsManager(this.props.model, this.props.client, getLocation);

    return (
      <Fragment>
        <Route render={props =>
          <RenkuNavBar {...props} {...this.props} notifications={notifications} />
        } />
        <main role="main" className="container-fluid">
          <div key="gap">&nbsp;</div>
          <h1>TEST CI ACTIONS</h1>
          <Switch>
            {/* Route forces trailing slashes on routes ending with a numerical id */}
            <Route exact path="/login" render={
              p => <Login key="login" {...p} {...this.props} />} />
            <Route exact strict path="/*(\d+)" render={props => <Redirect to={`${props.location.pathname}/`} />} />
            <Route exact path="/" render={
              p => <Landing.Home
                key="landing" welcomePage={this.props.params["WELCOME_PAGE"]}
                user={this.props.user}
                client={this.props.client}
                model={this.props.model}
                statuspageId={this.props.statuspageId}
                {...p} />} />
            <Route path="/help" render={
              p => <Help key="help" {...p} statuspageId={this.props.statuspageId} {...this.props} />} />
            <Route exact path={["/projects", "/projects/starred", "/projects/all"]} render={
              p => <Project.List
                key="projects"
                user={this.props.user}
                client={this.props.client}
                statusSummary={this.props.statusSummary}
                {...p}
              />}
            />
            <Route exact path="/projects/new" render={
              p => <Project.New
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
                notifications={notifications}
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
                notifications={notifications}
                {...p}
              />}
            />
            <Route path="*" render={p => <NotFound {...p} />} />
          </Switch>
        </main>
        <Route render={props => <FooterNavbar {...props} params={this.props.params} />} />
        <Route render={props => <Cookie {...props} params={this.props.params} />} />
        <ToastContainer />
      </Fragment>
    );

  }
}

export default App;

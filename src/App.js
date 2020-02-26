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

import React, { Component } from "react";
import { Jumbotron } from "reactstrap";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Project from "./project/Project";
import DatasetList from "./dataset/list/DatasetList.container";
import { Landing, RenkuNavBar, FooterNavbar } from "./landing";
import { Notebooks } from "./notebooks";
import { Login } from "./authentication";
import Help from "./help";
import NotFound from "./not-found";
import ShowDataset from "./dataset/Dataset.container";
import { Bouncer } from "./utils/UIComponents";

import "./App.css";


class App extends Component {
  render() {
    const { user } = this.props;
    if (!user.fetched && user.fetching) {
      return (
        <Jumbotron className="delay1s bg-white">
          <h3 className="text-center">Checking user data</h3>
          <Bouncer />
        </Jumbotron>
      );
    }

      return (
        <Router>
          <div>
            <Route render={props =>
              <RenkuNavBar {...props} {...this.props} />
            } />
            <main role="main" className="container-fluid">
              <div key="gap">&nbsp;</div>
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
                    {...p} />} />
                <Route path="/help" render={
                  p => <Help key="help" {...p} {...this.props} />} />
                <Route exact path={["/projects", "/projects/starred", "/projects/search"]} render={
                  p => <Project.List
                    key="projects"
                    user={this.props.user}
                    client={this.props.client}
                    {...p}
                  />}
                />
                {/* pull out the underlying parts of the url and pass them to the project view */}
                <Route path="/projects/:subUrl+" render={
                  p => <Project.View
                    key={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                    projectPathWithNamespace={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                    client={this.props.client}
                    params={this.props.params}
                    model={this.props.model}
                    user={this.props.user}
                    {...p}
                  />}
                />
                <Route exact path="/project_new" render={
                  p => <Project.New
                    key="project_new"
                    client={this.props.client}
                    model={this.props.model}
                    user={this.props.user}
                    renkuTemplatesUrl={this.props.params["RENKU_TEMPLATES_URL"]}
                    renkuTemplatesRef={this.props.params["RENKU_TEMPLATES_REF"]}
                    {...p}
                  />}
                />
                <Route exact path="/environments" render={
                  p => <Notebooks
                    key="environments"
                    standalone={true}
                    client={this.props.client}
                    model={this.props.model}
                    {...p}
                  />}
                />
                <Route path="/datasets/:identifier" render={
                  p => <ShowDataset
                    key="datasetpreview" {...p}
                    insideProject={false}
                    identifier={`${p.match.params.identifier}`}
                    client={this.props.client}
                    projectsUrl="/projects"
                    selectedDataset={p.match.params.datasetId}
                  />}
                />
                <Route path="/datasets" render={
                  p => <DatasetList key="datasets"
                    client={this.props.client}
                    model={this.props.model}
                    {...p}
                  />}
                />
                <Route path="*" render={p => <NotFound {...p} />} />
              </Switch>
            </main>
            <Route component={FooterNavbar} />
          </div>
        </Router>
      );

  }
}

export default App;

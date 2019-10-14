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

import React, { Component } from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Switch, Redirect }  from 'react-router-dom'

import Project from './project/Project'
import Issue from './issue/Issue'
import DatasetList from './dataset/list/DatasetList.container'
import { Landing, LoggedInNavBar, AnonymousNavBar, FooterNavbar } from './landing'
import { Notebooks } from './notebooks';
import { Login } from './authentication'
import Help from './help'
import NotFound from './not-found'
import { UserAvatar } from './utils/UIComponents'
import ShowDataset from './dataset/Dataset.container'

class RenkuNavBar extends Component {

  render() {
    const user = this.props.userState.getState().user || {};
    return (user.id) ? <LoggedInNavBar {...this.props} /> : <AnonymousNavBar {...this.props} />
  }
}

class RenkuFooter extends Component {
  render() {
    return <FooterNavbar {...this.props} />
  }
}


class App extends Component {
  render() {
    const userAvatar = <UserAvatar userState={this.props.userState} />;
    return (
      <Router>
        <div>
          <Route render={props => <RenkuNavBar userAvatar={userAvatar} {...props} {...this.props}/>} />
          <main role="main" className="container-fluid">
            <div key="gap">&nbsp;</div>
            <Switch>

              {/* Route forces trailing slashes on routes ending with a numerical id */}
              <Route exact path="/login"
                render ={p => <Login key="login" {...p} {...this.props} /> } />
              <Route exact strict path="/*(\d+)" render={props => <Redirect to={`${props.location.pathname}/`}/>}/>
              <Route exact path="/"
                render={p => <Landing.Home
                  key="landing" welcomePage={this.props.params['WELCOME_PAGE']}
                  user={this.props.userState.getState().user}
                  userStateDispatch={this.props.userState.dispatch}
                  client={this.props.client}
                  {...p} />} />
              <Route path="/help"
                render ={p => <Help key="help" {...p} {...this.props} /> } />

              {/*TODO: This route should be handled by <Route path="/projects/:id(\d+)" too. Until this is the
                 TODO: case, the issue_new route must be listed BEFORE the project one.   */}
              <Route exact path="/projects/:projectNamespace/:projectName/issue_new"
                render={(p) => <Issue.New key="issue_new" projectPathWithNamespace={`${p.match.params.projectNamespace}/${p.match.params.projectName}`} client={this.props.client} {...p}/>}/>
              {/* pull out the underlying parts of the url and pass them to the project view */}
              <Route path="/projects/:projectNamespace/:projectName"
                render={p => <Project.View key={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                  projectPathWithNamespace={`${p.match.params.projectNamespace}/${p.match.params.projectName}`}
                  client={this.props.client}
                  params={this.props.params}
                  model={this.props.model}
                  user={this.props.userState.getState().user}
                  userStateDispatch={this.props.userState.dispatch}
                  {...p}
                />}
              />
              <Route path="/projects/:id(\d+)"
                render={p => <Project.View key={`${p.match.params.id}`}
                  projectId={`${p.match.params.id}`} {...p}
                  client={this.props.client}
                  params={this.props.params}
                  model={this.props.model}
                  user={this.props.userState.getState().user}
                  userStateDispatch={this.props.userState.dispatch}
                />}
              />
              <Route path="/projects" render={
                p => <Project.List
                  key="projects"
                  user={this.props.userState.getState().user}
                  client={this.props.client}
                  {...p}
                />
              }/>
              <Route exact path="/project_new"
                render={(p) =>
                  <Project.New key="project_new"
                    client={this.props.client}
                    user={this.props.userState.getState().user}
                    userStateDispatch={this.props.userState.dispatch}
                    renkuTemplatesUrl={this.props.params['RENKU_TEMPLATES_URL']}
                    renkuTemplatesRef={this.props.params['RENKU_TEMPLATES_REF']}
                    {...p}/> }/>
              <Route exact path="/environments"
                render={p => <Notebooks key="environments"
                  standalone={true}
                  client={this.props.client}
                  model={this.props.model}
                  {...p}
                />}
              />
              <Route path="/datasets/:identifier"
                render={p => 
                  <ShowDataset
                    key="datasetpreview"  {...p}
                    insideProject={false}
                    identifier={`${p.match.params.identifier}`}
                    client={this.props.client}
                    projectsUrl="/projects"
                    selectedDataset={p.match.params.datasetId}
                  />
                }
              /> 
              <Route path="/datasets"
                render={p => <DatasetList key="datasets"
                  client={this.props.client}
                  model={this.props.model}
                  user={this.props.userState.getState().user}
                  {...p}
                />}
              />
              <Route path="*"
                render={p => <NotFound {...p} />} />
            </Switch>
          </main>
          <Route component={RenkuFooter} />
        </div>
      </Router>
    );
  }
}

export default App;

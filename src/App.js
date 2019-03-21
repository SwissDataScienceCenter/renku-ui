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
import Ku from './ku/Ku'
import { Landing, LoggedInNavBar, AnonymousNavBar, FooterNavbar } from './landing'
import Notebooks from './notebooks';
import { Login } from './login'
import Help from './help'
import { UserAvatar } from './utils/UIComponents'

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
                  {...p} />} />
              <Route path="/help"
                render ={p => <Help key="help" {...p} {...this.props} /> } />

              {/*TODO: This route should be handled by <Route path="/projects/:id(\d+)" too. Until this is the
                 TODO: case, the ku_new route must be listed BEFORE the project one.   */}
              <Route exact path="/projects/:projectId(\d+)/ku_new"
                render={(p) => <Ku.New key="ku_new" client={this.props.client} {...p}/>}/>
              {/* pull out the underlying parts of the url and pass them to the project view */}
              <Route path="/projects/:id(\d+)"
                render={p => <Project.View key="project" id={p.match.params.id} {...p}
                  user={this.props.userState.getState().user} userStateDispatch={this.props.userState.dispatch}
                  client={this.props.client} params={this.props.params}/>}/>
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
                  <Project.New key="project_new" client={this.props.client}
                    user={this.props.userState.getState().user} {...p}/> }/>
              <Route exact path="/notebooks"
                render={p => <Notebooks.Admin key="notebooks"
                  user={this.props.userState.getState().user}
                  client={this.props.client} {...p} />} />
            </Switch>
          </main>
          <Route component={RenkuFooter} />
        </div>
      </Router>
    );
  }
}

export default App;

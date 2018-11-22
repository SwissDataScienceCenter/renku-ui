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
import { Landing, LoggedInNavBar } from './landing'
import Notebooks from './notebooks';
<<<<<<< HEAD
import { Login } from './login'
import { RenkuNavLink, UserAvatar } from './utils/UIComponents'
import QuickNav from './utils/quicknav'
// import Lineage from './lineage'


function getActiveProjectId(currentPath) {
  try {
    return currentPath.match(/\/projects\/(\d+)/)[0].replace('/projects/', '')
  } catch(TypeError) {
    return null
  }
}

class RenkuToolbarItemUser extends Component {
  render() {
    if (!this.props.user) {
      return <RenkuNavLink to="/login" title="Login" />
    }
    else {
      return <li className="nav-item dropdown">
        <a key="button" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
          aria-haspopup="true" aria-expanded="false">
          {this.props.userAvatar}
        </a>
        <div key="menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
          {/* TODO: This is going to break as soon as we're trying to use another keycloak instance - replace by proper ui route. */}
          <a
            className="dropdown-item"
            href="/auth/realms/Renku/account?referrer=renku-ui"
          >Profile</a>
          <a
            className="dropdown-item"
            href={`${this.props.params.GATEWAY_URL}/auth/logout?redirect_url=${encodeURIComponent(this.props.params.BASE_URL)}`}
          >Logout</a>
        </div>
      </li>
    }
  }
}
=======
import { Login, Logout } from './login'
import { UserAvatar } from './utils/UIComponents'

import { Input, Button, Row, Col } from 'reactstrap';
>>>>>>> Extracted the NavBar to its own file.

class RenkuNavBar extends Component {

  render() {
    return <LoggedInNavBar {...this.props} />
  }
}

class RenkuFooter extends Component {
  render() {
    return <footer className="footer">
      <div className="container">
        <span className="text-muted">
          <a href="https://datascience.ch">&copy; SDSC {(new Date()).getFullYear()}</a>
        </span>
      </div>
    </footer>
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

              <Route exact path="/projects" render={
                p => <Project.List
                  key="projects"
                  user={this.props.userState.getState().user}
                  client={this.props.client}
                  {...p}
                />
              }/>

              {/*TODO: This route should be handled by <Route path="/projects/:id(\d+)" too. Until this is the
                 TODO: case, the ku_new route must be listed BEFORE the project one.   */}
              <Route exact path="/projects/:projectId(\d+)/ku_new"
                render={(p) => <Ku.New key="ku_new" client={this.props.client} {...p}/>}/>
              {/* pull out the underlying parts of the url and pass them to the project view */}
              <Route path="/projects/:id(\d+)"
                render={p => <Project.View key="project" id={p.match.params.id} {...p}
                  user={this.props.userState.getState().user} userStateDispatch={this.props.userState.dispatch}
                  client={this.props.client} params={this.props.params}/>}/>
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

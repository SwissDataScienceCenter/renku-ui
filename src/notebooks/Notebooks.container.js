/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React, { Component } from 'react';
// import { Notebooks as NotebooksPresent } from './Notebooks.present';

import { NotebookServerOptions } from './Notebooks.present';
import Cookies from 'universal-cookie';
import { ExternalLink } from '../utils/UIComponents';

class NotebookAdmin extends Component {
  render() {
    const adminUiUrl = this.props.adminUiUrl;
    // return <iframe width="100%" height="100%"
    //   style={{border:"none"}}
    //   src={adminUiUrl}></iframe>
    return <ExternalLink url={adminUiUrl} title="Launch Notebook Admin UI" />
  }
}

class LaunchNotebookServer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverOptions: {},
      serverRunning: false
    };
    this.cookies = new Cookies();
    this._unmounting = false;
  }

  componentWillUnmount() {
    this._unmounting = true;
  }

  componentDidMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.props.core.notebookServerUrl !== this.previousNotebookServerUrl){
      this.serverStatusSet = false;
      this.serverOptionsSet = false;
    }
    this.previousNotebookServerUrl = this.props.core.notebookServerUrl;
    this.setServerStatus()
    this.setServerOptions()
  }


  setServerStatus() {
    if (this.serverStatusSet) return;
    if (!this.props.core.notebookServerUrl || !this.cookies.get('jh_token')) return;

    // Check for already running servers
    fetch(this.props.core.notebookServerUrl, {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `token ${this.cookies.get('jh_token')}`
      }),
      credentials: 'omit'
    })
      .then(response => {
        if (response.status >= 300) {
          return {};
        }
        else {
          return response.json()
        }
      })
      .then(data => {
        const serverStatus = !(!data.pending && !data.ready);
        if (!this._unmounting) {
          this.setState({serverRunning: serverStatus});
          this.serverStatusSet = true;
        }
      });
  }

  setServerOptions() {
    if (this.serverOptionsSet) return;
    if (!this.props.core.notebookServerUrl || !this.cookies.get('jh_token')) return;
    // Load options and save them to state,
    // set intial selection values to defaults.
    fetch(`${this.props.core.notebookServerUrl}/server_options`, {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `token ${this.cookies.get('jh_token')}`
      }),
      cache: 'no-store',
      credentials: 'omit',
    })
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach(key => {
          data[key].selected = data[key].default;
        })
        if (!this._unmounting) {
          this.setState({serverOptions: data});
          this.serverOptionsSet = true;
        }
      })
  }


  getChangeHandlers() {

    const handlers = {};

    // Add all resource change handlers.
    Object.keys(this.state.serverOptions).forEach(key => {
      handlers[key] = (e) => {
        const newValue = this.state.serverOptions[key].type === 'boolean' ?
          e.target.checked : e.target.value;

        this.setState((prevState) => {
          const newState = {...prevState};
          newState.serverOptions[key].selected = newValue;
          return newState;
        })
      }
    });
    return handlers;
  }


  onSubmit(event) {
    event.preventDefault();

    const postData = {
      serverOptions: {}
    };
    Object.keys(this.state.serverOptions).forEach(key => {
      postData.serverOptions[key] = this.state.serverOptions[key].selected
    });

    // TODO: Temporary fix for notebook launching!
    // TODO: Improve as soon as communication between
    // TODO: ui and notebook service is routed through gateway.
    fetch(this.props.core.notebookServerUrl, {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `token ${this.cookies.get('jh_token')}`,
        'Content-Type': 'application/json'
      }),
      credentials: 'omit',
      body: JSON.stringify(postData)
    })
      .then(() => {
        this.props.onSuccess()
      })
      window.open(this.props.core.notebookServerUrl)
  }


  render() {
    if (this.state.serverRunning) {
      return <p>You already have a server running.</p>
    }
    else {
      return <NotebookServerOptions
        onSubmit={this.onSubmit.bind(this)}
        changeHandlers={this.getChangeHandlers()}
        serverOptions={this.state.serverOptions}
      />
    }
  }
}

export { NotebookAdmin, LaunchNotebookServer };

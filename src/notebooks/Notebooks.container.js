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
import { ExternalLink } from '../utils/UIComponents';
import { NotebookServers as NotebookServersPresent } from './Notebooks.present';

class NotebookAdmin extends Component {
  render() {
    const adminUiUrl = this.props.adminUiUrl;
    // TODO: don't open an external popup but display the content here
    return <div>
      <ExternalLink url={adminUiUrl} title="Launch Notebook Admin UI" />
    </div>
  }
}

class LaunchNotebookServer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverOptions: {},
      serverRunning: false
    };
    this._unmounting = false;
  }

  componentWillUnmount() {
    this._unmounting = true;
  }

  componentDidMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.props.core.notebookServerAPI !== this.previousNotebookServerAPI){
      this.serverStatusSet = false;
      this.serverOptionsSet = false;
    }
    this.previousNotebookServerAPI = this.props.core.notebookServerAPI;
    this.setServerStatus()
    this.setServerOptions()
  }


  setServerStatus() {
    if (this.serverStatusSet) return;
    if (!this.props.core.notebookServerAPI) return;
    if (!this.props.client) return;

    // Check for already running servers
    const headers = this.props.client.getBasicHeaders();
    this.props.client.clientFetch(this.props.core.notebookServerAPI, {headers})
      .then(response => {
        const serverStatus = !(!response.data.pending && !response.data.ready);
        if (!this._unmounting) {
          this.setState({serverRunning: serverStatus});
          this.serverStatusSet = true;
        }
      });
  }

  setServerOptions() {
    if (this.serverOptionsSet) return;
    if (!this.props.core.notebookServerAPI) return;
    if (!this.props.client) return;
    // Load options and save them to state,
    // set intial selection values to defaults.
    const headers = this.props.client.getBasicHeaders();
    this.props.client.clientFetch(`${this.props.core.notebookServerAPI}/server_options`, {
      cache: 'no-store',
      headers
    })
      .then(response => {
        const data = response.data;
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

    const headers = this.props.client.getBasicHeaders();
    headers.set('Content-Type', 'application/json');
    this.props.client.clientFetch(this.props.core.notebookServerAPI, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    })
      .then(() => {
        this.props.onSuccess()
      })

    // Note that the opening of the new tab must happen
    // on click and can not be delayed (pop-up blocking)
    window.open(this.props.core.notebookServerUrl);
  }


  render() {
    if (!this.props.client) return null;
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

class NotebookServers extends Component {
  render() {
    return <NotebookServersPresent {...this.props} />
  }
}

export { NotebookAdmin, LaunchNotebookServer, NotebookServers };

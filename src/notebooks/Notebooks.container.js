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
import { connect } from 'react-redux'
import { Col } from 'reactstrap';

import { NotebookServerOptions, NotebookServers, LogOutUser } from './Notebooks.present';

import NotebooksModel from './Notebooks.state';
import { Notebooks as NotebooksPresent } from './Notebooks.present';

class LaunchNotebookServer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverOptions: {},
      serverRunning: false,
      serverStarting: false,
      doLogOut: false
    };
    this._unmounting = false;
  }

  componentWillUnmount() {
    this._unmounting = true;
  }

  componentDidMount() {
    if (this.state.doLogOut === false)
      this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.state.doLogOut === true) return; // We are about to refresh anyway...

    if (this.props.core.notebookServerAPI !== this.previousNotebookServerAPI) {
      this.serverStatusSet = false;
      this.serverOptionsSet = false;
    }
    this.previousNotebookServerAPI = this.props.core.notebookServerAPI;
    this.setServerStatus();
    this.setServerOptions();
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
      }).catch(e => {
        if (e.case === 'UNAUTHORIZED') {
          this.setState({ doLogOut: true });
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

    // TODO: Move this code to a method getServerOptions in api client library.
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
      .catch(e => {
        if (e.case === 'UNAUTHORIZED'){
          this.setState({ doLogOut: true });
        }
      });
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

    this.setState({serverStarting: true});
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
    // window.open(this.props.core.notebookServerUrl);
  }


  render() {
    if (!this.props.client) return null;

    if (this.state.doLogOut) {
      return <LogOutUser client={this.props.client} />
    } else if (this.state.serverRunning) {
      return <Col xs={12}>
        <p>You already have a server running.</p>
      </Col>
    }
    else {
      return <NotebookServerOptions
        loader={this.state.serverStarting}
        onSubmit={this.onSubmit.bind(this)}
        changeHandlers={this.getChangeHandlers()}
        serverOptions={this.state.serverOptions}
      />
    }
  }
}

class Notebooks extends Component {
  constructor(props) {
    super(props);
    this.model = new NotebooksModel(props.client);

    this.handlers = {
      onStopNotebook: this.onStopNotebook.bind(this)
    }
  }

  componentDidMount() {
    this.startNotebookPolling();
  }

  componentWillUnmount() {
    this.stopNotebookPolling();
  }

  startNotebookPolling() {
    this.model.startNotebookPolling();
  }
  stopNotebookPolling() {
    this.model.stopNotebookPolling();
  }
  onStopNotebook(serverName){
    this.model.stopNotebook(serverName);
  }

  mapStateToProps(state, ownProps) {
    return {
      handlers: this.handlers,
      ...state
    }
  }

  render() {
    const VisibleNotebooks = connect(this.mapStateToProps.bind(this))(NotebooksPresent);

    return <VisibleNotebooks
      store={this.model.reduxStore}
      user={this.props.user}
    />
  }
}


export { LaunchNotebookServer, NotebookServers, Notebooks };

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
 *  incubator-renga-ui
 *
 *  Project.js
 *  Container components for project.
 */

import React, { Component } from 'react';

import { Provider, connect } from 'react-redux'

import { Row, Col } from 'reactstrap';

import { createStore } from '../utils/EnhancedState'
import Present from './Project.present'
import State from './Project.state'

class New extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.New.reducer);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  submitData() {
    return this.store.getState();
  }

  handleSubmit() {
    const body = JSON.stringify(this.submitData());
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    fetch('api/datasets/', {method: 'POST', headers: headers, body: body})
      .then( (response) => {
        if (response.ok) {
          response.json().then( newProject => {
            this.store.dispatch(State.List.append([newProject]))
          });
          this.props.history.push({pathname: '/projects/'});
        }
      });
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onTitleChange: (e) => { dispatch(State.New.Core.set('title', e.target.value)) },
      onDescriptionChange: (e) => { dispatch(State.New.Core.set('description', e.target.value)) },
      onVisibilityChange: (e) => { dispatch(State.New.Visibility.set(e.target.value)) },
      onDataReferenceChange: (key, e) => { dispatch(State.New.Data.set('reference', key, e.target.value)) }
    }
  }

  render() {
    const VisibleNewProject = connect(this.mapStateToProps, this.mapDispatchToProps)(Present.ProjectNew);
    return [
      <Row key="header"><Col md={8}><h1>New Project</h1></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}><VisibleNewProject onSubmit={this.onSubmit} /></Col></Row>
      </Provider>
    ]
  }
}

function displayMetadataValue(metadata, field, defaultValue) {
  let value = metadata[field];
  if (value == null) value = defaultValue;
  return value;
}

class View extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.View.reducer);
  }

  componentDidMount() {
    this.retrieveProject();
  }

  retrieveProject() {
    this.store.dispatch(State.View.fetchMetadata(this.props.client, this.props.id));
    this.store.dispatch(State.View.fetchReadme(this.props.client, this.props.id));
  }

  mapStateToProps(state, ownProps) {
    const displayId = state.core.displayId;
    const internalId = state.core.id;
    const visibilityLevel = state.visibility.level;
    const externalUrl = state.core.external_url;
    const title = displayMetadataValue(state.core, 'title', 'no title');
    const description = displayMetadataValue(state.core, 'description', 'no description');
    const readmeText = state.data.readme.text;
    const lastActivityAt = state.core.last_activity_at;
    return {title, description, displayId, internalId, visibilityLevel, externalUrl, readmeText, lastActivityAt}
  }

  render() {
    const VisibleProjectView = connect(this.mapStateToProps)(Present.ProjectView);
    return (
      <Provider key="new" store={this.store}>
        <VisibleProjectView />
      </Provider>)
  }
}

class List extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.List.reducer);
  }

  componentDidMount() {
    this.listProjects();
  }

  listProjects() {
    this.store.dispatch(State.List.fetch(this.props.client));
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
    }
  }

  render() {
    const VisibleProjectList = connect(this.mapStateToProps, this.mapDispatchToProps)(Present.ProjectList);
    return [
      <Provider key="new" store={this.store}>
        <VisibleProjectList />
      </Provider>
    ]
  }
}

export default { New, View, List };

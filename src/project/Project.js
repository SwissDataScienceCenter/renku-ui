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

import { StateKind, StateModelComponent } from '../model/Model';
import { projectSchema} from '../model/RengaModels';
import { createStore } from '../utils/EnhancedState'
import { slugFromTitle } from '../utils/HelperFunctions';
import Present from './Project.present'
import State from './Project.state'
import Ku from '../ku/Ku'
import Notebook from '../file/Notebook'
import { FileLineage, LaunchNotebookServerButton } from '../file'


class New extends StateModelComponent {
  constructor(props) {
    super(props, projectSchema, StateKind.REDUX);
    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      onTitleChange: this.onTitleChange.bind(this),
      onDescriptionChange: this.onDescriptionChange.bind(this),
      onVisibilityChange: this.onVisibilityChange.bind(this),
    };
  }

  onSubmit = () => {
    const validation = this.model.validate()
    if (validation.result) {
      this.props.client.postProject(this.model.get()).then((project) => {
        this.props.history.push(`/projects/${project.id}`);
      })
    }
    else {
      // This should be done by proper form validation.
      console.error('Can not create new project - insufficient information: ', validation.errors)
    }
  };
  onTitleChange = (e) => {
    this.model.setOne('display.title', e.target.value);
    this.model.setOne('display.slug', slugFromTitle(e.target.value));
  };
  onDescriptionChange = (e) => { this.model.setOne('display.description', e.target.value) };
  onVisibilityChange = (e) => { this.model.setOne('meta.visibility', e.target.value) };
  // onDataReferenceChange = (key, e) => { this.model.setOne('reference', key, e.target.value) };

  render() {
    const VisibleNewProject = connect(this.mapStateToProps)(Present.ProjectNew);
    return [
      <Provider key="new" store={this.store}>
        <VisibleNewProject handlers={this.handlers} />
      </Provider>
    ]
  }
}

class View extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.View.reducer, 'project details');
  }

  componentDidMount() {
    this.retrieveProject();
  }

  retrieveProject() {
    this.store.dispatch(State.View.fetchMetadata(this.props.client, this.props.id));
    this.store.dispatch(State.View.fetchReadme(this.props.client, this.props.id));
  }

  getStarred(userState, projectId) {
    const user = userState.getState().user;
    if (user && user.starredProjects) {
      return user.starredProjects.map((project) => project.id).indexOf(projectId) >= 0
    }
    else {
      return undefined
    }
  }

  mapStateToProps(state, ownProps) {
    // Display properties
    const displayId = state.core.displayId;
    const internalId = state.core.id || parseInt(ownProps.match.params.id, 10);
    const starred = this.getStarred(ownProps.userState, internalId);
    const visibilityLevel = state.visibility.level;
    const accessLevel = state.visibility.accessLevel;
    const externalUrl = state.core.external_url;
    const title = state.core.title || 'no title';
    const description = state.core.description || 'no description';
    const readmeText = state.data.readme.text;
    const lastActivityAt = state.core.last_activity_at;
    const tag_list = state.system.tag_list;
    const star_count = state.system.star_count;
    const ssh_url = state.system.ssh_url;
    const http_url = state.system.http_url;

    // Routing properties
    const baseUrl = ownProps.match.isExact ? ownProps.match.url.slice(0, -1) : ownProps.match.url;
    const overviewUrl = `${baseUrl}/`;
    const kusUrl = `${baseUrl}/kus`;
    const kuUrl = `${baseUrl}/kus/:kuIid(\\d+)`;
    const notebooksUrl = `${baseUrl}/notebooks`;
    const notebookUrl = `${baseUrl}/notebooks/:notebookPath`;
    const dataUrl = `${baseUrl}/data`;
    const datumUrl = `${baseUrl}/data/:datumPath+`;
    const settingsUrl = `${baseUrl}/settings`;
    const kuList = <Ku.List {...ownProps}
      key="kus" kuBaseUrl={kusUrl} projectId={internalId}  client={ownProps.client} />
    const kuView = (p) => <Ku.View key="ku" projectId={internalId}
      kuIid={p.match.params.kuIid} {...p} client={ownProps.client} userState={ownProps.userState}
      updateProjectView={this.forceUpdate.bind(this)} accessLevel={accessLevel}/>
    /* TODO Should we handle each type of file or just have a generic project files viewer? */
    const notebookView = (p) => <Notebook.Show key="notebook"
      projectId={internalId}
      path={`notebooks/${p.match.params.notebookPath}`}
      client={ownProps.client} {...p} accessLevel={accessLevel}/>;
    const lineageView = (p) => <FileLineage key="lineage"
      projectId={internalId}
      path={`data/${p.match.params.datumPath}`}
      client={ownProps.client} {...p} />
    const launchNotebookButton = <LaunchNotebookServerButton client={ownProps.client} projectId={internalId} />;
    return {title, description, displayId, internalId, visibilityLevel, accessLevel, project: state,
      externalUrl, readmeText, lastActivityAt,
      tag_list, star_count, starred, ssh_url, http_url,
      overviewUrl,
      kusUrl, kuList, kuUrl, kuView,
      notebooksUrl, notebookUrl, notebookView,
      lineageView,
      launchNotebookButton,
      dataUrl, datumUrl,
      settingsUrl}
  }

  mapDispatchToProps(dispatch, ownProps) {
    const state = this.store.getState();
    return {
      onProjectTagsChange: (tags) => {
        dispatch(State.View.setTags(ownProps.client, state.core.id, state.core.title, tags))
      },
      onProjectDescriptionChange: (description) => {
        dispatch(State.View.setDescription(ownProps.client, state.core.id, state.core.title, description))
      },
      onStar: (e) => {
        e.preventDefault();
        const projectId = state.core.id || parseInt(ownProps.match.params.id, 10);
        const starred = this.getStarred(ownProps.userState, projectId);
        dispatch(State.View.star(ownProps.client, projectId, ownProps.userState, starred))
      }
    }
  }

  render() {
    const VisibleProjectView = connect(this.mapStateToProps.bind(this),
      this.mapDispatchToProps.bind(this))(Present.ProjectView);
    return (
      <Provider key="view" store={this.store}>
        <VisibleProjectView
          client={this.props.client}
          userState={this.props.userState}
          match={this.props.match}
        />
      </Provider>)
  }
}

class List extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.List.reducer, 'project list');
  }

  componentDidMount() {
    this.listProjects();
  }

  listProjects() {
    this.store.dispatch(State.List.fetch(this.props.client));
  }

  mapStateToProps(state, ownProps) { return state  }

  render() {
    const VisibleProjectList = connect(this.mapStateToProps)(Present.ProjectList);
    return [
      <Provider key="new" store={this.store}>
        <VisibleProjectList />
      </Provider>
    ]
  }
}

export default { New, View, List };

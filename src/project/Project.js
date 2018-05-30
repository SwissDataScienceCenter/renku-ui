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
 *  Project.js
 *  Container components for project.
 */

import React, { Component } from 'react';
import { Provider, connect } from 'react-redux'

import { StateKind, StateModel } from '../model/Model';
// TODO: ONLY use one projectSchema after the refactoring has been finished.
import { newProjectSchema } from '../model/RenkuModels';
import { createStore } from '../utils/EnhancedState'
import { slugFromTitle } from '../utils/HelperFunctions';
import Present from './Project.present'
import State from './Project.state'
import { ProjectModel } from './Project.state'
import Ku from '../ku/Ku'
import Notebook from '../file/Notebook'
import { FileLineage, LaunchNotebookServerButton } from '../file'
import { ACCESS_LEVELS } from '../gitlab';


class New extends Component {
  constructor(props) {
    super(props);
    this.newProject = new StateModel(newProjectSchema, StateKind.REDUX);
    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      onTitleChange: this.onTitleChange.bind(this),
      onDescriptionChange: this.onDescriptionChange.bind(this),
      onVisibilityChange: this.onVisibilityChange.bind(this),
    };
  }

  onSubmit = () => {
    const validation = this.newProject.validate()
    if (validation.result) {
      this.props.client.postProject(this.newProject.get()).then((project) => {
        this.props.history.push(`/projects/${project.id}`);
      })
    }
    else {
      // This should be done by proper form validation.
      console.error('Can not create new project - insufficient information: ', validation.errors)
    }
  };
  onTitleChange = (e) => {
    this.newProject.set('display.title', e.target.value);
    this.newProject.set('display.slug', slugFromTitle(e.target.value));
  };
  onDescriptionChange = (e) => { this.newProject.set('display.description', e.target.value) };
  onVisibilityChange = (e) => { this.newProject.set('meta.visibility', e.target.value) };
  // onDataReferenceChange = (key, e) => { this.newProject.setObject('reference', key, e.target.value) };

  render() {
    const ConnectedNewProject = connect(this.newProject.mapStateToProps)(Present.ProjectNew);
    return <ConnectedNewProject handlers={this.handlers} store={this.newProject.reduxStore}/>;
  }
}


class View extends Component {
  constructor(props) {
    super(props);
    this.projectState = new ProjectModel(StateKind.REDUX);
  }

  componentDidMount() {
    this.projectState.fetchProject(this.props.client, this.props.id);
    this.projectState.fetchReadme(this.props.client, this.props.id);
  }

  getStarred(userState, projectId) {
    const user = userState.getState().user;
    if (user && user.starredProjects) {
      return user.starredProjects.map((project) => project.id).indexOf(projectId) >= 0
    }
  }

  subUrls(baseUrl) {
    return {
      overviewUrl: `${baseUrl}/`,
      kusUrl: `${baseUrl}/kus`,
      kuUrl: `${baseUrl}/kus/:kuIid(\\d+)`,
      notebooksUrl: `${baseUrl}/notebooks`,
      notebookUrl: `${baseUrl}/notebooks/:notebookPath`,
      dataUrl: `${baseUrl}/data`,
      datumUrl: `${baseUrl}/data/:datumPath+`,
      settingsUrl: `${baseUrl}/settings`,
    }
  }

  subComponents(projectId, baseUrl, ownProps) {
    const accessLevel = this.projectState.get('visibility.accessLevel');
    const updateProjectView = this.forceUpdate.bind(this);

    // Access to the project state could be given to the subComponents by connecting them here to
    // the projectStore. This is not yet necessary.
    const subProps = {...ownProps, projectId, accessLevel};
    return {
      kuList: <Ku.List key="kus" {...subProps} kuBaseUrl={`${baseUrl}/kus`} />,

      kuView: (p) => <Ku.View key="ku" {...subProps}
        kuIid={p.match.params.kuIid}
        updateProjectView={updateProjectView}
        projectPath={this.projectState.get('core.path_with_namespace')}/>,
      /* TODO Should we handle each type of file or just have a generic project files viewer? */

      notebookView: (p) => <Notebook.Show key="notebook" {...subProps}
        filePath={`notebooks/${p.match.params.notebookPath}`}
        projectPath={this.projectState.get('core.path_with_namespace')}/>,

      lineageView: (p) => <FileLineage key="lineage" {...subProps}
        path={`data/${p.match.params.datumPath}`} />,

      launchNotebookButton: <LaunchNotebookServerButton key= "launch notebook" {...subProps} />,
    }
  }

  eventHandlers = {
    onProjectTagsChange: (tags) => {
      const core = this.projectState.get('core');
      this.projectState.setTags(this.props.client, core.id, core.title, tags);
    },
    onProjectDescriptionChange: (description) => {
      const core = this.projectState.get('core');
      this.projectState.setDescription(this.props.client, core.id, core.title, description);
    },
    onStar: (e) => {
      e.preventDefault();
      const projectId = this.projectState.get('core.id') || parseInt(this.props.match.params.id, 10);
      const starred = this.getStarred(this.props.userState, projectId);
      this.projectState.star(this.props.client, projectId, this.props.userState, starred)
    }
  };

  mapStateToProps(state, ownProps) {
    const internalId = this.projectState.get('core.id') || parseInt(ownProps.match.params.id, 10);
    const starred = this.getStarred(ownProps.userState, internalId);
    const settingsReadOnly = state.visibility.accessLevel < ACCESS_LEVELS.MASTER;
    const baseUrl = ownProps.match.isExact ? ownProps.match.url.slice(0, -1) : ownProps.match.url;

    return {
      ...this.projectState.get(),
      ...ownProps,
      ...this.subUrls(baseUrl),
      ...this.subComponents.bind(this)(internalId, baseUrl, ownProps),
      starred,
      settingsReadOnly
    }
  }

  render() {
    const ConnectedProjectView = connect(
      this.mapStateToProps.bind(this), null, null, {storeKey: 'projectStore'}
    )(Present.ProjectView);
    const props = {...this.props, ...this.eventHandlers, projectStore: this.projectState.reduxStore};
    return <ConnectedProjectView {...props} />

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

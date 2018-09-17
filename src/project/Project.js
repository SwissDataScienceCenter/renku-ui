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
import { connect } from 'react-redux'

import { StateKind, StateModel } from '../model/Model';
// TODO: ONLY use one projectSchema after the refactoring has been finished.
import { newProjectSchema } from '../model/RenkuModels';
import { slugFromTitle } from '../utils/HelperFunctions';
import Present from './Project.present'

import { ProjectModel, ProjectListModel } from './Project.state'
import Ku from '../ku/Ku'
import Notebook from '../file/Notebook'
import { FileLineage, LaunchNotebookServerButton } from '../file'
import { ACCESS_LEVELS } from '../api-client';
import { alertError } from '../utils/Errors';
import { MergeRequest, MergeRequestList } from '../merge-request';

import qs from 'query-string';

function groupVisibilitySupportsVisibility(groupVisibility, visibility) {
  if (visibility === 'private') return true;
  if (visibility === 'internal') return (groupVisibility === 'internal' || groupVisibility === 'public');
  // Public is the last remaining
  return (groupVisibility === 'public');
}

function projectVisibilitiesForGroupVisibility(groupVisibility='public') {
  const visibilities = [];
  visibilities.push({name: "Private", value: "private"});
  if (groupVisibilitySupportsVisibility(groupVisibility, 'internal'))
    visibilities.push({name: "Internal", value: "internal"});
  if (groupVisibilitySupportsVisibility(groupVisibility, 'public'))
    visibilities.push({name: "Public", value: "public"});
  return visibilities
}

class New extends Component {
  constructor(props) {
    super(props);

    this.newProject = new StateModel(newProjectSchema, StateKind.REDUX);
    this.state = {statuses: [], namespaces: [], namespaceGroup: null,
      visibilities: projectVisibilitiesForGroupVisibility()
    };

    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      onTitleChange: this.onTitleChange.bind(this),
      onDescriptionChange: this.onDescriptionChange.bind(this),
      onVisibilityChange: this.onVisibilityChange.bind(this),
      onProjectNamespaceChange: this.onProjectNamespaceChange.bind(this),
      onProjectNamespaceAccept: this.onProjectNamespaceAccept.bind(this),
      fetchMatchingNamespaces: this.fetchMatchingNamespaces.bind(this)
    };
    this.mapStateToProps = this.doMapStateToProps.bind(this);
  }

  async componentDidMount() {
    const namespaces = await this.fetchNamespaces();
    const username = this.props.user.username;
    const namespace = namespaces.data.filter(n => n.name === username)
    if (namespace.length > 0) this.newProject.set('meta.projectNamespace', namespace[0]);
    this.setState({namespaces});
  }

  onSubmit() {
    const validation = this.validate();
    if (validation.result) {
      this.props.client.postProject(this.newProject.get())
        .then((project) => {
          this.props.history.push(`/projects/${project.id}`);
        })
        .catch(error => {
          const errorData = error.errorData;
          if (errorData != null) {
            if (errorData.message.path != null) {
              alert(`Path ${errorData.message.path}`);
            } else {
              alert(JSON.stringify(errorData.message))
            }
          }
        })
    }
  }

  validate() {
    const validation = this.newProject.validate()
    if (!validation.result) {
      this.setState({statuses: validation.errors});
    }
    return validation;
  }

  onTitleChange(e) {
    this.newProject.set('display.title', e.target.value);
    this.newProject.set('display.slug', slugFromTitle(e.target.value));
  }

  onDescriptionChange(e) { this.newProject.set('display.description', e.target.value); }
  onVisibilityChange(e) { this.newProject.set('meta.visibility', e.target.value); }
  onProjectNamespaceChange(value) {
    this.newProject.set('meta.projectNamespace', value);
  }
  onProjectNamespaceAccept() {
    const namespace = this.newProject.get('meta.projectNamespace');
    if (namespace.kind !== 'group') {
      const visibilities = projectVisibilitiesForGroupVisibility();
      this.setState({namespaceGroup: null, visibilities});
      return;
    }

    this.props.client.getGroupByPath(namespace.full_path).then(r => {
      const group = r.data;
      const visibilities = projectVisibilitiesForGroupVisibility(group.visibility);
      const visibility = this.newProject.get('meta.visibility');
      if (!groupVisibilitySupportsVisibility(group.visibility, visibility)) {
        // Default to the highest available visibility
        this.newProject.set('meta.visibility', visibilities[visibilities.length - 1].value);
      }
      this.setState({namespaceGroup: group, visibilities});
    })
  }

  doMapStateToProps(state, ownProps) {
    const model = this.newProject.mapStateToProps(state, ownProps);
    return {model}
  }

  fetchNamespaces(search=null) {
    const queryParams = {};
    if (search != null) queryParams['search'] = search;
    return this.props.client.getNamespaces(queryParams);
  }

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async fetchMatchingNamespaces(search) {
    const namespaces = this.state.namespaces;
    if (namespaces.pagination.totalPages > 1) return this.fetchNamespaces(search);

    // We have all the data, just filter in the browser
    let escapedValue = this.escapeRegexCharacters(search.trim());
    if (escapedValue === '') escapedValue = '.*';
    const regex = new RegExp(escapedValue, 'i');
    return Promise.resolve(namespaces.data.filter(namespace => regex.test(namespace.name)))
  }

  render() {
    const ConnectedNewProject = connect(this.mapStateToProps)(Present.ProjectNew);
    const statuses = {}
    this.state.statuses.forEach((d) => { Object.keys(d).forEach(k => statuses[k] = d[k])});
    return <ConnectedNewProject
      statuses={statuses}
      namespaces={this.state.namespaces.data}
      visibilities={this.state.visibilities}
      handlers={this.handlers}
      store={this.newProject.reduxStore}
      user={this.props.user} />;
  }
}


// TODO: This component has grown too much and needs restructuring. One option would be to insert
// TODO: another container component between this top-level project component and the presentational
// TODO: component displaying the project overview.
class View extends Component {
  constructor(props) {
    super(props);
    this.projectState = new ProjectModel(StateKind.REDUX);
  }

  componentDidMount() {
    this.fetchAll()
  }

  fetchAll() {
    this.projectState.fetchProject(this.props.client, this.props.id);
    this.projectState.fetchReadme(this.props.client, this.props.id);
    this.projectState.fetchModifiedFiles(this.props.client, this.props.id);
    this.projectState.fetchMergeRequests(this.props.client, this.props.id);
    this.projectState.fetchBranches(this.props.client, this.props.id);
    this.projectState.fetchCIJobs(this.props.client, this.props.id);
  }

  getStarred(user, projectId) {
    if (user && user.starredProjects) {
      return user.starredProjects.map((project) => project.id).indexOf(projectId) >= 0
    }
  }

  subUrls() {
    // For exact matches, we strip the trailing / from the baseUrl
    const match = this.props.match;
    const baseUrl = match.isExact ? match.url.slice(0, -1) : match.url;
    const filesUrl = `${baseUrl}/files`;
    const fileContentUrl = `${filesUrl}/blob`;

    return {
      overviewUrl: `${baseUrl}/`,
      kusUrl: `${baseUrl}/kus`,
      kuNewUrl: `${baseUrl}/ku_new`,
      kuUrl: `${baseUrl}/kus/:kuIid(\\d+)`,
      filesUrl: `${filesUrl}`,
      fileContentUrl: `${fileContentUrl}`,
      lineagesUrl: `${filesUrl}/lineage`,
      lineageUrl: `${filesUrl}/lineage/:filePath+`,
      notebooksUrl: `${filesUrl}/notebooks`,
      notebookUrl: `${fileContentUrl}/:filePath([^.]+.ipynb)`,
      dataUrl: `${filesUrl}/data`,
      workflowsUrl: `${filesUrl}/workflows`,
      settingsUrl: `${baseUrl}/settings`,
      mrOverviewUrl: `${baseUrl}/pending`,
      mrUrl: `${baseUrl}/pending/:mrIid`,
    }
  }

  // TODO: Fix for MRs across forks.
  getMrSuggestions() {

    // Don't display any suggestions while the state is updating - leads to annoying flashing fo
    // wrong information while branches are there but merge_requests are not...
    if (this.projectState.get('system.merge_requests') === this.projectState._updatingPropVal) return [];
    if (this.projectState.get('system.branches') === this.projectState._updatingPropVal) return [];

    const mergeRequestBranches = this.projectState.get('system.merge_requests')
      .map(mr => mr.source_branch);

    return this.projectState.get('system.branches')
      .filter(branch => branch.name !== 'master')
      .filter(branch => !branch.merged)
      .filter(branch => mergeRequestBranches.indexOf(branch.name) < 0);
  }

  getImageBuildStatus() {
    const ciJobs = this.projectState.get('system.ci_jobs');

    // We don't want to flash an alert while the state is updating.
    if (ciJobs === this.projectState._updatingPropVal) return;

    const buildJobs = (ciJobs || [])
      .filter((job) => job.name === 'image_build')
      .sort((job1, job2) => job1.created_at > job2.created_at ? -1 : 1);

    if (buildJobs.length === 0) {
      return;
    }
    else {
      return buildJobs[0]
    }
  }

  subComponents(projectId, ownProps) {
    const accessLevel = this.projectState.get('visibility.accessLevel');
    const externalUrl = this.projectState.get('core.external_url');
    const updateProjectView = this.forceUpdate.bind(this);
    const notebookServerUrl = this.projectState.get('core.notebookServerUrl');

    // Access to the project state could be given to the subComponents by connecting them here to
    // the projectStore. This is not yet necessary.
    const subProps = {...ownProps, projectId, accessLevel, externalUrl, notebookServerUrl};

    const mergeRequests = this.projectState.get('system.merge_requests');

    const mapStateToProps = (state, ownProps) => {
      return {
        mergeRequests: mergeRequests === this.projectState._updatingPropVal ? [] : mergeRequests,
        externalMROverviewUrl: `${externalUrl}/merge_requests`,
        ...ownProps
      };
    };
    const ConnectedMergeRequestList = connect(mapStateToProps)(MergeRequestList);

    return {
      kuList: <Ku.List key="kus" {...subProps} urlMap={this.subUrls()} />,

      kuView: (p) => <Ku.View key="ku" {...subProps}
        kuIid={p.match.params.kuIid}
        updateProjectView={updateProjectView}
        projectPath={this.projectState.get('core.path_with_namespace')}/>,
      /* TODO Should we handle each type of file or just have a generic project files viewer? */

      notebookView: (p) => <Notebook.Show key="notebook" {...subProps}
        filePath={p.match.params.filePath}
        projectPath={this.projectState.get('core.path_with_namespace')}/>,

      lineageView: (p) => <FileLineage key="lineage" {...subProps}
        externalUrl={externalUrl}
        path={p.match.params.filePath} />,

      launchNotebookServerButton: <LaunchNotebookServerButton key= "launch notebook" {...subProps}
        notebookServerUrl={this.projectState.get('core.notebookServerUrl')}/>,

      mrList: <ConnectedMergeRequestList key="mrList" store={this.projectState.reduxStore}
        mrOverviewUrl={this.subUrls().mrOverviewUrl}/>,
      mrView: (p) => <MergeRequest
        key="mr" {...subProps}
        iid={p.match.params.mrIid}
        updateProjectState={this.fetchAll.bind(this)}/>,
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
      const user = this.props.user;
      if (!(user && user.id != null)) {
        alertError('Please login to star a project.');
        return;
      }
      const projectId = this.projectState.get('core.id') || parseInt(this.props.match.params.id, 10);
      const starred = this.getStarred(this.props.user, projectId);
      this.projectState.star(this.props.client, projectId, this.props.userStateDispatch, starred)
    },
    onCreateMergeRequest: (branch) => {
      const core = this.projectState.get('core');
      let newMRiid;
      // TODO: Again, it would be nice to update the local state rather than relying on the server
      // TODO: updating the information fast enough through all possible layers of caches, etc...
      this.props.client.createMergeRequest(core.id, branch.name, branch.name, 'master')
        .then((d) => {
          newMRiid = d.iid;
          return this.fetchAll()
        })
        .then(() => this.props.history.push(`${this.subUrls().mrOverviewUrl}/${newMRiid}`))
    },
    onProjectRefresh: (e) => {
      e.preventDefault();
      this.fetchAll()
    }
  };

  mapStateToProps(state, ownProps) {
    const internalId = this.projectState.get('core.id') || parseInt(ownProps.match.params.id, 10);
    const starred = this.getStarred(ownProps.user, internalId);
    const settingsReadOnly = state.visibility.accessLevel < ACCESS_LEVELS.MAINTAINER;
    const suggestedMRBranches = this.getMrSuggestions();
    const externalUrl = this.projectState.get('core.external_url');
    const canCreateMR = state.visibility.accessLevel >= ACCESS_LEVELS.DEVELOPER;
    const imageBuild = this.getImageBuildStatus();

    return {
      ...this.projectState.get(),
      ...ownProps,
      ...this.subUrls(),
      ...this.subComponents.bind(this)(internalId, ownProps),
      starred,
      settingsReadOnly,
      suggestedMRBranches,
      externalUrl,
      canCreateMR,
      imageBuild
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
    this.projectPages = new ProjectListModel(props.client);
    this.perPage = this.props.perPage || 10;

    // Register listener for route changes (back/forward buttons)
    this.props.history.listen(location => {
      this.onPageChange(this.getPageNumber(location));
    });


  }

  // TODO: Replace this by URLs which are passed down from the app level.
  urlMap() {
    return {
      projectsUrl: '/projects',
      projectNewUrl: '/project_new'
    }
  }

  componentDidMount() {
    this.projectPages.set('perPage', this.perPage);
    this.projectPages.setPage(this.getPageNumber(this.props.location));
  }

  getPageNumber(location) {
    return parseInt(qs.parse(location.search).page, 10) || 1;
  }

  setPageInUrl(newPageNumber) {
    const projectsUrl = this.urlMap().projectsUrl
    this.props.history.push(`${projectsUrl}?page=${newPageNumber}`)
  }

  onPageChange(newPageNumber) {
    this.projectPages.setPage(newPageNumber);
  }

  mapStateToProps(state, ownProps) {
    const currentPage = this.projectPages.get('currentPage');
    return {
      user: ownProps.user,
      page: this.projectPages.get('pages')[currentPage] || {projects: []},
      currentPage: this.projectPages.get('currentPage'),
      totalItems: this.projectPages.get('totalItems'),
      perPage: this.projectPages.get('perPage'),
      onPageChange: this.setPageInUrl.bind(this),
    }
  }

  render() {
    const VisibleProjectList =
      connect(this.mapStateToProps.bind(this))(Present.ProjectList);

    return <VisibleProjectList
      store={this.projectPages.reduxStore}
      user={this.props.user}
      urlMap={this.urlMap()}
    />
  }
}

export default { New, View, List };

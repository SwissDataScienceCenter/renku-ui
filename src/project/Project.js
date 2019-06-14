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

import { StateKind } from '../model/Model';
import Present from './Project.present'

import { ProjectModel, GraphIndexingStatus, PollingInterval } from './Project.state'
import Ku from '../ku/Ku'
import { FileLineage } from '../file'
import { ACCESS_LEVELS } from '../api-client';
import { alertError } from '../utils/Errors';
import { MergeRequest, MergeRequestList } from '../merge-request';
import { LaunchNotebookServer } from '../notebooks';

import List from './list';
import New from './new';
import { ShowFile } from '../file/File.present';

// TODO: This component has grown too much and needs restructuring. One option would be to insert
// TODO: another container component between this top-level project component and the presentational
// TODO: component displaying the project overview.
class View extends Component {
  constructor(props) {
    super(props);
    this.projectState = new ProjectModel(StateKind.REDUX);
  }

  componentDidMount() {
    // fetch only if user data are already loaded
    if (this.props.user.available === true) {
      this.fetchAll();
    }
  }

  componentDidUpdate(prevProps) {
    // re-fetch when user data are available
    if (prevProps.user.available !== true && this.props.user.available === true) {
      this.fetchAll();
    }
  }

  async fetchProject() { return this.projectState.fetchProject(this.props.client, this.props.id); }
  async fetchReadme() { return this.projectState.fetchReadme(this.props.client, this.props.id); }
  async fetchMergeRequests() { return this.projectState.fetchMergeRequests(this.props.client, this.props.id); }
  async fetchModifiedFiles() { return this.projectState.fetchModifiedFiles(this.props.client, this.props.id); }
  async fetchBranches() { return this.projectState.fetchBranches(this.props.client, this.props.id); }
  async fetchCIJobs() { return this.projectState.fetchCIJobs(this.props.client, this.props.id); }
  async startNotebookServersPolling() {
    return this.projectState.startNotebookServersPolling(this.props.client, this.props.id,PollingInterval.START);
  }
  async stopNotebookServersPolling() { return this.projectState.stopNotebookServersPolling(); }
  async stopNotebookServer(serverName) { return this.projectState.stopNotebookServer(this.props.client, serverName); }
  async createGraphWebhook() { return this.projectState.createGraphWebhook(this.props.client, this.props.id); }
  async stopCheckingWebhook() { this.projectState.stopCheckingWebhook(); }
  async fetchGraphWebhook() { this.projectState.fetchGraphWebhook(this.props.client, this.props.id, this.props.user); }
  async fetchProjectFilesTree() {
    return this.projectState.fetchProjectFilesTree(this.props.client, this.props.id, this.cleanCurrentURL());
  }
  async setProjectOpenFolder(filepath) {
    this.projectState.setProjectOpenFolder(this.props.client, this.props.id, filepath);
  }
  async fetchGraphStatus() { return this.projectState.fetchGraphStatus(this.props.client, this.props.id); }
  async fetchNotebookServerUrl() { return this.projectState.fetchNotebookServerUrl(this.props.client, this.props.id); }

  async fetchAll() {
    await this.fetchProject();

    // these are fetched only if user is logged in
    if (this.props.user.id) {
      this.fetchCIJobs();
      this.checkGraphWebhook();
      this.fetchNotebookServerUrl();
    }
  }

  cleanCurrentURL(){
    if(this.subUrls().filesUrl===this.props.location.pathname || this.subUrls().filesUrl+'/'===this.props.location.pathname )
      return ""
    else 
      return this.props.location.pathname.replace(this.props.match.projectPath,"").replace(this.subUrls().lineagesUrl,"").replace(this.subUrls().fileContentUrl,"");
  }

  // TODO: move all .set actions to Project.state.js
  checkGraphWebhook() {
    // check if data are available -- may remove this?
    if (this.projectState.get('core.available') !== true) {
      this.projectState.set('webhook.possible', false);
      return;
    }
    // check user permissions and fetch webhook status
    const webhookCreator = this.projectState.get('visibility.accessLevel') >= ACCESS_LEVELS.MAINTAINER ?
      true :
      false;
    this.projectState.set('webhook.possible', webhookCreator);
    if (webhookCreator) {
      this.projectState.fetchGraphWebhookStatus(this.props.client, this.props.id);
    }
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
      projectsUrl: '/projects',
      baseUrl: baseUrl,
      overviewUrl: `${baseUrl}/overview`,
      statsUrl: `${baseUrl}/overview/stats`,
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
      launchNotebookUrl: `${baseUrl}/launchNotebook`,
      notebookServersUrl: `${baseUrl}/notebookServers`
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
    const notebookServerAPI = this.projectState.get('core.notebookServerAPI');
    const filesTree = this.projectState.get('filesTree');
    const graphProgress = this.projectState.get('webhook.progress');
    const mergeRequests = this.projectState.get('system.merge_requests');
    const maintainer = this.projectState.get('visibility.accessLevel') >= ACCESS_LEVELS.MAINTAINER ?
      true :
      false;
    const forkedData = this.projectState.get('system.forked_from_project');
    const forked = (forkedData != null && Object.keys(forkedData).length > 0) ?
      true :
      false;

    // Access to the project state could be given to the subComponents by connecting them here to
    // the projectStore. This is not yet necessary.
    const subProps = {...ownProps, projectId, accessLevel, externalUrl, notebookServerUrl, notebookServerAPI, filesTree};

    const mapStateToProps = (state, ownProps) => {
      return {
        mergeRequests: mergeRequests === this.projectState._updatingPropVal ? [] : mergeRequests,
        externalMROverviewUrl: `${externalUrl}/merge_requests`,
        ...ownProps
      };
    };

    const ConnectedMergeRequestList = connect(mapStateToProps)(MergeRequestList);
    const ConnectedLaunchNotebookServer = connect(this.projectState.mapStateToProps)(LaunchNotebookServer);

    return {
      kuList: <Ku.List key="kus" {...subProps} urlMap={this.subUrls()} />,

      kuView: (p) => <Ku.View key="ku" {...subProps}
        kuIid={p.match.params.kuIid}
        updateProjectView={updateProjectView}
        projectPath={this.projectState.get('core.path_with_namespace')}/>,
      /* TODO Should we handle each type of file or just have a generic project files viewer? */

      lineageView: (p) => <FileLineage key="lineage" {...subProps}
        externalUrl={externalUrl}
        projectPath={this.projectState.get('core.path_with_namespace')}
        path={p.match.params.filePath}
        notebook={"Notebook"}
        accessLevel={accessLevel}
        progress={graphProgress}
        maintainer={maintainer}
        forked={forked}
        hashElement={filesTree !== undefined ? filesTree.hash[p.match.params.filePath] : undefined} />,

      fileView: (p) => <ShowFile
        key="filepreview" {...subProps}
        filePath={p.location.pathname}
        projectPath={this.projectState.get('core.path_with_namespace')}
        lineagesPath={this.subUrls().lineagesUrl}
        hashElement={filesTree !== undefined ? filesTree.hash[p.location.pathname.replace(this.props.match.url + '/files/blob/', '')]:undefined}
      />,

      mrList: <ConnectedMergeRequestList key="mrList" store={this.projectState.reduxStore}
        mrOverviewUrl={this.subUrls().mrOverviewUrl}/>,

      mrView: (p) => <MergeRequest
        key="mr" {...subProps}
        iid={p.match.params.mrIid}
        updateProjectState={this.fetchAll.bind(this)}/>,

      launchNotebookServer: (p) => <ConnectedLaunchNotebookServer
        key="launchNotebook"
        store={this.projectState.reduxStore}
        client={ownProps.client}
        onSuccess={() => this.props.history.push(`/projects/${this.projectState.get('core.id')}/notebookServers`)}
      />
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
    },
    fetchOverviewData: () => { this.fetchReadme() },
    fetchMrSuggestions: async () => {
      await this.fetchMergeRequests();
      this.fetchBranches();
    },
    fetchFiles: () => {
      this.fetchProjectFilesTree();
      //this.fetchModifiedFiles();
    },
    setOpenFolder: (filePath) => { 
      this.setProjectOpenFolder(filePath);
    },
    fetchCIJobs: () => { this.fetchCIJobs() },
    startNotebookServersPolling: () => {
      this.startNotebookServersPolling();
    },
    stopNotebookServersPolling: () => {
      this.stopNotebookServersPolling();
    },
    stopNotebookServer: (serverName) => {
      this.stopNotebookServer(serverName);
    },
    createGraphWebhook: (e) => { 
      e.preventDefault();
      return this.createGraphWebhook();
    },
    onCloseGraphWebhook: () => {
      this.stopCheckingWebhook();
    },
    fetchGraphStatus: () => {
      return this.fetchGraphStatus();
    },
    fetchNotebookServerUrl: () => {
      return this.fetchNotebookServerUrl();
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

export default { New, View, List };
export { GraphIndexingStatus };

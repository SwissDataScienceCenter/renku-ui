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

import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash/collection";

import { StateKind } from "../model/Model";
import Present from "./Project.present";
import { ProjectModel, GraphIndexingStatus, ProjectCoordinator, MigrationStatus } from "./Project.state";
import { ProjectsCoordinator } from "./shared";
import Issue from "../collaboration/issue/Issue";
import { FileLineage } from "../file";
import { ACCESS_LEVELS } from "../api-client";
import { MergeRequest } from "../collaboration/merge-request";
import { ShowFile } from "../file";
import ShowDataset from "../dataset/Dataset.container";
import ChangeDataset from "./datasets/change/index";
import ImportDataset from "./datasets/import/index";
import KnowledgeGraphStatus from "../file/KnowledgeGraphStatus.container";


const subRoutes = {
  overview: "overview",
  stats: "overview/stats",
  overviewDatasets: "overview/datasets",
  overviewCommits: "overview/commits",
  overviewStatus: "overview/status",
  datasets: "datasets",
  datasetsAdd: "datasets/new",
  dataset: "datasets/:datasetId",
  datasetEdit: "datasets/:datasetId/modify",
  issueNew: "issue_new",
  collaboration: "collaboration",
  issues: "collaboration/issues",
  issue: "collaboration/issues/:issueId(\\d+)",
  mrs: "collaboration/mergerequests",
  mr: "collaboration/mergerequests/:mrIid(\\d+)",
  fork: "collaboration/fork",
  files: "files",
  fileContent: "blob",
  notebook: "files/blob/:filePath([^.]+.ipynb)",
  lineages: "files/lineage",
  lineage: "files/lineage/:filePath+",
  data: "files/data",
  workflows: "files/workflows",
  settings: "settings",
  settingsSessions: "settings/sessions",
  sessions: "sessions",
  sessionNew: "sessions/new",
  showSession: "sessions/show/:server"
};

// SubRoutes grouped by depth
const srMap = _.groupBy(Object.values(subRoutes), v => v.split("/").length);
const maxSrMapDepth = Math.max(...Object.keys(srMap).map(k => Number.parseInt(k)));
const projectIdRegex = /^\d+$/;

/**
 * Check if the components need to be added to the projectPathWithNamespace
 * @param {string} projectPathWithNamespace
 * @param {array} comps
 */
function accumulateIntoProjectPath(projectPathWithNamespace, comps) {
  if (comps.length === 0) return projectPathWithNamespace;

  // check if any of these match
  const routes = srMap[Math.min(comps.length, maxSrMapDepth)];
  for (let i = 0; i < routes.length; ++i) {
    const routeComps = routes[i].split("/");
    let matches = true;
    for (let j = 0; j < routeComps.length && matches; ++j) {
      if (routeComps[j].startsWith(":")) continue;
      if (routeComps[j] !== comps[j]) matches = false;
    }
    if (matches) return projectPathWithNamespace;
  }
  // Add one level to the projectPathWithNamespace
  return accumulateIntoProjectPath(`${projectPathWithNamespace}/${comps[0]}`, comps.slice(1));
}

function splitProjectSubRoute(subUrl) {
  let result = {
    namespace: null,
    projectPathWithNamespace: null,
    projectId: null,
    baseUrl: null
  };
  if (subUrl == null)
    return result;

  const baseUrl = subUrl.endsWith("/") ? subUrl.slice(0, -1) : subUrl;
  const projectSubRoute = baseUrl.startsWith("/projects/") ? baseUrl.slice(10) : baseUrl;
  const comps = projectSubRoute.split("/");
  if (comps.length < 1)
    return result;

  // This could be a route that just provides a projectId
  if (projectIdRegex.test(comps[0])) {
    result.projectId = comps[0];
    result.baseUrl = `/projects/${result.projectId}`;
    return result;
  }
  if (comps.length < 2) {
    result.namespace = comps[0];
    return result;
  }

  result.projectPathWithNamespace = comps.slice(0, 2).join("/");
  if (comps.length > 2) {
    // We need to check if we need to accumulate more components into the projectPathWithNamespace
    result.projectPathWithNamespace = accumulateIntoProjectPath(result.projectPathWithNamespace, comps.slice(2));
  }

  if (result.projectId != null) {
    result.baseUrl = `/projects/${result.projectId}`;
  }
  else {
    result.baseUrl = `/projects/${result.projectPathWithNamespace}`;
    result.namespace = result.projectPathWithNamespace.slice(0, result.projectPathWithNamespace.lastIndexOf("/"));
  }

  return result;
}

function matchToDatasetId(matchDatasetId) {
  return decodeURIComponent(matchDatasetId);
}


// TODO: This component has grown too much and needs restructuring. One option would be to insert
// TODO: another container component between this top-level project component and the presentational
// TODO: component displaying the project overview.
class View extends Component {
  constructor(props) {
    super(props);
    this.projectState = new ProjectModel(StateKind.REDUX);
    // TODO: Could move projectsCoordinator once ProjectModel goes away
    this.projectsCoordinator = new ProjectsCoordinator(props.client, props.model.subModel("projects"));
    this.projectCoordinator = new ProjectCoordinator(props.client, props.model.subModel("project"));

    // fetch useful projects data in not yet loaded
    if (this.props.user.logged) {
      const featured = props.model.get("projects.featured");
      if (!featured.fetched && !featured.fetching)
        this.projectsCoordinator.getFeatured();
    }
  }

  componentDidMount() {
    const pathComponents = splitProjectSubRoute(this.props.match.url);
    if (pathComponents.projectPathWithNamespace == null && pathComponents.projectId != null)
      this.redirectProjectWithNumericId(pathComponents.projectId);

    if (pathComponents.projectPathWithNamespace != null) {
      // fetch only if user data are already loaded
      if (this.props.user.fetched)
        this.fetchAll();


      // in case the route fails it tests weather it could be a projectId route
      const routes = ["overview", "issues", "issue_new", "files", "lineage", "notebooks", "collaboration",
        "data", "workflows", "settings", "pending", "launchNotebook", "notebookServers", "datasets", "sessions"];
      const available = this.props.core ? this.props.core.available : null;
      const potentialProjectId = pathComponents.projectPathWithNamespace.split("/")[0];
      const potentialRoute = pathComponents.projectPathWithNamespace.split("/")[1];

      if (!available && !isNaN(potentialProjectId) && routes.indexOf(potentialRoute) > 0) {
        this.redirectAfterFetchFails(pathComponents.projectPathWithNamespace,
          this.props.location.pathname.replace("/projects/" + potentialProjectId, ""));
      }
    }
  }

  componentDidUpdate(prevProps) {
    // re-fetch when user data are available
    if (!prevProps.user.fetched && this.props.user.fetched)
      this.fetchAll();

    const prevPathComps = splitProjectSubRoute(prevProps.match.url);
    const pathComps = splitProjectSubRoute(this.props.match.url);
    if (prevPathComps.projectPathWithNamespace !== pathComps.projectPathWithNamespace)
      this.fetchAll();
  }

  componentWillUnmount() {
    this.projectCoordinator.resetProject();
  }

  async fetchProject() {
    const pathComponents = splitProjectSubRoute(this.props.match.url);
    const projectData = this.projectState.fetchProject(this.props.client, pathComponents.projectPathWithNamespace);
    // TODO: gradually move queries from local store projectState to shared store projectCoordinator
    projectData.then(data => {
      this.projectCoordinator.setProjectData(data, true);
      this.projectCoordinator.fetchCommits();
      // TODO: move fetchBranches to projectCoordinator. We should fetch commits after we know the default branch
      this.fetchBranches();
    });
    return projectData;
  }
  async fetchReadme() { return this.projectCoordinator.fetchReadme(this.props.client); }
  async fetchModifiedFiles() { return this.projectCoordinator.fetchModifiedFiles(this.props.client); }
  async fetchBranches() { return this.projectState.fetchBranches(this.props.client); }
  async createGraphWebhook() { return this.projectCoordinator.createGraphWebhook(this.props.client); }
  async fetchGraphWebhook() { this.projectCoordinator.fetchGraphWebhook(this.props.client, this.props.user); }
  async fetchProjectFilesTree() {
    return this.projectCoordinator.fetchProjectFilesTree(this.props.client, this.cleanCurrentURL());
  }
  async setProjectOpenFolder(filePath) {
    this.projectCoordinator.setProjectOpenFolder(this.props.client, filePath);
  }
  async fetchProjectDatasets(forceReFetch) {
    return this.projectState.fetchProjectDatasets(this.props.client, forceReFetch);
  }
  async fetchProjectDatasetsFromKg() {
    return this.projectState.fetchProjectDatasetsFromKg(this.props.client);
  }
  async fetchGraphStatus() { return this.projectCoordinator.fetchGraphStatus(this.props.client); }
  saveProjectLastNode(nodeData) { this.projectCoordinator.saveProjectLastNode(nodeData); }

  async fetchMigrationCheck() { this.projectState.fetchMigrationCheck(this.props.client); }

  async fetchAll() {
    const pathComponents = splitProjectSubRoute(this.props.match.url);
    if (pathComponents.projectPathWithNamespace)
      await this.fetchProject();
    if (this.props.user.logged) {
      this.checkGraphWebhook();
      this.fetchMigrationCheck();
    }
  }

  migrateProject(params) {
    this.projectState.migrateProject(this.props.client, params);
  }

  redirectProjectWithNumericId(projectId) {
    this.props.client.getProjectById(projectId)
      .then((project) => {
        this.props.history.push("/projects/" + project.data.metadata.core.path_with_namespace);
      });
  }

  redirectAfterFetchFails(projectPathWithNamespace, urlInsideProject) {
    this.props.client.getProjectById(projectPathWithNamespace.split("/")[0])
      .then((project) => {
        this.props.history.push("/projects/" + project.data.metadata.core.path_with_namespace + urlInsideProject);
      });
  }

  cleanCurrentURL() {
    const subUrls = this.getSubUrls();
    if (subUrls.filesUrl === this.props.location.pathname || subUrls.filesUrl + "/" === this.props.location.pathname)
      return "";
    return this.props.location.pathname
      .replace(this.props.match.projectPath, "")
      .replace(subUrls.lineagesUrl, "")
      .replace(subUrls.fileContentUrl, "");
  }

  checkGraphWebhook() { this.projectCoordinator.checkGraphWebhook(this.props.client); }

  isGraphReady() {
    const webhookStatus = this.projectCoordinator.get("webhook");
    return webhookStatus.status || (webhookStatus.created && webhookStatus.stop)
      || webhookStatus.progress === GraphIndexingStatus.MAX_VALUE;
  }

  getStarred() {
    const featured = this.props.model.get("projects.featured");
    // return false until data are available
    if (!featured.fetched)
      return false;
    return featured.starred.map((project) => project.id).indexOf(this.projectCoordinator.get("metadata.id")) >= 0;
  }

  getSubUrls() {
    const match = this.props.match;
    const pathComponents = splitProjectSubRoute(match.url);
    const baseUrl = pathComponents.baseUrl;
    const filesUrl = `${baseUrl}/files`;
    const fileContentUrl = `${filesUrl}/blob`;
    const collaborationUrl = `${baseUrl}/collaboration`;
    const datasetsUrl = `${baseUrl}/datasets`;

    return {
      projectsUrl: "/projects",
      baseUrl: baseUrl,
      overviewUrl: `${baseUrl}/overview`,
      statsUrl: `${baseUrl}/overview/stats`,
      overviewDatasetsUrl: `${baseUrl}/overview/datasets`,
      overviewCommitsUrl: `${baseUrl}/overview/commits`,
      overviewStatusUrl: `${baseUrl}/overview/status`,
      datasetsUrl: `${datasetsUrl}`,
      newDatasetUrl: `${datasetsUrl}/new`,
      datasetUrl: `${datasetsUrl}/:datasetId`,
      editDatasetUrl: `${datasetsUrl}/:datasetId/modify`,
      issueNewUrl: `${collaborationUrl}/issues/issue_new`,
      collaborationUrl: `${collaborationUrl}`,
      issuesUrl: `${collaborationUrl}/issues`,
      issueUrl: `${collaborationUrl}/issues/:issueIid`,
      mergeRequestsOverviewUrl: `${collaborationUrl}/mergerequests`,
      mergeRequestUrl: `${collaborationUrl}/mergerequests/:mrIid(\\d+)`,
      mergeRequestDiscussionUrl: `${collaborationUrl}/mergerequests/:mrIid(\\d+)/discussion`,
      mergeRequestChangesUrl: `${collaborationUrl}/mergerequests/:mrIid(\\d+)/changes`,
      mergeRequestCommitsUrl: `${collaborationUrl}/mergerequests/:mrIid(\\d+)/commits`,
      forkUrl: `${collaborationUrl}/fork`,
      filesUrl: `${filesUrl}`,
      fileContentUrl: `${fileContentUrl}`,
      lineagesUrl: `${filesUrl}/lineage`,
      lineageUrl: `${filesUrl}/lineage/:filePath+`,
      notebookUrl: `${fileContentUrl}/:filePath([^.]+.ipynb)`,
      dataUrl: `${filesUrl}/data`,
      workflowsUrl: `${filesUrl}/workflows`,
      settingsUrl: `${baseUrl}/settings`,
      settingsSessionsUrl: `${baseUrl}/settings/sessions`,
      mrOverviewUrl: `${baseUrl}/pending`,
      mrUrl: `${baseUrl}/pending/:mrIid`,
      launchNotebookUrl: `${baseUrl}/sessions/new`,
      sessionAutostartUrl: `${baseUrl}/sessions/new?autostart=1`,
      notebookServersUrl: `${baseUrl}/sessions`,
      sessionShowUrl: `${baseUrl}/sessions/show/:server`
    };
  }

  subComponents(projectId, ownProps) {
    const isPrivate = this.projectCoordinator.get("metadata.visibility") === "private";
    const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
    const externalUrl = this.projectState.get("core.external_url");
    const httpProjectUrl = this.projectState.get("system.http_url");
    const updateProjectView = this.forceUpdate.bind(this);
    const filesTree = this.projectState.get("filesTree");
    const datasets = this.projectState.get("core.datasets");
    const graphProgress = this.projectCoordinator.get("webhook.progress");
    const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ?
      true :
      false;
    const forkedData = this.projectState.get("system.forked_from_project");
    const forked = (forkedData != null && Object.keys(forkedData).length > 0) ?
      true :
      false;
    const projectPathWithNamespace = this.projectState.get("core.path_with_namespace");
    // Access to the project state could be given to the subComponents by connecting them here to
    // the projectStore. This is not yet necessary.
    const subUrls = this.getSubUrls();
    const subProps = {
      ...ownProps, projectId, accessLevel, externalUrl, filesTree, projectPathWithNamespace, datasets
    };
    const branches = {
      all: this.projectState.get("system.branches"),
      fetch: () => { this.fetchBranches(); }
    };

    const pathComponents = splitProjectSubRoute(this.props.match.url);

    return {

      mrView: (p) => <MergeRequest
        key="mr" {...subProps}
        match={p.match}
        iid={p.match.params.mrIid}
        updateProjectState={this.fetchAll.bind(this)}
        mergeRequestsOverviewUrl={subUrls.mergeRequestsOverviewUrl}
        mergeRequestUrl={subUrls.mergeRequestUrl}
        mergeRequestDiscussionUrl={subUrls.mergeRequestDiscussionUrl}
        mergeRequestChangesUrl={subUrls.mergeRequestChangesUrl}
        mergeRequestCommitsUrl={subUrls.mergeRequestCommitsUrl}
      />,

      issueView: (p) => <Issue.View key="issue" {...subProps}
        issueIid={p.match.params.issueIid}
        updateProjectView={updateProjectView}
        projectPath={projectPathWithNamespace}
        issuesUrl={subUrls.issuesUrl}
      />,
      /* TODO Should we handle each type of file or just have a generic project files viewer? */

      lineageView: (p) => <FileLineage key="lineage" {...subProps}
        externalUrl={externalUrl}
        lineagesUrl={subUrls.lineagesUrl}
        projectPath={projectPathWithNamespace}
        path={p.match.params.filePath}
        notebook={"Notebook"}
        accessLevel={accessLevel}
        progress={graphProgress}
        maintainer={maintainer}
        forked={forked}
        launchNotebookUrl={subUrls.launchNotebookUrl}
        projectNamespace={this.projectState.get("core.namespace_path")}
        projectPathOnly={this.projectState.get("core.project_path")}
        branches={branches}
        hashElement={filesTree !== undefined ? filesTree.hash[p.match.params.filePath] : undefined}
        gitFilePath={p.location.pathname.replace(pathComponents.baseUrl + "/files/lineage/", "")}
        history={this.props.history}
        branch={this.projectState.get("core.default_branch")} />,

      fileView: (p) => <ShowFile
        key="filePreview" {...subProps}
        filePath={p.location.pathname.replace(pathComponents.baseUrl + "/files/blob/", "")}
        lineagesPath={subUrls.lineagesUrl}
        launchNotebookUrl={subUrls.launchNotebookUrl}
        projectNamespace={this.projectState.get("core.namespace_path")}
        projectPath={this.projectState.get("core.project_path")}
        branches={branches}
        projectId={projectId}
        projectPathWithNamespace={this.projectState.get("core.path_with_namespace")}
        hashElement={filesTree !== undefined ?
          filesTree.hash[p.location.pathname.replace(pathComponents.baseUrl + "/files/blob/", "")] :
          undefined}
        filesTree={filesTree}
        history={this.props.history}
        branch={this.projectState.get("core.default_branch")} //this can be changed
        defaultBranch={this.projectState.get("core.default_branch")} />,

      datasetView: (p, projectInsideKg) => <ShowDataset
        key="datasetPreview" {...subProps}
        maintainer={maintainer}
        insideProject={true}
        datasets={datasets}
        datasetId={matchToDatasetId(p.match.params.datasetId)}
        projectPathWithNamespace={projectPathWithNamespace}
        lineagesUrl={subUrls.lineagesUrl}
        fileContentUrl={subUrls.fileContentUrl}
        projectsUrl={subUrls.projectsUrl}
        history={this.props.history}
        logged={this.props.user.logged}
        model={this.props.model}
        projectId={projectId}
        httpProjectUrl={httpProjectUrl}
        graphStatus={this.isGraphReady()}
        overviewStatusUrl={subUrls.overviewStatusUrl}
        projectInsideKg={projectInsideKg}
        location={this.props.location}
      />,

      newDataset: (p) => <ChangeDataset
        key="datasetCreate" {...subProps}
        progress={graphProgress}
        maintainer={maintainer}
        accessLevel={accessLevel}
        forked={forked}
        insideProject={true}
        datasets={datasets}
        lineagesUrl={subUrls.lineagesUrl}
        fileContentUrl={subUrls.fileContentUrl}
        projectsUrl={subUrls.projectsUrl}
        client={this.props.client}
        history={this.props.history}
        httpProjectUrl={httpProjectUrl}
        fetchDatasets={this.eventHandlers.fetchDatasets}
        overviewCommitsUrl={subUrls.overviewCommitsUrl}
        edit={false}
        location={p.location}
        notifications={p.notifications}
        model={this.props.model}
        defaultBranch={this.projectState.get("core.default_branch")}
      />,

      editDataset: (p) => <ChangeDataset
        key="datasetModify" {...subProps}
        progress={graphProgress}
        maintainer={maintainer}
        accessLevel={accessLevel}
        forked={forked}
        insideProject={true}
        datasets={datasets}
        lineagesUrl={subUrls.lineagesUrl}
        fileContentUrl={subUrls.fileContentUrl}
        projectsUrl={subUrls.projectsUrl}
        client={this.props.client}
        history={this.props.history}
        datasetId={matchToDatasetId(p.match.params.datasetId)}
        dataset={p.location.state ? p.location.state.dataset : null}
        httpProjectUrl={httpProjectUrl}
        fetchDatasets={this.eventHandlers.fetchDatasets}
        overviewCommitsUrl={subUrls.overviewCommitsUrl}
        edit={true}
        location={p.location}
        notifications={p.notifications}
        model={this.props.model}
        defaultBranch={this.projectState.get("core.default_branch")}
      />,

      importDataset: (p) => <ImportDataset
        key="datasetImport" {...subProps}
        progress={graphProgress}
        maintainer={maintainer}
        accessLevel={accessLevel}
        forked={forked}
        insideProject={true}
        datasets={datasets}
        lineagesUrl={subUrls.lineagesUrl}
        fileContentUrl={subUrls.fileContentUrl}
        projectsUrl={subUrls.projectsUrl}
        selectedDataset={matchToDatasetId(p.match.params.datasetId)}
        client={this.props.client}
        history={this.props.history}
        httpProjectUrl={httpProjectUrl}
        fetchDatasets={this.eventHandlers.fetchDatasets}
        overviewCommitsUrl={subUrls.overviewCommitsUrl}
        location={p.location}
        notifications={p.notifications}
        model={this.props.model}
      />,

      kgStatusView: (displaySuccessMessage = false) =>
        <KnowledgeGraphStatus
          fetchGraphStatus={this.eventHandlers.fetchGraphStatus}
          createGraphWebhook={this.eventHandlers.createGraphWebhook}
          maintainer={maintainer}
          forked={forked}
          progress={graphProgress}
          displaySuccessMessage={displaySuccessMessage}
          warningMessage="Knowledge Graph integration has not been turned on."
          fetchAfterBuild={this.eventHandlers.fetchDatasets}
          isPrivate={isPrivate}
        />
    };
  }

  eventHandlers = {
    onProjectTagsChange: (tags) => {
      this.projectState.setTags(this.props.client, tags);
    },
    onProjectDescriptionChange: (description) => {
      this.projectState.setDescription(this.props.client, description);
    },
    onAvatarChange: (avatarFile) => {
      return this.projectState.setAvatar(this.props.client, avatarFile);
    },
    onStar: () => {
      const starred = this.getStarred();
      return this.projectCoordinator.star(this.props.client, starred).then((project) => {
        // we know it worked, we can manually change star status without querying APIs
        if (project && project.star_count != null) {
          // first update the list of starred project, otherwise this.getStarred returns wrong
          this.projectsCoordinator.updateStarred(project, !starred);
          this.projectCoordinator.setStars(project.star_count);
        }
        return true;
      });
    },
    onProjectRefresh: (e) => {
      e.preventDefault();
      this.fetchAll();
    },
    fetchOverviewData: () => {
      return this.fetchReadme();
    },
    fetchFiles: () => {
      this.fetchProjectFilesTree();
    },
    fetchDatasets: (forceReFetch) => {
      this.fetchProjectDatasetsFromKg();
      this.fetchProjectDatasets(forceReFetch);
    },
    setOpenFolder: (filePath) => {
      this.setProjectOpenFolder(filePath);
    },
    setLastNode: (nodeData) => {
      this.saveProjectLastNode(nodeData);
    },
    createGraphWebhook: (e) => {
      e.preventDefault();
      return this.createGraphWebhook();
    },
    fetchGraphStatus: () => {
      return this.fetchGraphStatus();
    },
    fetchBranches: () => {
      return this.fetchBranches();
    },
    onMigrateProject: (params) => {
      return this.migrateProject(params);
    }
  };

  mapStateToProps(state, ownProps) {
    const pathComponents = splitProjectSubRoute(ownProps.match.url);
    const internalId = this.projectState.get("core.id") || parseInt(ownProps.match.params.id, 10);
    const starred = this.getStarred();
    const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
    const settingsReadOnly = accessLevel < ACCESS_LEVELS.MAINTAINER;
    const externalUrl = this.projectState.get("core.external_url");
    const canCreateMR = accessLevel >= ACCESS_LEVELS.DEVELOPER;
    const isGraphReady = this.isGraphReady();

    return {
      ...this.projectState.get(),
      ...this.projectCoordinator.get(),
      ...ownProps,
      projectPathWithNamespace: pathComponents.projectPathWithNamespace,
      projectId: pathComponents.projectId,
      namespace: pathComponents.namespace,
      ...this.getSubUrls(),
      ...this.subComponents.bind(this)(internalId, ownProps),
      starred,
      settingsReadOnly,
      externalUrl,
      canCreateMR,
      isGraphReady
    };
  }

  render() {
    const ConnectedProjectView = connect(
      this.mapStateToProps.bind(this), null, null)(Present.ProjectView);
    const props = {
      ...this.props,
      ...this.eventHandlers,
      store: this.props.model.reduxStore,
      projectCoordinator: this.projectCoordinator
    };
    return <ConnectedProjectView {...props} />;
  }
}


/**
 * Generate the appropriate mapStateToProps function to connect project components
 *
 * @param {Object} projectCoordinator - an instance of the projectCoordinator
 * @param {string[]} [features] - list of project sub-categories to include. An empty array
 *     means all categories will be included
 * @param {string} [parentProperty] - optional parent property where to include all the
 *     selected categories. Try to avoid it, only for compatibility with old components.
 */
function mapProjectFeatures(projectCoordinator, features = [], parentProperty = null) {
  let mapStateToProps = function (state) {
    const projectState = state.project;
    if (!features || !features.length)
      features = Object.keys(projectState);

    // select categories
    let properties = { ...projectState };
    properties = features.reduce(
      (all, category) => {
        if (projectState[category])
          all[category] = { ...projectState[category] };
        return all;
      },
      {}
    );

    // add useful functions
    if (properties.commits)
      properties.commits.refresh = () => { projectCoordinator.fetchCommits(); };

    // return the object
    if (parentProperty)
      return { [parentProperty]: { ...properties } };
    return { ...properties };
  };

  return mapStateToProps;
}


/**
 * Enhance a React component with project data mapped as properties.
 *
 * @param {Object} MappingComponent - component to be mapped with the project categories
 * @param {Object} MappingComponent.props.projectCoordinator - an instance of the projectCoordinator
 * @param {string[]} [features] - list of project sub-categories to include. An empty array
 *     means all categories will be included
 * @param {bool} [passProps] - weather to pass down the properties or not. Default is true
 */
function withProjectMapped(MappingComponent, features = [], passProps = true) {
  return class ProjectMapped extends Component {
    render() {
      const projectCoordinator = this.props.projectCoordinator;
      const mapFunction = mapProjectFeatures(projectCoordinator, features);
      const MappedComponent = connect(mapFunction.bind(this))(MappingComponent);
      const store = projectCoordinator.model.reduxStore;
      const props = passProps ? this.props : {};

      return (<MappedComponent store={store} {...props} />);
    }
  };
}


export default { View };
export { GraphIndexingStatus, MigrationStatus, mapProjectFeatures, splitProjectSubRoute, withProjectMapped };

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
import _ from "lodash";

import Present from "./Project.present";
import { GraphIndexingStatus, ProjectCoordinator, MigrationStatus } from "./Project.state";
import { FileLineage } from "../file";
import { ACCESS_LEVELS } from "../api-client";
import { ShowFile } from "../file";
import ShowDataset from "../dataset/Dataset.container";
import ChangeDataset from "./datasets/change/index";
import ImportDataset from "./datasets/import/index";
import KnowledgeGraphStatus from "../file/KnowledgeGraphStatus.container";
import qs from "query-string";
import { DatasetCoordinator } from "../dataset/Dataset.state";
import { NotebooksCoordinator } from "../notebooks";


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
  files: "files",
  fileContent: "blob",
  notebook: "files/blob/:filePath([^.]+.ipynb)",
  lineages: "files/lineage",
  lineage: "files/lineage/:filePath+",
  data: "files/data",
  workflow: "workflows/:id",
  workflowSingle: "workflow/:id",
  workflows: "workflows",
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

function stripFetchingInfo(thing) {
  const result = {};
  for (const k of Object.keys(thing)) {
    if (k === "fetching" || k === "fetched") continue;
    // We could make this more deeply recursive, but not necessary for now
    if (typeof thing[k] === "object") {
      result[k] = { ...thing[k] };
      if (result[k].fetching !== undefined)
        delete result[k].fetching;
      if (result[k].fetched !== undefined)
        delete result[k].fetched;
    }
    else {
      result[k] = thing[k];
    }
  }
  return result;
}

// N.b. This is explicitly against the best practices of Redux because
// it does not scale.
// But it is a temporary solution to prevent unnecessary rerenders
// until we have finished refactoring the code.
function refreshTrigger(thing) {
  return JSON.stringify(stripFetchingInfo(thing));
}

function mapProjectStateToProps(state, ownProps) {
  const projectCoordinator = ownProps.projectCoordinator;
  const pathComponents = splitProjectSubRoute(ownProps.match.url);
  const accessLevel = projectCoordinator.get("metadata.accessLevel");
  const settingsReadOnly = accessLevel < ACCESS_LEVELS.MAINTAINER;
  const externalUrl = projectCoordinator.get("metadata.externalUrl");
  const canCreateMR = accessLevel >= ACCESS_LEVELS.DEVELOPER;
  const isGraphReady = ownProps.isGraphReady();
  const pathname = ownProps.history.location.pathname;
  const isOnDatasetEditPage = pathname.endsWith("datasets/new") || pathname.endsWith("modify");


  return {
    ...projectCoordinator.get(),
    ...ownProps,
    projectPathWithNamespace: pathComponents.projectPathWithNamespace,
    projectId: pathComponents.projectId,
    namespace: pathComponents.namespace,
    settingsReadOnly,
    externalUrl,
    canCreateMR,
    isGraphReady,
    // fields (mostly non-project) that should trigger a re-render
    triggerDataset: refreshTrigger(state.stateModel.dataset),
    triggerForm: isOnDatasetEditPage ? {} : null,
    triggerNotebooks: refreshTrigger(state.stateModel.notebooks),
    triggerWorkflow: refreshTrigger(state.stateModel.workflow),
    triggerWorkflows: refreshTrigger(state.stateModel.workflows)
  };
}


// TODO: This component has grown too much and needs restructuring. One option would be to insert
// TODO: another container component between this top-level project component and the presentational
// TODO: component displaying the project overview.
class View extends Component {
  constructor(props) {
    super(props);
    const currentSearch = qs.parse(props.location.search);
    this.autostart = currentSearch?.autostart;
    this.customBranch = currentSearch?.branch;
    this.projectCoordinator = new ProjectCoordinator(props.client, props.model.subModel("project"));
    this.datasetCoordinator = new DatasetCoordinator(props.client, props.model.subModel("dataset"));
    this.notebookCoordinator = new NotebooksCoordinator(props.client, props.model.subModel("notebooks"));
    // reset filter file path when load a new project
    this.notebookCoordinator.setNotebookFilePath(null);
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
      const routes = ["overview", "files", "lineage", "notebooks", "data", "workflows", "settings",
        "pending", "launchNotebook", "notebookServers", "datasets", "sessions"];
      const potentialProjectId = pathComponents.projectPathWithNamespace.split("/")[0];
      const potentialRoute = pathComponents.projectPathWithNamespace.split("/")[1];

      if (!isNaN(potentialProjectId) && routes.indexOf(potentialRoute) > 0) {
        this.redirectAfterFetchFails(pathComponents.projectPathWithNamespace,
          this.props.location.pathname.replace("/projects/" + potentialProjectId, ""));
      }
    }
  }

  componentDidUpdate(prevProps) {
    const prevPathComps = splitProjectSubRoute(prevProps.match.url);
    const pathComps = splitProjectSubRoute(this.props.match.url);
    if (prevPathComps.projectPathWithNamespace !== pathComps.projectPathWithNamespace)
      this.fetchAll();
  }

  componentWillUnmount() {
    this.projectCoordinator.resetProject();
  }

  async fetchProject() {
    // fetch the main project data, fetch branches and commits (exception for auto-starting links)
    const pathComponents = splitProjectSubRoute(this.props.match.url);
    const projectData =
      await this.projectCoordinator.fetchProject(this.props.client, pathComponents.projectPathWithNamespace);
    this.fetchBranches();
    if (projectData && !this.autostart && !this.customBranch) {
      const defaultBranch = projectData?.all?.default_branch;
      const commitOptions = defaultBranch ?
        { branch: defaultBranch } :
        {};
      this.projectCoordinator.fetchCommits(commitOptions);
    }

    return projectData;
  }
  async fetchReadme() { return this.projectCoordinator.fetchReadme(this.props.client); }
  async fetchModifiedFiles() { return this.projectCoordinator.fetchModifiedFiles(this.props.client); }
  async fetchBranches() { return this.projectCoordinator.fetchBranches(); }
  async fetchCommits(branch) { return this.projectCoordinator.fetchCommits({ branch }); }
  async createGraphWebhook() { return this.projectCoordinator.createGraphWebhook(this.props.client); }
  async fetchGraphWebhook() { this.projectCoordinator.fetchGraphWebhook(this.props.client, this.props.user); }
  async fetchProjectFilesTree() {
    return this.projectCoordinator.fetchProjectFilesTree(this.props.client, this.cleanCurrentURL());
  }
  async setProjectOpenFolder(filePath) {
    this.projectCoordinator.setProjectOpenFolder(this.props.client, filePath);
  }
  async fetchProjectDatasets(forceReFetch) {
    return this.projectCoordinator.fetchProjectDatasets(this.props.client, forceReFetch);
  }
  async fetchProjectDatasetsFromKg() {
    return this.projectCoordinator.fetchProjectDatasetsFromKg(this.props.client);
  }
  async fetchGraphStatus() { return this.projectCoordinator.fetchGraphStatus(this.props.client); }
  saveProjectLastNode(nodeData) { this.projectCoordinator.saveProjectLastNode(nodeData); }

  async fetchMigrationCheck(gitUrl, defaultBranch) {
    return this.projectCoordinator.fetchMigrationCheck(this.props.client, gitUrl, defaultBranch);
  }
  async fetchReadmeCommits() {
    return this.projectCoordinator.fetchReadmeCommits(this.props.client);
  }

  async checkCoreAvailability(version = null) {
    return await this.projectCoordinator.checkCoreAvailability(version);
  }

  async fetchProjectLockStatus() {
    return await this.projectCoordinator.fetchProjectLockStatus(this.props.user.logged);
  }

  async fetchAll() {
    // Get the project main data
    const pathComponents = splitProjectSubRoute(this.props.match.url);
    let projectData = null;
    if (pathComponents.projectPathWithNamespace)
      projectData = await this.fetchProject();

    if (projectData) {
      // check project webhook
      if (this.props.user.logged)
        this.checkGraphWebhook();

      // Check the supported core versions
      const gitUrl = projectData.all?.http_url_to_repo;
      const defaultBranch = projectData.all?.default_branch;
      const migrationData = await this.fetchMigrationCheck(gitUrl, defaultBranch);
      const projectVersion = migrationData.core_compatibility_status?.project_metadata_version;
      await this.checkCoreAvailability(projectVersion);
      await this.fetchProjectDatasets();
      await this.fetchProjectLockStatus();
    }
  }

  migrateProject(gitUrl, branch, options) {
    this.projectCoordinator.migrateProject(this.props.client, gitUrl, branch, options);
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

  getSubUrls() {
    const match = this.props.match;
    const pathComponents = splitProjectSubRoute(match.url);
    const baseUrl = pathComponents.baseUrl;
    const filesUrl = `${baseUrl}/files`;
    const fileContentUrl = `${filesUrl}/blob`;
    const datasetsUrl = `${baseUrl}/datasets`;
    const workflowsUrl = `${baseUrl}/workflows`;

    return {
      projectsUrl: "/projects",
      baseUrl: baseUrl,
      overviewUrl: `${baseUrl}/overview`,
      statsUrl: `${baseUrl}/overview/stats`,
      overviewDatasetsUrl: `${baseUrl}/overview/datasets`,
      overviewCommitsUrl: `${baseUrl}/overview/commits`,
      overviewStatusUrl: `${baseUrl}/overview/status`,
      datasetsUrl: datasetsUrl,
      newDatasetUrl: `${datasetsUrl}/new`,
      datasetUrl: `${datasetsUrl}/:datasetId`,
      editDatasetUrl: `${datasetsUrl}/:datasetId/modify`,
      filesUrl: filesUrl,
      fileContentUrl: fileContentUrl,
      lineagesUrl: `${filesUrl}/lineage`,
      lineageUrl: `${filesUrl}/lineage/:filePath+`,
      notebookUrl: `${fileContentUrl}/:filePath([^.]+.ipynb)`,
      dataUrl: `${filesUrl}/data`,
      workflowsUrl: workflowsUrl,
      workflowUrl: `${workflowsUrl}/:id`,
      settingsUrl: `${baseUrl}/settings`,
      settingsSessionsUrl: `${baseUrl}/settings/sessions`,
      launchNotebookUrl: `${baseUrl}/sessions/new`,
      sessionAutostartUrl: `${baseUrl}/sessions/new?autostart=1`,
      notebookServersUrl: `${baseUrl}/sessions`,
      sessionShowUrl: `${baseUrl}/sessions/show/:server`
    };
  }

  // TODO: remove sub-components and use mapping function as everywhere else
  subComponents(ownProps) {
    const getSubProps = () => {
      const projectId = this.projectCoordinator.get("metadata.id") || parseInt(ownProps.match.params.id, 10);
      const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
      const datasets = this.projectCoordinator.get("datasets.core.datasets");
      const externalUrl = this.projectCoordinator.get("metadata.externalUrl");
      const filesTree = this.projectCoordinator.get("filesTree");
      const projectPathWithNamespace = this.projectCoordinator.get("metadata.pathWithNamespace");
      return {
        ...ownProps, projectId, accessLevel, externalUrl, filesTree, projectPathWithNamespace, datasets
      };
    };

    return {

      lineageView: (p) => {
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const branches = {
          all: this.projectCoordinator.get("branches"),
          fetch: () => { this.projectCoordinator.fetchBranches(); }
        };
        const externalUrl = this.projectCoordinator.get("metadata.externalUrl");
        const filesTree = this.projectCoordinator.get("filesTree");
        const forkedData = this.projectCoordinator.get("forkedFromProject");
        const forked = (forkedData != null && Object.keys(forkedData).length > 0) ? true : false;
        const graphProgress = this.projectCoordinator.get("webhook.progress");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        const pathComponents = splitProjectSubRoute(this.props.match.url);
        const projectPathWithNamespace = this.projectCoordinator.get("metadata.pathWithNamespace");
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <FileLineage key="lineage" {...subProps}
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
          projectNamespace={this.projectCoordinator.get("metadata.namespace")}
          projectPathOnly={this.projectCoordinator.get("metadata.path")}
          branches={branches}
          hashElement={filesTree !== undefined ? filesTree.hash[p.match.params.filePath] : undefined}
          gitFilePath={p.location.pathname.replace(pathComponents.baseUrl + "/files/lineage/", "")}
          history={this.props.history}
          branch={this.projectCoordinator.get("metadata.defaultBranch")} />;
      },

      fileView: (p) => {
        const branches = {
          all: this.projectCoordinator.get("branches"),
          fetch: () => { this.projectCoordinator.fetchBranches(); }
        };
        const filesTree = this.projectCoordinator.get("filesTree");
        const pathComponents = splitProjectSubRoute(this.props.match.url);
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <ShowFile
          key="filePreview" {...subProps}
          filePath={p.location.pathname.replace(pathComponents.baseUrl + "/files/blob/", "")}
          lineagesPath={subUrls.lineagesUrl}
          launchNotebookUrl={subUrls.launchNotebookUrl}
          projectNamespace={this.projectCoordinator.get("metadata.namespace")}
          projectPath={this.projectCoordinator.get("metadata.path")}
          branches={branches}
          projectId={subProps.projectId}
          projectPathWithNamespace={this.projectCoordinator.get("metadata.pathWithNamespace")}
          hashElement={filesTree !== undefined ?
            filesTree.hash[p.location.pathname.replace(pathComponents.baseUrl + "/files/blob/", "")] :
            undefined}
          filesTree={filesTree}
          history={this.props.history}
          branch={this.projectCoordinator.get("metadata.defaultBranch")} //this can be changed
          defaultBranch={this.projectCoordinator.get("metadata.defaultBranch")} />;
      },

      datasetView: (p, projectInsideKg) => {
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const datasets = this.projectCoordinator.get("datasets.core.datasets");
        const httpProjectUrl = this.projectCoordinator.get("metadata.httpUrl");
        const lockStatus = this.projectCoordinator.get("lockStatus");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        const migration = this.projectCoordinator.get("migration");
        const projectPathWithNamespace = this.projectCoordinator.get("metadata.pathWithNamespace");
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <ShowDataset
          key="datasetPreview" {...subProps}
          datasets={datasets}
          datasetId={matchToDatasetId(p.match.params.datasetId)}
          fileContentUrl={subUrls.fileContentUrl}
          graphStatus={this.isGraphReady()}
          history={this.props.history}
          httpProjectUrl={httpProjectUrl}
          insideProject={true}
          lineagesUrl={subUrls.lineagesUrl}
          location={this.props.location}
          lockStatus={lockStatus}
          logged={this.props.user.logged}
          maintainer={maintainer}
          migration={migration}
          model={this.props.model}
          overviewStatusUrl={subUrls.overviewStatusUrl}
          projectId={subProps.projectId}
          projectInsideKg={projectInsideKg}
          projectPathWithNamespace={projectPathWithNamespace}
          projectsUrl={subUrls.projectsUrl}
          datasetCoordinator={this.datasetCoordinator}
        />;
      },

      newDataset: (p) => {
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const datasets = this.projectCoordinator.get("datasets.core.datasets");
        const forkedData = this.projectCoordinator.get("forkedFromProject");
        const forked = (forkedData != null && Object.keys(forkedData).length > 0) ? true : false;
        const graphProgress = this.projectCoordinator.get("webhook.progress");
        const httpProjectUrl = this.projectCoordinator.get("metadata.httpUrl");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        const migration = this.projectCoordinator.get("migration");
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <ChangeDataset
          key="datasetCreate" {...subProps}
          accessLevel={accessLevel}
          client={this.props.client}
          datasets={datasets}
          defaultBranch={this.projectCoordinator.get("metadata.defaultBranch")}
          edit={false}
          fetchDatasets={this.eventHandlers.fetchDatasets}
          fileContentUrl={subUrls.fileContentUrl}
          forked={forked}
          history={this.props.history}
          httpProjectUrl={httpProjectUrl}
          insideProject={true}
          lineagesUrl={subUrls.lineagesUrl}
          location={p.location}
          maintainer={maintainer}
          migration={migration}
          model={this.props.model}
          notifications={p.notifications}
          overviewCommitsUrl={subUrls.overviewCommitsUrl}
          progress={graphProgress}
          projectsUrl={subUrls.projectsUrl}
          toggleNewDataset={p.toggleNewDataset}
        />;
      },

      editDataset: (p) => {
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const datasets = this.projectCoordinator.get("datasets.core.datasets");
        const forkedData = this.projectCoordinator.get("forkedFromProject");
        const forked = (forkedData != null && Object.keys(forkedData).length > 0) ? true : false;
        const graphProgress = this.projectCoordinator.get("webhook.progress");
        const httpProjectUrl = this.projectCoordinator.get("metadata.httpUrl");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        const migration = this.projectCoordinator.get("migration");
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <ChangeDataset
          key="datasetModify" {...subProps}
          accessLevel={accessLevel}
          client={this.props.client}
          dataset={p.location.state ? p.location.state.dataset : null}
          datasetId={matchToDatasetId(p.match.params.datasetId)}
          datasets={datasets}
          defaultBranch={this.projectCoordinator.get("metadata.defaultBranch")}
          edit={true}
          fetchDatasets={this.eventHandlers.fetchDatasets}
          fileContentUrl={subUrls.fileContentUrl}
          forked={forked}
          history={this.props.history}
          httpProjectUrl={httpProjectUrl}
          insideProject={true}
          lineagesUrl={subUrls.lineagesUrl}
          location={p.location}
          maintainer={maintainer}
          migration={migration}
          model={this.props.model}
          notifications={p.notifications}
          overviewCommitsUrl={subUrls.overviewCommitsUrl}
          progress={graphProgress}
          projectsUrl={subUrls.projectsUrl}
          toggleNewDataset={p.toggleNewDataset}
        />;
      },

      importDataset: (p) => {
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const datasets = this.projectCoordinator.get("datasets.core.datasets");
        const forkedData = this.projectCoordinator.get("forkedFromProject");
        const forked = (forkedData != null && Object.keys(forkedData).length > 0) ? true : false;
        const graphProgress = this.projectCoordinator.get("webhook.progress");
        const httpProjectUrl = this.projectCoordinator.get("metadata.httpUrl");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        const migration = this.projectCoordinator.get("migration");
        const subProps = getSubProps();
        const subUrls = this.getSubUrls();
        return <ImportDataset
          key="datasetImport" {...subProps}
          accessLevel={accessLevel}
          client={this.props.client}
          datasets={datasets}
          fetchDatasets={this.eventHandlers.fetchDatasets}
          fileContentUrl={subUrls.fileContentUrl}
          forked={forked}
          history={this.props.history}
          httpProjectUrl={httpProjectUrl}
          insideProject={true}
          lineagesUrl={subUrls.lineagesUrl}
          location={p.location}
          maintainer={maintainer}
          migration={migration}
          model={this.props.model}
          notifications={p.notifications}
          overviewCommitsUrl={subUrls.overviewCommitsUrl}
          progress={graphProgress}
          projectsUrl={subUrls.projectsUrl}
          selectedDataset={matchToDatasetId(p.match.params.datasetId)}
          toggleNewDataset={p.toggleNewDataset}
        />;
      },

      kgStatusView: (displaySuccessMessage = false) => {
        const isPrivate = this.projectCoordinator.get("metadata.visibility") === "private";
        const accessLevel = this.projectCoordinator.get("metadata.accessLevel");
        const forkedData = this.projectCoordinator.get("forkedFromProject");
        const forked = (forkedData != null && Object.keys(forkedData).length > 0) ? true : false;
        const graphProgress = this.projectCoordinator.get("webhook.progress");
        const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
        return <KnowledgeGraphStatus
          fetchGraphStatus={this.eventHandlers.fetchGraphStatus}
          createGraphWebhook={this.eventHandlers.createGraphWebhook}
          maintainer={maintainer}
          forked={forked}
          progress={graphProgress}
          displaySuccessMessage={displaySuccessMessage}
          warningMessage="Knowledge Graph integration has not been turned on."
          fetchAfterBuild={this.eventHandlers.fetchDatasets}
          isPrivate={isPrivate}
        />;
      }
    };
  }

  eventHandlers = {
    onProjectTagsChange: (tags) => {
      return this.projectCoordinator.setTags(this.props.client, tags);
    },
    onProjectDescriptionChange: (description) => {
      return this.projectCoordinator.setDescription(this.props.client, description);
    },
    onAvatarChange: (avatarFile) => {
      return this.projectCoordinator.setAvatar(this.props.client, avatarFile);
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
    fetchDatasets: async (forceReFetch) => {
      this.fetchProjectDatasetsFromKg();
      await this.fetchProjectDatasets(forceReFetch);
      this.fetchProjectLockStatus();
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
    fetchReadmeCommits: () => {
      return this.fetchReadmeCommits();
    },
    fetchBranches: () => {
      return this.projectCoordinator.fetchBranches();
    },
    fetchCommits: (branch = null) => {
      return this.projectCoordinator.fetchCommits(branch);
    },
    onMigrateProject: (gitUrl, branch, options) => {
      return this.migrateProject(gitUrl, branch, options);
    },
    fetchProject: (usePendingRefresh) => {
      if (usePendingRefresh) {
        const pendingRefreshing = this.projectCoordinator.get("metadata.pendingRefresh");
        if (pendingRefreshing) {
          this.projectCoordinator.fetchProject(this.props.client);
          this.projectCoordinator.set("metadata.pendingRefresh", false);
        }
      }
      else {
        this.projectCoordinator.fetchProject(this.props.client);
      }
    }
  };

  render() {
    const ConnectedProjectView = connect(mapProjectStateToProps)(Present.ProjectView);
    const props = {
      ...this.props,
      ...this.eventHandlers,
      ...this.getSubUrls(),
    };
    return <ConnectedProjectView
      isGraphReady={this.isGraphReady.bind(this)}
      projectCoordinator={this.projectCoordinator}
      {...this.subComponents(props)}
      {...props} />;
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
    const projectState = projectCoordinator.get();
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
      const MappedComponent = connect(mapFunction)(MappingComponent);
      const props = passProps ? this.props : {};

      return (<MappedComponent projectCoordinator={projectCoordinator} {...props} />);
    }
  };
}


export default { View };
export { GraphIndexingStatus, MigrationStatus, mapProjectFeatures, splitProjectSubRoute, withProjectMapped };

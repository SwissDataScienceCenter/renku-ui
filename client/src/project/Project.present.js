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

/**
 *  incubator-renku-ui
 *
 *  Project.present.js
 *  Presentational components.
 */

import React, { Component, Fragment, useEffect } from "react";
import { Link, Route, Switch } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  Row,
  Nav,
  NavItem,
  UncontrolledTooltip,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { Url } from "../utils/helpers/url";
import { SpecialPropVal } from "../model/Model";
import { Notebooks, ShowSession, StartNotebookServer } from "../notebooks";
import FilesTreeView from "./filestreeview/FilesTreeView";
import { ProjectDatasetsView } from "../features/project";
import { ACCESS_LEVELS } from "../api-client";
import { shouldDisplayVersionWarning } from "./status/MigrationUtils.js";
import { NamespaceProjects } from "../namespace";
import { ProjectOverviewCommits, ProjectOverviewStats, ProjectOverviewVersion } from "./overview";
import { ForkProject } from "./new";
import { ProjectSettingsGeneral, ProjectSettingsNav, ProjectSettingsSessions } from "./settings";
import { WorkflowsList } from "../workflows";
import { ExternalLink } from "../components/ExternalLinks";
import { GoBackButton, RoundButtonGroup } from "../components/buttons/Button";
import { RenkuMarkdown } from "../components/markdown/RenkuMarkdown";
import { InfoAlert } from "../components/Alert";
import { RenkuNavLink } from "../components/RenkuNavLink";
import { Loader } from "../components/Loader";
import { ProjectViewNotFound } from "./components/ProjectViewNotFound";
import { TimeCaption } from "../components/TimeCaption";
import { Docs } from "../utils/constants/Docs";
import { ContainerWrap } from "../App";
import { ThrottledTooltip } from "../components/Tooltip";
import { SshModal } from "../components/ssh/ssh";
import GitLabConnectButton, { externalUrlToGitLabIdeUrl } from "./components/GitLabConnect";
import { NotebooksCoordinator } from "../notebooks";
import ProjectPageTitle from "../features/project/ProjectPageTitle";
import { ProjectEntityHeader, ProjectFileLineage, ProjectFileView } from "../features/project";

import "./Project.css";

function filterPaths(paths, blacklist) {
  // Return paths to do not match the blacklist of regexps.
  const result = paths.filter((p) => blacklist.every((b) => p.match(b) === null));
  return result;
}

function isRequestPending(props, request) {
  const transient = props.transient || {};
  const requests = transient.requests || {};
  return requests[request] === SpecialPropVal.UPDATING;
}

function webhookError(props) {
  if (props == null || props === SpecialPropVal.UPDATING || props === true || props === false) return false;

  return true;
}

function isKgDown(webhook) {
  return webhook === false || (webhook.status === false && webhook.created !== true) || webhookError(webhook.status);
}

/**
 * Shows a warning icon when Renku version is outdated or Knowledge Graph integration is not active.
 *
 * @param {Object} webhook - project.webhook store object
 * @param {bool} migration_required - whether it's necessary to migrate the project or not
 * @param {bool} docker_update_possible - whether it's necessary to migrate the docker image or not
 * @param {Object} history - react history object
 * @param {string} overviewStatusUrl - overview status url
 */
class ProjectStatusIcon extends Component {
  render() {
    const { webhook, overviewStatusUrl, history, migration } = this.props;
    const kgDown = isKgDown(webhook);

    const warningSignForVersionDisplayed = shouldDisplayVersionWarning(migration);

    if (!warningSignForVersionDisplayed && !kgDown) return null;

    const versionInfo = warningSignForVersionDisplayed ? "Current project is outdated. " : null;
    const kgInfo = kgDown ? "Knowledge Graph integration not active. " : null;

    return (
      <span className="warningLabel cursor-pointer" style={{ verticalAlign: "text-bottom" }}>
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          onClick={() => history.push(overviewStatusUrl)}
          id="warningStatusLink"
        />
        <UncontrolledTooltip placement="top" target="warningStatusLink">
          {versionInfo}
          {kgInfo}
          Click to see details.
        </UncontrolledTooltip>
      </span>
    );
  }
}

function ToggleForkModalButton({ forkProjectDisabled, showForkCount, toggleModal }) {
  // display the button a bit differently if showForkCount == false
  if (showForkCount == false) {
    return (
      <Button id="fork-project" color="primary" size="sm" disabled={forkProjectDisabled} onClick={toggleModal}>
        Fork the project
      </Button>
    );
  }
  return (
    <Button id="fork-project" className="btn-outline-rk-green" disabled={forkProjectDisabled} onClick={toggleModal}>
      <FontAwesomeIcon size="sm" icon={faCodeBranch} /> Fork
      <ThrottledTooltip target="fork-project" tooltip="Fork" />
    </Button>
  );
}

function ForkCountButton({ forkProjectDisabled, externalUrl, forksCount }) {
  return (
    <Button
      id="project-forks"
      key="counter-forks"
      className="btn-outline-rk-green btn-icon-text"
      disabled={forkProjectDisabled}
      href={`${externalUrl}/-/forks`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {forksCount}
      <ThrottledTooltip target="project-forks" tooltip="Forks" />
    </Button>
  );
}

class ForkProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.toggleFunction = this.toggle.bind(this);
  }

  toggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    let content = null;
    // this prevents flashing wrong content during the close animation
    if (this.state.open) {
      content = (
        <ForkProject
          client={this.props.client}
          forkedId={this.props.id}
          forkedTitle={this.props.title}
          projectVisibility={this.props.projectVisibility}
          toggleModal={this.toggleFunction}
        />
      );
    }
    // Treat undefined as true
    const buttons =
      this.props.showForkCount === false ? (
        <ToggleForkModalButton
          forkProjectDisabled={this.props.forkProjectDisabled}
          showForkCount={false}
          toggleModal={this.toggleFunction}
        />
      ) : (
        <RoundButtonGroup>
          <ToggleForkModalButton
            forkProjectDisabled={this.props.forkProjectDisabled}
            showForkCount={true}
            toggleModal={this.toggleFunction}
          />
          <ForkCountButton
            externalUrl={this.props.externalUrl}
            forksCount={this.props.forksCount}
            forkProjectDisabled={this.props.forkProjectDisabled}
          />
        </RoundButtonGroup>
      );
    return (
      <Fragment>
        {buttons}
        <Modal isOpen={this.state.open} toggle={this.toggleFunction}>
          {content}
        </Modal>
      </Fragment>
    );
  }
}


function getLinksProjectHeader(datasets, datasetsUrl, errorGettingDatasets) {
  const status = errorGettingDatasets
    ? "error"
    : datasets.transient === undefined || datasets.core === "is_updating"
      ? "pending"
      : "done";
  const linksHeader = {
    data: [],
    status: status,
    total: 0,
    linkAll: datasetsUrl,
  };
  if (datasets.transient !== undefined && datasets.core !== "is_updating" && datasets.core?.datasets?.length > 0) {
    linksHeader.total = datasets.core.datasets.length;
    datasets.core.datasets.slice(0, 3).map((dataset) => {
      linksHeader.data.push({
        title: dataset.title,
        url: `${datasetsUrl}/${encodeURIComponent(dataset.name)}`,
      });
    });
  }
  return linksHeader;
}

function ProjectViewHeaderMinimal(props) {
  const linksHeader = getLinksProjectHeader(props.datasets, props.datasetsUrl,
    props.migration.core.fetched && !props.migration.core.backendAvailable);
  const projectUrl = Url.get(Url.pages.project,
    { namespace: props.metadata.namespace, path: props.metadata.path });
  const statusButton = (<ProjectStatusIcon
    history={props.history}
    webhook={props.webhook}
    overviewStatusUrl={props.overviewStatusUrl}
    migration={props.migration}
  />);
  const isInKg = props.isGraphReady;

  const forkedFromText = isForkedFromProject(props.forkedFromProject) ? (
    <>
      {" "}
      <b key="forked">forked</b>
      {" from "} {props.forkedFromLink}
    </>
  ) : null;
  const forkedFrom = forkedFromText ? (
    <>
      <span className="text-rk-text fs-small">{forkedFromText}</span>
      <br />
    </>
  ) : null;
  const slug = (
    <>
      {props.metadata.pathWithNamespace} {forkedFrom}
    </>
  );

  return (
    <>
      <ProjectEntityHeader
        client={props.client}
        creators={props.metadata.owner ? [props.metadata.owner] : []}
        description={{ value: props.metadata.description }}
        devAccess={props.metadata.accessLevel > ACCESS_LEVELS.DEVELOPER}
        fullPath={props.metadata.pathWithNamespace}
        gitUrl={props.externalUrl}
        hideEmptyTags={true}
        imageUrl={props.metadata.avatarUrl}
        isInKg={isInKg}
        itemType="project"
        labelCaption={"Updated"}
        links={linksHeader}
        slug={slug}
        statusButton={statusButton}
        tagList={props.metadata.tagList}
        timeCaption={props.metadata.lastActivityAt}
        title={props.metadata.title}
        url={projectUrl}
        visibility={props.metadata.visibility}
      />
      <SshModal />
    </>
  );
}

function ProjectSuggestionReadme({ commits, commitsReadme, externalUrl, metadata }) {
  const countCommitsReadme = commitsReadme?.list?.length ?? null;
  let isReadmeCommitInitial = countCommitsReadme === 1;
  if (countCommitsReadme === 1 && commits.list.length > 0) {
    const firstCommit = commits?.list.sort((a, b) => new Date(a.committed_date) - new Date(b.committed_date))[0];
    isReadmeCommitInitial = firstCommit.id === commitsReadme.list[0].id;
  }

  if (countCommitsReadme > 1 || (!isReadmeCommitInitial && countCommitsReadme !== 0)) return null;

  const gitlabIDEUrl = externalUrlToGitLabIdeUrl(externalUrl);
  const addReadmeUrl = `${gitlabIDEUrl}/edit/${metadata.defaultBranch}/-/README.md`;
  return (
    <li>
      <p style={{ fontSize: "smaller" }}>
        <a className="mx-1" href={addReadmeUrl} target="_blank" rel="noopener noreferrer">
          <strong className="suggestionTitle">Edit README.md</strong>
        </a>
        Use the README to explain your project to others, letting them understand what you want to do and what you have
        already accomplished.
      </p>
    </li>
  );
}

function ProjectSuggestionDataset(props) {
  const datasets = props.datasets.core;
  const isLoadingDatasets = typeof datasets === "string" || datasets?.datasets === null;
  let hasDatasets = !isLoadingDatasets ? datasets.datasets?.length > 0 : true;

  if (hasDatasets) return null;
  return (
    <li>
      <p style={{ fontSize: "smaller" }}>
        <Link className="mx-1" to={props.newDatasetUrl}>
          <strong className="suggestionTitle">Add some datasets</strong>
        </Link>
        Datasets let you work with data in a structured way, facilitating easier sharing. You can create a new dataset
        with data you already have, or importing one from another Renku project or from a public data repository such as
        <ExternalLink className="mx-1" url="https://zenodo.org/" title="Zenodo" role="link" /> or
        <ExternalLink className="mx-1" url="https://dataverse.harvard.edu/" title="Dataverse" role="link" />.
      </p>
    </li>
  );
}

const ProjectSuggestActions = (props) => {
  const { commits, commitsReadme } = props;
  const datasets = props.datasets.core;
  const isProjectMaintainer = props.metadata.accessLevel >= ACCESS_LEVELS.MAINTAINER;
  const countTotalCommits = commits?.list?.length ?? 0;
  const countCommitsReadme = commitsReadme?.list?.length ?? null;
  let isReadmeCommitInitial = countCommitsReadme === 1;
  if (countCommitsReadme === 1 && commits.list.length > 0) {
    const firstCommit = commits?.list.sort((a, b) => new Date(a.committed_date) - new Date(b.committed_date))[0];
    isReadmeCommitInitial = firstCommit.id === commitsReadme.list[0].id;
  }

  const isLoadingDatasets = typeof datasets === "string" || datasets?.datasets === null;
  let hasDatasets = !isLoadingDatasets ? datasets.datasets?.length > 0 : true;
  const isLoadingData = !commits.fetched || !commitsReadme.fetched || countCommitsReadme === null || isLoadingDatasets;

  useEffect(() => {
    if (props.metadata.id !== null) props.fetchReadmeCommits();
  }, []); // eslint-disable-line

  const cHasDataset = countCommitsReadme > 1 && hasDatasets;
  const cCombo = !isReadmeCommitInitial && hasDatasets && countCommitsReadme !== 0;
  const isLocked = props.lockStatus?.locked ?? true;
  if (!isProjectMaintainer || isLoadingData || countTotalCommits > 4 || cHasDataset || cCombo || isLocked) return null;

  return (
    <InfoAlert timeout={0}>
      <div className="mb-0" style={{ textAlign: "justify" }}>
        <strong>Welcome</strong> to your new Renku project! It looks like this project is just getting started, so here
        are some suggestions to help you. <br />
        <ul className="my-2">
          <ProjectSuggestionReadme {...props} />
          <ProjectSuggestionDataset {...props} />
        </ul>
      </div>
    </InfoAlert>
  );
};

class ProjectViewHeaderOverview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const metadata = this.props.metadata;

    const gitlabIDEUrl = externalUrlToGitLabIdeUrl(this.props.externalUrl);
    const forkProjectDisabled = metadata.accessLevel < ACCESS_LEVELS.REPORTER && metadata.visibility === "private";

    return (
      <Fragment>
        <Row className="d-flex rk-project-header gy-2 gx-2 pb-2 justify-content-md-between justify-content-sm-start">
          <Col className="col-12">
            <div className="d-flex gap-1 gap-md-3 justify-content-end flex-wrap">
              <div className="pt-1">
                <TimeCaption key="time-caption" time={this.props.metadata.lastActivityAt} className="text-rk-text" />
              </div>
              <ForkProjectModal
                client={this.props.client}
                history={this.props.history}
                model={this.props.model}
                notifications={this.props.notifications}
                title={this.props.metadata && this.props.metadata.title ? this.props.metadata.title : ""}
                id={this.props.metadata && this.props.metadata.id ? this.props.metadata.id : 0}
                forkProjectDisabled={forkProjectDisabled}
                projectVisibility={this.props.metadata.visibility}
                user={this.props.user}
                forksCount={metadata.forksCount}
                externalUrl={this.props.externalUrl}
              />
              <GitLabConnectButton
                externalUrl={this.props.externalUrl}
                gitlabIDEUrl={gitlabIDEUrl}
                userLogged={this.props.user.logged}
              />
            </div>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

function isForkedFromProject(forkedFromProject) {
  return forkedFromProject && Object.keys(forkedFromProject).length > 0;
}

function ForkedFromLink({ forkedFromProject, projectsUrl }) {
  if (!isForkedFromProject(forkedFromProject)) return null;
  return (
    <Link key="forkedFrom" to={`${projectsUrl}/${forkedFromProject.pathWithNamespace}`}>
      {forkedFromProject.pathWithNamespace || "no title"}
    </Link>
  );
}

class ProjectViewHeader extends Component {
  constructor(props) {
    // ? Temporary workaround to fetch sessions at least once when opening the project header.
    super(props);
    const notebooksModel = props.model.subModel("notebooks");
    const userModel = props.model.subModel("user");
    const notebookCoordinator = new NotebooksCoordinator(props.client, notebooksModel, userModel);
    notebookCoordinator.fetchNotebooks();
  }

  render() {
    const forkedFromLink = (
      <ForkedFromLink forkedFromProject={this.props.forkedFromProject} projectsUrl={this.props.projectsUrl} />
    );
    return <ProjectViewHeaderMinimal key="minimalHeader" forkedFromLink={forkedFromLink} {...this.props} />;
  }
}

class ProjectNav extends Component {
  render() {
    return (
      <div className="pb-3 rk-search-bar pt-4 mt-1" data-cy="project-navbar">
        <Col className="d-flex pb-2 mb-1 justify-content-start" md={12} lg={12}>
          <Nav pills className="nav-pills-underline">
            <NavItem>
              <RenkuNavLink to={this.props.baseUrl} alternate={this.props.overviewUrl} title="Overview" />
            </NavItem>
            <NavItem>
              <RenkuNavLink exact={false} to={this.props.filesUrl} title="Files" />
            </NavItem>
            <NavItem>
              <RenkuNavLink exact={false} to={this.props.datasetsUrl} title="Datasets" />
            </NavItem>
            <NavItem>
              <RenkuNavLink exact={false} to={this.props.workflowsUrl} title="Workflows" />
            </NavItem>
            <NavItem>
              <RenkuNavLink exact={false} to={this.props.notebookServersUrl} title="Sessions" />
            </NavItem>
            <NavItem className="pe-0">
              <RenkuNavLink exact={false} to={this.props.settingsUrl} title="Settings" />
            </NavItem>
          </Nav>
        </Col>
      </div>
    );
  }
}

class ProjectFilesNav extends Component {
  render() {
    const loading = isRequestPending(this.props, "filesTree");
    const allFiles = this.props.filesTree || [];
    if ((loading && Object.keys(allFiles).length < 1) || this.props.filesTree === undefined) return <Loader />;

    return (
      <FilesTreeView
        data={this.props.filesTree}
        lineageUrl={this.props.lineagesUrl}
        projectUrl={this.props.fileContentUrl}
        setOpenFolder={this.props.setOpenFolder}
        setLastNode={this.props.setLastNode}
        hash={this.props.filesTree.hash}
        fileView={this.props.filesTreeView}
        currentUrl={this.props.location.pathname}
        history={this.props.history}
        limitHeight={true}
      />
    );
  }
}

class ProjectViewReadme extends Component {
  componentDidMount() {
    this.props.fetchOverviewData();
  }

  render() {
    const readmeText = this.props.readme.text;
    const loading = isRequestPending(this.props, "readme");
    if (loading && readmeText === "") return <Loader />;

    return (
      <Card className="border-rk-light">
        <CardHeader className="bg-white p-3 ps-4">README.md</CardHeader>
        <CardBody style={{ overflow: "auto" }} className="p-4" data-cy="project-readme">
          <RenkuMarkdown
            projectPathWithNamespace={this.props.metadata.pathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            branch={this.props.metadata.defaultBranch}
            markdownText={this.props.readme.text}
            client={this.props.client}
            projectId={this.props.metadata.id}
          />
        </CardBody>
      </Card>
    );
  }
}

function ProjectViewGeneral(props) {
  const forkedFromLink = <ForkedFromLink forkedFromProject={props.metadata.forkedFromProject} />;

  return (
    <Fragment>
      <ProjectViewHeaderOverview key="overviewHeader" forkedFromLink={forkedFromLink} {...props} />
      <ProjectSuggestActions {...props} />
      <ProjectViewReadme {...props} />
    </Fragment>
  );
}

class ProjectViewOverviewNav extends Component {
  render() {
    // Add when results are handled:
    // <NavItem>
    //   <RenkuNavLink to={`${this.props.overviewUrl}/results`} title="Results" />
    // </NavItem>
    return (
      <Nav className="flex-column nav-light nav-pills-underline" data-cy="project-overview-nav">
        <NavItem>
          <RenkuNavLink to={this.props.baseUrl} title="General" id="nav-overview-general" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.statsUrl} title="Stats" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.overviewCommitsUrl} title="Commits" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.overviewStatusUrl} title="Status" />
        </NavItem>
      </Nav>
    );
  }
}

class ProjectViewOverview extends Component {
  render() {
    const { projectCoordinator } = this.props;
    return (
      <Col key="overview" data-cy="project-overview">
        <Row>
          <Col key="nav" sm={12} md={2}>
            <ProjectViewOverviewNav {...this.props} />
          </Col>
          <Col key="content" sm={12} md={10} data-cy="project-overview-content">
            <Switch>
              <Route
                exact
                path={this.props.baseUrl}
                render={() => {
                  return <ProjectViewGeneral readme={this.props.data.readme} {...this.props} />;
                }}
              />
              <Route
                exact
                path={this.props.statsUrl}
                render={() => (
                  <ProjectOverviewStats
                    projectCoordinator={projectCoordinator}
                    branches={this.props.branches.standard}
                  />
                )}
              />
              <Route
                exact
                path={this.props.overviewCommitsUrl}
                render={(props) => (
                  <ProjectOverviewCommits
                    location={this.props.location}
                    history={props.history}
                    projectCoordinator={projectCoordinator}
                  />
                )}
              />
              <Route
                exact
                path={this.props.overviewStatusUrl}
                render={() => (
                  <ProjectOverviewVersion {...this.props} isLoading={isRequestPending(this.props, "readme")} />
                )}
              />
            </Switch>
          </Col>
        </Row>
      </Col>
    );
  }
}

function ProjectViewWorkflows(props) {
  const reference = props.metadata?.defaultBranch ? props.metadata?.defaultBranch : "";

  useEffect(() => {
    console.log({ migration: props.migration })
  }, [props.migration])

  return (
    <WorkflowsList
      fullPath={props.projectPathWithNamespace}
      reference={reference}
      repositoryUrl={props.externalUrl}
      versionUrl={props.migration?.core?.versionUrl}
      backendAvailable={props.migration?.core?.backendAvailable}
    />
  );
}

class ProjectViewFiles extends Component {
  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    return [
      <div key="files" className="variableWidthColLeft me-2 pb-0 pe-0">
        <ProjectFilesNav {...this.props} />
      </div>,
      <div key="content" className="flex-shrink-1 variableWidthColRight">
        <Switch>
          <Route path={this.props.lineageUrl} render={(p) =>
            <ProjectFileLineage
              client={this.props.client}
              fetchBranches={() => this.props.projectCoordinator.fetchBranches()}
              fetchGraphStatus={this.props.fetchGraphStatus}
              filePath={p.match.params.filePath}
              history={this.props.history}
              location={p.location}
              model={this.props.model}
            />
          } />
          <Route path={this.props.fileContentUrl} render={(p) =>
            <ProjectFileView
              client={this.props.client}
              fetchBranches={() => this.props.projectCoordinator.fetchBranches()}
              fetchGraphStatus={this.props.fetchGraphStatus}
              filePath={p.match.params.filePath}
              history={this.props.history}
              location={p.location}
              model={this.props.model}
              params={this.props.params}
            />
          } />
        </Switch>
      </div>,
    ];
  }
}

const ProjectSessions = (props) => {
  const locationFrom = props.history?.location?.state?.from;
  const filePath = props.history?.location?.state?.filePath;
  const backNotebookLabel = filePath ? `Back to ${filePath}` : "Back to notebook file";
  const backButtonLabel = locationFrom ? backNotebookLabel : `Back to ${props.metadata.pathWithNamespace}`;
  const backUrl = locationFrom ?? props.baseUrl;

  const backButton = <GoBackButton label={backButtonLabel} url={backUrl} />;

  return [
    <Col key="content" xs={12}>
      <Switch>
        <Route
          exact
          path={props.notebookServersUrl}
          render={() => (
            <>
              {backButton}
              <ProjectNotebookServers {...props} />
            </>
          )}
        />
        <Route
          path={props.launchNotebookUrl}
          render={() => (
            <ProjectStartNotebookServer
              key="startNotebookForm"
              {...props}
              backUrl={backUrl}
              defaultBackButton={backButton}
            />
          )}
        />
        <Route
          path={props.sessionShowUrl}
          render={(p) => (
            <Fragment>
              <ProjectShowSession {...props} match={p.match} />
            </Fragment>
          )}
        />
      </Switch>
    </Col>,
  ];
};

function notebookWarning(userLogged, accessLevel, forkUrl, postLoginUrl, externalUrl, props) {
  if (!userLogged) {
    const to = Url.get(Url.pages.login.link, { pathname: postLoginUrl });
    return (
      <InfoAlert timeout={0} key="permissions-warning">
        <p>
          As an anonymous user, you can start{" "}
          <ExternalLink
            role="text"
            title="Sessions"
            url={Docs.rtdHowToGuide("renkulab/session-stopping-and-saving.html")}
          />
          , but you cannot save your work.
        </p>
        <p className="mb-0">
          <Link className="btn btn-primary btn-sm" to={to}>
            Log in
          </Link>{" "}
          for full access.
        </p>
      </InfoAlert>
    );
  }
  else if (accessLevel < ACCESS_LEVELS.DEVELOPER) {
    return (
      <InfoAlert timeout={0} key="permissions-warning">
        <p>
          You have limited permissions for this project. You can launch a session, but you will not be able to save any
          changes. If you want to save your work, consider one of the following:
        </p>
        <ul className="mb-0">
          <li>
            <ForkProjectModal
              className="btn btn-primary btn-sm"
              client={props.client}
              history={props.history}
              model={props.model}
              notifications={props.notifications}
              title={props.metadata && props.metadata.title ? props.metadata.title : ""}
              id={props.metadata && props.metadata.id ? props.metadata.id : 0}
              forkProjectDisabled={false}
              projectVisibility={props.metadata.visibility}
              user={props.user}
              externalUrl={props.externalUrl}
              showForkCount={false}
            />
            {" "}
            and start a session from your fork.
          </li>
          <li className="pt-1">
            <ExternalLink size="sm" title="Contact a maintainer" url={`${externalUrl}/-/project_members`} /> and ask
            them to{" "}
            <ExternalLink
              role="text"
              title="grant you the necessary permissions"
              url={Docs.rtdHowToGuide("renkulab/collaboration.html")}
            />
            .
          </li>
        </ul>
      </InfoAlert>
    );
  }
  return null;
}

class ProjectShowSession extends Component {
  render() {
    const {
      blockAnonymous,
      client,
      externalUrl,
      history,
      launchNotebookUrl,
      location,
      match,
      metadata,
      model,
      notifications,
      forkUrl,
      user,
      notebookServersUrl,
    } = this.props;
    const warning = notebookWarning(user.logged, metadata.accessLevel, forkUrl,
      location.pathname, externalUrl, this.props);

    return (
      <ShowSession
        blockAnonymous={blockAnonymous}
        client={client}
        history={history}
        location={location}
        match={match}
        message={warning}
        model={model}
        notifications={notifications}
        scope={{ namespace: this.props.metadata.namespace, project: this.props.metadata.path }}
        standalone={false}
        urlNewSession={launchNotebookUrl}
        notebookServersUrl={notebookServersUrl}
        projectName={this.props.metadata.title}
      />
    );
  }
}

class ProjectNotebookServers extends Component {
  render() {
    const { client, metadata, model, user, forkUrl, location, externalUrl, launchNotebookUrl, blockAnonymous } =
      this.props;
    const warning = notebookWarning(user.logged, metadata.accessLevel, forkUrl,
      location.pathname, externalUrl, this.props);

    return (
      <Notebooks
        standalone={false}
        client={client}
        model={model}
        location={location}
        message={warning}
        urlNewSession={launchNotebookUrl}
        blockAnonymous={blockAnonymous}
        scope={{
          namespace: this.props.metadata.namespace,
          project: this.props.metadata.path,
          defaultBranch: this.props.metadata.defaultBranch,
        }}
      />
    );
  }
}

class ProjectStartNotebookServer extends Component {
  render() {
    const {
      branches,
      client,
      commits,
      model,
      user,
      forkUrl,
      externalUrl,
      location,
      metadata,
      fetchBranches,
      fetchCommits,
      notebookServersUrl,
      history,
      blockAnonymous,
      notifications,
      projectCoordinator,
      lockStatus,
      backUrl,
      defaultBackButton,
    } = this.props;
    const warning = notebookWarning(user.logged, metadata.accessLevel, forkUrl,
      location.pathname, externalUrl, this.props);

    const locationEnhanced =
      location && location.state && location.state.successUrl
        ? location
        : {
          ...this.props.location,
          state: {
            ...this.props.location.state,
            successUrl: notebookServersUrl,
          },
        };

    const scope = {
      defaultBranch: this.props.metadata.defaultBranch,
      namespace: this.props.metadata.namespace,
      project: this.props.metadata.path,
      filePath: location?.state?.filePath,
    };

    return (
      <StartNotebookServer
        accessLevel={metadata?.accessLevel}
        autosaved={branches.autosaved}
        blockAnonymous={blockAnonymous}
        branches={branches.standard}
        client={client}
        commits={commits}
        externalUrl={externalUrl}
        fetchingBranches={branches.fetching}
        history={history}
        location={locationEnhanced}
        lockStatus={lockStatus}
        message={warning}
        model={model}
        notebooks={projectCoordinator.model.baseModel.get("notebooks")}
        notifications={notifications}
        refreshBranches={fetchBranches}
        refreshCommits={fetchCommits}
        scope={scope}
        successUrl={notebookServersUrl}
        user={user}
        openShareLinkModal={location?.state?.openShareLinkModal}
        backUrl={backUrl}
        defaultBackButton={defaultBackButton}
      />
    );
  }
}

function ProjectSettings(props) {
  return (
    <Col key="settings">
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectSettingsNav {...props} />
        </Col>
        <Col key="content" sm={12} md={10}>
          <Switch>
            <Route
              exact
              path={props.settingsUrl}
              render={() => {
                return <ProjectSettingsGeneral {...props} />;
              }}
            />
            <Route
              exact
              path={props.settingsSessionsUrl}
              render={() => {
                return <ProjectSettingsSessions {...props} />;
              }}
            />
          </Switch>
        </Col>
      </Row>
    </Col>
  );
}

class ProjectViewLoading extends Component {
  render() {
    const info = this.props.projectId ? (
      <h3>Identifying project number {this.props.projectId}...</h3>
    ) : (
      <h3>Loading project {this.props.projectPathWithNamespace}...</h3>
    );
    return (
      <Row>
        <Col>
          {info}
          <Loader />
        </Col>
      </Row>
    );
  }
}

class NotFoundInsideProject extends Component {
  render() {
    return (
      <Col key="notFound">
        <Row>
          <Col xs={12} md={12}>
            <Alert color="primary">
              <h4>404 - Page not found</h4>
              The URL
              <strong> {this.props.location.pathname.replace(this.props.match.url, "")} </strong>
              was not found inside this project. You can explore the current project using the tabs on top.
            </Alert>
          </Col>
        </Row>
      </Col>
    );
  }
}

function ProjectView(props) {
  const available = props.metadata ? props.metadata.exists : null;

  if (props.namespace && !props.projectPathWithNamespace) {
    return <NamespaceProjects namespace={props.namespace} client={props.client} />;
  }
  else if (available == null || available === SpecialPropVal.UPDATING || (props.projectId && available !== false)) {
    return (
      <ContainerWrap>
        <ProjectViewLoading projectPathWithNamespace={props.projectPathWithNamespace} projectId={props.projectId} />
      </ContainerWrap>
    );
  }
  else if (available === false) {
    const { logged } = props.user;
    return (
      <ProjectViewNotFound
        userLogged={logged}
        projectPathWithNamespace={props.projectPathWithNamespace}
        projectId={props.projectId}
        location={props.location}
      />
    );
  }
  const cleanSessionUrl = props.location.pathname.split("/").slice(0, -1).join("/") + "/:server";
  const isShowSession = cleanSessionUrl === props.sessionShowUrl;
  const isInKg = props.isGraphReady;
  return [
    <ProjectPageTitle key="page-title" isInKg={isInKg}
      projectPathWithNamespace={props.metadata.pathWithNamespace}
      projectTitle={props.metadata.title} />,
    <ContainerWrap key="project-content" fullSize={isShowSession}>
      <Switch key="projectHeader">
        <Route exact path={props.baseUrl} render={() => <ProjectViewHeader {...props} minimalistHeader={false} />} />
        <Route path={props.overviewUrl} render={() => <ProjectViewHeader {...props} minimalistHeader={false} />} />
        <Route path={props.notebookServersUrl} render={() => null} />
        <Route path={props.editDatasetUrl} render={() => null} />
        <Route path={props.datasetUrl} render={() => null} />
        <Route path={props.sessionShowUrl} render={() => null} />
        <Route path={props.newDatasetUrl} component={() => <ProjectViewHeader {...props} minimalistHeader={true} />} />
        <Route component={() => <ProjectViewHeader {...props} minimalistHeader={true} />} />
      </Switch>
      <Switch key="projectNav">
        <Route path={props.notebookServersUrl} render={() => null} />
        <Route path={props.editDatasetUrl} render={() => null} />
        <Route path={props.datasetUrl} render={() => null} />
        <Route path={props.sessionShowUrl} render={() => null} />
        <Route component={() => <ProjectNav key="nav" {...props} />} />
      </Switch>
      <Row key="content">
        <Switch>
          <Route exact path={props.baseUrl} render={() => <ProjectViewOverview key="overview" {...props} />} />
          <Route path={props.overviewUrl} render={() => <ProjectViewOverview key="overview" {...props} />} />
          <Route path={props.filesUrl} render={() => <ProjectViewFiles key="files" {...props} />} />
          <Route path={props.datasetsUrl} render={() => <ProjectDatasetsView key="datasets" {...props} />} />
          <Route
            path={[props.workflowUrl, props.workflowsUrl]}
            render={() => <ProjectViewWorkflows key="workflows" {...props} />}
          />
          <Route path={props.settingsUrl} render={() => <ProjectSettings key="settings" {...props} />} />
          <Route path={props.notebookServersUrl} render={() => <ProjectSessions key="sessions" {...props} />} />
          <Route component={NotFoundInsideProject} />
        </Switch>
      </Row>
    </ContainerWrap>,
  ];
}

export default { ProjectView };
export { ProjectSuggestActions, ProjectSuggestionDataset, ProjectSuggestionReadme };

// For testing
export { filterPaths };

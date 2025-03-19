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

import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { Component, Fragment, useEffect } from "react";
import { Link } from "react-router";
import { Route, Routes, useLocation, useParams } from "react-router";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  Nav,
  NavItem,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { ContainerWrap } from "../App";
import { ACCESS_LEVELS } from "../api-client";
import { InfoAlert } from "../components/Alert";
import { ExternalLink } from "../components/ExternalLinks";
import { Loader } from "../components/Loader";
import RenkuNavLinkV2, {
  RenkuNavLinkV2WithAlternates,
} from "../components/RenkuNavLinkV2";
import { RoundButtonGroup } from "../components/buttons/Button";
import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";
import { SshModal } from "../components/ssh/ssh";
import {
  ProjectDatasetsView,
  ProjectEntityHeader,
  ProjectFileLineage,
  ProjectFileView,
} from "../features/project";
import ProjectPageTitle from "../features/project/components/ProjectPageTitle";
import ProjectSettings from "../features/project/components/ProjectSettings";
import { useCoreSupport } from "../features/project/useProjectCoreSupport";
import ProjectSessionsRouter from "../features/session/components/ProjectSessionsRouter";
import { SpecialPropVal } from "../model/Model";
import { NamespaceProjects } from "../namespace";
import { Url } from "../utils/helpers/url";
import { WorkflowsList } from "../workflows";
import "./Project.css";
import { CloneButton } from "./clone/CloneButton";
import GitLabConnectButton, {
  externalUrlToGitLabIdeUrl,
} from "./components/GitLabConnect";
import { ProjectViewNotFound } from "./components/ProjectViewNotFound";
import FilesTreeView from "./filestreeview/FilesTreeView";
import { ForkProject } from "./new";
import { ProjectOverviewCommits, ProjectOverviewStats } from "./overview";

function filterPaths(paths, blacklist) {
  // Return paths to do not match the blacklist of regexps.
  const result = paths.filter((p) =>
    blacklist.every((b) => p.match(b) === null)
  );
  return result;
}

function isRequestPending(props, request) {
  const transient = props.transient || {};
  const requests = transient.requests || {};
  return requests[request] === SpecialPropVal.UPDATING;
}

function ToggleForkModalButton({
  forkProjectDisabled,
  showForkCount,
  toggleModal,
}) {
  // display the button a bit differently if showForkCount == false
  if (showForkCount == false) {
    return (
      <Button
        id="fork-project"
        color="primary"
        size="sm"
        disabled={forkProjectDisabled}
        onClick={toggleModal}
      >
        Fork the project
      </Button>
    );
  }
  return (
    <Button
      id="fork-project"
      className="btn-outline-rk-green"
      disabled={forkProjectDisabled}
      onClick={toggleModal}
    >
      <FontAwesomeIcon size="sm" icon={faCodeBranch} /> Fork
      <UncontrolledTooltip target="fork-project">
        Fork your own copy of this project
      </UncontrolledTooltip>
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
      <UncontrolledTooltip target="project-forks">Forks</UncontrolledTooltip>
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
          model={this.props.model}
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
  if (
    datasets.transient !== undefined &&
    datasets.core !== "is_updating" &&
    datasets.core?.datasets?.length > 0
  ) {
    linksHeader.total = datasets.core.datasets.length;
    datasets.core.datasets.slice(0, 3).map((dataset) => {
      linksHeader.data.push({
        title: dataset.name,
        url: `${datasetsUrl}/${encodeURIComponent(dataset.slug)}`,
      });
    });
  }
  return linksHeader;
}

function ProjectViewHeaderMinimal(props) {
  const gitUrl = props.metadata?.externalUrl ?? undefined;
  const branch = props.metadata?.defaultBranch ?? undefined;
  const { coreSupport } = useCoreSupport({
    gitUrl,
    branch,
  });
  const { backendAvailable, computed: coreSupportComputed } = coreSupport;

  const linksHeader = getLinksProjectHeader(
    props.datasets,
    props.datasetsUrl,
    coreSupportComputed && !backendAvailable
  );
  const projectUrl = Url.get(Url.pages.project, {
    namespace: props.metadata.namespace,
    path: props.metadata.path,
  });

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
        defaultBranch={props.metadata?.defaultBranch}
        description={{ value: props.metadata.description }} // ? overwritten by KG where available
        devAccess={props.metadata.accessLevel > ACCESS_LEVELS.DEVELOPER}
        accessLevel={props.metadata.accessLevel}
        fullPath={props.metadata.pathWithNamespace}
        gitUrl={props.externalUrl}
        hideEmptyTags={true}
        imageUrl={props.metadata.avatarUrl}
        itemType="project"
        labelCaption={"Updated"}
        links={linksHeader}
        projectId={props.metadata?.id}
        slug={slug}
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

function ProjectSuggestionReadme({
  commits,
  commitsReadme,
  externalUrl,
  metadata,
}) {
  const countCommitsReadme = commitsReadme?.list?.length ?? null;
  let isReadmeCommitInitial = countCommitsReadme === 1;
  if (countCommitsReadme === 1 && commits.list.length > 0) {
    const firstCommit = commits?.list.sort(
      (a, b) => new Date(a.committed_date) - new Date(b.committed_date)
    )[0];
    isReadmeCommitInitial = firstCommit.id === commitsReadme.list[0].id;
  }

  if (
    countCommitsReadme > 1 ||
    (!isReadmeCommitInitial && countCommitsReadme !== 0)
  )
    return null;

  const gitlabIDEUrl = externalUrlToGitLabIdeUrl(externalUrl);
  const addReadmeUrl = `${gitlabIDEUrl}/edit/${metadata.defaultBranch}/-/README.md`;
  return (
    <li>
      <p style={{ fontSize: "smaller" }}>
        <a
          className="mx-1"
          href={addReadmeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong className="suggestionTitle">Edit README.md</strong>
        </a>
        Use the README to explain your project to others, letting them
        understand what you want to do and what you have already accomplished.
      </p>
    </li>
  );
}

function ProjectSuggestionDataset(props) {
  const datasets = props.datasets.core;
  const isLoadingDatasets =
    typeof datasets === "string" || datasets?.datasets === null;
  let hasDatasets = !isLoadingDatasets ? datasets.datasets?.length > 0 : true;

  if (hasDatasets) return null;
  return (
    <li>
      <p style={{ fontSize: "smaller" }}>
        <Link className="mx-1" to={props.newDatasetUrl}>
          <strong className="suggestionTitle">Add some datasets</strong>
        </Link>
        Datasets let you work with data in a structured way, facilitating easier
        sharing. You can create a new dataset with data you already have, or
        importing one from another Renku project or from a public data
        repository such as
        <ExternalLink
          className="mx-1"
          url="https://zenodo.org/"
          title="Zenodo"
          role="link"
        />{" "}
        or
        <ExternalLink
          className="mx-1"
          url="https://dataverse.harvard.edu/"
          title="Dataverse"
          role="link"
        />
        .
      </p>
    </li>
  );
}

const ProjectSuggestActions = (props) => {
  const { commits, commitsReadme } = props;
  const datasets = props.datasets.core;
  const isProjectMaintainer =
    props.metadata.accessLevel >= ACCESS_LEVELS.MAINTAINER;
  const countTotalCommits = commits?.list?.length ?? 0;
  const countCommitsReadme = commitsReadme?.list?.length ?? null;
  let isReadmeCommitInitial = countCommitsReadme === 1;
  if (countCommitsReadme === 1 && commits.list.length > 0) {
    const firstCommit = commits?.list.sort(
      (a, b) => new Date(a.committed_date) - new Date(b.committed_date)
    )[0];
    isReadmeCommitInitial = firstCommit.id === commitsReadme.list[0].id;
  }

  const isLoadingDatasets =
    typeof datasets === "string" || datasets?.datasets === null;
  let hasDatasets = !isLoadingDatasets ? datasets.datasets?.length > 0 : true;
  const isLoadingData =
    !commits.fetched ||
    !commitsReadme.fetched ||
    countCommitsReadme === null ||
    isLoadingDatasets;

  useEffect(() => {
    if (props.metadata.id !== null) props.fetchReadmeCommits();
  }, []); // eslint-disable-line

  const cHasDataset = countCommitsReadme > 1 && hasDatasets;
  const cCombo =
    !isReadmeCommitInitial && hasDatasets && countCommitsReadme !== 0;
  const isLocked = props.lockStatus?.locked ?? true;
  if (
    !isProjectMaintainer ||
    isLoadingData ||
    countTotalCommits > 4 ||
    cHasDataset ||
    cCombo ||
    isLocked
  )
    return null;

  return (
    <InfoAlert timeout={0}>
      <div className="mb-0" style={{ textAlign: "justify" }}>
        <strong>Welcome</strong> to your new Renku project! It looks like this
        project is just getting started, so here are some suggestions to help
        you. <br />
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
    const forkProjectDisabled =
      metadata.accessLevel < ACCESS_LEVELS.REPORTER &&
      metadata.visibility === "private";

    return (
      <Fragment>
        <Row className="d-flex rk-project-header gy-2 gx-2 pb-2 justify-content-md-between justify-content-sm-start">
          <Col className="col-12">
            <div className="d-flex gap-2 gap-md-3 justify-content-end align-items-end flex-wrap">
              <ForkProjectModal
                client={this.props.client}
                model={this.props.model}
                notifications={this.props.notifications}
                title={
                  this.props.metadata && this.props.metadata.title
                    ? this.props.metadata.title
                    : ""
                }
                id={
                  this.props.metadata && this.props.metadata.id
                    ? this.props.metadata.id
                    : 0
                }
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
              <CloneButton
                externalUrl={this.props.externalUrl}
                userLogged={this.props.user.logged}
                projectPath={this.props.metadata.path}
                sshUrl={this.props.metadata.sshUrl}
                httpUrl={this.props.metadata.httpUrl}
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
    <Link
      key="forkedFrom"
      to={`${projectsUrl}/${forkedFromProject.pathWithNamespace}`}
    >
      {forkedFromProject.pathWithNamespace || "no title"}
    </Link>
  );
}

function ProjectViewHeader(props) {
  const forkedFromLink = (
    <ForkedFromLink
      forkedFromProject={props.forkedFromProject}
      projectsUrl={props.projectsUrl}
    />
  );

  return (
    <ProjectViewHeaderMinimal
      key="minimalHeader"
      forkedFromLink={forkedFromLink}
      {...props}
    />
  );
}

class ProjectNav extends Component {
  render() {
    return (
      <div className="pb-3 rk-search-bar pt-4 mt-1" data-cy="project-navbar">
        <Col className="d-flex pb-2 mb-1 justify-content-start" md={12} lg={12}>
          <Nav pills className="nav-pills-underline">
            <NavItem>
              <RenkuNavLinkV2WithAlternates
                alternates={[this.props.overviewUrl]}
                to={this.props.baseUrl}
                end
              >
                Overview
              </RenkuNavLinkV2WithAlternates>
            </NavItem>
            <NavItem>
              <RenkuNavLinkV2 to={this.props.filesUrl}>Files</RenkuNavLinkV2>
            </NavItem>
            <NavItem>
              <RenkuNavLinkV2 to={this.props.datasetsUrl}>
                Datasets
              </RenkuNavLinkV2>
            </NavItem>
            <NavItem>
              <RenkuNavLinkV2 to={this.props.workflowsUrl}>
                Workflows
              </RenkuNavLinkV2>
            </NavItem>
            <NavItem>
              <RenkuNavLinkV2 to={this.props.notebookServersUrl}>
                Sessions
              </RenkuNavLinkV2>
            </NavItem>
            <NavItem className="pe-0">
              <RenkuNavLinkV2 to={this.props.settingsUrl}>
                Settings
              </RenkuNavLinkV2>
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
    if (
      (loading && Object.keys(allFiles).length < 1) ||
      this.props.filesTree === undefined
    )
      return <Loader />;

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
      <Card>
        <CardHeader className="bg-white p-3 ps-4">README.md</CardHeader>
        <CardBody
          style={{ overflow: "auto" }}
          className="p-4"
          data-cy="project-readme"
        >
          <LazyRenkuMarkdown
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
  const forkedFromLink = (
    <ForkedFromLink forkedFromProject={props.metadata.forkedFromProject} />
  );

  return (
    <Fragment>
      <ProjectViewHeaderOverview
        key="overviewHeader"
        forkedFromLink={forkedFromLink}
        {...props}
      />
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
      <Nav
        className="flex-column nav-light nav-pills-underline"
        data-cy="project-overview-nav"
      >
        <NavItem>
          <RenkuNavLinkV2 id="nav-overview-general" to={this.props.baseUrl} end>
            General
          </RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2 to={this.props.statsUrl}>Stats</RenkuNavLinkV2>
        </NavItem>
        <NavItem>
          <RenkuNavLinkV2 to={this.props.overviewCommitsUrl}>
            Commits
          </RenkuNavLinkV2>
        </NavItem>
      </Nav>
    );
  }
}

function ProjectViewOverview(props) {
  const { projectCoordinator } = props;
  return (
    <Col key="overview" data-cy="project-overview">
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectViewOverviewNav {...props} />
        </Col>
        <Col key="content" sm={12} md={10} data-cy="project-overview-content">
          {props.index ? (
            <ProjectViewGeneral readme={props.data.readme} {...props} />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <ProjectViewGeneral readme={props.data.readme} {...props} />
                }
              />
              <Route
                path="stats"
                element={
                  <ProjectOverviewStats
                    projectCoordinator={projectCoordinator}
                    branches={props.branches.standard}
                  />
                }
              />
              <Route
                path="commits"
                element={
                  <ProjectOverviewCommits
                    location={props.location}
                    projectCoordinator={projectCoordinator}
                    navigate={props.navigate}
                  />
                }
              />
            </Routes>
          )}
        </Col>
      </Row>
    </Col>
  );
}

function ProjectViewWorkflows(props) {
  const reference = props.metadata?.defaultBranch
    ? props.metadata?.defaultBranch
    : "";

  return (
    <WorkflowsList
      fullPath={props.projectPathWithNamespace}
      reference={reference}
      repositoryUrl={props.externalUrl}
    />
  );
}

class ProjectViewFiles extends Component {
  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    const filesUrl = this.props.filesUrl;
    const lineageUrl = this.props.lineageUrl
      .slice(filesUrl.length)
      .replace(":filePath+", "*");
    const fileContentUrl =
      this.props.fileContentUrl.slice(filesUrl.length) + "/*";

    return [
      <div key="files" className="variableWidthColLeft me-2 pb-0 pe-0">
        <ProjectFilesNav {...this.props} />
      </div>,
      <div key="content" className="flex-shrink-1 variableWidthColRight">
        <Routes>
          <Route
            path={lineageUrl}
            element={
              <ProjectFileLineageRoute
                client={this.props.client}
                fetchBranches={() =>
                  this.props.projectCoordinator.fetchBranches()
                }
                model={this.props.model}
                projectId={this.props.metadata?.id ?? undefined}
              />
            }
          />
          <Route
            path={fileContentUrl}
            element={
              <ProjectFileViewRoute
                client={this.props.client}
                fetchBranches={() =>
                  this.props.projectCoordinator.fetchBranches()
                }
                model={this.props.model}
                params={this.props.params}
              />
            }
          />
        </Routes>
      </div>,
    ];
  }
}

function ProjectFileLineageRoute({ client, fetchBranches, model, projectId }) {
  const location = useLocation();

  const params = useParams();
  const filePath = params["*"];

  return (
    <ProjectFileLineage
      client={client}
      fetchBranches={fetchBranches}
      filePath={filePath}
      location={location}
      model={model}
      projectId={projectId}
    />
  );
}

function ProjectFileViewRoute({ client, fetchBranches, model, params }) {
  const location = useLocation();

  const routeParams = useParams();
  const filePath = routeParams["*"];

  return (
    <ProjectFileView
      client={client}
      fetchBranches={fetchBranches}
      filePath={filePath}
      location={location}
      model={model}
      params={params}
    />
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

function NotFoundInsideProject({ baseUrl }) {
  const location = useLocation();

  return (
    <Col key="notFound">
      <Row>
        <Col xs={12} md={12}>
          <Alert color="primary">
            <h4>404 - Page not found</h4>
            The URL
            <strong> {location.pathname.replace(baseUrl, "")} </strong>
            was not found inside this project. You can explore the current
            project using the tabs on top.
          </Alert>
        </Col>
      </Row>
    </Col>
  );
}

function ProjectView(props) {
  const available = props.metadata ? props.metadata.exists : null;
  const gitUrl = props.metadata?.externalUrl ?? undefined;
  const branch = props.metadata?.defaultBranch ?? undefined;

  const { coreSupport } = useCoreSupport({
    gitUrl,
    branch,
  });
  const { apiVersion, backendAvailable, metadataVersion, versionUrl } =
    coreSupport;

  const { datasets, fetchDatasets } = props;
  useEffect(() => {
    if (datasets?.core?.datasets === null && backendAvailable) {
      fetchDatasets(false, versionUrl);
    }
  }, [backendAvailable, datasets, fetchDatasets, versionUrl]);

  if (props.namespace && !props.projectPathWithNamespace) {
    return (
      <NamespaceProjects namespace={props.namespace} client={props.client} />
    );
  } else if (
    available == null ||
    available === SpecialPropVal.UPDATING ||
    (props.projectId && available !== false)
  ) {
    return (
      <ContainerWrap>
        <ProjectViewLoading
          projectPathWithNamespace={props.projectPathWithNamespace}
          projectId={props.projectId}
        />
      </ContainerWrap>
    );
  } else if (available === false) {
    const { logged } = props.user;
    return (
      <ProjectViewNotFound
        userLogged={logged}
        projectPathWithNamespace={props.projectPathWithNamespace}
        projectId={props.projectId}
      />
    );
  }
  const cleanSessionUrl =
    props.location.pathname.split("/").slice(0, -1).join("/") + "/:server";
  const isShowSession = cleanSessionUrl === props.sessionShowUrl;

  const prefixUrl = props.projectsUrl.endsWith("/")
    ? props.projectsUrl
    : `${props.projectsUrl}/`;
  const baseUrl = props.baseUrl.startsWith(prefixUrl)
    ? props.baseUrl.slice(prefixUrl.length)
    : props.baseUrl;
  const overviewUrl = `${baseUrl}/overview/*`;
  const filesUrl = `${baseUrl}/files/*`;
  const datasetsUrl = `${baseUrl}/datasets/*`;
  const datasetUrl = `${baseUrl}/datasets/:datasetId`;
  const workflowsUrl = `${baseUrl}/workflows/*`;
  const settingsUrl = `${baseUrl}/settings/*`;
  const notebookServersUrl = `${baseUrl}/sessions/*`;
  const launchNotebookUrl = `${baseUrl}/sessions/new`;
  const sessionShowUrl = `${baseUrl}/sessions/show/:server`;

  return [
    <ProjectPageTitle
      key="page-title"
      projectId={props.metadata?.id}
      projectPathWithNamespace={props.metadata.pathWithNamespace}
      projectTitle={props.metadata.title}
    />,
    <ContainerWrap key="project-content" fullSize={isShowSession}>
      <Routes key="projectHeader">
        <Route path={`${datasetUrl}/*`} element={null} />
        <Route path={launchNotebookUrl} element={null} />
        <Route path={sessionShowUrl} element={null} />
        <Route path="*" element={<ProjectViewHeader {...props} />} />
      </Routes>
      <Routes key="projectNav">
        <Route path={`${datasetUrl}/*`} element={null} />
        <Route path={launchNotebookUrl} element={null} />
        <Route path={sessionShowUrl} element={null} />
        <Route path="*" element={<ProjectNav key="nav" {...props} />} />
      </Routes>
      <Row key="content" className={cx(isShowSession && "m-0")}>
        <Routes>
          <Route
            path={baseUrl}
            element={<ProjectViewOverview key="overview" {...props} index />}
          />
          <Route
            path={overviewUrl}
            element={<ProjectViewOverview key="overview" {...props} />}
          />
          <Route
            path={filesUrl}
            element={<ProjectViewFiles key="files" {...props} />}
          />
          <Route
            path={datasetsUrl}
            element={<ProjectDatasetsView key="datasets" {...props} />}
          />
          <Route
            path={workflowsUrl}
            element={<ProjectViewWorkflows key="workflows" {...props} />}
          >
            <Route path=":workflowId" element={null} />
          </Route>
          <Route
            path={settingsUrl}
            element={
              <ProjectSettings
                key="settings"
                {...props}
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
              />
            }
          />
          <Route
            path={notebookServersUrl}
            element={<ProjectSessionsRouter key="sessions" />}
          />
          <Route
            path="*"
            element={<NotFoundInsideProject baseUrl={props.baseUrl} />}
          />
        </Routes>
      </Row>
    </ContainerWrap>,
  ];
}

export default { ProjectView };
export {
  ProjectSuggestActions,
  ProjectSuggestionDataset,
  ProjectSuggestionReadme,
};
// For testing
export { filterPaths };

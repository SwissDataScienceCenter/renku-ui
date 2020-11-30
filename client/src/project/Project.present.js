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


import React, { Component, Fragment, useState, useEffect } from "react";

import { Link, Route, Switch } from "react-router-dom";
import {
  Container, Row, Col, Alert, DropdownItem, Table, Nav, NavItem, Button, ButtonGroup, Badge, Spinner,
  Card, CardBody, CardHeader, Form, FormGroup, FormText, Label, Input, UncontrolledTooltip, ListGroupItem,
  UncontrolledCollapse
} from "reactstrap";
import qs from "query-string";

import { default as fileSize } from "filesize"; // eslint-disable-line
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faCodeBranch, faInfoCircle, faStar as faStarSolid,
  faExclamationTriangle, faLock, faUserFriends, faGlobe, faSearch, faCheck
} from "@fortawesome/free-solid-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import {
  Clipboard, ExternalLink, Loader, RenkuNavLink, TimeCaption, RefreshButton, Pagination,
  ButtonWithMenu, InfoAlert, GoBackButton, RenkuMarkdown,
} from "../utils/UIComponents";
import { SpecialPropVal } from "../model/Model";
import { ProjectTags, ProjectTagList } from "./shared";
import { Notebooks, StartNotebookServer } from "../notebooks";
import Issue from "../collaboration/issue/Issue";
import { CollaborationList, collaborationListTypeMap } from "../collaboration/lists/CollaborationList.container";
import FilesTreeView from "./filestreeview/FilesTreeView";
import DatasetsListView from "./datasets/DatasetsListView";
import { ACCESS_LEVELS } from "../api-client";
import { withProjectMapped, MigrationStatus } from "./Project";
import { NamespaceProjects } from "../namespace";
import { CommitsView } from "../utils/Commits";

import "./Project.css";

function filterPaths(paths, blacklist) {
  // Return paths to do not match the blacklist of regexps.
  const result = paths.filter(p => blacklist.every(b => p.match(b) === null));
  return result;
}

function isRequestPending(props, request) {
  const transient = props.transient || {};
  const requests = transient.requests || {};
  return requests[request] === SpecialPropVal.UPDATING;
}

function webhookError(props) {
  if (props == null || props === SpecialPropVal.UPDATING || props === true || props === false)
    return false;

  return true;
}

function isKgDown(webhook) {
  return webhook === false ||
    (webhook.status === false && webhook.created !== true) ||
    webhookError(webhook.status);
}

class ProjectVisibilityLabel extends Component {
  render() {
    switch (this.props.visibilityLevel) {
      case "private":
        return <span className="visibilityLabel"><FontAwesomeIcon icon={faLock} /> Private</span>;
      case "internal":
        return <span className="visibilityLabel"><FontAwesomeIcon icon={faUserFriends} /> Internal</span>;
      case "public":
        return <span className="visibilityLabel"><FontAwesomeIcon icon={faGlobe} /> Public</span>;
      default:
        return null;
    }
  }
}

/**
 * Shows a warning icon when Renku version is outdated or Knowledge Graph integration is not active.
 *
 * @param {Object} webhook - project.webhook store object
 * @param {bool} migration_required - whether it's necessary to migrate the project or not
 * @param {Object} history - react history object
 * @param {string} overviewStatusUrl - overview status url
 */
class ProjectStatusIcon extends Component {
  render() {
    const { webhook, migration_required, overviewStatusUrl, history } = this.props;
    const kgDown = isKgDown(webhook);

    if (!migration_required && !kgDown)
      return null;

    const versionInfo = migration_required ?
      "Current Renku version is outdated. " :
      null;
    const kgInfo = kgDown ?
      "Knowledge Graph integration not active. " :
      null;

    return (
      <span className="warningLabel">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          onClick={() => history.push(overviewStatusUrl)}
          id="warningStatusLink" />
        <UncontrolledTooltip placement="top" target="warningStatusLink">
          {versionInfo}
          {kgInfo}
          Click to see details.
        </UncontrolledTooltip>
      </span>
    );
  }
}

class MergeRequestSuggestions extends Component {
  handleCreateMergeRequest(e, onCreateMergeRequest, branch) {
    e.preventDefault();
    onCreateMergeRequest(branch);
  }

  render() {
    const mrSuggestions = this.props.suggestedMRBranches.map((branch, i) => {
      if (!this.props.canCreateMR) return null;
      return <Alert color="warning" key={i}>
        <p> Do you want to create a merge request for branch <b>{branch.name}</b>?</p>
        <ExternalLink url={`${this.props.externalUrl}/tree/${branch.name}`} title="View in GitLab" />
        &nbsp;<Button color="success"
          onClick={(e) => { this.handleCreateMergeRequest(e, this.props.onCreateMergeRequest, branch); }}>
          Create Merge Request
        </Button>
        {/*TODO: Enable the 'no' option once the alert can be dismissed permanently!*/}
        {/*&nbsp; <Button color="warning" onClick={this.props.createMR(branch.iid)}>No</Button>*/}
      </Alert>;
    });
    return mrSuggestions;
  }
}

function GitLabConnectButton(props) {
  const size = (props.size) ? props.size : "md";
  const { userLogged, gitlabIDEUrl } = props;
  if (!props.externalUrl)
    return null;
  const gitlabProjectButton = <ExternalLink url={props.externalUrl} title="View in GitLab" />;

  const onClick = () => window.open(gitlabIDEUrl, "_blank");
  const gitlabIDEButton = userLogged ?
    (<DropdownItem onClick={onClick} size={size}>View in Web IDE</DropdownItem>) :
    null;

  let button = gitlabIDEButton ?
    (<ButtonWithMenu default={gitlabProjectButton} size={size}>{gitlabIDEButton}</ButtonWithMenu>) :
    (<ExternalLink url={props.externalUrl} size={size} title="View in GitLab" />);

  return (<div>{button}</div>);
}

class ProjectViewHeaderOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updating_star: false
    };
  }

  star(event) {
    event.preventDefault();
    this.setState({ updating_star: true });
    this.props.onStar().then(
      result => {
        this.setState({ updating_star: false });
      });
  }

  render() {
    const forkedFrom = (this.props.forkedFromLink == null) ?
      null :
      [" ", "forked from", " ", this.props.forkedFromLink];
    const core = this.props.core;
    const system = this.props.system;

    let starElement;
    let starText;
    if (this.state.updating_star) {
      starElement = (<Loader inline size={14} />);
      if (this.props.starred)
        starText = "un-starring...";
      else
        starText = "starring...";
    }
    else {
      if (this.props.starred) {
        starText = "unstar";
        starElement = (<FontAwesomeIcon icon={faStarSolid} />);
      }
      else {
        starText = "star";
        starElement = (<FontAwesomeIcon icon={faStarRegular} />);
      }
    }

    const gitlabIDEUrl = this.props.externalUrl !== "" && this.props.externalUrl.includes("/gitlab/") ?
      this.props.externalUrl.replace("/gitlab/", "/gitlab/-/ide/project/") : null;
    return (
      <Container fluid>
        <Row>
          <Col xs={12} md>
            <h3>
              <ProjectStatusIcon
                history={this.props.history}
                webhook={this.props.webhook}
                overviewStatusUrl={this.props.overviewStatusUrl}
                migration_required={this.props.migration.migration_required}
              />{core.title} <ProjectVisibilityLabel visibilityLevel={this.props.visibility.level} />
            </h3>
            <p>
              <span>{this.props.core.path_with_namespace}{forkedFrom}</span> <br />
            </p>
          </Col>
          <Col xs={12} md="auto">
            <div className="d-flex mb-2">
              <ButtonGroup size="sm">
                <Button outline color="primary"
                  onClick={this.props.toggleForkModal}>
                  <FontAwesomeIcon icon={faCodeBranch} /> fork
                </Button>
                <Button outline color="primary"
                  href={`${this.props.externalUrl}/forks`} target="_blank" rel="noreferrer noopener">
                  {system.forks_count}
                </Button>
              </ButtonGroup>
              <ButtonGroup size="sm" className="ml-1">
                <Button outline color="primary"
                  disabled={this.state.updating_star}
                  onClick={this.star.bind(this)}>
                  {starElement} {starText}
                </Button>
                <Button outline color="primary" style={{ cursor: "default" }}>{system.star_count}</Button>
              </ButtonGroup>
            </div>

            <div className="d-flex flex-md-row-reverse mb-2">
              <GitLabConnectButton size="sm"
                externalUrl={this.props.externalUrl}
                gitlabIDEUrl={gitlabIDEUrl}
                userLogged={this.props.user.logged} />
            </div>
          </Col>
        </Row>
        {this.props.fork(this.props)}
      </Container>
    );
  }
}

class ProjectViewHeader extends Component {

  render() {
    let forkedFromLink = null;
    if (this.props.system.forked_from_project != null &&
      Object.keys(this.props.system.forked_from_project).length > 0) {
      const forkedFrom = this.props.system.forked_from_project;
      const projectsUrl = this.props.projectsUrl;
      forkedFromLink = <Link key="forkedFrom" to={`${projectsUrl}/${forkedFrom.metadata.core.path_with_namespace}`}>
        {forkedFrom.metadata.core.path_with_namespace || "no title"}
      </Link>;
    }

    return <ProjectViewHeaderOverview
      key="overviewHeader"
      forkedFromLink={forkedFromLink} {...this.props} />;
  }
}

class ProjectNav extends Component {
  render() {
    return (
      <Nav pills className={"nav-pills-underline"}>
        <NavItem>
          <RenkuNavLink to={this.props.baseUrl} alternate={this.props.overviewUrl} title="Overview" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.issuesUrl}
            alternate={this.props.collaborationUrl} title="Collaboration" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.filesUrl} title="Files" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.datasetsUrl} title="Datasets" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.notebookServersUrl} title="Environments" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.settingsUrl} title="Settings" />
        </NavItem>
      </Nav>
    );
  }
}

class ProjectFilesNav extends Component {
  render() {
    const loading = isRequestPending(this.props, "filesTree");
    const allFiles = this.props.filesTree || [];
    if ((loading && Object.keys(allFiles).length < 1) || this.props.filesTree === undefined)
      return <Loader />;

    return <FilesTreeView
      data={this.props.filesTree}
      lineageUrl={this.props.lineagesUrl}
      projectUrl={this.props.fileContentUrl}
      setOpenFolder={this.props.setOpenFolder}
      setLastNode={this.props.setLastNode}
      hash={this.props.filesTree.hash}
      fileView={this.props.filesTreeView}
      currentUrl={this.props.location.pathname}
      history={this.props.history}
      limitHeight={true} />;
  }
}

class ProjectViewReadme extends Component {
  render() {
    const readmeText = this.props.readme.text;
    const loading = isRequestPending(this.props, "readme");
    if (loading && readmeText === "")
      return <Loader />;

    return (
      <Card className="border-0">
        <CardHeader>README.md</CardHeader>
        <CardBody style={{ overflow: "auto" }}>
          <RenkuMarkdown
            projectPathWithNamespace = {this.props.core.path_with_namespace}
            filePath={""}
            fixRelativePaths={true}
            markdownText={this.props.readme.text}
            client={this.props.client}
            projectId={this.props.core.id}
          />
        </CardBody>
      </Card>
    );
  }
}

class ProjectViewStats extends Component {

  render() {
    const loading = (this.props.core.id == null);
    if (loading)
      return <Loader />;

    const system = this.props.system;
    const stats = this.props.statistics;
    return [
      <Card key="project-stats" className="border-0">
        <CardHeader>Project Statistics</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <Table key="stats-table" size="sm">
                <tbody>
                  <tr>
                    <th scope="row">Number of Branches</th>
                    <td>{system.branches.length + 1}</td>
                    <td>
                      <ExternalLink size="sm" url={`${this.props.externalUrl}/branches`} title="Branches in Gitlab" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Number of Forks</th>
                    <td>{system.forks_count}</td>
                    <td><ExternalLink size="sm" url={`${this.props.externalUrl}/forks`} title="Forks in Gitlab" /></td>
                  </tr>
                  <tr>
                    <th scope="row">Number of Commits</th>
                    <td>{stats.commit_count}</td>
                    <td>
                      <ExternalLink size="sm" url={`${this.props.externalUrl}/commits`} title="Commits in Gitlab" />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
      </Card>,
      <Card key="storage-stats" className="border-0">
        <CardHeader>Storage Statistics</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <Table key="stats-table" size="sm">
                <tbody>
                  <tr>
                    <th scope="row">Storage Size</th>
                    <td>{fileSize(stats.storage_size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Repository Size</th>
                    <td>{fileSize(stats.repository_size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">LFS Size</th>
                    <td>{fileSize(stats.lfs_objects_size)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
      </Card>
    ];
  }
}

class ProjectViewVersion extends Component {
  render() {
    const { migration_required, project_supported, migration_status, check_error } = this.props.migration;
    const loading = isRequestPending(this.props, "readme") || migration_required === null;
    const maintainer = this.props.visibility.accessLevel >= ACCESS_LEVELS.MAINTAINER;

    let body = null;
    if (loading) {
      body = (<Loader />);
    }
    else {
      // print the error if any
      if (check_error || migration_status === MigrationStatus.ERROR) {
        const error = check_error ?
          check_error :
          migration_status;
        body = (
          <Alert color="danger">
            <p>
              Error while { check_error ? "checking" : "updating" } the version. Please reload the page to try again.
              If the problem persists you should contact the development team on&nbsp;
              <a href="https://gitter.im/SwissDataScienceCenter/renku"
                target="_blank" rel="noreferrer noopener">Gitter</a> or create an issue in&nbsp;
              <a href="https://github.com/SwissDataScienceCenter/renku/issues"
                target="_blank" rel="noreferrer noopener">GitHub</a>.
            </p>
            <div><strong>Error Message</strong><pre>{error}</pre></div>
          </Alert>
        );
      }
      // migration required
      else if (migration_required) {
        let updateSection = null;
        const updateInstruction = (
          <Fragment>
            You can launch
            an <Link to={this.props.launchNotebookUrl}>interactive environment</Link> and follow the
            {/* eslint-disable-next-line max-len */}
            &nbsp;<a href="https://renku.readthedocs.io/en/latest/user/upgrading_renku.html#upgrading-your-image-to-use-the-latest-renku-cli-version">
              instructions for upgrading</a>.
            When finished, you will need to run <code>renku migrate</code>.
          </Fragment>
        );
        if (maintainer) {
          if (project_supported) {
            updateSection = (
              <Fragment>
                <Button
                  color="warning"
                  disabled={migration_status === MigrationStatus.MIGRATING}
                  onClick={this.props.onMigrateProject}
                >
                  {migration_status === MigrationStatus.MIGRATING ?
                    <span><Spinner size="sm" /> Updating...</span> : "Update"
                  }
                </Button>
                <Button color="link" id="btn_instructions"><i>Do you prefer manual instructions?</i></Button>
                <UncontrolledCollapse toggler="#btn_instructions">
                  <br />
                  <p>{updateInstruction}</p>
                </UncontrolledCollapse>
              </Fragment>
            );
          }
          else {
            updateSection = (
              <p>
                <strong>Updating this project automatically is not possible.</strong>
                <br /> {updateInstruction}
              </p>
            );
          }
        }
        else {
          updateSection = (
            <p>
              <strong>You do not have the required permissions to upgrade this project.</strong>
              &nbsp;You can <ExternalLink role="text" size="sm"
                title="ask a project maintainer" url={`${this.props.externalUrl}/project_members`} /> to
              do that for you.
            </p>
          );
        }
        body = (
          <Alert color="warning">
            <p>
              <FontAwesomeIcon icon={faExclamationTriangle} /> A new version of <strong>renku</strong> is available.
              The project needs to be migrated to keep working.
            </p>
            {updateSection}
          </Alert>
        );
      }
      // migration not needed
      else {
        body = (<Alert color="success"><FontAwesomeIcon icon={faCheck} /> The current version is up to date.</Alert>);
      }
    }

    return (
      <Card className="border-0">
        <CardHeader>Renku Version</CardHeader>
        <CardBody>
          <Row><Col>{body}</Col></Row>
        </CardBody>
      </Card>
    );
  }
}

function ProjectViewKG(props) {
  const loading = false;

  let body = null;
  if (loading)
    body = (<Loader />);
  else
    body = props.kgStatusView(true);

  return (
    <Card className="border-0">
      <CardHeader>Knowledge Graph integration</CardHeader>
      <CardBody>
        <Row><Col>{body}</Col></Row>
      </CardBody>
    </Card>
  );
}

class ProjectViewOverviewNav extends Component {

  render() {
    // Add when results are handled:
    // <NavItem>
    //   <RenkuNavLink to={`${this.props.overviewUrl}/results`} title="Results" />
    // </NavItem>
    return (
      <Nav pills className={"flex-column"}>
        <NavItem>
          <RenkuNavLink to={this.props.baseUrl} title="Description" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${this.props.statsUrl}`} title="Stats" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${this.props.overviewDatasetsUrl}`} title="Datasets" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${this.props.overviewCommitsUrl}`} title="Commits" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${this.props.overviewStatusUrl}`} title="Status" />
        </NavItem>
      </Nav>);
  }
}

class ProjectViewOverview extends Component {

  componentDidMount() {
    this.props.fetchOverviewData();
  }

  render() {
    const { core, system, projectCoordinator } = this.props;
    const description = core.description ?
      (<Fragment><span className="lead">{core.description}</span><br /></Fragment>) :
      null;

    return <Col key="overview">
      <Row>
        <Col xs={12} md={9}>
          <p>
            {description}
            <TimeCaption key="time-caption" time={core.last_activity_at} />
          </p>
        </Col>
        <Col xs={12} md={3}>
          <p className="text-md-right">
            <ProjectTagList tagList={system.tag_list} />
          </p>
        </Col>
      </Row>
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectViewOverviewNav {...this.props} />
        </Col>
        <Col key="content" sm={12} md={10}>
          <Switch>
            <Route exact path={this.props.baseUrl} render={props => {
              return <ProjectViewReadme readme={this.props.data.readme} {...this.props} />;
            }} />
            <Route exact path={this.props.statsUrl} render={props =>
              <ProjectViewStats {...this.props} />}
            />
            <Route exact path={this.props.overviewDatasetsUrl} render={props =>
              <ProjectViewDatasetsOverview {...this.props} />}
            />
            <Route exact path={this.props.overviewCommitsUrl}
              render={(props) => {
                const categories = ["commits", "metadata"];
                const ProjectViewCommitsConnected = withProjectMapped(ProjectViewCommits, categories);
                return (
                  <ProjectViewCommitsConnected
                    location={props.location}
                    history={props.history}
                    projectCoordinator={projectCoordinator}
                  />
                );
              }}
            />
            <Route exact path={this.props.overviewStatusUrl} render={props =>
              <Fragment>
                <ProjectViewVersion {...this.props} />
                <ProjectViewKG {...this.props} />
              </Fragment>}
            />
          </Switch>
        </Col>
      </Row>
    </Col>;
  }
}

class ProjectViewCommits extends Component {
  render() {
    const { commits, metadata } = this.props;
    const gitlabCommitsUrl = `${metadata.repositoryUrl}/commits`;
    const tooMany = commits.error && commits.error.message && commits.error.message.startsWith("Cannot iterate more") ?
      true :
      false;

    const commitBadgeNumber = `${commits.list.length}${tooMany ? "+" : ""}`;
    const badge = commits.fetched && !commits.fetching ?
      (<Badge color="primary">{commitBadgeNumber}</Badge>) :
      null;
    const buttonGit = (
      <Fragment>
        <ExternalLink
          role="link"
          id="commitLink"
          title={<FontAwesomeIcon icon={faGitlab} />}
          url={gitlabCommitsUrl}
          className="text-primary btn ml-2 p-0"
        />
        <UncontrolledTooltip placement="top" target="commitLink">
          Open in GitLab
        </UncontrolledTooltip>
      </Fragment>
    );
    const info = commits.error && commits.error.message && commits.error.message.startsWith("Cannot iterate more") ?
      (<ProjectViewCommitsInfo number={commits.list.length} url={gitlabCommitsUrl} />) :
      null;

    const body = commits.fetching ?
      (<Loader />) :
      (<ProjectViewCommitsBody {...this.props} />);
    return (
      <Card className="border-0">
        <CardHeader>
          Commits {badge}
          <RefreshButton action={commits.refresh} updating={commits.fetching} message="Refresh commits" />
          {buttonGit}
        </CardHeader>
        <CardBody className="pl-0 pr-0">
          {body}
          {info}
        </CardBody>
      </Card>
    );
  }
}

class ProjectViewCommitsInfo extends Component {
  render() {
    return (
      <ListGroupItem className="commit-object">
        <FontAwesomeIcon icon={faInfoCircle} />&nbsp;
        Cannot load more than {this.props.number} commits. To see the full project history,&nbsp;
        <ExternalLink role="link" id="commitLink" title="view in GitLab" url={this.props.url} />
      </ListGroupItem>
    );
  }
}

class ProjectViewCommitsBody extends Component {
  constructor(props) {
    super(props);
    const locationPage = qs.parse(props.location.search);
    this.state = {
      currentPage: locationPage.page ? parseInt(locationPage.page) : 1,
      perPage: 25,
    };
  }

  onPageChange(newPage) {
    this.setState({ currentPage: newPage });
    const currentSearch = qs.parse(this.props.location.search);
    const newSearch = qs.stringify({ ...currentSearch, page: newPage });
    this.props.history.push({ pathname: this.props.location.pathname, search: newSearch });
  }

  render() {
    const { commits, metadata } = this.props;
    const { currentPage, perPage } = this.state;

    if (commits.fetching || !commits.fetched)
      return <Loader />;

    const firstCommit = (currentPage - 1) * perPage;
    const lastCommit = currentPage * perPage;

    return (
      <Fragment>
        <CommitsView
          commits={commits.list.slice(firstCommit, lastCommit)}
          fetched={commits.fetched}
          fetching={commits.fetching}
          error={commits.error}
          urlRepository={metadata.repositoryUrl}
          urlDiff={`${metadata.repositoryUrl}/commit/`}
        />
        <Pagination
          className="mt-2"
          currentPage={currentPage}
          perPage={perPage}
          totalItems={commits.list.length}
          onPageChange={this.onPageChange.bind(this)}
        />
      </Fragment>
    );
  }
}

class ProjectDatasetsNav extends Component {

  render() {
    const allDatasets = this.props.core.datasets || [];

    if (allDatasets.length === 0)
      return null;

    return <DatasetsListView
      datasets_kg={this.props.core.datasets_kg}
      datasets={this.props.core.datasets}
      datasetsUrl={this.props.datasetsUrl}
      newDatasetUrl={this.props.newDatasetUrl}
      visibility={this.props.visibility}
      graphStatus={this.props.isGraphReady}
    />;
  }
}

function ProjectAddDataset(props) {

  const [newDataset, setNewDataset] = useState(true);

  return <Col>
    { props.visibility.accessLevel > ACCESS_LEVELS.DEVELOPER ? [
      <Row key="header">
        <h3 className="uk-heading-divider uk-text-center pb-1 ml-4">Add Dataset</h3>
      </Row>,
      <Row key="switch-button" className="pb-3">
        <ButtonGroup className={"ml-4 pt-1"}>
          <Button color="primary" outline onClick={() => setNewDataset(true)} active={newDataset}>
            Create Dataset
          </Button>
          <Button color="primary" outline onClick={() => setNewDataset(false)} active={!newDataset}>
            Import Dataset
          </Button>
        </ButtonGroup>
      </Row>,
      <Row key="text-details" className="pb-3">
        <small className={"ml-4 text-muted"}>
          {
            newDataset ?
              <span>
                Create a new dataset by providing metadata and content. Use&nbsp;
                <Button className="p-0" style={{ verticalAlign: "baseline" }}
                  color="link" onClick={() => setNewDataset(false)}>
                  <small>Import Dataset</small>
                </Button>
                &nbsp;to reuse an existing dataset.
              </span>
              :
              <span>
                Import a published dataset from Zenodo, Dataverse, or from another Renku project. Use&nbsp;
                <Button className="p-0" style={{ verticalAlign: "baseline" }}
                  color="link" onClick={() => setNewDataset(true)}>
                  <small>Create Dataset</small>
                </Button>
                &nbsp;to make a new dataset.
              </span>
          }
        </small>
      </Row>
    ]
      : null
    }
    { newDataset ?
      props.newDataset(props)
      : props.importDataset(props)
    }
  </Col>;
}

function EmptyDatasets(props) {
  return <Alert timeout={0} color="primary">
    No datasets found for this project.
    { props.membership ?
      <div><br /><FontAwesomeIcon icon={faInfoCircle} />  If you recently activated the knowledge graph or
        added the datasets try refreshing the page. <br /><br />
        You can also click on the button to
        &nbsp;<Link className="btn btn-primary btn-sm" to={props.newDatasetUrl}>Add a Dataset</Link></div>
      : null
    }
  </Alert>;
}

/**
 * Shows a warning Alert when Renku version is outdated or Knowledge Graph integration is not active.
 *
 * @param {Object} webhook - project.webhook store object
 * @param {bool} migration_required - whether it's necessary to migrate the project or not
 * @param {Object} history - react history object
 * @param {string} overviewStatusUrl - overview status url
 */
function ProjectStatusAlert(props) {
  const { webhook, migration_required, overviewStatusUrl, history } = props;
  const kgDown = isKgDown(webhook);

  if (!migration_required && !kgDown)
    return null;

  const versionInfo = migration_required ?
    <span>
      <FontAwesomeIcon icon={faExclamationTriangle} className="pr-1" />
      <strong>A new version of renku is available. </strong>
      An upgrade is necessary to allow modification of datasets and is recommended for all projects.&nbsp;
    </span> :
    null;
  const kgInfo = kgDown ?
    <span>
      <FontAwesomeIcon icon={faExclamationTriangle} className="pr-1" />
      <strong>Knowledge Graph integration not active. </strong>
      This means that some operations on datasets are not possible, we recommend activating it.
    </span> :
    null;

  const conditionalSpace = versionInfo && kgInfo ? <br /> : null;

  return (
    <Alert color="warning">
      {versionInfo}
      {conditionalSpace}
      {conditionalSpace}
      {kgInfo}
      <br />
      <br />
      <Button color="warning" onClick={() => history.push(overviewStatusUrl)}>
        See details
      </Button>
    </Alert>
  );
}

function ProjectViewDatasets(props) {

  const kgDown = isKgDown(props.webhook);

  const migrationMessage = <ProjectStatusAlert
    history={props.history}
    overviewStatusUrl={props.overviewStatusUrl}
    migration_required={props.migration.migration_required}
    webhook={props.webhook}
  />;

  useEffect(()=>{
    const loading = props.core.datasets === SpecialPropVal.UPDATING;
    if (loading) return;
    props.fetchDatasets(props.location.state && props.location.state.reload);
    props.fetchGraphStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = props.core.datasets === SpecialPropVal.UPDATING || props.core.datasets === undefined;
  if (loading)
    return <Loader />;

  //When the core service can return stuff for anonymous users this should be removed
  if (!props.user.logged) {
    const postLoginUrl = props.location.pathname;
    const to = { "pathname": "/login", "state": { previous: postLoginUrl } };

    return <Col sm={12} md={12} lg={8}>
      <Alert color="primary">You are logged out, please&nbsp;
        <Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>
          Log in
        </Link> to see datasets for this project.</Alert>
    </Col>;
  }

  if (props.core.datasets.error) {
    return <Col sm={12} md={12} lg={8}>
      <Alert color="danger">
        There was an error fetching the datasets, please try <Button color="danger" size="sm" onClick={
          () => window.location.reload()
        }> reloading </Button> the page.</Alert>
    </Col>;
  }

  if (!loading && props.core.datasets !== undefined && props.core.datasets.length === 0
    && props.location.pathname !== props.newDatasetUrl) {
    return <Col sm={12} md={12} lg={8}>
      {migrationMessage}
      <EmptyDatasets
        membership={props.visibility.accessLevel > ACCESS_LEVELS.DEVELOPER}
        newDatasetUrl={props.newDatasetUrl}
      />
    </Col>;
  }

  return <Col sm={12} md={12} lg={8}>
    {migrationMessage}
    <Switch>
      <Route path={props.newDatasetUrl}
        render={p =>[
          <Col key="btn" md={12}>
            <GoBackButton label="Back to list" url={props.datasetsUrl}/>
          </Col>,
          <ProjectAddDataset key="projectsAddDataset" {...props} />
        ]}/>
      <Route path={props.editDatasetUrl}
        render={p => [
          <Col key="btn" md={12}>
            <GoBackButton label="Back to dataset" url={`${props.datasetsUrl}/${p.match.params.datasetId}/`}/>
          </Col>,
          props.editDataset(p)]
        }/>
      <Route path={props.datasetUrl} render={p =>[
        <Col key="btn" md={12}>
          <GoBackButton key="btn" label="Back to list" url={props.datasetsUrl}/>
        </Col>,
        props.datasetView(p, !kgDown)
      ]} />
      <Route exact path={props.datasetsUrl} render={p =>
        <ProjectDatasetsNav {...props} />
      }/>
    </Switch>
  </Col>;
}

class ProjectViewCollaborationNav extends Component {
  render() {
    return (
      <Nav pills className={"flex-column"}>
        <NavItem>
          <RenkuNavLink to={this.props.issuesUrl} matchPath={true} title="Issues" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.mergeRequestsOverviewUrl} matchPath={true} title="Merge Requests" />
        </NavItem>
      </Nav>);
  }
}

class ProjectViewCollaboration extends Component {

  render() {
    return <Col key="collaboration">
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectViewCollaborationNav {...this.props} />
        </Col>
        <Col key="collaborationContent" sm={12} md={10}>
          <Switch>
            <Route path={this.props.mergeRequestUrl} render={props =>
              <ProjectViewMergeRequests {...this.props} />} />
            <Route path={this.props.mergeRequestsOverviewUrl} render={props =>
              <ProjectMergeRequestList {...this.props} />} />
            <Route exact path={this.props.issueNewUrl} render={props =>
              <Issue.New {...props}
                projectPathWithNamespace={this.props.core.path_with_namespace}
                client={this.props.client} />} />
            <Route path={this.props.issueUrl} render={props =>
              <ProjectViewIssues {...this.props} />} />
            <Route path={this.props.issuesUrl} render={props =>
              <ProjectIssuesList {...this.props} />} />
          </Switch>
        </Col>
      </Row>
    </Col>;
  }
}

class ProjectIssuesList extends Component {

  render() {
    return <Row><Col key="issuesList" className={"pt-3"} sm={12} md={10} lg={8}>
      <CollaborationList
        key="issuesList"
        listType={collaborationListTypeMap.ISSUES}
        collaborationUrl={this.props.collaborationUrl}
        issueNewUrl={this.props.issueNewUrl}
        projectId={this.props.core.id}
        user={this.props.user}
        location={this.props.location}
        client={this.props.client}
        history={this.props.history}
        fetchElements={this.props.client.getProjectIssues}
      />
    </Col></Row>;
  }
}

class ProjectViewIssues extends Component {

  render() {
    return <Row>
      <Col key="issue" sm={12} md={10}>
        <Route path={this.props.issueUrl}
          render={props => this.props.issueView(props)} />
      </Col>
    </Row>;
  }
}

class ProjectViewMergeRequests extends Component {
  render() {
    return <Row>
      <Col key="issue" sm={12} md={10}>
        <Route path={this.props.mergeRequestUrl}
          render={props => this.props.mrView(props)} />
      </Col>
    </Row>;
  }
}

class ProjectMergeRequestList extends Component {

  componentDidMount() {
    this.props.fetchMrSuggestions();
  }

  render() {
    return <Col>
      <Row>
        <Col sm={12} md={10} lg={8}>
          <MergeRequestSuggestions
            externalUrl={this.props.externalUrl}
            canCreateMR={this.props.canCreateMR}
            onCreateMergeRequest={this.props.onCreateMergeRequest}
            suggestedMRBranches={this.props.suggestedMRBranches} />
        </Col>
      </Row>
      <Row>
        <Col key="mrList" sm={12} md={10} lg={8}>
          <CollaborationList
            collaborationUrl={this.props.collaborationUrl}
            listType={collaborationListTypeMap.MREQUESTS}
            projectId={this.props.core.id}
            user={this.props.user}
            location={this.props.location}
            client={this.props.client}
            history={this.props.history}
            mergeRequestsOverviewUrl={this.props.mergeRequestsOverviewUrl}
            fetchElements={this.props.client.getMergeRequests}
          />
        </Col>
      </Row>
    </Col>;
  }
}

class ProjectViewFiles extends Component {
  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    return [
      <Col key="files" sm={12} md={4} lg={3} xl={2}>
        <ProjectFilesNav {...this.props} />
      </Col>,
      <Col key="content" sm={12} md={8} lg={9} xl={10}>
        <Switch>
          <Route path={this.props.lineageUrl}
            render={p => this.props.lineageView(p)} />
          <Route path={this.props.fileContentUrl}
            render={props => this.props.fileView(props)} />
        </Switch>
      </Col>
    ];
  }
}

class OverviewDatasetRow extends Component {
  render() {
    return <tr>
      <td className="align-middle">
        <Link to={this.props.fullDatasetUrl}>{this.props.name}</Link>
      </td>
    </tr>;
  }
}

class ProjectViewDatasetsOverview extends Component {

  componentDidMount() {
    this.props.fetchDatasets(false);
  }

  render() {
    const datasetsList = this.props.core.datasets;

    if (datasetsList === undefined || datasetsList === SpecialPropVal.UPDATING)
      return <Loader />;

    if (datasetsList.length === 0)
      return <p>No datasets to display.</p>;

    let datasets = datasetsList.map((dataset) =>
      <OverviewDatasetRow
        key={dataset.name}
        name={dataset.title || dataset.name}
        fullDatasetUrl={`${this.props.datasetsUrl}/${encodeURIComponent(dataset.name)}`}
      />
    );

    return <Col xs={12} md={10} lg={10}>
      <Table bordered>
        <thead className="thead-light">
          <tr><th className="align-middle">Datasets</th></tr>
        </thead>
        <tbody>
          {datasets}
        </tbody>
      </Table>
    </Col>;
  }
}

class ProjectEnvironments extends Component {
  render() {
    return [
      <Col key="nav" xs={12} md={2}>
        <Nav pills className="flex-column mb-3">
          <NavItem>
            <RenkuNavLink to={this.props.notebookServersUrl} title="Running" />
          </NavItem>
          <NavItem>
            <RenkuNavLink to={this.props.launchNotebookUrl} title="New" />
          </NavItem>
        </Nav>
      </Col>,
      <Col key="content" xs={12} md={10}>
        <Switch>
          <Route exact path={this.props.notebookServersUrl}
            render={props => <ProjectNotebookServers {...this.props} />} />
          <Route path={this.props.launchNotebookUrl}
            render={props => <ProjectStartNotebookServer {...this.props} />} />
        </Switch>
      </Col>
    ];
  }
}

function notebookWarning(userLogged, accessLevel, fork, postLoginUrl, externalUrl) {
  if (!userLogged) {
    const to = { "pathname": "/login", "state": { previous: postLoginUrl } };
    return (
      <InfoAlert timeout={0} key="permissions-warning">
        <p>
          <FontAwesomeIcon icon={faExclamationTriangle} /> As
          an anonymous user, you can start <ExternalLink role="text" title="Interactive Environments"
            url="https://renku.readthedocs.io/en/latest/developer/services/notebooks_service.html" />, but
          you cannot save your work.
        </p>
        <p className="mb-0">
          <Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>Log in</Link> for
          full access.
        </p>
      </InfoAlert>
    );
  }
  else if (accessLevel < ACCESS_LEVELS.DEVELOPER) {
    return (
      <InfoAlert timeout={0} key="permissions-warning">
        <p>
          <FontAwesomeIcon icon={faExclamationTriangle} /> You have limited permissions for this
          project. You can launch an interactive environment, but you will not be able to save
          any changes. If you want to save your work, consider one of the following:
        </p>
        <ul className="mb-0">
          <li>
            <Button size="sm" color="primary" onClick={(event) => fork(event)}>
              Fork the project
            </Button> and start an interactive environment from your fork.
          </li>
          <li className="pt-1">
            <ExternalLink size="sm" title="Contact a maintainer"
              url={`${externalUrl}/project_members`} /> and ask them
            to <a href="https://renku.readthedocs.io/en/latest/user/collaboration.html#added-to-project"
              target="_blank" rel="noreferrer noopener">
              grant you the necessary permissions
            </a>.
          </li>
        </ul>
      </InfoAlert>
    );
  }
  return null;
}

class ProjectNotebookServers extends Component {
  render() {
    const {
      client, model, user, visibility, toggleForkModal, location, externalUrl, launchNotebookUrl,
      blockAnonymous
    } = this.props;
    const warning = notebookWarning(
      user.logged, visibility.accessLevel, toggleForkModal, location.pathname, externalUrl
    );

    return (
      <Notebooks standalone={false} client={client} model={model} location={location}
        message={warning}
        urlNewEnvironment={launchNotebookUrl}
        blockAnonymous={blockAnonymous}
        scope={{ namespace: this.props.core.namespace_path, project: this.props.core.project_path }}
      />
    );
  }
}

class ProjectStartNotebookServer extends Component {
  render() {
    const {
      client, model, user, visibility, toggleForkModal, externalUrl, system, location,
      fetchBranches, notebookServersUrl, history, blockAnonymous, notifications
    } = this.props;
    const warning = notebookWarning(
      user.logged, visibility.accessLevel, toggleForkModal, location.pathname, externalUrl
    );

    const locationEnhanced = location && location.state && location.state.successUrl ?
      location :
      {
        ...this.props.location,
        state: {
          ...this.props.location.state,
          successUrl: notebookServersUrl
        }
      };

    return (
      <StartNotebookServer client={client} model={model} history={history} location={locationEnhanced}
        message={warning}
        branches={system.branches}
        autosaved={system.autosaved}
        refreshBranches={fetchBranches}
        externalUrl={externalUrl}
        successUrl={notebookServersUrl}
        blockAnonymous={blockAnonymous}
        notifications={notifications}
        scope={{ namespace: this.props.core.namespace_path, project: this.props.core.project_path }}
      />
    );
  }
}

function RepositoryUrlRow(props) {
  return (
    <tr>
      <th scope="row">{props.urlType}</th>
      <td>{props.url}</td>
      <td style={{ width: 1 }}><Clipboard clipboardText={props.url} /></td>
    </tr>
  );
}

class RepositoryUrls extends Component {
  render() {
    return (
      <Fragment>
        <Label className="font-weight-bold">Repository URL</Label>
        <Table size="sm">
          <tbody>
            <RepositoryUrlRow urlType="SSH" url={this.props.system.ssh_url} />
            <RepositoryUrlRow urlType="HTTP" url={this.props.system.http_url} />
          </tbody>
        </Table>
      </Fragment>
    );
  }
}

function CommandRow(props) {
  return (
    <tr>
      <th scope="row">{props.application}</th>
      <td>
        <code>{props.command}</code>
      </td>
      <td style={{ width: 1 }}><Clipboard clipboardText={props.command} /></td>
    </tr>
  );
}

function GitCloneCmd(props) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const { externalUrl, projectPath } = props;
  const gitClone = `git clone ${externalUrl}.git && cd ${projectPath} && git lfs install --local --force`;
  const gitHooksInstall = "renku githooks install"; // eslint-disable-line
  return (cmdOpen) ?
    <div style={{ fontSize: "smaller" }} className="mt-3">
      <p className="font-italic">
        If the <b>renku</b> command is not available, you can clone a project using Git.
      </p>
      <Table size="sm" className="mb-0" borderless={true}>
        <tbody>
          <tr>
            <th scope="row">Git<sup>*</sup></th>
            <td>
              <code>{gitClone}</code>
              <div className="mt-2 mb-0">
                If you want to work with the repo using renku, {" "}
                you need to run the following after the <code>git clone</code> completes:
              </div>
            </td>
            <td style={{ width: 1 }}><Clipboard clipboardText={gitClone} /></td>
          </tr>
          <tr>
            <th scope="row"></th>
            <td>
              <code>{gitHooksInstall}</code>
            </td>
            <td style={{ width: 1 }}><Clipboard clipboardText={gitHooksInstall} /></td>
          </tr>
        </tbody>
      </Table>
      <Button color="link" onClick={() => setCmdOpen(false)}>
        Hide git command
      </Button>
    </div> :
    <Button color="link" style={{ fontSize: "smaller" }} className="font-italic"
      onClick={() => setCmdOpen(true)}>
      Do not have renku?
    </Button>;
}


class RepositoryClone extends Component {
  render() {
    const { externalUrl } = this.props;
    const renkuClone = `renku clone ${externalUrl}.git`;
    return (
      <Fragment>
        <Label className="font-weight-bold">Clone commands</Label>
        <Table size="sm" className="mb-0">
          <tbody>
            <CommandRow application="Renku" command={renkuClone} />
          </tbody>
        </Table>
        <GitCloneCmd externalUrl={externalUrl} projectPath={this.props.core.project_path} />
      </Fragment>
    );
  }
}

class ProjectDescription extends Component {
  constructor(props) {
    super(props);
    this.state = ProjectDescription.getDerivedStateFromProps(props, {});
    this.onValueChange = this.handleChange.bind(this);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = { value: nextProps.core.description };
    return { ...update, ...prevState };
  }

  handleChange(e) { this.setState({ value: e.target.value }); }

  handleSubmit(e) { e.preventDefault(); this.props.onProjectDescriptionChange(this.state.value); }

  render() {
    const inputField = this.props.settingsReadOnly ?
      <Input id="projectDescription" readOnly value={this.state.value} /> :
      <Input id="projectDescription" onChange={this.onValueChange}
        value={this.state.value === null ? "" : this.state.value} />;
    let submit = (this.props.core.description !== this.state.value) ?
      <Button className="mb-3" color="primary">Update</Button> :
      <span></span>;
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="projectDescription">Project Description</Label>
        {inputField}
        <FormText>A short description for the project</FormText>
      </FormGroup>
      {submit}
    </Form>;
  }
}

class ProjectSettings extends Component {
  render() {
    return <Col key="settings" xs={12}>
      <Row>
        <Col xs={12} lg={6}>
          <ProjectTags
            tag_list={this.props.system.tag_list}
            onProjectTagsChange={this.props.onProjectTagsChange}
            settingsReadOnly={this.props.settingsReadOnly} />
          <ProjectDescription {...this.props} />
        </Col>
        <Col xs={12} lg={6}>
          <RepositoryUrls {...this.props} />
          <RepositoryClone {...this.props} />
        </Col>
      </Row>
    </Col>;
  }
}

class ProjectViewNotFound extends Component {
  render() {
    let tip;
    if (this.props.logged) {
      tip = <InfoAlert timeout={0}>
        <p>
          <FontAwesomeIcon icon={faInfoCircle} /> If you are sure the project exists,
          you may want to try the following:
        </p>
        <ul className="mb-0">
          <li>Do you have multiple accounts? Are you logged in with the right user?</li>
          <li>
            If you received this link from someone, ask that person to make sure you have access to the project.
          </li>
        </ul>
      </InfoAlert>;
    }
    else {
      const postLoginUrl = this.props.location.pathname;
      const to = { "pathname": "/login", "state": { previous: postLoginUrl } };
      tip = <InfoAlert timeout={0}>
        <p className="mb-0">
          <FontAwesomeIcon icon={faInfoCircle} /> You might need to be logged in to see this project.
          Please try to <Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>Log in</Link>
        </p>
      </InfoAlert>;
    }

    return <Row>
      <Col>
        <h1>Error 404</h1>
        <h3>Project not found <FontAwesomeIcon icon={faSearch} flip="horizontal" /></h3>
        <div>&nbsp;</div>
        <p>We could not find project with path {this.props.projectPathWithNamespace}.</p>
        <p>
          It is possible that the project has been deleted by its owner or you don&apos;t have permission to access it.
        </p>
        {tip}
      </Col>
    </Row>;
  }
}

class ProjectViewLoading extends Component {
  render() {
    const info = this.props.projectId ?
      <h3>Identifying project number {this.props.projectId}...</h3> :
      <h3>Loading project {this.props.projectPathWithNamespace}...</h3>;
    return <Container fluid>
      <Row>
        <Col>
          {info}
          <Loader />
        </Col>
      </Row>
    </Container>;
  }
}

class NotFoundInsideProject extends Component {
  render() {
    return <Col key="notFound">
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
    </Col>;
  }
}

class ProjectView extends Component {
  render() {
    const available = this.props.core ? this.props.core.available : null;
    const projectPathWithNamespaceOrId = this.props.projectPathWithNamespace ?
      this.props.projectPathWithNamespace
      : this.props.projectId;

    if (this.props.namespace && !this.props.projectPathWithNamespace) {
      return (
        <NamespaceProjects
          namespace={this.props.namespace}
          client={this.props.client}
        />
      );
    }
    else if (available == null || available === SpecialPropVal.UPDATING || this.props.projectId) {
      return (
        <ProjectViewLoading
          projectPathWithNamespace={this.props.projectPathWithNamespace}
          projectId={this.props.projectId} />
      );
    }
    else if (available === false) {
      const { logged } = this.props.user;
      return (
        <ProjectViewNotFound
          projectPathWithNamespace={projectPathWithNamespaceOrId}
          logged={logged}
          location={this.props.location} />
      );
    }

    return [
      <Row key="header"><Col xs={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
      <Row key="nav"><Col xs={12}><ProjectNav key="nav" {...this.props} /></Col></Row>,
      <Row key="space"><Col key="space" xs={12}>&nbsp;</Col></Row>,
      <Container key="content" fluid>
        <Row>
          <Switch>
            <Route exact path={this.props.baseUrl}
              render={props => <ProjectViewOverview key="overview" {...this.props} />} />
            <Route path={this.props.overviewUrl}
              render={props => <ProjectViewOverview key="overview" {...this.props} />} />
            <Route path={this.props.collaborationUrl}
              render={props => <ProjectViewCollaboration key="collaboration" {...this.props} />} />
            <Route path={this.props.filesUrl}
              render={props => <ProjectViewFiles key="files" {...this.props} />} />
            <Route path={this.props.datasetsUrl}
              render={props => <ProjectViewDatasets key="datasets" {...this.props} />} />
            <Route path={this.props.settingsUrl}
              render={props => <ProjectSettings key="settings" {...this.props} />} />
            <Route path={this.props.notebookServersUrl}
              render={props => <ProjectEnvironments key="environments" {...this.props} />} />
            <Route component={NotFoundInsideProject} />
          </Switch>
        </Row>
      </Container>
    ];

  }
}

export default { ProjectView };

// For testing
export { filterPaths, ProjectViewCommitsBody };

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
  Container, Row, Col, Alert, DropdownItem, Table, Nav, NavItem, Button, ButtonGroup, Badge,
  Card, CardBody, CardHeader, Form, FormGroup, FormText, Label, Input, UncontrolledTooltip, ListGroupItem
} from "reactstrap";

import filesize from "filesize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faCodeBranch, faExternalLinkAlt, faInfoCircle, faLongArrowAltLeft, faStar as faStarSolid,
  faExclamationTriangle, faLock, faUserFriends, faGlobe, faSearch
} from "@fortawesome/free-solid-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";

import {
  Clipboard, ExternalLink, Loader, RenkuMarkdown, RenkuNavLink, TimeCaption, RefreshButton,
  ButtonWithMenu, InfoAlert, SuccessAlert, WarnAlert, ErrorAlert
} from "../utils/UIComponents";
import { SpecialPropVal } from "../model/Model";
import { ProjectTags, ProjectTagList } from "./shared";
import { Notebooks, StartNotebookServer } from "../notebooks";
import Issue from "../collaboration/issue/Issue";
import { CollaborationList, collaborationListTypeMap } from "../collaboration/lists/CollaborationList.container";
import FilesTreeView from "./filestreeview/FilesTreeView";
import DatasetsListView from "./datasets/DatasetsListView";
import { ACCESS_LEVELS } from "../api-client";
import { GraphIndexingStatus, withProjectMapped } from "./Project";
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

/**
 * If appropriate, show a warning banner that the project has not been integration with the knowledge graph.
 */
class KnowledgeGraphIntegrationWarningBanner extends Component {
  render() {
    if (this.props.webhook.stop) return null;

    const status = this.props.webhook.status;
    if (status === false) {
      const isPrivate = this.props.visibility && this.props.visibility.level === "private" ? true : false;
      return (
        <KnowledgeGraphWarning
          close={this.props.onCloseGraphWebhook}
          webhook={this.props.webhook.created}
          create={this.props.createGraphWebhook}
          isPrivate={isPrivate} />
      );
    }
    // I would keep this error for safety, even if this error *should* not happen
    const error = webhookError(status);
    if (error) {
      return (
        <WarnAlert dismissCallback={this.props.onCloseGraphWebhook}>
          An error prevented checking integration of the project with the Knowledge Graph. Error: &quot;
          <span className="font-italic">{status.message}</span>&quot;
        </WarnAlert>
      );
    }
    return null;
  }
}

class KnowledgeGraphWarning extends Component {
  render() {
    const webhook = this.props.webhook;
    if (webhook === true) {
      return (
        <SuccessAlert dismissCallback={this.props.close}>
          Integration with the Knowledge Graph was successful.
        </SuccessAlert>
      );
    }
    else if (webhook === false || webhook === SpecialPropVal.UPDATING) {
      const updating = webhook === SpecialPropVal.UPDATING ? true : false;
      return (
        <WarnAlert dismissCallback={this.props.close}>
          Knowledge Graph integration has not been turned on. &nbsp;
          <KnowledgeGraphPrivateWarning {...this.props} />
          <KnowledgeGraphLink color="warning" {...this.props} updating={updating} />
        </WarnAlert>
      );
    }

    const error = webhookError(webhook) ?
      `The project was not integrated with the Knowledge Graph. Error: "${webhook.message}".` :
      "An unknown error prevented integration of the project with the Knowledge Graph.";
    return (
      <ErrorAlert dismissCallback={this.props.close}>
        <p>{error}</p>
        <KnowledgeGraphLink color="danger" {...this.props} />
      </ErrorAlert>
    );

  }
}

class KnowledgeGraphPrivateWarning extends Component {
  render() {
    if (!this.props.isPrivate) return null;
    return (
      <p className="font-italic">
        {/* <span className="font-weight-bold">WARNING! </span> */}
        <FontAwesomeIcon icon={faExclamationTriangle} /> This is a private project. Though contents remain private,
        the Knowledge Graph may make some metadata public; only activate if that is acceptable.
        <br />
        <a href="https://renku.readthedocs.io/en/latest/user/knowledge-graph.html"
          target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faExternalLinkAlt} /> Read more about the Knowledge Graph integration.
        </a>
      </p>
    );
  }
}

class KnowledgeGraphLink extends Component {
  render() {
    if (this.props.updating) {
      return (
        <span>Activating... <Loader size="12" inline="true" /></span>
      );
    }
    return (
      <Button color={this.props.color} onClick={this.props.create}>Activate Knowledge Graph</Button>
    );
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
        starText = "unstarring...";
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
            <h3>{core.title} <ProjectVisibilityLabel visibilityLevel={this.props.visibility.level} /></h3>
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
        <KnowledgeGraphIntegrationWarningBanner {...this.props} />
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
      forkedFromLink = <Link key="forkedfrom" to={`${projectsUrl}/${forkedFrom.metadata.core.path_with_namespace}`}>
        {forkedFrom.metadata.core.path_with_namespace || "no title"}
      </Link>;
    }

    return <ProjectViewHeaderOverview
      key="overviewheader"
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
      hash={this.props.filesTree.hash}
      fileView={this.props.filesTreeView}
      currentUrl={this.props.location.pathname} />;
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
          <RenkuMarkdown markdownText={this.props.readme.text} />
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
                    <td>{filesize(stats.storage_size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Repository Size</th>
                    <td>{filesize(stats.repository_size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">LFS Size</th>
                    <td>{filesize(stats.lfs_objects_size)}</td>
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
      </Nav>);
  }
}

class ProjectViewOverview extends Component {

  componentDidMount() {
    this.props.fetchOverviewData();
  }

  render() {
    const { core, system, projectCoordinator } = this.props;

    return <Col key="overview">
      <Row>
        <Col xs={12} md={9}>
          <p>
            <span className="lead">{core.description}</span> <br />
            <TimeCaption key="time-caption" time={core.last_activity_at} />
          </p>
        </Col>
        <Col xs={12} md={3}>
          <p className="text-md-right">
            <ProjectTagList taglist={system.tag_list} />
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
                return <ProjectViewCommitsConnected projectCoordinator={projectCoordinator} />;
              }}
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
    const maxCommits = 100;
    const gitlabCommitsUrl = `${metadata.repositoryUrl}/commits`;

    const commitBadgeNumber = commits.list.length >= maxCommits ?
      `${maxCommits}+` :
      commits.list.length;
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
    const info = commits.list.length >= maxCommits ?
      (<ProjectViewCommitsInfo number={maxCommits} url={gitlabCommitsUrl} />) :
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
        More than {this.props.number} commits. To see the full project history,&nbsp;
        <ExternalLink role="link" id="commitLink" title="view in GitLab" url={this.props.url} />
      </ListGroupItem>
    );
  }
}

class ProjectViewCommitsBody extends Component {
  render() {
    const { commits, metadata } = this.props;

    if (commits.fetching || !commits.fetched)
      return <Loader />;
    return (
      <CommitsView
        commits={commits.list}
        fetched={commits.fetched}
        fetching={commits.fetching}
        urlRepository={metadata.repositoryUrl}
        urlDiff={`${metadata.repositoryUrl}/commit/`}
      />
    );
  }
}

class ProjectDatasetsNav extends Component {

  render() {
    const allDatasets = this.props.core.datasets || [];

    if (allDatasets.length === 0)
      return null;

    return <DatasetsListView
      datasets={this.props.core.datasets}
      datasetsUrl={this.props.datasetsUrl}
      newDatasetUrl={this.props.newDatasetUrl}
      visibility={this.props.visibility}
    />;
  }
}

function ProjectAddDataset(props) {

  const [newDataset, setNewDataset] = useState(true);

  return <Col>
    { props.visibility.accessLevel > ACCESS_LEVELS.DEVELOPER ? [
      <Row key="header">
        <h3 className="uk-heading-divider uk-text-center pb-2 ml-4">Add Dataset</h3>
      </Row>,
      <Row key="switch-button">
        <ButtonGroup className={"ml-4 pt-1"}>
          <Button color="primary" outline onClick={() => setNewDataset(true)} active={newDataset}>
            Create Dataset
          </Button>
          <Button color="primary" outline onClick={() => setNewDataset(false)} active={!newDataset}>
            Import Dataset
          </Button>
        </ButtonGroup>
      </Row>]
      : null
    }
    { newDataset ?
      props.newDataset(props)
      : props.importDataset(props)
    }
  </Col>;
}

function GoBackButton(props) {
  return <Col md={12} className="pb-3">
    <Link className="pl-3" to={props.url}>
      <FontAwesomeIcon icon={faLongArrowAltLeft} /> {props.label}
    </Link>
  </Col>;
}

function EmptyDatasets(props) {
  return <Col sm={12} md={10} lg={8}>
    <Alert timeout={0} color="primary">
      No datasets found for this project.
      { props.membership ?
        <div><br /><FontAwesomeIcon icon={faInfoCircle} />  If you recently activated the knowledge graph or
          added the datasets try refreshing the page. <br /><br />
          You can also click on the button to
          &nbsp;<Link className="btn btn-primary btn-sm" to={props.newDatasetUrl}>Add a Dataset</Link></div>
        : null
      }
    </Alert>
  </Col>;
}

function ProjectViewDatasets(props) {
  const [fetchAfterWebhook, setFetchAfterWebhook] = useState(false);
  const [firstFetch, setFirstFetch] = useState(false);

  useEffect(()=>{
    const loading = props.core.datasets === SpecialPropVal.UPDATING;
    if (loading) return;
    if (firstFetch === false) {
      props.fetchDatasets();
      props.fetchGraphStatus();
      setFirstFetch(true);
      return;
    }
    const incomingDatasets = props.location.state && props.location.state.datasets
      ? props.location.state.datasets : [];
    if (props.core.datasets === undefined ||
      incomingDatasets.length > props.core.datasets.length) {
      props.fetchDatasets();
    }
    else if (props.core.datasets === undefined && !fetchAfterWebhook &&
      props.webhook.progress >= GraphIndexingStatus.MAX_VALUE) {
      props.fetchDatasets();
      setFetchAfterWebhook(true);
    }
  }, [props, fetchAfterWebhook, firstFetch]);

  const loading = props.core.datasets === SpecialPropVal.UPDATING;
  const incomingDatasets = props.location.state && props.location.state.datasets
    ? props.location.state.datasets : [];
  if (loading || props.core.datasets === undefined
     || incomingDatasets.length > props.core.datasets.length)
    return <Loader />;
  const progress = props.webhook.progress;

  const kgLoading = progress == null
      || progress === GraphIndexingStatus.NO_WEBHOOK
      || progress === GraphIndexingStatus.NO_PROGRESS
      || (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE);

  if (kgLoading)
    return <Col sm={12} md={10} lg={8}>{props.kgStatusView(true, props.fetchDatasets)}</Col>;

  if (!loading && !kgLoading && props.core.datasets !== undefined && props.core.datasets.length === 0
    && props.location.pathname !== props.newDatasetUrl) {
    return <EmptyDatasets
      membership={props.visibility.accessLevel > ACCESS_LEVELS.DEVELOPER}
      newDatasetUrl={props.newDatasetUrl}
    />;
  }

  return <Col sm={12} md={12} lg={8}>
    <Switch>
      <Route path={props.newDatasetUrl}
        render={p =>[
          <GoBackButton key="btn" label="Back to list" url={props.datasetsUrl}/>,
          <ProjectAddDataset key="projectsAddDataset" {...props} />
        ]}/>
      <Route path={props.editDatasetUrl}
        render={p => [
          <GoBackButton key="btn" label="Back to dataset" url={`${props.datasetsUrl}/${p.match.params.datasetId}/`} />,
          props.editDataset(p)]
        }/>
      <Route path={props.datasetUrl} render={p =>[
        <GoBackButton key="btn" label="Back to list" url={props.datasetsUrl}/>,
        props.datasetView(p)
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
          <RenkuNavLink to={this.props.issuesUrl} matchpath={true} title="Issues" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.mergeRequestsOverviewUrl} matchpath={true} title="Merge Requests" />
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
        <Col key="collaborationcontent" sm={12} md={10}>
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
    return <Row><Col key="issueslist" className={"pt-3"} sm={12} md={10} lg={8}>
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
    this.props.fetchDatasets();
  }

  render() {
    if (this.props.datasets === undefined)
      return <p>Loading datasets...</p>;

    if (this.props.datasets.length === 0)
      return <p>No datasets to display.</p>;

    let datasets = this.props.datasets.map((dataset) =>
      <OverviewDatasetRow
        key={dataset.identifier}
        name={dataset.name}
        fullDatasetUrl={`${this.props.datasetsUrl}/${encodeURIComponent(dataset.identifier)}`}
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
      fetchBranches, notebookServersUrl, history, blockAnonymous
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
      <td><Clipboard clipboardText={props.url} /></td>
    </tr>
  );
}

class RepositoryUrls extends Component {
  render() {
    return [
      <strong key="header">Repository URL</strong>,
      <Table key="table" size="sm">
        <tbody>
          <RepositoryUrlRow urlType="SSH" url={this.props.system.ssh_url} />
          <RepositoryUrlRow urlType="HTTP" url={this.props.system.http_url} />
        </tbody>
      </Table>
    ];
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
      <Input id="projectDescription" value={this.state.value} onChange={this.onValueChange} />;
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
        <Col xs={12} md={10} lg={6}>
          <ProjectTags
            tag_list={this.props.system.tag_list}
            onProjectTagsChange={this.props.onProjectTagsChange}
            settingsReadOnly={this.props.settingsReadOnly} />
          <ProjectDescription {...this.props} />
        </Col>
        <Col xs={12} md={10} lg={6}><RepositoryUrls {...this.props} /></Col>
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
    return <Col key="nofound">
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

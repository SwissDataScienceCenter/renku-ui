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



import React, { Component } from 'react';

import { Link, Route, Switch } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import filesize from 'filesize';

import { Container, Row, Col } from 'reactstrap';
import { Alert, Table } from 'reactstrap';
import { Button, Form, FormGroup, FormText, Label } from 'reactstrap';
import { Input } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';
import { Card, CardBody, CardHeader } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faStarRegular from '@fortawesome/fontawesome-free-regular/faStar'
import { faStar as faStarSolid, faInfoCircle, faExternalLinkAlt, faCodeBranch } from '@fortawesome/fontawesome-free-solid'
import { faExclamationTriangle, faLock , faUserFriends, faGlobe, faSearch } from '@fortawesome/fontawesome-free-solid'

import { ExternalLink, Loader, RenkuNavLink, TimeCaption} from '../utils/UIComponents'
import { InfoAlert, SuccessAlert, WarnAlert, ErrorAlert } from '../utils/UIComponents'
import { SpecialPropVal } from '../model/Model'
import { ProjectTags, ProjectTagList } from './shared'
import { Notebooks, StartNotebookServer } from '../notebooks'
import FilesTreeView from './filestreeview/FilesTreeView';
import { ACCESS_LEVELS } from '../api-client';

import './Project.css';

function filterPaths(paths, blacklist) {
  // Return paths to do not match the blacklist of regexps.
  const result = paths.filter(p => blacklist.every(b => p.match(b) === null))
  return result;
}

function isRequestPending(props, request) {
  const transient = props.transient || {};
  const requests = transient.requests || {}
  return requests[request] === SpecialPropVal.UPDATING;
}

function webhookError(props) {
  if (props == null || props === SpecialPropVal.UPDATING || props === true || props === false) {
    return false;
  }
  return true;
}

class ProjectVisibilityLabel extends Component {
  render(){
    switch(this.props.visibilityLevel) {
    case "private":
      return  <span className="visibilityLabel"><FontAwesomeIcon icon={faLock}/> Private</span>
    case "internal":
      return  <span className="visibilityLabel"><FontAwesomeIcon icon={faUserFriends}/> Internal</span>
    case "public":
      return  <span className="visibilityLabel"><FontAwesomeIcon icon={faGlobe}/> Public</span>
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
        <p style={{ float: 'left' }}> Do you want to create a pending change for branch <b>{branch.name}</b>?</p>
        <p style={{ float: 'right' }}>
          &nbsp; <ExternalLink url={`${this.props.externalUrl}/tree/${branch.name}`} title="View in GitLab" />
          &nbsp; <Button color="success" onClick={(e) => {
            this.handleCreateMergeRequest(e, this.props.onCreateMergeRequest, branch)
          }}>Create Pending Change</Button>
          {/*TODO: Enable the 'no' option once the alert can be dismissed permanently!*/}
          {/*&nbsp; <Button color="warning" onClick={this.props.createMR(branch.iid)}>No</Button>*/}
        </p>
        <div style={{ clear: 'left' }}></div>
      </Alert>
    });
    return mrSuggestions
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
      )
    }
    // I would keep this error for safety, even if this error *should* not happen
    const error = webhookError(status);
    if (error) {
      return (
        <WarnAlert dismissCallback={this.props.onCloseGraphWebhook}>
          An error prevented checking integration of the project with the Knowledge Graph. Error: &quot;
          <span className="font-italic">{status.message}</span>&quot;
        </WarnAlert>
      )
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
      )
    }
    else if (webhook === false || webhook ===  SpecialPropVal.UPDATING) {
      const updating = webhook === SpecialPropVal.UPDATING ? true : false;
      return (
        <WarnAlert dismissCallback={this.props.close}>
          Knowledge Graph integration has not been turned on. &nbsp;
          <KnowledgeGraphPrivateWarning {...this.props} />
          <KnowledgeGraphLink color="warning" {...this.props} updating={updating} />
        </WarnAlert>
      )
    }
    else {
      const error = webhookError(webhook) ?
        `The project was not integrated with the Knowledge Graph. Error: "${webhook.message}".` :
        "An unknown error prevented integration of the project with the Knowledge Graph.";
      return (
        <ErrorAlert dismissCallback={this.props.close}>
          <p>{error}</p>
          <KnowledgeGraphLink color="danger" {...this.props} />
        </ErrorAlert>
      )
    }
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
    )
  }
}

class KnowledgeGraphLink extends Component {
  render() {
    if (this.props.updating) {
      return (
        <span>Activating... <Loader size="12" inline="true" /></span>
      )
    }
    return (
      <Button color={this.props.color} onClick={this.props.create}>Activate Knowledge Graph</Button>
    )
  }
}

class ProjectViewHeaderOverview extends Component {

  render() {
    const forkedFrom = (this.props.forkedFromLink == null) ?
      null :
      [" ", "forked from", " ", this.props.forkedFromLink];
    const core = this.props.core;
    const system = this.props.system;
    const starButtonText = this.props.starred ? 'unstar' : 'star';
    const starIcon = this.props.starred ? faStarSolid : faStarRegular;
    const forkButtonText = 'fork';
    const forkIcon = faCodeBranch
    return (
      <Container fluid>
        <Row>
          <Col xs={12} md={6}>
            <h3>{core.title} <ProjectVisibilityLabel visibilityLevel={this.props.visibility.level}/></h3>
            <p>
              <span>{this.props.core.path_with_namespace}{forkedFrom}</span> <br />
            </p>
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex flex-md-row-reverse">
              <div className={`fixed-width-${this.props.starred ? '120' : '100'}`}>
                <form className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <button className="btn btn-outline-primary" onClick={this.props.onStar}>
                      <FontAwesomeIcon icon={starIcon} /> {starButtonText}
                    </button>
                  </div>
                  <input className="form-control border-primary text-right"
                    placeholder={system.star_count} aria-label="starCount" readOnly={true} />
                </form>
              </div>
              <div className={`fixed-width-100 pr-1`}>
                <form className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <button className="btn btn-outline-primary" onClick={this.props.toogleForkModal}>
                      <FontAwesomeIcon icon={forkIcon} /> {forkButtonText}
                    </button>
                  </div>
                  <input className="form-control border-primary text-right"
                    placeholder={system.forks_count} aria-label="starCount" readOnly={true} />
                </form>
              </div>
            </div>
            <div className="d-flex flex-md-row-reverse pt-2 pb-2">
              <div>
                {
                  (this.props.externalUrl !== "") ?
                    <ExternalLink url={this.props.externalUrl} title="View in GitLab" /> :
                    null
                }
              </div>
            </div>
          </Col>
        </Row>
        <KnowledgeGraphIntegrationWarningBanner {...this.props} />
        {this.props.fork(this.props)}
      </Container>
    )
  }
}

class ProjectViewHeader extends Component {

  render() {
    let forkedFromLink = null;
    if (this.props.system.forked_from_project != null &&
      Object.keys(this.props.system.forked_from_project).length > 0) {
      const forkedFrom = this.props.system.forked_from_project;
      const projectsUrl = this.props.projectsUrl;
      forkedFromLink = <Link key="forkedfrom" to={`${projectsUrl}/${forkedFrom.metadata.core.id}`}>
        {forkedFrom.metadata.core.path_with_namespace || 'no title'}
      </Link>;
    }

    return <ProjectViewHeaderOverview
      key="overviewheader"
      forkedFromLink={forkedFromLink} {...this.props} />
  }
}

class ProjectNav extends Component {
  render() {
    return (
      <Nav pills className={'nav-pills-underline'}>
        <NavItem>
          <RenkuNavLink to={this.props.baseUrl} alternate={this.props.overviewUrl} title="Overview" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.kusUrl} title="Kus" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.filesUrl} title="Files" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.mrOverviewUrl} title="Pending Changes" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.notebookServersUrl} title="Notebook Servers" />
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
    const loading = isRequestPending(this.props, 'filesTree');
    const allFiles = this.props.filesTree || []
    if ( (loading && Object.keys(allFiles).length < 1 ) || this.props.filesTree===undefined) {
      return <Loader />
    }
    return <FilesTreeView
      data={this.props.filesTree}
      lineageUrl={this.props.lineagesUrl}
      projectUrl={this.props.fileContentUrl}
      setOpenFolder={this.props.setOpenFolder}
      hash={this.props.filesTree.hash}
      fileView={this.props.filesTreeView}
      currentUrl={this.props.location.pathname}/>;
  }
}

class ProjectViewReadme extends Component {
  render() {
    const readmeText = this.props.readme.text;
    const loading = isRequestPending(this.props, 'readme');
    if (loading && readmeText === '') {
      return <Loader />
    }
    return (
      <Card className="border-0">
        <CardHeader>README.md</CardHeader>
        <CardBody>
          <ReactMarkdown key="readme" source={readmeText} />
        </CardBody>
      </Card>
    )
  }
}

class ProjectViewStats extends Component {

  render() {
    const loading = (this.props.core.id == null);
    if (loading) {
      return <Loader />
    }
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
    ]
  }
}

class ProjectViewOverviewNav extends Component {

  render() {
    // Add when results are handled:
    // <NavItem>
    //   <RenkuNavLink to={`${this.props.overviewUrl}/results`} title="Results" />
    // </NavItem>
    return (
      <Nav pills className={'flex-column'}>
        <NavItem>
          <RenkuNavLink to={this.props.baseUrl} title="Description" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={`${this.props.statsUrl}`} title="Stats" />
        </NavItem>
      </Nav>)
  }
}

class ProjectViewOverview extends Component {

  componentDidMount() {
    this.props.fetchOverviewData();
  }

  render() {
    // return [
    //   <Col key="stats" sm={12} md={3}><br /><ProjectViewStats {...this.props} /></Col>,
    //   <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" {...this.props} /></Col>
    // ]
    // Hide the stats until we can actually get them from the server
    const core = this.props.core;
    const system = this.props.system;
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
              return <ProjectViewReadme readme={this.props.data.readme} {...this.props} />
            }} />
            <Route path={this.props.statusUrl} render={props =>
              <ProjectViewStats {...this.props} />}
            />
          </Switch>
        </Col>
      </Row>
    </Col>
  }
}

class ProjectViewKus extends Component {

  render() {
    return [
      <Col key="kulist" sm={12} md={4}>
        {this.props.kuList}
      </Col>,
      <Col key="ku" sm={12} md={8}>
        <Route path={this.props.kuUrl}
          render={props => this.props.kuView(props)} />
      </Col>
    ]
  }
}

class ProjectMergeRequestList extends Component {

  componentDidMount() {
    this.props.fetchMrSuggestions();
  }

  render() {
    return <Col>
      <Row>
        <Col>
          <MergeRequestSuggestions
            externalUrl={this.props.externalUrl}
            canCreateMR={this.props.canCreateMR}
            onCreateMergeRequest={this.props.onCreateMergeRequest}
            suggestedMRBranches={this.props.suggestedMRBranches} />
        </Col>
      </Row>
      <Row>
        <Col key="mrList" sm={12} md={4} lg={3} xl={2}>
          {this.props.mrList}
        </Col>
        <Col key="mr" sm={12} md={8} lg={9} xl={10}>
          <Route path={this.props.mrUrl}
            render={props => this.props.mrView(props)} />
        </Col>
      </Row>
    </Col>
  }
}

class ProjectViewFiles extends Component {

  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    return [
      <Col key="files" sm={12} md={4} lg={2}>
        <ProjectFilesNav
          {...this.props} />
      </Col>,
      <Col key="content" sm={12} md={8} lg={10}>
        <Switch>
          <Route path={this.props.lineageUrl}
            render={p => this.props.lineageView(p)} />
          <Route path={this.props.fileContentUrl}
            render={props => this.props.fileView(props)}/>
        </Switch>
      </Col>
    ]
  }
}

function notebookLauncher(userId, accessLevel, notebookLauncher, fork, postLoginUrl, externalUrl) {
  if (accessLevel >= ACCESS_LEVELS.DEVELOPER)
    return (<Col xs={12}>{notebookLauncher}</Col>);

  let content = [<p key="no-permission">You do not have sufficient permissions to launch an interactive environment
    for this project.</p>];
  if (userId == null) {
    const to = { "pathname": "/login", "state": { previous: postLoginUrl } };
    content = content.concat(
      <InfoAlert timeout={0} key="login-info">
        <p className="mb-0">
          <Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>Log in</Link> to use
          interactive environments.
        </p>
      </InfoAlert>
    );
  }
  else {
    content = content.concat(
      <InfoAlert timeout={0} key="login-info">
        <p>You can still do one of the following:</p>
        <ul className="mb-0">
          <li>
            <Button size="sm" color="primary" onClick={(event) => fork(event)}>
              Fork the project
            </Button> and start an interactive environment from your fork.
          </li>
          <li className="pt-1">
            <ExternalLink size="sm" url={`${externalUrl}/project_members`} title="Contact a maintainer" /> and ask them
            to <a href="https://renku.readthedocs.io/en/latest/user/collaboration.html#added-to-project"
              target="_blank" rel="noreferrer noopener">
              grant you the necessary permissions
            </a>.
          </li>
        </ul>
      </InfoAlert>
    );
  }

  return (<Col xs={12}>{content}</Col>);
}

class ProjectNotebookServers extends Component {
  render() {
    const content = [
      <Notebooks key="notebooks"
        standalone={false}
        client={this.props.client}
        scope={{namespace: this.props.core.namespace_path, project: this.props.core.project_path}}
      />,
      <Link key="launch" to={ `/projects/${this.props.id}/launchNotebook` }>
        <Button color="primary">Start new server</Button>
      </Link>
    ];

    return (notebookLauncher(this.props.user.id,
      this.props.visibility.accessLevel,
      content,
      this.props.toogleForkModal,
      this.props.location.pathname,
      this.props.externalUrl));
  }
}

class ProjectStartNotebookServer extends Component {
  render() {
    let content = (<StartNotebookServer
      client={this.props.client}
      branches={this.props.system.branches}
      autosaved={this.props.system.autosaved}
      refreshBranches={this.props.fetchBranches}
      scope={{namespace: this.props.core.namespace_path, project: this.props.core.project_path}}
      successUrl={this.props.notebookServersUrl}
      history={this.props.history}
    />);

    return (notebookLauncher(this.props.user.id,
      this.props.visibility.accessLevel,
      content,
      this.props.toggleModalFork,
      this.props.location.pathname,
      this.props.externalUrl));
  }
}

class RepositoryUrls extends Component {
  render() {
    return [
      <strong key="header">Repository URL</strong>,
      <Table key="table" size="sm">
        <tbody>
          <tr>
            <th scope="row">SSH</th>
            <td>{this.props.system.ssh_url}</td>
          </tr>
          <tr>
            <th scope="row">HTTP</th>
            <td>{this.props.system.http_url}</td>
          </tr>
        </tbody>
      </Table>
    ]
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
      <span></span>
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="projectDescription">Project Description</Label>
        {inputField}
        <FormText>A short description for the project</FormText>
      </FormGroup>
      {submit}
    </Form>
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
    </Col>
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
      </InfoAlert>
    }
    else {
      tip = <InfoAlert timeout={0}>
        <p className="mb-0">
          <FontAwesomeIcon icon={faInfoCircle} /> You might need to be logged in to see this project.
          Please try to log in.
        </p>
      </InfoAlert>
    }

    return <Row>
      <Col>
        <h1>Error 404</h1>
        <h3>Project not found <FontAwesomeIcon icon={faSearch} flip="horizontal" /></h3>
        <div>&nbsp;</div>
        <p>We could not find project #{this.props.id}.</p>
        <p>
          It is possible that the project has been deleted by its owner or you don&apos;t have permission to access it.
        </p>
        {tip}
      </Col>
    </Row>
  }
}

class ProjectViewLoading extends Component {
  render() {
    return <Container fluid>
      <Row>
        <Col>
          <h3>Loading project #{this.props.id}...</h3>
          <Loader />
        </Col>
      </Row>
    </Container>
  }
}

class ProjectView extends Component {

  render() {
    const available = this.props.core ? this.props.core.available : null;
    if (available === null || available === SpecialPropVal.UPDATING) {
      return <ProjectViewLoading id={ this.props.id } />
    }
    else if (available === false) {
      const logged = this.props.user.id ? true : false;
      return <ProjectViewNotFound id={ this.props.id } logged={ logged } />
    }
    else {
      return [
        <Row key="header"><Col xs={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
        <Row key="nav"><Col xs={12}><ProjectNav key="nav" {...this.props} /></Col></Row>,
        <Row key="space"><Col key="space" xs={12}>&nbsp;</Col></Row>,
        <Container key="content" fluid>
          <Row>
            <Route exact path={this.props.baseUrl}
              render={props => <ProjectViewOverview key="overview" {...this.props} />} />
            <Route path={this.props.overviewUrl}
              render={props => <ProjectViewOverview key="overview" {...this.props} />} />
            <Route path={this.props.kusUrl}
              render={props => <ProjectViewKus key="kus" {...this.props} />} />
            <Route path={this.props.filesUrl}
              render={props => <ProjectViewFiles key="files" {...this.props} />} />
            <Route path={this.props.settingsUrl}
              render={props => <ProjectSettings key="settings" {...this.props} />} />
            <Route path={this.props.mrOverviewUrl}
              render={props => <ProjectMergeRequestList key="files-changes" {...this.props} />} />
            <Route path={this.props.notebookServersUrl}
              render={props => <ProjectNotebookServers key="notebook-servers" {...this.props} />} />
            <Route path={this.props.launchNotebookUrl}
              render={props => <ProjectStartNotebookServer key="start-server" {...this.props} />}/>
          </Row>
        </Container>
      ]
    }
  }
}

export default { ProjectView };
export { filterPaths };

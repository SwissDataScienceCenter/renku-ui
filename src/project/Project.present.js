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

import { Link, Route, Switch }  from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import ReactMarkdown from 'react-markdown'

import { Container, Row, Col } from 'reactstrap';
import { Alert, Badge, Table } from 'reactstrap';
import { Button, Form, FormGroup, FormText, Label } from 'reactstrap';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';
import { Card, CardBody, CardHeader } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faStarRegular from '@fortawesome/fontawesome-free-regular/faStar'
import faStarSolid from '@fortawesome/fontawesome-free-solid/faStar'
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle'

import collection from 'lodash/collection';
import { Avatar, ExternalLink, FieldGroup, Loader, Pagination, RenkuNavLink, TimeCaption } from '../utils/UIComponents'
import { SpecialPropVal } from '../model/Model'
import './Project.style.css';

const imageBuildStatusText = {
  failed: 'No notebook image has been built. You can still open a notebook server with the default image.',
  canceled: 'The notebook image build has been cancelled.  You can still open a notebook server with the default image',
  running: 'The notebook image build is still ongoing. Wait a bit before launching a notebook...',
  pending: 'The notebook image build is still pending. Wait a bit before launching a notebook...'
};

const imageBuildAlertColor = {
  failed : 'danger',
  canceled : 'danger',
  running : 'warning',
  pending : 'warning'
};

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

class ProjectPath extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.doChange.bind(this);
    this.onBlur = this.doBlur.bind(this);
    this.onSuggestionsFetchRequested = this.doSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.doSuggestionsClearRequested.bind(this);

    this.state = {
      suggestions: [],
      input: this.props.namespace.name
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.namespace.name !== prevProps.namespace.name) {
      this.setState({input: this.props.namespace.name});
    }
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return <span>{suggestion.name}</span>;
  }

  renderSectionTitle(section) {
    return (
      <strong>{section.kind}</strong>
    );
  }

  getSectionSuggestions(section) {
    return section.namespaces;
  }

  doBlur(event, {highlightedSuggestion}) {
    // Take the highlighted suggestion or return to the selected namespace
    if (null != highlightedSuggestion) {
      this.props.onChange(highlightedSuggestion);
      this.props.onAccept();
    }
    this.setState({input: this.props.namespace.name})
  }

  doChange(event, { newValue, method }) {
    // If the user typed, store it as local input, otherwise set the selection
    if (method === 'type') {
      this.setState({input: newValue});
    } else {
      this.props.onChange(newValue)
    }
    if (method === 'enter' || method === 'click') {
      this.props.onAccept();
    }
  }

  async doSuggestionsFetchRequested({ value, reason }) {
    let searchValue = value;
    // Do a broad search on input-focused to show many options
    if (reason === 'input-focused') searchValue = '';
    const matches = await this.props.fetchMatchingNamespaces(searchValue);
    const namespaces = collection.groupBy(matches, 'kind');
    const suggestions = ['user', 'group']
      .map(section => {
        const sectionNs = namespaces[section];
        return {
          kind: section,
          namespaces: (sectionNs == null) ? [] : sectionNs
        };
      })
      .filter(section => section.namespaces.length > 0);

    // Show current as first on input-focused, otherwise do not show
    if (reason === 'input-focused') {
      const current = {kind: 'current', namespaces: [this.props.namespace]};
      suggestions.splice(0, 0, current);
    }
    this.setState({ suggestions });
  }

  doSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  render() {
    const { suggestions } = this.state;
    const inputProps = {
      placeholder: "{user}",
      value: this.state.input || '',
      onChange: this.onChange,
      onBlur: this.onBlur
    };
    // See https://github.com/moroshko/react-autosuggest#themeProp
    const defaultTheme = {
      container:                'react-autosuggest__container',
      containerOpen:            'react-autosuggest__container--open',
      input:                    'react-autosuggest__input',
      inputOpen:                'react-autosuggest__input--open',
      inputFocused:             'react-autosuggest__input--focused',
      suggestionsContainer:     'react-autosuggest__suggestions-container',
      suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
      suggestionsList:          'react-autosuggest__suggestions-list',
      suggestion:               'react-autosuggest__suggestion',
      suggestionFirst:          'react-autosuggest__suggestion--first',
      suggestionHighlighted:    'react-autosuggest__suggestion--highlighted',
      sectionContainer:         'react-autosuggest__section-container',
      sectionContainerFirst:    'react-autosuggest__section-container--first',
      sectionTitle:             'react-autosuggest__section-title'
    };
    // Override the input theme to match our visual style
    const theme = {...defaultTheme, ...{input: 'form-control'}};
    return <FormGroup>
      <Label>Project Home</Label>
      <InputGroup>
        <Autosuggest
          multiSection={true}
          highlightFirstSuggestion={true}
          suggestions={suggestions}
          inputProps={inputProps}
          theme={theme}
          shouldRenderSuggestions={(v) => true}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          renderSectionTitle={this.renderSectionTitle}
          getSectionSuggestions={this.getSectionSuggestions} />
        <InputGroupAddon addonType="append">
          <InputGroupText>/</InputGroupText>
          <InputGroupText>{this.props.slug}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FormText color="muted">{"By default, a project is owned by the user that created it, but \
        it can optionally be created within a group."}</FormText>
    </FormGroup>
  }
}

class DataVisibility extends Component {
  render() {
    const visibilities = this.props.visibilities;
    const vizExplanation = (visibilities.length === 3) ?
      "" :
      "The project home's visibility setting limits the project visibility options.";
    const options = visibilities.map(v =>
      <option key={v.value} value={v.value}>{v.name}</option>
    )
    return <FormGroup>
      <Label>Visibility</Label>
      <Input type="select" placeholder="visibility" value={this.props.value} onChange={this.props.onChange}>
        {options}
      </Input>
      <FormText color="muted">{vizExplanation}</FormText>
    </FormGroup>
  }
}

class ProjectNew extends Component {

  render() {
    const statuses = this.props.statuses;
    const titleHelp = this.props.model.display.slug.length > 0 ? `Id: ${this.props.model.display.slug}` : null;
    return [
      <Row key="header"><Col md={8}>
        <h1>New Project</h1>
      </Col></Row>,
      <Row key="body"><Col md={8}>
        <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
          <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the project"
            help={titleHelp} value={this.props.model.display.title}
            feedback={statuses.title} invalid={statuses.title != null}
            onChange={this.props.handlers.onTitleChange} />
          <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the project"
            help="A description of the project helps users understand it and is highly recommended."
            feedback={statuses.description} invalid={statuses.description != null}
            value={this.props.model.display.description} onChange={this.props.handlers.onDescriptionChange} />
          <ProjectPath namespace={this.props.model.meta.projectNamespace} slug={this.props.model.display.slug}
            namespaces={this.props.namespaces}
            onChange={this.props.handlers.onProjectNamespaceChange}
            onAccept={this.props.handlers.onProjectNamespaceAccept}
            fetchMatchingNamespaces={this.props.handlers.fetchMatchingNamespaces} />
          <DataVisibility
            value={this.props.model.meta.visibility}
            visibilities={this.props.visibilities}
            onChange={this.props.handlers.onVisibilityChange} />
          <br/>
          <Button color="primary" onClick={this.props.handlers.onSubmit}>
            Create
          </Button>
        </form>
      </Col></Row>
    ]
  }
}

class ProjectTag extends Component {
  render() {
    return <span><Badge color="primary">{this.props.tag}</Badge>&nbsp;</span>;
  }
}

function sortedTagList(taglistOrNull) {
  const taglist = taglistOrNull || [];
  const tlSet = new Set(taglist);
  const tl = Array.from(tlSet);
  tl.sort();
  return tl;
}

class ProjectTagList extends Component {
  render() {
    const taglist = sortedTagList(this.props.taglist);
    return (taglist.length > 0) ? taglist.map(t => <ProjectTag key={t} tag={t} />) : <br />;
  }
}

class ImageBuildInfo extends Component {
  render() {
    const imageBuild = this.props.imageBuild || {status: 'success'};
    const imageBuildAlert = imageBuild.status === 'success' ? null :
      <Alert color={imageBuildAlertColor[imageBuild.status]}>
        <p style={{float:'left'}}>{imageBuildStatusText[imageBuild.status] || imageBuildStatusText['failed']}</p>
        <p style={{float:'right'}}>
          <ExternalLink url={`${this.props.externalUrl}/-/jobs/${imageBuild.id}`} title="View in GitLab" />
          &nbsp;
          <Button
            color={imageBuildAlertColor[imageBuild.status]}
            onClick={this.props.onProjectRefresh}>Refresh</Button>
        </p>
        <div style={{clear: 'left'}}></div>
      </Alert>;
    return imageBuildAlert
  }
}

class ImageBuildInfoBadge extends Component {
  render() {
    const imageBuild = this.props.imageBuild || {status: 'success'};
    if (imageBuild.status === 'success') return null;
    return <Link className={`badge badge-${imageBuildAlertColor[imageBuild.status]}`}
      title={imageBuildStatusText[imageBuild.status] || imageBuildStatusText['failed']}
      to={this.props.notebooksUrl}>Notebooks</Link>
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
        <p style={{float:'left'}}> Do you want to create a pending change for branch <b>{branch.name}</b>?</p>
        <p style={{float:'right'}}>
          &nbsp; <ExternalLink url={`${this.props.externalUrl}/tree/${branch.name}`} title="View in GitLab" />
          &nbsp; <Button color="success" onClick={(e) => {
            this.handleCreateMergeRequest(e, this.props.onCreateMergeRequest, branch)
          }}>Create Pending Change</Button>
          {/*TODO: Enable the 'no' option once the alert can be dismissed permanently!*/}
          {/*&nbsp; <Button color="warning" onClick={this.props.createMR(branch.iid)}>No</Button>*/}
        </p>
        <div style={{clear: 'left'}}></div>
      </Alert>
    });
    return mrSuggestions
  }
}

class ProjectViewHeader extends Component {

  render() {

    const core = this.props.core;
    const system = this.props.system;
    const starButtonText = this.props.starred ? 'unstar' : 'star';
    const starIcon = this.props.starred ? faStarSolid : faStarRegular;
    return (
      <Container fluid>
        <MergeRequestSuggestions externalUrl={this.props.externalUrl} canCreateMR={this.props.canCreateMR}
          onCreateMergeRequest={this.props.onCreateMergeRequest} suggestedMRBranches={this.props.suggestedMRBranches} />
        <Row>
          <Col xs={12} md={9}>
            <h1>{core.title}</h1>
            <p>
              <span className="lead">{core.description}</span> <br />
              <TimeCaption key="time-caption" time={core.last_activity_at} />
            </p>
          </Col>
          <Col xs={12} md={3}>
            <p className="text-md-right">
              <ProjectTagList taglist={system.tag_list} />
            </p>
            <div className="d-flex flex-md-row-reverse">
              <div className={`fixed-width-${this.props.starred ? '120' : '100'}`}>
                <form className="input-group input-group-sm">
                  <div className="input-group-prepend">
                    <button className="btn btn-outline-primary" onClick={this.props.onStar}>
                      <FontAwesomeIcon icon={starIcon} /> {starButtonText}
                    </button>
                  </div>
                  <input className="form-control border-primary text-right"
                    placeholder={system.star_count} aria-label="starCount" readOnly={true}/>
                </form>
              </div>
            </div>
            <div className="d-flex flex-md-row-reverse pt-3">
              <div>
                <ExternalLink url={this.props.externalUrl} title="View Project in GitLab" />
              </div>
              <div>&nbsp;</div>
              <div>
                {this.props.launchNotebookServerButton}
              </div>
            </div>
            <p className="text-md-right pt-3">
              <ImageBuildInfoBadge notebooksUrl={this.props.notebooksUrl} imageBuild={this.props.imageBuild} />
            </p>
          </Col>
        </Row>
      </Container>
    )
  }
}

class ProjectNav extends Component {

  render() {
    return (
      <Nav pills className={'nav-pills-underline'}>
        <NavItem>
          <RenkuNavLink to={this.props.overviewUrl} title="Overview" />
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
          <RenkuNavLink exact={false} to={this.props.settingsUrl} title="Settings" />
        </NavItem>
      </Nav>)
  }
}

class ProjectFilesNav extends Component {

  render() {
    return (
      <Nav pills className={'flex-column'}>
        <NavItem><RenkuNavLink to={this.props.filesUrl} title="All" /></NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.dataUrl} title="Data" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.notebooksUrl} title="Notebooks" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.workflowsUrl} title="Workflows" />
        </NavItem>
      </Nav>)
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

// class ProjectViewStats extends Component {
//
//   render() {
//     const lastActivityAt = this.props.lastActivityAt;
//     return [
//       <h3 key="header">Stats</h3>,
//       <TimeCaption key="time-caption" time={lastActivityAt} />,
//       <p key="stats">
//         <b>Kus</b> 5; 1 closed, 2 active<br />
//         <b>Contributors</b> 3<br />
//         <b>Notebooks</b> 3
//       </p>,
//     ]
//   }
// }

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
    return <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" readme={this.props.data.readme} {...this.props} /></Col>
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
          render={props => this.props.kuView(props) }/>
      </Col>
    ]
  }
}

class ProjectMergeRequestList extends Component {

  render() {
    return [
      <Col key="mrList" sm={12} md={4} lg={3} xl={2}>
        {this.props.mrList}
      </Col>,
      <Col key="mr" sm={12} md={8} lg={9} xl={10}>
        <Route path={this.props.mrUrl}
          render={props => this.props.mrView(props) }/>
      </Col>
    ]
  }
}

class FileFolderTableRow extends Component {
  render() {
    const p = this.props.path;
    const url = `${this.props.linkUrl}/${p}`;
    const alert = this.props.alert;
    const mrIid = this.props.mrIid;
    return <tr key={p}><td><Link to={url}>{p}</Link> {alert} {mrIid}</td></tr>
  }
}

class FileFolderList extends Component {
  render() {
    const blacklist = this.props.blacklist || [/^\..*/, /\/\..*/];
    const paths = filterPaths(this.props.paths || [], blacklist)

    const alertIcon = <div className="simple-tooltip">
      <FontAwesomeIcon icon={faExclamationCircle} />
      <span className="tooltiptext">This file has pending changes!</span>
    </div>;
    let alerts, mrIids;
    if (this.props.alerts) {
      alerts = this.props.alerts.map((el) => el ? alertIcon : '');
      mrIids = this.props.mrIids;
    }
    else {
      alerts = paths.map(() => '');
      mrIids = paths.map(() => []);
    }

    const linkUrl = this.props.linkUrl;
    const rows = paths.map((p, i) =>
      <FileFolderTableRow key={p} path={p} alert={alerts[i]} mrIid={mrIids[i]} linkUrl={linkUrl} />)
    return <Table>
      <tbody>{rows}</tbody>
    </Table>
  }
}

class AnnotatedFileFolderList extends Component {
  render() {
    const paths = this.props.paths;
    const alerts = this.props.paths ?
      paths.map(path => this.props.annotations.modifiedFiles[path] !== undefined) : undefined;
    const mrIids = paths ?
      paths.map(path => {
        if (!this.props.annotations.modifiedFiles[path]) return [];
        return this.props.annotations.modifiedFiles[path].map((mrInfo, i) => {
          return <Link key={i} to={`${this.props.mrOverviewUrl}/${mrInfo.mrIid}`}>&nbsp;[{mrInfo.source_branch}]</Link>;
        });
      }) : undefined;

    const headertext = this.props.headertext || "Lineage and Usage";
    return [
      <div key="header" className="d-flex justify-content-between">
        <div><h3>{headertext}</h3></div>
      </div>,
      <FileFolderList key="filelist"
        paths={paths}
        alerts={alerts}
        mrIids={mrIids}
        linkUrl={this.props.linkUrl} />
    ]
  }
}

class NotebookFolderList extends Component {
  render() {
    return [
      <ImageBuildInfo key="imagebuild" imageBuild={this.props.imageBuild}
        externalUrl={this.props.externalUrl}
        onProjectRefresh={this.props.onProjectRefresh} />,
      <AnnotatedFileFolderList key="filelist"
        headertext="Notebooks"
        paths={this.props.paths}
        annotations={this.props.files}
        linkUrl={this.props.fileContentUrl}
        mrOverviewUrl={this.props.mrOverviewUrl} />
    ]
  }
}

class ProjectFilesCategorizedList extends Component {
  render() {
    const files = this.props.files;
    const loading = isRequestPending(this.props, 'files');
    const allFiles = files.all || []
    if (loading && Object.keys(allFiles).length < 1) {
      return <Loader />
    }
    return <Switch>
      <Route path={this.props.notebooksUrl} render={props => {
        return <NotebookFolderList
          externalUrl={this.props.externalUrl}
          imageBuild={this.props.imageBuild}
          mrOverviewUrl={this.props.mrOverviewUrl}
          onProjectRefresh={this.props.onProjectRefresh}
          paths={files.notebooks}
          files={files}
          fileContentUrl={this.props.fileContentUrl}
        />} }
      />
      <Route path={this.props.dataUrl} render={props =>
        <AnnotatedFileFolderList paths={files.data} annotations={files}
          linkUrl={this.props.lineagesUrl} mrOverviewUrl={this.props.mrOverviewUrl} />}
      />
      <Route path={this.props.workflowsUrl} render={props =>
        <AnnotatedFileFolderList paths={files.workflows} annotations={files}
          linkUrl={this.props.lineagesUrl} mrOverviewUrl={this.props.mrOverviewUrl} />}
      />
      <Route render={props =>
        <AnnotatedFileFolderList paths={files.all} annotations={files}
          linkUrl={this.props.lineagesUrl} mrOverviewUrl={this.props.mrOverviewUrl} />}
      />
    </Switch>
  }
}

class ProjectViewFiles extends Component {

  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    return [
      <Col key="files" sm={12} md={2}>
        <ProjectFilesNav
          notebooksUrl={this.props.notebooksUrl}
          mrOverviewUrl={this.props.mrOverviewUrl}
          dataUrl={this.props.dataUrl}
          filesUrl={this.props.filesUrl}
          workflowsUrl={this.props.workflowsUrl} />
      </Col>,
      <Col key="content" sm={12} md={10}>
        <Switch>
          <Route path={this.props.notebookUrl}
            render={props => this.props.notebookView(props) } />
          <Route path={this.props.lineageUrl}
            render={p => this.props.lineageView(p) } />
          <Route render={props => <ProjectFilesCategorizedList {...props } {...this.props } /> } />
        </Switch>
      </Col>
    ]
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

class ProjectTags extends Component {
  constructor(props) {
    super(props);
    this.state = ProjectTags.getDerivedStateFromProps(props, {});
    this.onValueChange = this.handleChange.bind(this);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  static tagListString(props) {
    const tagList = sortedTagList(props.tag_list)
    return tagList.join(', ');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = {value: ProjectTags.tagListString(nextProps) };
    return {...prevState, ...update};
  }

  handleChange(e) { this.setState({value: e.target.value}); }

  handleSubmit(e) { e.preventDefault(); this.props.onProjectTagsChange(this.state.value); }

  render() {
    const inputField = this.props.settingsReadOnly ?
      <Input readOnly value={this.state.value} /> :
      <Input value={this.state.value} onChange={this.onValueChange} />;
    let submit = (ProjectTags.tagListString(this.props) !== this.state.value) ?
      <Button color="primary">Update</Button> :
      <span></span>
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="project_tags">Project Tags</Label>
        {inputField}
        <FormText>Comma-separated list of tags</FormText>
      </FormGroup>
      {submit}
    </Form>
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
    const update = {value: nextProps.core.description };
    return {...prevState, ...update};
  }

  handleChange(e) { this.setState({value: e.target.value}); }

  handleSubmit(e) { e.preventDefault(); this.props.onProjectDescriptionChange(this.state.value); }

  render() {
    const inputField = this.props.settingsReadOnly ?
      <Input readOnly value={this.state.value} /> :
      <Input value={this.state.value} onChange={this.onValueChange} />;
    let submit = (this.props.core.description !== this.state.value) ?
      <Button color="primary">Update</Button> :
      <span></span>
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="project_tags">Project Description</Label>
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
          <ProjectDescription {...this.props}/>
        </Col>
        <Col xs={12} md={10} lg={6}><RepositoryUrls {...this.props} /></Col>
      </Row>
    </Col>
  }
}

class ProjectView extends Component {

  render() {
    return [
      <Row key="header"><Col xs={12}><ProjectViewHeader key="header" {...this.props} /></Col></Row>,
      <Row key="nav"><Col xs={12}><ProjectNav key="nav" {...this.props} /></Col></Row>,
      <Row key="space"><Col key="space" xs={12}>&nbsp;</Col></Row>,
      <Container key="content" fluid>
        <Row>
          <Route exact path={this.props.overviewUrl}
            render={props => <ProjectViewOverview key="overview" {...this.props} />} />
          <Route path={this.props.kusUrl}
            render={props => <ProjectViewKus key="kus" {...this.props} />} />
          <Route path={this.props.filesUrl}
            render={props => <ProjectViewFiles key="files" {...this.props} />} />
          <Route path={this.props.settingsUrl}
            render={props => <ProjectSettings key="settings" {...this.props} />} />
          <Route path={this.props.mrOverviewUrl}
            render={props => <ProjectMergeRequestList key="files-changes" {...this.props} />} />
          <Route path={this.props.launchNotebookUrl}
            render={this.props.launchNotebookServer}/>
        </Row>
      </Container>
    ]
  }
}

class ProjectListRow extends Component {
  render() {
    const projectsUrl = this.props.projectsUrl;
    const title =
      <Link to={`${projectsUrl}/${this.props.id}`}>
        {this.props.path_with_namespace || 'no title'}
      </Link>
    const description = this.props.description !== '' ? this.props.description : 'No description available';
    return (
      <Row className="project-list-row">
        <Col md={2} lg={1}><Avatar person={this.props.owner} /></Col>
        <Col md={10} lg={11}>
          <p><b>{title}</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<ProjectTagList taglist={this.props.tag_list} /></p>
          <p>{description} <TimeCaption caption="Updated" time={this.props.last_activity_at} /> </p>
        </Col>
      </Row>
    );
  }
}

class ProjectList extends Component {
  render() {
    const loading = this.props.loading || false;
    const projects = this.props.page.projects || [];
    const hasUser = this.props.user && this.props.user.id != null;
    const rows = projects.map((d, i) => <ProjectListRow key={i} projectsUrl={this.props.urlMap.projectsUrl} {...d} />);
    const projectsCol = (projects.length < 1 && loading) ?
      <Col md={{size: 2,  offset: 3}}><Loader /></Col> :
      <Col md={8}>{rows}</Col>
    return [
      <Row key="header">
        <Col md={3} lg={2}><h1>Projects</h1></Col>
        <Col md={2}>
          {
            (hasUser) ?
              <Link className="btn btn-primary" role="button" to={this.props.urlMap.projectNewUrl}>New Project</Link> :
              <span></span>
          }
        </Col>
      </Row>,
      <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="projects">{projectsCol}</Row>,
      <Pagination key="pagination" {...this.props} />
    ]
  }
}

export default { ProjectNew, ProjectView, ProjectList };
export { ProjectListRow, filterPaths };

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

import { Container, Row, Col } from 'reactstrap';
import { Alert, Badge, Button, Form, FormGroup, FormText, Input, Label, Table } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Card, CardBody, CardHeader } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faStarRegular from '@fortawesome/fontawesome-free-regular/faStar'
import faStarSolid from '@fortawesome/fontawesome-free-solid/faStar'
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle'


import ReactMarkdown from 'react-markdown'

import { Avatar, TimeCaption, FieldGroup, RenkuNavLink } from '../utils/UIComponents'

class DataVisibility extends Component {
  render() {
    return <FormGroup>
      <Label>Visibility</Label>
      <Input type="select" placeholder="visibility" value={this.props.value.level} onChange={this.props.onChange}>
        <option value="public">Public</option>
        <option value="restricted">Restricted</option>
      </Input>
    </FormGroup>
  }
}

class ProjectNew extends Component {

  render() {
    const titleHelp = this.props.display.slug.length > 0 ? `Id: ${this.props.display.slug}` : null;
    return [
      <Row key="header"><Col md={8}>
        <h1>New Project</h1>
      </Col></Row>,
      <Row key="body"><Col md={8}>
        <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
          <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the project"
            help={titleHelp} value={this.props.display.title} onChange={this.props.handlers.onTitleChange} />
          <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the project"
            help="A description of the project helps users understand it and is highly recommended."
            value={this.props.display.description} onChange={this.props.handlers.onDescriptionChange} />
          <DataVisibility value={this.props.meta.visibility} onChange={this.props.handlers.onVisibilityChange} />
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

class ProjectTagList extends Component {
  render() {
    const taglist = this.props.taglist || [];
    return (taglist.length > 0) ? taglist.map(t => <ProjectTag key={t} tag={t} />) : <br />;
  }
}

class ProjectViewHeader extends Component {

  render() {

    const mrSuggestions = this.props.suggestedMRBranches.map((branch, i) => {
      return <Alert color="warning" key={i}>
        <p style={{float:'left'}}> Do you want to create a merge request for branch <b>{branch.name}</b>?</p>
        <p style={{float:'right'}}>
          &nbsp; <Button color="link" onClick={(e) => {
          e.preventDefault();
          window.open(`${this.props.externalUrl}/tree/${branch.name}`);
        }
        }>View branch in GitLab</Button>
          &nbsp; <Button color="success" onClick={(e) => {
            e.preventDefault();
            this.props.onCreateMergeRequest(branch)
          }}
          >Create merge request</Button>

          {/*TODO: Enable the 'no' option once the alert can be dismissed permanently!*/}
          {/*&nbsp; <Button color="warning" onClick={this.props.createMR(branch.iid)}>No</Button>*/}
        </p>
        <div style={{clear: 'left'}}></div>
      </Alert>
    });

    const core = this.props.core;
    const system = this.props.system;
    const starButtonText = this.props.starred ? 'unstar' : 'star';
    const starIcon = this.props.starred ? faStarSolid : faStarRegular;
    return (
      <Container fluid>
        {mrSuggestions}
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
            {/*TODO: Adapting the width in a more elegant manner would be nice...*/}
            <div className={`float-md-right fixed-width-${this.props.starred ? '120' : '100'}`}>
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
          <RenkuNavLink exact={false} to={this.props.notebooksUrl} title="Files" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.mrOverviewUrl} title="Merge Requests" />
        </NavItem>
        <NavItem>
          <RenkuNavLink exact={false} to={this.props.settingsUrl} title="Settings" />
        </NavItem>
      </Nav>)
  }
}

class ProjectFilesNav extends Component {

  render() {
    const selected = 'notebooks';
    const dummy = () => { };
    const onWorkflows = dummy;
    const onOther = dummy;

    return (
      <Nav pills className={'flex-column'}>
        <NavItem>
          <RenkuNavLink to={this.props.notebooksUrl} title="Notebooks" />
        </NavItem>
        <NavItem>
          <RenkuNavLink to={this.props.dataUrl} title="Data" />
        </NavItem>
        <NavItem><NavLink href="#" active={selected === 'workflows'}
          onClick={onWorkflows}>Workflows</NavLink></NavItem>
        <NavItem><NavLink href="#" active={selected === 'other'}
          onClick={onOther}>Other</NavLink></NavItem>
      </Nav>)
  }
}

class ProjectViewReadme extends Component {

  render() {
    const readmeText = this.props.readme.text;
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

  render() {
    // return [
    //   <Col key="stats" sm={12} md={3}><br /><ProjectViewStats {...this.props} /></Col>,
    //   <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" {...this.props} /></Col>
    // ]
    // Hide the stats until we can actually get them from the server
    return <Col key="readme" sm={12} md={9}><ProjectViewReadme key="readme" readme={this.props.data.readme} /></Col>
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

class FileFolderList extends Component {
  render() {
    const alertIcon = <div className="simple-tooltip">
      <FontAwesomeIcon icon={faExclamationCircle} />
      <span className="tooltiptext">This file has open modifications!</span>
    </div>;
    let alerts, mrIids;
    if (this.props.alerts) {
      alerts = this.props.alerts.map((el) => el ? alertIcon : '');
      mrIids = this.props.mrIids;
    }
    else {
      alerts = this.props.paths.map(() => '');
      mrIids = this.props.paths.map(() => []);
    }
    const emptyView = this.props.emptyView;
    if ((this.props.paths.length < 1) && emptyView != null) return emptyView;
    const rows = this.props.paths.map((p, i) => {
      return <tr key={p}><td><Link to={p}>{p}</Link> {alerts[i]} {mrIids[i]}</td></tr>
    });
    return <Table>
      <tbody>{rows}</tbody>
    </Table>
  }
}

class ProjectFilesCategorizedList extends Component {
  render() {
    const alerts = this.props.files.notebooks ?
      this.props.files.notebooks.map(path => this.props.files.modifiedFiles[path] !== undefined) : undefined;
    const mrIids = this.props.files.notebooks ?
      this.props.files.notebooks.map(path => {
        if (!this.props.files.modifiedFiles[path]) return [];
        return this.props.files.modifiedFiles[path].map((mrIid, i) => {
          return <Link key={i} to={`/projects/${this.props.id}/mergeRequests/${mrIid}`}>&nbsp;{mrIid}</Link>;
        });
      }) : undefined;

    return <Switch>
      <Route path={this.props.notebooksUrl} render={props => {
        return <FileFolderList
          paths={this.props.files.notebooks}
          alerts={alerts}
          mrIids={mrIids}
          emptyView={this.props.launchNotebookServerButton}
        /> }}
      />
      <Route path={this.props.dataUrl} render={props => <FileFolderList paths={this.props.files.data} /> } />
      <Route render={() => <p>Files</p> } />
    </Switch>
  }
}

class ProjectViewFiles extends Component {

  render() {
    return [
      <Col key="files" sm={12} md={2}>
        <ProjectFilesNav
          notebooksUrl={this.props.notebooksUrl}
          dataUrl={this.props.dataUrl} />
      </Col>,
      <Col key="notebook" sm={12} md={10}>
        <Switch>
          <Route path={this.props.notebookUrl}
            render={props => this.props.notebookView(props) } />
          <Route path={this.props.datumUrl}
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
    return props.tag_list.join(', ');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = {value: ProjectTags.tagListString(nextProps) };
    return {...prevState, ...update};
  }

  // N.b. This works in react 16.2, but has been deprecated in favor in getDerivedStateFromProps in 16.3
  // TODO Remove this method when we switch to React 16.3
  componentWillReceiveProps(nextProps) {
    this.setState(ProjectTags.getDerivedStateFromProps(nextProps, this.state));
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

  // N.b. This works in react 16.2, but has been deprecated in favor in getDerivedStateFromProps in 16.3
  componentWillReceiveProps(nextProps) {
    this.setState(ProjectDescription.getDerivedStateFromProps(nextProps, this.state));
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
          <ProjectTags tag_list={this.props.system.tag_list}
            onProjectTagsChange={this.props.onProjectTagsChange}
            settingsReadOnly={this.props.settingsReadOnly} />
        </Col>
        <Col xs={12} md={10} lg={6}><RepositoryUrls {...this.props} /></Col>
      </Row>
      <Row>
        <Col xs={12} md={10} lg={6}>
          <ProjectDescription {...this.props}/>
        </Col>
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
            render={props => <ProjectViewOverview key="overview" {...this.props} /> }/>
          <Route path={this.props.kusUrl}
            render={props => <ProjectViewKus key="kus" {...this.props} /> }/>
          <Route path={this.props.notebooksUrl}
            render={props => <ProjectViewFiles key="files-notebook" {...this.props} /> }/>
          <Route path={this.props.dataUrl}
            render={props => <ProjectViewFiles key="files-data" {...this.props} /> }/>
          <Route path={this.props.settingsUrl}
            render={props => <ProjectSettings key="settings" {...this.props} /> }/>
          <Route path={this.props.mrOverviewUrl}
            render={props => <ProjectMergeRequestList key="settings" {...this.props} /> }/>
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
    const projects = this.props.projects;
    const hasUser = this.props.user && this.props.user.id != null;
    const rows = projects.map((d, i) => <ProjectListRow key={i} projectsUrl={this.props.urlMap.projectsUrl} {...d} />);
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
      <Row key="projects"><Col md={8}>{rows}</Col></Row>
    ]
  }
}

export default { ProjectNew, ProjectView, ProjectList };
export { ProjectListRow };

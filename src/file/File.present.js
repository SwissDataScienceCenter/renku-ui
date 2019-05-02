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

import React from 'react';
import ReactDOM from 'react-dom';
import NotebookPreview from '@nteract/notebook-render';

// Do not import the style because this does not work after webpack bundles things for production mode.
// Instead define the style below
//import './notebook.css'
import { Button, Row, Col, Tooltip, Card, CardHeader, CardBody, Badge } from 'reactstrap';
import '../../node_modules/highlight.js/styles/atom-one-light.css'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faProjectDiagram from '@fortawesome/fontawesome-free-solid/faProjectDiagram'
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';

import {  FilePreview } from './File.container';
import { API_ERRORS } from '../api-client';


class ShowFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: null, error: null }
  }

  // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
  componentDidMount() {
    this._isMounted = true;
    this.retrieveFile()
  }

  componentWillUnmount() { this._isMounted = false; }

  retrieveFile() {
    const branchName = this.props.branchName || 'master';
    let filePath = this.props.filePath.replace(this.props.match.url + '/files/blob/', '')
    this.props.client.getRepositoryFile(this.props.projectId, filePath, branchName, 'base64')
      .catch(e => {
        if (e.case === API_ERRORS.notFoundError) {
          this.setState({error:"ERROR 404: The file with path '"+ this.props.filePath +"' does not exist."})
        }
        else this.setState({error:"Could not load file with path "+this.props.filePath})
      })
      .then(json => {
        if (!this._isMounted) return;
        if(!this.state.error)
          this.setState({file:json});
      });
  }

  render() {
    if (this.state.error !== null){
      let filePath = this.props.filePath.replace(this.props.match.url + '/files/blob/', '')
      let buttonGraph = this.props.lineagesPath !== undefined ? 
        <span>
          <Tooltip placement="top" isOpen={this.state.tooltipGraphViewOpen} target="TooltipGraphView">
            Graph View
          </Tooltip>
          <FontAwesomeIcon className="icon-link" icon={faProjectDiagram} 
            id="TooltipGraphView"
            onClick={()=> { 
              this.props.history.push(this.props.lineagesPath+'/'+filePath)} }
            onMouseEnter={() => {
              this.setState({ tooltipGraphViewOpen: true });
            }} 
            onMouseLeave={() => {
              this.setState({ tooltipGraphViewOpen: false });
            }} /> 
        </span>
        : null;

      let buttonGit = <span>
        <Tooltip placement="top" isOpen={this.state.tooltipGitViewOpen} target="TooltipGitView">
            Open in GitLab
        </Tooltip>
        <a href={`${this.props.externalUrl}/blob/master/${filePath}`} 
          role="button" 
          target="_blank"
          rel="noreferrer noopener"
          id="TooltipGitView"
          onMouseEnter={() => {
            this.setState({ tooltipGitViewOpen: true });
          }} 
          onMouseLeave={() => {
            this.setState({ tooltipGitViewOpen: false });
          }}>
          <FontAwesomeIcon className="icon-link" icon={faGitlab} /> 
        </a>
      </span>

      return  <Card>
        <CardHeader className="align-items-baseline">
          {this.props.filePath.split('\\').pop().split('/').pop()}
          <span className="caption align-baseline">&nbsp;File view</span>
          <div className="float-right" >
            {buttonGit}
            {buttonGraph}
          </div>
        </CardHeader>
        <CardBody>{this.state.error}</CardBody>
      </Card>;
    } 

    if (this.state.file == null) return <Card>
      <CardHeader className="align-items-baseline">&nbsp;</CardHeader>
      <CardBody>{"Loading..."}</CardBody>
    </Card>;
    
    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS? 
      <Badge className="lfs-badge" color="light">LFS</Badge> : null;
         
    const filePath = this.props.filePath.replace(this.props.match.url + '/files/blob/', '')
    const buttonGraph = this.props.lineagesPath !== undefined ? 
      <span>
        <Tooltip placement="top" isOpen={this.state.tooltipGraphViewOpen} target="TooltipGraphView">
          Graph View
        </Tooltip>
        <FontAwesomeIcon className="icon-link" icon={faProjectDiagram} 
          id="TooltipGraphView"
          onClick={()=> { 
            this.props.history.push(this.props.lineagesPath+'/'+filePath) 
          }} 
          onMouseEnter={() => {
            this.setState({ tooltipGraphViewOpen: true });
          }} 
          onMouseLeave={() => {
            this.setState({ tooltipGraphViewOpen: false });
          }} /> 
      </span>
      : null;

    const buttonGit = <span>
      <Tooltip placement="top" isOpen={this.state.tooltipGitViewOpen} target="TooltipGitView">
          Open in GitLab
      </Tooltip>
      <a href={`${this.props.externalUrl}/blob/master/${filePath}`} 
        role="button" 
        target="_blank"
        rel="noreferrer noopener"
        id="TooltipGitView"
        onMouseEnter={() => {
          this.setState({ tooltipGitViewOpen: true });
        }} 
        onMouseLeave={() => {
          this.setState({ tooltipGitViewOpen: false });
        }}>
        <FontAwesomeIcon className="icon-link" icon={faGitlab} /> 
      </a>
    </span>

    const buttonJupyter = filePath.endsWith(".ipynb") ? 
      <FilePreview
        getNotebookButton={true}
        file={this.state.file}
        {...this.props}
      /> : null; 
      

    return (
      <Card>
        <CardHeader className="align-items-baseline">
          {isLFSBadge}
          {this.props.filePath.replace(this.props.match.url + '/files/blob/', '')}
          <span className="caption align-baseline">&nbsp;File view</span>
          <div className="float-right" >
            {buttonJupyter}
            {buttonGit}
            {buttonGraph}
          </div>
        </CardHeader>
        <CardBody>
          <FilePreview
            file={this.state.file}
            {...this.props}
          />
        </CardBody>
      </Card>
    )
  }
}

class StyledNotebook extends React.Component {

  componentDidMount() {
    /*  eslint-disable-next-line react/no-find-dom-node */
    const domNode = ReactDOM.findDOMNode(this.notebook);
    this.fixUpDom(domNode);
  }

  fixUpDom(domNode) {
    // TODO go through the dom and modify the nodes, e.g., with D3
    // console.log(domNode);
  }

  render() {
    const notebookStyle = `
    .jupyter .output img {
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      display: block;
    }
    `;

    return [
      <style key="notebook-style">{notebookStyle}</style>,
      <NotebookPreview
        key="notebook"
        ref={c => { this.notebook = c }}
        defaultStyle={false}
        loadMathjax={false}
        notebook={this.props.notebook}
        showCode={this.props.showCode} />]
  }
}

class LaunchNotebookButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      serverRunning: false
    };
    this.state.showTooltip = false;
  }

  componentDidMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.props.notebookServerAPI === this.previousNotebookServerAPI) return;
    if (!this.props.notebookServerAPI) return;

    // TODO: Method setServerStatus in LaunchNotebookServer component does the
    // TODO: same. Move to client library.
    const headers = this.props.client.getBasicHeaders();
    this.props.client.clientFetch(this.props.notebookServerAPI, { headers })
      .then(response => {
        const serverStatus = !(!response.data.pending && !response.data.ready);
        this.setState({serverRunning: serverStatus})
      })
      .catch(e => {
        console.log("Unexpected error in LaunchNotebook button", e)
      });
    this.previousNotebookServerAPI = this.props.notebookServerAPI;
  }

  render() {
    if (!this.props.notebookServerUrl) return null;

    const props = this.props;
    const label = props.label || 'Open Notebook';
    const className = props.className;

    // Create a tooltip that will explain the deactivated button
    const message = this.props.user.id ?
      "You have to launch Jupyter in Notebook Servers":
      "Please login to open notebooks"
    const tooltip = this.state.serverRunning ? null :
      <Tooltip
        id="JupyterButtonTooltip"
        target="tooltipButton"
        placement="top"
        isOpen={this.state.showTooltip}
      >
        {message}
      </Tooltip>

    const externalUrl = this.props.deploymentUrl || this.props.notebookServerUrl;

    return this.props.iconView ? 
      <span>
        {tooltip}
        <span disabled={!this.state.serverRunning}
          onClick={event => {
            event.preventDefault();
            window.open(externalUrl);
          }}  
          id="tooltipButton"
          onMouseEnter={() => {
            this.setState({ showTooltip: true });
            // just a dirty trick because the mouseout event does not fire...
            setTimeout(() => this.setState({ showTooltip: false }), 3000)
          }}
          role="button" target="_blank"
          rel="noreferrer noopener">
          <svg aria-hidden="true" 
            data-prefix="fas" 
            className="jupyter-icon fa-w-20 icon-link" 
            role="img" xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 640 512"/>
        </span> 
      </span>
      :
      <div>
        {tooltip}
        <Button
          id="tooltipButton"
          onMouseEnter={() => {
            this.setState({ showTooltip: true });
            // just a dirty trick because the mouseout event does not fire...
            setTimeout(() => this.setState({ showTooltip: false }), 3000)
          }}
          disabled={!this.state.serverRunning}
          className={className}
          color="primary" onClick={event => {
            event.preventDefault();
            window.open(externalUrl);
          }}>
          {label}
        </Button>
      </div>
  }
}

const JupyterNotebookButton = props => {
  if(props.notebook == null) return null;
  return  <LaunchNotebookButton
    className="deployButton float-right"
    key="launchbutton"
    deploymentUrl={props.deploymentUrl}
    notebookServerUrl={props.notebookServerUrl}
    notebookServerAPI={props.notebookServerAPI}
    client={props.client}
    label="Open Notebook"
    user={props.user}
  />
}

const JupyterNotebookButtonIcon = props => {
  if(props.notebook == null) return null;
  return  <LaunchNotebookButton
    className="deployButton float-right"
    key="launchbutton"
    iconView={true}
    deploymentUrl={props.deploymentUrl}
    notebookServerUrl={props.notebookServerUrl}
    notebookServerAPI={props.notebookServerAPI}
    client={props.client}
    label="Open Notebook"
    user={props.user}
  />
}

const JupyterNotebookBody = props => {
  if (props.notebook == null) return <div>Loading...</div>;
  return <StyledNotebook key="notebook" notebook={props.notebook} showCode={true}/>;
}

const JupyterNotebookPresent = props => {

  if (props.notebook == null) return <div>Loading...</div>;

  return [
    <Row key="controls">
      <Col>
        <LaunchNotebookButton
          className="deployButton float-right"
          key="launchbutton"
          deploymentUrl={props.deploymentUrl}
          notebookServerUrl={props.notebookServerUrl}
          notebookServerAPI={props.notebookServerAPI}
          client={props.client}
          label="Open Notebook"
          user={props.user}
        />
      </Col>
    </Row>,
    <Row key="notebook">
      <Col>
        <StyledNotebook key="notebook" notebook={props.notebook} showCode={true}/>
      </Col>
    </Row>
  ]
};

export { 
  JupyterNotebookPresent, 
  LaunchNotebookButton, 
  ShowFile, 
  JupyterNotebookBody, 
  JupyterNotebookButton, 
  JupyterNotebookButtonIcon 
};

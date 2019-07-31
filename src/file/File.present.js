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
import { Link }  from 'react-router-dom';
import NotebookPreview from '@nteract/notebook-render';

// Do not import the style because this does not work after webpack bundles things for production mode.
// Instead define the style below
//import './notebook.css'
import { UncontrolledTooltip, Card, CardHeader, CardBody, Badge } from 'reactstrap';
import '../../node_modules/highlight.js/styles/atom-one-light.css'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faProjectDiagram from '@fortawesome/fontawesome-free-solid/faProjectDiagram'
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';

import { FilePreview, LaunchJupyter } from './File.container';
import { API_ERRORS } from '../api-client';


class LaunchJupyterPresent extends React.Component { 
  render() {
    const { notebookUrl, launchNotebookUrl, file } = this.props;
    const icon = (
      <svg 
        aria-hidden="true"
        data-prefix="fas"
        className="jupyter-icon fa-w-20 icon-link"
        role="img" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512" />
    );

    let tooltipText, link;
    if (notebookUrl) {
      tooltipText = "Connect to Jupyter";
      const filePath = file && file.file_path ? file.file_path : null;
      // * Jupyterlab url reference: https://jupyterlab.readthedocs.io/en/stable/user/urls.html
      const url = `${notebookUrl}lab/tree/${filePath}`;
      link = (<a href={url} role="button" target="_blank" rel="noreferrer noopener">{icon}</a>);
    }
    else {
      tooltipText = "Start a Jupyter server";
      link = (<Link to={launchNotebookUrl}>{icon}</Link>);
    }

    return (
      <span>
        <span id="launchJupyterIcon">{link}</span>
        <UncontrolledTooltip placement="top" target="launchJupyterIcon">{tooltipText}</UncontrolledTooltip>
      </span>
    );
  }
}

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
    const filePath = this.props.filePath.replace(this.props.match.url + '/files/blob/', '');
    const buttonGraph = this.props.lineagesPath !== undefined ?
      <span>
        <UncontrolledTooltip placement="top" target="tooltipGraphView">
          Graph View
        </UncontrolledTooltip>
        <Link to={this.props.lineagesPath + '/' + filePath} id="tooltipGraphView">
          <FontAwesomeIcon className="icon-link" icon={faProjectDiagram} id="TooltipFileView"/>
        </Link>
      </span>
      
      : null;

    const buttonGit = <span>
      <UncontrolledTooltip placement="top" target="tooltipGitView">
          Open in GitLab
      </UncontrolledTooltip>
      <a id="tooltipGitView" href={`${this.props.externalUrl}/blob/master/${filePath}`}
        role="button" target="_blank" rel="noreferrer noopener">
        <FontAwesomeIcon className="icon-link" icon={faGitlab} />
      </a>
    </span>

    if (this.state.error !== null){
      return <Card>
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
    const isLFSBadge = isLFS ?
      <Badge className="lfs-badge" color="light">LFS</Badge> :
      null;
    
    const buttonJupyter = this.props.filePath.endsWith(".ipynb") ?
      <LaunchJupyter {...this.props} file={this.state.file} /> :
      null;

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
    // TODO go through the dom and modify the nodes, e.g., with D3
    //this.fixUpDom(ReactDOM.findDOMNode(this.notebook));
  }

  render() {
    if (this.props.notebook == null) return <div>Loading...</div>;

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
        showCode={true}
      />
    ];
  }
}

export { ShowFile, StyledNotebook, LaunchJupyterPresent };

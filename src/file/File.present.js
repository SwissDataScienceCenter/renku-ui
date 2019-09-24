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
import { ListGroup, ListGroupItem } from 'reactstrap';
import '../../node_modules/highlight.js/styles/atom-one-light.css'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faProjectDiagram from '@fortawesome/fontawesome-free-solid/faProjectDiagram'
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';

import { FilePreview } from './index';
import { CheckNotebookStatus, CheckNotebookIcon } from '../notebooks'
import { Loader } from '../utils/UIComponents';
import { Time } from '../utils/Time';

const commitMessageLengthLimit = 120;


/**
 * Display the Card with file information. Has the following parameters:
 *
 * @param {string} gitLabUrl - Url to GitLab.
 * @param {string} filePath - Path of the file
 * @param {Object} commit - Information from GitLab about the commit.
 * @param {Component} buttonGraph - Button to switch to graph view
 * @param {Component} buttonGit - Button to switch to GitLab.
 * @param {Component} buttonJupyter - Button to switch to Jupyter.
 * @param {Object} body - Content to show as the body of the card
 * @param {Component} lfsBadge - Badge to show for LFS (or null)
 */
class FileCard extends React.Component {
  render() {
    let commitHeader = null;
    if (this.props.commit) {
      const commitLinkHref = `${this.props.gitLabUrl}/commit/${this.props.commit.id}`;
      const title = (this.props.commit.title.length > commitMessageLengthLimit) ?
        this.props.commit.title.slice(0, commitMessageLengthLimit) + "..." :
        this.props.commit.title
      commitHeader = <ListGroup flush>
        <ListGroupItem>
          <div className="d-flex justify-content-between flex-wrap">
            <div>
              <a href={commitLinkHref} target="_blank" rel="noreferrer noopener">
                Commit: {this.props.commit.short_id}
              </a> &nbsp;
              {title}
            </div>
            <div className="caption">
              {this.props.commit.author_name} &nbsp;
              {Time.toIsoString(this.props.commit.committed_date)}
            </div>
          </div>
        </ListGroupItem>
      </ListGroup>
    }
    return <Card>
      <CardHeader className="align-items-baseline">
        {this.props.lfsBadge}
        {this.props.filePath}
        <span className="caption align-baseline">&nbsp;File view</span>
        <div className="float-right">
          {this.props.buttonJupyter}
          {this.props.buttonGit}
          {this.props.buttonGraph}
        </div>
      </CardHeader>
      {commitHeader}
      <CardBody>{this.props.body}</CardBody>
    </Card>
  }
}

/**
 * Display a file with some metadata. Has the following parameters:
 *
 * @param {string} externalUrl - Url to GitLab.
 * @param {string} filePath - Path of the file
 * @param {string} gitLabFilePath - Path of the file in gitLab
 * @param {string} lineagesPath - Path to get the lineage
 * @param {Component} buttonJupyter - A button to connect to jupyter
 * @param {Object} file - The file object from GitLab (can be null)
 * @param {Object} commit - The commit object from GitLab (can be null)
 * @param {Object} error - The error object from GitLab (can be null)
 */
class ShowFile extends React.Component {

  render() {
    const gitLabFilePath = this.props.gitLabFilePath;
    const buttonGraph = this.props.lineagesPath !== undefined ?
      <span>
        <UncontrolledTooltip placement="top" target="tooltipGraphView">
          Graph View
        </UncontrolledTooltip>
        <Link to={this.props.lineagesPath + '/' + gitLabFilePath} id="tooltipGraphView">
          <FontAwesomeIcon className="icon-link" icon={faProjectDiagram} id="TooltipFileView"/>
        </Link>
      </span>

      : null;

    const buttonGit = <span>
      <UncontrolledTooltip placement="top" target="tooltipGitView">
          Open in GitLab
      </UncontrolledTooltip>
      <a id="tooltipGitView" href={`${this.props.externalUrl}/blob/master/${gitLabFilePath}`}
        role="button" target="_blank" rel="noreferrer noopener">
        <FontAwesomeIcon className="icon-link" icon={faGitlab} />
      </a>
    </span>

    if (this.props.error !== null) {
      return <FileCard gitLabUrl={this.props.externalUrl}
        filePath={this.props.gitLabFilePath.split('\\').pop().split('/').pop()}
        commit={this.props.commit}
        buttonGraph={buttonGraph}
        buttonGit={buttonGit}
        buttonJupyter={this.props.buttonJupyter}
        body={this.props.error}
        lfsBadge={null} />
    }

    if (this.props.file == null) return <Card>
      <CardHeader className="align-items-baseline">&nbsp;</CardHeader>
      <CardBody>{"Loading..."}</CardBody>
    </Card>;

    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS ?
      <Badge className="lfs-badge" color="light">LFS</Badge> :
      null;

    const body = <FilePreview
      file={this.props.file}
      {...this.props}
    />

    return <FileCard gitLabUrl={this.props.externalUrl}
      filePath={this.props.filePath}
      commit={this.props.commit}
      buttonGraph={buttonGraph}
      buttonGit={buttonGit}
      buttonJupyter={this.props.buttonJupyter}
      body={body}
      lfsBadge={isLFSBadge} />
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

class JupyterButtonPresent extends React.Component {
  render() {
    if (!this.props.access)
      return (<CheckNotebookIcon fetched={true} launchNotebookUrl={this.props.launchNotebookUrl} />);

    if (this.props.updating)
      return (<Loader size="16" inline="true" />);

    return (
      <CheckNotebookStatus
        client={this.props.client}
        model={this.props.model}
        scope={this.props.scope}
        launchNotebookUrl={this.props.launchNotebookUrl}
        filePath={this.props.filePath} />
    );
  }
}

export { StyledNotebook, JupyterButtonPresent, ShowFile };

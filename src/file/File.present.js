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
import ReactMarkdown from 'react-markdown'
import JupyterNotebook from 'react-jupyter';
import { JupyterNotebook as RengaJupyterNotebook } from './File.container';
import { Button } from 'reactstrap';
import hljs from 'highlight.js'
import '../../node_modules/highlight.js/styles/atom-one-light.css'
import './notebook.css'

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
    return <JupyterNotebook ref={c => {this.notebook = c}}
      notebook={this.props.notebook}
      showCode={this.props.showCode} />
  }
}


const JupyterNotebookPresent = props => {

  if (props.notebook == null) return <div>Loading...</div>;

  return <div className="positioned">
    <Button
      className="deployButton"
      color="primary" onClick={event => {
        event.preventDefault();
        props.deploymentUrl ? window.open(props.deploymentUrl) : alert('I\'m sorry, this notebook is not deployed')
      }}>
      Launch Notebook
    </Button>
    <StyledNotebook notebook={props.notebook} showCode={true} />
  </div>;
};


const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'pdf', 'gif'];
const CODE_EXTENSIONS = ['py', 'js', 'json', 'sh', 'r', 'txt',];


// FIXME: Unify the file viewing for kus (embedded) and independent file viewing.
// FIXME: Javascript highlighting is broken for large files.
// FIXME: Fix positioning of input tags when rendering Jupyter Notebooks.

class FilePreview extends React.Component {

  getFileExtension = () => {
    if (!this.props.file) {
      return null
    } else {
      return this.props.file.file_name
        .match(/\.(.*)/)[0]
        .slice(1,)
        .toLowerCase();
    }
  };

  fileIsCode = () => CODE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsImage = () => IMAGE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;

  highlightBlock = () => {
    // FIXME: Usage of findDOMNode is discouraged.
    // eslint-disable-next-line
    const baseNode = ReactDOM.findDOMNode(this);
    hljs.highlightBlock(baseNode);
  };

  componentDidMount(){
    if (this.fileIsCode()) this.highlightBlock()
  }
  componentDidUpdate(){
    if (this.fileIsCode()) this.highlightBlock()
  }

  render(){
    // File has not yet been fetched
    if (!this.props.file) {
      return <p>Loading...</p>;
    }
    // Various types of images
    if (this.fileIsImage()) {
      return <img
        className="image-preview"
        alt={this.props.file.file_name}
        src={'data:image;base64,' + this.props.file.content}
      />;
    }
    // Code with syntax highlighting
    if (this.fileIsCode()) {
      return (
        <pre className={`hljs ${this.getFileExtension()}`}>
          <code>{atob(this.props.file.content)}</code>
        </pre>
      );
    }
    // Markdown
    if (this.getFileExtension() === 'md'){
      return <ReactMarkdown source={atob(this.props.file.content)}/>;
    }
    // Jupyter Notebook
    if (this.getFileExtension() === 'ipynb'){
      return <RengaJupyterNotebook
        notebook={JSON.parse(atob(this.props.file.content))}
        filePath={this.props.file.file_path}
        projectId={this.props.projectId}
        client={this.props.client}/>;
    }

    // File extension not supported
    return <p>{`Unable to preview file with extension .${this.getFileExtension()}`}</p>;
  }
}

export { FilePreview, JupyterNotebookPresent };

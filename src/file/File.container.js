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

import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import ReactDOM from 'react-dom';
import hljs from 'highlight.js';

import { atobUTF8 } from '../utils/Encoding';

import { JupyterNotebookPresent, JupyterNotebookBody, JupyterNotebookButtonIcon } from './File.present';
import { ACCESS_LEVELS } from '../api-client';


class JupyterNotebookContainer extends Component {

  render() {
    let filePath = this.props.filePath;
    let deploymentUrl = null;
    if (filePath && filePath[0] !== '/') filePath = '/' + filePath;


    if (this.props.accessLevel >= ACCESS_LEVELS.DEVELOPER &&
      this.props.justButton && this.props.notebookServerUrl ) {
      deploymentUrl = `${this.props.notebookServerUrl}`
    }

    if(this.props.justBody)
      return <JupyterNotebookBody
        fileName={this.props.filePath.replace(/^.*(\\|\/|:)/, '')}
        notebook={this.props.notebook}
        deploymentUrl={deploymentUrl}
        notebookServerUrl={this.props.notebookServerUrl}
        notebookServerAPI={this.props.notebookServerAPI}
        client={this.props.client}
      />

    if(this.props.justButton)
      return <JupyterNotebookButtonIcon
        fileName={this.props.filePath.replace(/^.*(\\|\/|:)/, '')}
        notebook={this.props.notebook}
        deploymentUrl={deploymentUrl}
        notebookServerUrl={this.props.notebookServerUrl}
        notebookServerAPI={this.props.notebookServerAPI}
        client={this.props.client}
        user={this.props.user}
      />

    return <JupyterNotebookPresent
      fileName={this.props.filePath.replace(/^.*(\\|\/|:)/, '')}
      notebook={this.props.notebook}
      deploymentUrl={deploymentUrl}
      notebookServerUrl={this.props.notebookServerUrl}
      notebookServerAPI={this.props.notebookServerAPI}
      client={this.props.client}
      user={this.props.user}
    />
  }
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'pdf', 'gif'];
const CODE_EXTENSIONS = ['py', 'js', 'json', 'sh', 'r', 'txt','yml','csv','parquet','cwl','job','prn'];
const NO_EXTENSION_FILE = ['Dockerfile','errlog','log']

// FIXME: Unify the file viewing for kus (embedded) and independent file viewing.
// FIXME: Javascript highlighting is broken for large files.
// FIXME: Fix positioning of input tags when rendering Jupyter Notebooks.

class FilePreview extends React.Component {

  getFileExtension = () => {
    if (!this.props.file) {
      return null
    } else {
      if(this.props.file.file_name.match(/\.(.*)/)===null)
        return this.props.file.file_name;
      else return this.props.file.file_name
        .match(/\.(.*)/)[0]
        .slice(1,)
        .toLowerCase();
    }
  };

  fileIsCode = () => CODE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileIsImage = () => IMAGE_EXTENSIONS.indexOf(this.getFileExtension()) >= 0;
  fileHasNoExtension = () => NO_EXTENSION_FILE.indexOf(this.getFileExtension())>=0;

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
      return "Loading...";
    }
    // Various types of images
    if (this.fileIsImage()) {
      if(atob(this.props.file.content).includes("https://git-lfs.github.com/"))
        return "The image can't be previewed because it's stored in Git LFS."
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
          <code>{atobUTF8(this.props.file.content)}</code>
        </pre>
      );
    }
    // Markdown
    if (this.getFileExtension() === 'md'){
      let content = atobUTF8(this.props.file.content);
      return <ReactMarkdown source={content}/>;
    }

    // Jupyter Notebook Button
    if (this.getFileExtension() === 'ipynb' && this.props.getNotebookButton){
      return <JupyterNotebookContainer
        key="notebook-button"
        justButton={true}
        notebook={JSON.parse(atobUTF8(this.props.file.content), (key, value) => Object.freeze(value))}
        filePath={this.props.file.file_path}
        {...this.props}
      />
    }

    // Jupyter Notebook
    if (this.getFileExtension() === 'ipynb'){
      return <JupyterNotebookContainer
        key="notebook-body"
        justBody={true}
        notebook={JSON.parse(atobUTF8(this.props.file.content), (key, value) => Object.freeze(value))}
        filePath={this.props.file.file_path}
        {...this.props}
      />;
    }

    if(this.fileHasNoExtension()){
      return (
        <pre className={`hljs ${this.getFileExtension()}`}>
          <code>{atobUTF8(this.props.file.content)}</code>
        </pre>
      )
    }

    // File extension not supported
    return <p>{`Unable to preview file with extension .${this.getFileExtension()}`}</p>;
  }
}

export { FilePreview, JupyterNotebookContainer as JupyterNotebook };

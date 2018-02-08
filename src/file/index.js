/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renga-ui
 *
 *  file/index.js
 *  Module for file rendering in Renga.
 */

import React from 'react';
import ReactDom from 'react-dom';
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import JupyterNotebook from 'react-jupyter'
import '../../node_modules/highlight.js/styles/atom-one-light.css'


const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'pdf', 'gif'];
const CODE_EXTENSIONS = ['py', 'js', 'json', 'sh', 'r', 'txt',];


// FIXME: Unify the file viewing for kus (embedded) and independent file viewing.
// FIXME: Javascript highlighting is broken for large files.
// FIXME: Fix positioning of input tags when rendering Jupyter Notebooks.

export class FilePreview extends React.Component {

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
    const baseNode = ReactDom.findDOMNode(this);
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
      console.log(atob(this.props.file.content));
      return <JupyterNotebook notebook={JSON.parse(atob(this.props.file.content))} showCode={true}/>;
    }

    // File extension not supported
    return <p>{`Unable to preview file with extension .${this.getFileExtension()}`}</p>;
  }
}

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
import JupyterNotebook from 'react-jupyter';
// Do not import the style because this does not work after webpack bundles things for production mode.
// Instead define the style below
//import './notebook.css'
import { Button } from 'reactstrap';
import '../../node_modules/highlight.js/styles/atom-one-light.css'

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
    .showCode .input:before {
      content: "";
    }

    .showCode .output:before {
      content: "";
    }
    .jupyter .output img {
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      display: block;
    }
    `;
    return [
      <style key="notebook-style">{notebookStyle}</style>,
      <JupyterNotebook
        key="notebook"
        ref={c => {this.notebook = c}}
        defaultStyle={false}
        loadMathjax={false}
        notebook={this.props.notebook}
        showCode={this.props.showCode} />]
  }
}

class LaunchNotebookButton extends React.Component {
  render() {
    if (!this.props.deploymentUrl) return null;

    const props = this.props;
    const label = props.label || 'Launch Notebook';
    const className = props.className;
    return <Button
      className={className}
      color="primary" onClick={event => {
        event.preventDefault();
        window.open(props.deploymentUrl)
      }}>
      {label}
    </Button>
  }
}


const JupyterNotebookPresent = props => {

  if (props.notebook == null) return <div>Loading...</div>;

  return <div className="positioned">
    <LaunchNotebookButton deploymentUrl={props.deploymentUrl} label="Launch Notebook" className="deployButton" />
    <StyledNotebook notebook={props.notebook} showCode={true} />
  </div>;
};

export { JupyterNotebookPresent, LaunchNotebookButton };

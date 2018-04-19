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
import { Button } from 'reactstrap';
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
      showCode={this.props.showCode || true} />
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

export { JupyterNotebookPresent };

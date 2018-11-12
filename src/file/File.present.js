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
import NotebookPreview from '@nteract/notebook-preview';
// Do not import the style because this does not work after webpack bundles things for production mode.
// Instead define the style below
//import './notebook.css'
import { Button, Row, Col, Tooltip } from 'reactstrap';
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
        ref={c => {this.notebook = c}}
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
    this.props.client.clientFetch(this.props.core.notebookServerAPI, {headers})
      .then(response => {
        const serverStatus = !(!response.data.pending && !response.data.ready);
        this.setState({serverRunning: serverStatus})
      });
    this.previousNotebookServerAPI = this.props.notebookServerAPI;
  }

  render() {
    if (!this.props.notebookServerUrl) return null;

    const props = this.props;
    const label = props.label || 'Open Notebook';
    const className = props.className;

    // Create a tooltip that will explain the deactivated button
    const tooltip = this.state.serverRunning ? null :
      <Tooltip
        id="JupyterButtonTooltip"
        target="createPlus"
        placement="bottom"
        isOpen={this.state.showTooltip}
      >
        You have to launch Jupyter first!
      </Tooltip>


    return <div>
      {tooltip}
      <Button
        id="tooltipButton"
        onMouseEnter={() => {
          this.setState({showTooltip: true});
          // just a dirty trick because the mouseout event does not fire...
          setTimeout(() => this.setState({showTooltip: false}), 3000)
        }}
        disabled={!this.state.serverRunning}
        className={className}
        color="primary" onClick={event => {
          event.preventDefault();
          window.open(this.props.notebookServerUrl);
        }}>
        {label}
      </Button>
    </div>
  }
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
          label="Open Notebook"
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

export { JupyterNotebookPresent, LaunchNotebookButton };

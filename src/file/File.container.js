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

import { JupyterNotebookPresent } from './File.present';


class JupyterNotebookContainer extends Component {
  constructor(props){
    super(props);
    this.state = {deploymentUrl: undefined}
  }

  componentDidMount() {
    this.getDetploymentUrl()
  }

  getDetploymentUrl() {
    this.props.client.getDeploymentUrl(this.props.projectId, 'review')
      .then(jupyterhubUrl => {
        const jh = new URL(jupyterhubUrl);
        const url = `${jh.origin}${jh.pathname}/${this.props.filePath}?${jh.search}`;
        this.setState({deploymentUrl: url})
      })
  }

  render() {
    return <JupyterNotebookPresent
      notebook={this.props.notebook}
      deploymentUrl={this.state.deploymentUrl}/>
  }
}

export { JupyterNotebookContainer as JupyterNotebook };

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

/**
 *  incubator-renku-ui
 *
 *  Notebook.js
 *  Container components for rendering notebooks.
 */

import React, { Component } from 'react';

import { JupyterNotebook } from './File.container'


class Show extends Component {
  constructor(props) {
    super(props);
    this.state = {notebook: null}
  }
  componentDidMount() {
    this.retrieveNotebook()
  }

  retrieveNotebook() {
    const branchName = this.props.branchName || 'master';
    this.props.client.getProjectFile(this.props.projectId, this.props.filePath, branchName)
      .then(json => {
        const notebook = JSON.parse(json);
        this.setState({notebook});
      });
  }

  render() {
    if (this.state.notebook == null) return <div>Loading...</div>
    return (<JupyterNotebook
      notebook={this.state.notebook}
      {...this.props}
    />)
  }
}

export default { Show };

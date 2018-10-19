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
import { FileLineage as FileLineagePresent } from './Lineage.present';


class FileLineage extends Component {
  constructor(props){
    super(props);
    this.state = {url: null, dot: null}
  }

  componentDidMount() {
    // TODO This should work a little differently for robustness:
    // - Get the dot/master deployment URL (environment external_url) from gitlab
    // - Get the job from gitlab
    // - Combine the file name from the external_url and the job information to retreive the file
    // TODO: Write a wrapper to make promises cancellable to avoid usage of this._isMounted
    this._isMounted = true;
    this.retrieveArtifact('dot', 'graph.dot');
  }

  componentWillUnmount() { this._isMounted = false;  }

  // TODO: This method is not used!!! Should it?
  // retrieveDeploymentUrl() {
  //   this.props.client
  //     .getDeploymentUrl(this.props.projectId, 'dot', this.props.filePath)
  //     .then(url => this.retrieveGraph(url))
  // }

  async retrieveArtifact(job, artifact) {
    const [url, r] = await this.props.client.getArtifact(this.props.projectId, job, artifact);
    const dot = await r.text();
    if (this._isMounted) this.setState({url, dot});
  }

  render() {
    return <FileLineagePresent dotUrl={this.state.url} dot={this.state.dot} {...this.props} />
  }
}


export { FileLineage };

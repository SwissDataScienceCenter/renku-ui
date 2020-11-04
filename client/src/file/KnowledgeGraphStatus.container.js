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

import React, { Component } from "react";
import { GraphIndexingStatus } from "../project/Project";

import { KnowledgeGraphStatus as KnowledgeGraphStatusPresent } from "./KnowledgeGraphStatus.present";

class KnowledgeGraphStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphStatusPoller: null,
      graphStatusWaiting: false,
      webhookJustCreated: null,
      error: null
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.startPollingProgress();
  }

  componentWillUnmount() {
    if (this._isMounted)
      this.stopPollingProgress();

    this._isMounted = false;
  }

  async startPollingProgress() {
    if (this._isMounted && !this.state.graphStatusPoller) {
      this.props.fetchGraphStatus()
        .then((progress) => {
          if (this._isMounted && !this.state.graphStatusPoller &&
            progress !== GraphIndexingStatus.MAX_VALUE &&
            progress !== GraphIndexingStatus.NO_WEBHOOK) {
            const poller = setInterval(this.checkStatus, 2000);
            this.setState({ graphStatusPoller: poller });
          }
        })
        .catch((err) => {
          this.setState({ error: err });
          this.stopPollingProgress();
        });
    }
  }

  stopPollingProgress() {
    const { graphStatusPoller } = this.state;
    if (this._isMounted && graphStatusPoller) {
      clearTimeout(graphStatusPoller);
      this.setState({ graphStatusPoller: null });
    }
  }


  checkStatus = () => {
    if (this._isMounted && !this.state.graphStatusWaiting) {
      this.setState({ graphStatusWaiting: true });
      this.props.fetchGraphStatus().then((progress) => {
        if (this._isMounted) {
          this.setState({ graphStatusWaiting: false });
          if (progress === GraphIndexingStatus.MAX_VALUE || progress === GraphIndexingStatus.NO_WEBHOOK) {
            this.stopPollingProgress();
            if (progress === GraphIndexingStatus.MAX_VALUE && this.props.fetchAfterBuild)
              this.props.fetchAfterBuild();
          }
        }
      });
    }
  }

  createWebhook(e) {
    this.setState({ webhookJustCreated: true });
    this.props.createGraphWebhook(e).then((data) => {
      if (this._isMounted) {
        // remember that the graph status endpoint is not updated instantly, better adding a short timeout
        setTimeout(() => {
          if (this._isMounted)
            this.startPollingProgress();

        }, 1000);
        // updating this state slightly later avoids UI flickering
        setTimeout(() => {
          if (this._isMounted)
            this.setState({ webhookJustCreated: false });

        }, 1500);
      }
    });
  }

  render() {
    return <KnowledgeGraphStatusPresent
      progress={this.props.progress}
      webhookJustCreated={this.state.webhookJustCreated}
      maintainer={this.props.maintainer}
      createWebhook={this.createWebhook.bind(this)}
      forked={this.props.forked}
      error={this.state.error}
      displaySuccessMessage={this.props.displaySuccessMessage}
      warningMessage={this.props.warningMessage}
      isPrivate={this.props.isPrivate}
    />;
  }
}

export default KnowledgeGraphStatus ;

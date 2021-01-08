/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 *  renku-ui
 *
 *  ProjectOverview.container.js
 *  Container components for project overview.
 */

import React, { Component } from "react";

import { withProjectMapped } from "../Project";
import { OverviewStats as OverviewStatsPresent } from "./ProjectOverview.present";

/**
 * Create a visualization of the project stats.
 *
 * @param {Object} props.projectCoordinator - project coordinator
 * @param {Object[]} props.branches - list of available branches
 */
class OverviewStats extends Component {
  constructor(props) {
    super(props);
    this.projectCoordinator = props.projectCoordinator;

    this.handlers = {
      refreshStatistics: this.refreshStatistics.bind(this)
    };
  }

  componentDidMount() {
    const statistics = this.projectCoordinator.get("statistics");
    if (!statistics.fetching) {
      const now = (new Date()).getTime();
      if (!statistics.fetched || statistics.fetched.getTime() < now - 10 * 1000)
        this.refreshStatistics();
    }
  }

  refreshStatistics() {
    // TODO: refresh all the necessary data once getBranches and getProject go into projectCoordinator
    const statistics = this.projectCoordinator.get("statistics");
    if (!statistics.fetching)
      this.projectCoordinator.fetchStatistics();
  }

  render() {
    const categories = ["statistics", "metadata"];
    const OverviewStatsConnected = withProjectMapped(OverviewStatsPresent, categories);
    return (
      <OverviewStatsConnected
        projectCoordinator={this.projectCoordinator}
        branches={this.props.branches}
      />);
  }
}

export { OverviewStats };

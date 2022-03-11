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

import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import { Loader } from "../../utils/components/Loader";

import { withProjectMapped } from "../Project";
import {
  OverviewCommits as OverviewCommitsPresent, OverviewStats as OverviewStatsPresent
} from "./ProjectOverview.present";
import ProjectVersionStatus from "../status/ProjectVersionStatus.present";


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
      // refresh if not available or older than 10s
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

/**
 * Create a visualization of the project commits.
 *
 * @param {Object} props.location - react location object
 * @param {Object} props.history - react history object
 * @param {Object} props.projectCoordinator - project coordinator
 */
class OverviewCommits extends Component {
  constructor(props) {
    super(props);
    this.projectCoordinator = props.projectCoordinator;

    this.handlers = {
      refreshCommits: this.refreshCommits.bind(this)
    };
  }

  componentDidMount() {
    const commits = this.projectCoordinator.get("commits");
    if (!commits.fetching) {
      const now = (new Date()).getTime();
      // refresh if not available or older than 10s
      if (!commits.fetched || commits.fetched.getTime() < now - 10 * 1000)
        this.refreshCommits();
    }
  }

  refreshCommits() {
    const commits = this.projectCoordinator.get("commits");
    if (!commits.fetching)
      this.projectCoordinator.fetchCommits();
  }

  render() {
    const categories = ["commits", "metadata"];
    const OverviewStatsConnected = withProjectMapped(OverviewCommitsPresent, categories);
    return (
      <OverviewStatsConnected
        projectCoordinator={this.projectCoordinator}
        location={this.props.location}
        history={this.props.history}
      />);
  }
}

function ProjectKGStatus(props) {
  const loading = false;

  let body = null;
  if (loading)
    body = (<Loader />);
  else
    body = props.kgStatusView(true);

  return (
    <Card className="border-rk-light">
      <CardHeader className="bg-white p-3 ps-4">Knowledge Graph Integration</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg">
        <Row>
          <Col>{body}</Col>
        </Row>
      </CardBody>
    </Card>
  );
}

/**
 * Show the project version information
 *
 * @param {Object} props.projectCoordinator - project coordinator
 */
class OverviewVersion extends Component {
  constructor(props) {
    super(props);
    this.projectCoordinator = props.projectCoordinator;
  }

  componentDidMount() {
    this.projectCoordinator.fetchProjectLockStatus();
  }

  render() {
    return <>
      <ProjectVersionStatus {...this.props} />
      <ProjectKGStatus {...this.props} />
    </>;
  }
}

export { OverviewCommits, OverviewStats, OverviewVersion };

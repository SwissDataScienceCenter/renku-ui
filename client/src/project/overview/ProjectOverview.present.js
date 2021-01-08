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
 *  ProjectOverview.present.js
 *  Presentational components for project overview.
 */

import React, { Component } from "react";
import { Card, CardHeader, CardBody, Row, Col, Table } from "reactstrap";
import { default as fileSize } from "filesize";

import { ExternalLink, Loader } from "../../utils/UIComponents";


class OverviewStats extends Component {
  valueOrEmptyOrLoading(value, fetching, readableSize = true) {
    if (fetching)
      return (<Loader size="14" inline="true" />);
    if (value === 0)
      return 0;
    if (value !== null && !isNaN(value))
      return readableSize ? fileSize(value) : value;
    return "";
  }

  render() {
    const { metadata, statistics, branches } = this.props;
    if (metadata.fetching)
      return <Loader />;

    const storageSize = this.valueOrEmptyOrLoading(statistics.data.storage_size, statistics.fetching);
    const repositorySize = this.valueOrEmptyOrLoading(statistics.data.repository_size, statistics.fetching);
    const lfsSize = this.valueOrEmptyOrLoading(statistics.data.lfs_objects_size, statistics.fetching);
    const commitsCount = this.valueOrEmptyOrLoading(statistics.data.commit_count, statistics.fetching, false);

    let info = null;
    if (!metadata.accessLevel) {
      info = (
        <p className="font-italic">
          Since you do not have any permission for this project, some fields may be unavailable.
          <br />You can still find more information in the GitLab UI.
        </p>
      );
    }

    // TODO: provide a refresh button once all the data can be refreshed at once (see container)
    return (
      <Card className="border-0">
        <CardHeader>Project Statistics</CardHeader>
        <CardBody><Row><Col>
          {info}
          <Table className="table-responsive" key="stats-table" size="sm">
            <tbody>
              <tr>
                <th className="align-middle" scope="row">Number of Branches</th>
                <td className="px-3 px-lg-4 align-middle">{branches.length + 1}</td>
                <td>
                  <ExternalLink role="text" showLinkIcon={true}
                    url={`${metadata.repositoryUrl}/branches`} title="Branches in Gitlab" />
                </td>
              </tr>
              <tr>
                <th className="align-middle" scope="row">Number of Forks</th>
                <td className="px-3 px-lg-4 align-middle">{metadata.forksCount}</td>
                <td>
                  <ExternalLink role="text" showLinkIcon={true}
                    url={`${metadata.repositoryUrl}/forks`} title="Forks in Gitlab" />
                </td>
              </tr>
              <tr>
                <th className="align-middle" scope="row">Number of Stars</th>
                <td className="px-3 px-lg-4 align-middle">{metadata.starCount}</td>
                <td>
                  <ExternalLink role="text" showLinkIcon={true}
                    url={`${metadata.repositoryUrl}/-/starrers`} title="Stars in Gitlab" />
                </td>
              </tr>
              <tr>
                <th className="align-middle" scope="row">Number of Commits</th>
                <td className="px-3 px-lg-4 align-middle">{commitsCount}</td>
                <td>
                  <ExternalLink role="text" showLinkIcon={true}
                    url={`${metadata.repositoryUrl}/commits`} title="Commits in Gitlab" />
                </td>
              </tr>
              <tr>
                <th scope="row">Storage Size</th>
                <td className="px-3 px-lg-4 align-middle">{storageSize}</td>
                <td className="align-middle" rowSpan="3">
                  <ExternalLink role="text" showLinkIcon={true}
                    url={metadata.repositoryUrl} title="Sizes in Gitlab" />
                </td>
              </tr>
              <tr>
                <th className="align-middle" scope="row">Repository Size</th>
                <td className="px-3 px-lg-4 align-middle">{repositorySize}</td>
              </tr>
              <tr>
                <th className="align-middle" scope="row">LFS Size</th>
                <td className="px-3 px-lg-4 align-middle">{lfsSize}</td>
              </tr>
            </tbody>
          </Table>
        </Col></Row></CardBody>
      </Card>
    );
  }
}

export { OverviewStats };

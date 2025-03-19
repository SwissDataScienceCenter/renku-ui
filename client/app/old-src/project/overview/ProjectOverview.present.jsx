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

import { Component, Fragment } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroupItem,
  Row,
  Table,
  UncontrolledTooltip,
} from "reactstrap";
import fileSize from "filesize";
import qs from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import BootstrapGitLabIcon from "../../components/icons/BootstrapGitLabIcon";

import { StatusHelper } from "../../model/Model";
import { CommitsView } from "../../components/commits/Commits";
import { Loader } from "../../components/Loader";
import { ExternalLink } from "../../components/ExternalLinks";
import { RefreshButton } from "../../components/buttons/Button";
import Pagination from "../../components/Pagination";

class OverviewStats extends Component {
  valueOrEmptyOrLoading(value, fetching, readableSize = true) {
    if (fetching) return <Loader inline size={16} />;
    if (value === 0) return 0;
    if (value !== null && !isNaN(value))
      return readableSize ? fileSize(value) : value;
    return "";
  }

  render() {
    const { metadata, statistics, branches } = this.props;
    if (metadata.fetching) return <Loader />;

    const storageSize = this.valueOrEmptyOrLoading(
      statistics.data.storage_size,
      statistics.fetching
    );
    const repositorySize = this.valueOrEmptyOrLoading(
      statistics.data.repository_size,
      statistics.fetching
    );
    const lfsSize = this.valueOrEmptyOrLoading(
      statistics.data.lfs_objects_size,
      statistics.fetching
    );
    const commitsCount = this.valueOrEmptyOrLoading(
      statistics.data.commit_count,
      statistics.fetching,
      false
    );
    const branchesCount = !StatusHelper.isUpdating(branches) ? (
      branches.length
    ) : (
      <Loader inline size={16} />
    );

    let info = null;
    if (!metadata.accessLevel) {
      info = (
        <p className="font-italic">
          Since you are not a member of this project, some information may not
          be available.
          <br />
          You can still find more information in the GitLab UI.
        </p>
      );
    }

    // TODO: provide a refresh button once all the data can be refreshed at once (see container)
    return (
      <Card>
        <CardHeader className="bg-white p-3 ps-4">
          Project Statistics
        </CardHeader>
        <CardBody className="lh-lg">
          <Row>
            <Col>
              {info}
              <Table className="table-responsive" key="stats-table" size="sm">
                <tbody>
                  <tr>
                    <th className="align-middle" scope="row">
                      Number of Branches
                    </th>
                    <td className="px-3 px-lg-4 align-middle">
                      {branchesCount}
                    </td>
                    <td>
                      <ExternalLink
                        role="text"
                        showLinkIcon={true}
                        url={`${metadata.repositoryUrl}/-/branches`}
                        title="Branches in GitLab"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="align-middle" scope="row">
                      Number of Forks
                    </th>
                    <td className="px-3 px-lg-4 align-middle">
                      {metadata.forksCount}
                    </td>
                    <td>
                      <ExternalLink
                        role="text"
                        showLinkIcon={true}
                        url={`${metadata.repositoryUrl}/-/forks`}
                        title="Forks in GitLab"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="align-middle" scope="row">
                      Number of Commits
                    </th>
                    <td className="px-3 px-lg-4 align-middle">
                      {commitsCount}
                    </td>
                    <td>
                      <ExternalLink
                        role="text"
                        showLinkIcon={true}
                        url={`${metadata.repositoryUrl}/commits`}
                        title="Commits in GitLab"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Storage Size</th>
                    <td className="px-3 px-lg-4 align-middle">{storageSize}</td>
                    <td className="align-middle" rowSpan="3">
                      <ExternalLink
                        role="text"
                        showLinkIcon={true}
                        url={metadata.repositoryUrl}
                        title="Sizes in GitLab"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="align-middle" scope="row">
                      Repository Size
                    </th>
                    <td className="px-3 px-lg-4 align-middle">
                      {repositorySize}
                    </td>
                  </tr>
                  <tr>
                    <th className="align-middle" scope="row">
                      LFS Size
                    </th>
                    <td className="px-3 px-lg-4 align-middle">{lfsSize}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

class OverviewCommits extends Component {
  render() {
    const { commits, metadata } = this.props;
    const gitlabCommitsUrl = `${metadata.repositoryUrl}/commits`;
    const tooMany =
      commits.error &&
      commits.error.message &&
      commits.error.message.startsWith("Cannot iterate more")
        ? true
        : false;

    const commitBadgeNumber = `${commits.list.length}${tooMany ? "+" : ""}`;
    const badge =
      commits.fetched && !commits.fetching ? (
        <Badge color="primary" className="ms-2">
          {commitBadgeNumber}
        </Badge>
      ) : null;
    const buttonGit = (
      <Fragment>
        <ExternalLink
          role="link"
          id="commitLink"
          title={<BootstrapGitLabIcon className="bi" />}
          url={gitlabCommitsUrl}
          className="text-primary btn p-0 ms-2"
        />
        <UncontrolledTooltip placement="top" target="commitLink">
          Open in GitLab
        </UncontrolledTooltip>
      </Fragment>
    );
    const info =
      commits.error &&
      commits.error.message &&
      commits.error.message.startsWith("Cannot iterate more") ? (
        <OverviewCommitsInfo
          number={commits.list.length}
          url={gitlabCommitsUrl}
        />
      ) : null;

    const body = commits.fetching ? (
      <Loader />
    ) : (
      <OverviewCommitsBody {...this.props} />
    );
    return (
      <Card>
        <CardHeader className="bg-white p-3 ps-4 d-flex">
          <span className="align-text-bottom">Commits</span>
          <div>
            {badge}
            <RefreshButton
              action={commits.refresh}
              updating={commits.fetching}
              message="Refresh commits"
              dataCy="refresh-commits"
            />
            {buttonGit}
          </div>
        </CardHeader>
        <CardBody className="lh-lg">
          {body}
          {info}
        </CardBody>
      </Card>
    );
  }
}

class OverviewCommitsInfo extends Component {
  render() {
    return (
      <ListGroupItem className="commit-object">
        <FontAwesomeIcon icon={faInfoCircle} />
        &nbsp; Cannot load more than {this.props.number} commits. To see the
        full project history,&nbsp;
        <ExternalLink
          role="link"
          id="commitLink"
          title="view in GitLab"
          url={this.props.url}
        />
      </ListGroupItem>
    );
  }
}

class OverviewCommitsBody extends Component {
  constructor(props) {
    super(props);
    const locationPage = qs.parse(props.location.search);
    this.state = {
      currentPage: locationPage.page ? parseInt(locationPage.page) : 1,
      perPage: 25,
    };
  }

  onPageChange(newPage) {
    this.setState({ currentPage: newPage });
    const currentSearch = qs.parse(this.props.location.search);
    const newSearch = qs.stringify({ ...currentSearch, page: newPage });
    this.props.navigate({
      pathname: this.props.location.pathname,
      search: newSearch,
    });
  }

  render() {
    const { commits, metadata } = this.props;
    const { currentPage, perPage } = this.state;

    if (commits.fetching || !commits.fetched) return <Loader />;

    const firstCommit = (currentPage - 1) * perPage;
    const lastCommit = currentPage * perPage;

    return (
      <Fragment>
        <CommitsView
          commits={commits.list.slice(firstCommit, lastCommit)}
          fetched={commits.fetched}
          fetching={commits.fetching}
          error={commits.error}
          urlRepository={metadata.repositoryUrl}
          urlDiff={`${metadata.repositoryUrl}/commit/`}
        />
        <Pagination
          currentPage={currentPage}
          perPage={perPage}
          totalItems={commits.list.length}
          onPageChange={this.onPageChange.bind(this)}
          className="mt-4 d-flex justify-content-center rk-search-pagination pagination-sm"
        />
      </Fragment>
    );
  }
}

export { OverviewStats, OverviewCommits };

// For testing
export { OverviewCommitsBody };

/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
import { Row, Col } from 'reactstrap';
import { Link, Route, Switch } from 'react-router-dom'

class MergeRequestList extends Component {
  render() {
    const rows = this.props.mergeRequests.map((d, i) => {
      const mrUrl = `${this.props.mrOverviewUrl}/${d.iid}`;
      return <Switch key={i}>
        <Route exact path={mrUrl}
          render={() => <MergeRequestListItem active={true} {...d} mrUrl={mrUrl}/> }/>
        <Route path={this.props.mrOverviewUrl}
          render={() => <MergeRequestListItem active={false} {...d} mrUrl={mrUrl}/> }/>
      </Switch>;
    });
    return <Row key="mr"><Col xs={12}>{rows}</Col></Row>
  }
}

class MergeRequestListItem extends Component {
  render() {
    const className = this.props.active ? 'underline-nav font-weight-bold' : 'font-weight-normal';
    const title = this.props.active ?
      <span>{this.props.title}</span> :
      <Link to={this.props.mrUrl}> {this.props.title || 'no title'} </Link>;

    return <Col key="branches" md={9}>
      <p className={className}>{title}</p>
      <p>source: {this.props.source_branch}</p>
      <p>target: {this.props.target_branch}</p>
      <p>status: {this.props.merge_status}</p>
    </Col>
  }
}


class SimpleChange extends Component {
  render() {
    let line;
    if (this.props.new_file) {
      line = `New file: ${this.props.new_path}`
    }
    else if (this.props.deleted_file) {
      line = `Deleted file: ${this.props.new_path}`
    }
    else if (this.props.renamed_file) {
      line = `Renamed file: ${this.props.old_path} --> ${this.props.new_path}`
    }
    else {
      line = `Modified file: ${this.props.new_path}`
    }
    return <p>{line}</p>
  }
}


class NotebookComparisonPresent extends Component {
  render() {
    return (
      <Row>
        <Col className="notebook-comparison" sm={5}>
          {this.props.leftNotebookComponent}
        </Col>
        <Col sm={1}>
        </Col>
        <Col className="notebook-comparison" sm={5}>
          {this.props.rightNotebookComponent}
        </Col>
      </Row>
    )
  }
}


export { MergeRequestList, SimpleChange, NotebookComparisonPresent }

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
 *  renku-ui
 *
 *  shared
 *  Shared components for projects.
 */



import React, { Component } from 'react';

import { Button, Form, FormGroup, FormText, Label } from 'reactstrap';
import { Badge, Input } from 'reactstrap';

class ProjectTag extends Component {
  render() {
    return <span><Badge color="primary">{this.props.tag}</Badge>&nbsp;</span>;
  }
}

function sortedTagList(taglistOrNull) {
  const taglist = taglistOrNull || [];
  const tlSet = new Set(taglist);
  const tl = Array.from(tlSet);
  tl.sort();
  return tl;
}

class ProjectTagList extends Component {
  render() {
    const taglist = sortedTagList(this.props.taglist);
    return (taglist.length > 0) ? taglist.map(t => <ProjectTag key={t} tag={t} />) : <br />;
  }
}

class ProjectTags extends Component {
  constructor(props) {
    super(props);
    this.state = ProjectTags.getDerivedStateFromProps(props, {});
    this.onValueChange = this.handleChange.bind(this);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  static tagListString(props) {
    const tagList = sortedTagList(props.tag_list)
    return tagList.join(', ');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = {value: ProjectTags.tagListString(nextProps) };
    return {...prevState, ...update};
  }

  handleChange(e) { this.setState({value: e.target.value}); }

  handleSubmit(e) { e.preventDefault(); this.props.onProjectTagsChange(this.state.value); }

  render() {
    const inputField = this.props.settingsReadOnly ?
      <Input readOnly value={this.state.value} /> :
      <Input value={this.state.value} onChange={this.onValueChange} />;
    let submit = (ProjectTags.tagListString(this.props) !== this.state.value) ?
      <Button color="primary">Update</Button> :
      <span></span>
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="project_tags">Project Tags</Label>
        {inputField}
        <FormText>Comma-separated list of tags</FormText>
      </FormGroup>
      {submit}
    </Form>
  }
}

export { ProjectTags, ProjectTagList };

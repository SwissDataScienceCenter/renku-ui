/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  ProjectTag.container.js
 *  ProjectTag container and present code.
 */

import React, { Component } from "react";

import { Form, FormGroup, FormText, Label } from "reactstrap";
import { Badge, Input } from "reactstrap";
import { InlineSubmitButton } from "../../utils/components/Button";

class ProjectTag extends Component {
  render() {
    return <span><Badge color="rk-text">{this.props.tag}</Badge>&nbsp;</span>;
  }
}

function sortedTagList(tagListOrNull) {
  const tagList = tagListOrNull || [];
  const tlSet = new Set(tagList);
  const tl = Array.from(tlSet);
  tl.sort();
  return tl;
}

class ProjectTagList extends Component {
  render() {
    const tagList = sortedTagList(this.props.tagList);
    return (tagList.length > 0) ? tagList.map(t => <ProjectTag key={t} tag={t} />) : <br />;
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
    const tagList = sortedTagList(props.tagList);
    return tagList.join(", ");
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = { value: ProjectTags.tagListString(nextProps), pristine: true };
    return { ...update, ...prevState };
  }

  handleChange(e) {
    if (e.target.values !== this.state.value)
      this.setState({ value: e.target.value, updated: false, pristine: false });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ value: this.state.value, updating: true });
    this.props.onProjectTagsChange(this.state.value)
      .then(() => {
        this.setState({ value: this.state.value, updated: true, updating: false });
      });
  }

  render() {
    const inputField = this.props.settingsReadOnly || this.state.updating ?
      <Input id="projectTags" readOnly value={this.state.value} /> :
      <Input id="projectTags" value={this.state.value} onChange={this.onValueChange} />;
    const submitButton = this.props.settingsReadOnly ? null :
      <InlineSubmitButton
        id="update-tag"
        submittingText="Updating"
        doneText="Updated"
        text="Update"
        isDone={this.state.updated}
        isReadOnly={this.state.updating || this.state.pristine}
        isSubmitting={this.state.updating}
        pristine={this.state.pristine}
        tooltipPristine="Modify tag to update value"
      />;
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="projectTags">Project Tags</Label>
        <div className="d-flex">
          {inputField}
          {submitButton}
        </div>
        <FormText>Comma-separated list of tags</FormText>
      </FormGroup>
    </Form>;
  }
}

export { ProjectTags, ProjectTagList };

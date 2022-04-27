/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  Template.js
 *  Template field group component
 */
import React, { Component } from "react";
import TemplateSelector from "../../../utils/components/templateSelector/TemplateSelector";
import { FormGroup } from "reactstrap/lib";

class Template extends Component {
  async componentDidMount() {
    // fetch templates if not available yet
    const { templates, handlers } = this.props;
    if (!templates.fetched && !templates.fetching) {
      let templates = await handlers.getTemplates();
      if (templates && templates.length === 1)
        handlers.setProperty("template", templates[0].id);
    }
  }

  render() {
    const { config, handlers, input, templates, meta } = this.props;
    const error = meta.validation.errors["template"];
    const invalid = error && !input.templatePristine;

    const isFetching = (!input.userRepo && templates.fetching) || (input.userRepo && meta.userTemplates.fetching);
    const noFetchedUserRepo = input.userRepo && !meta.userTemplates.fetched;
    // Pass down templates and repository with the same format to the gallery component
    let listedTemplates, repositories;
    if (input.userRepo) {
      listedTemplates = meta.userTemplates.all;
      repositories = [{ url: meta.userTemplates.url, ref: meta.userTemplates.ref, name: "Custom" }];
    }
    else {
      listedTemplates = templates.all;
      repositories = config.repositories;
    }

    const select = (template) => handlers.setProperty("template", template);

    return (
      <FormGroup className="field-group">
        <TemplateSelector
          repositories={repositories}
          select={select}
          selected={input.template}
          templates={listedTemplates}
          isRequired
          isInvalid={invalid}
          isFetching={isFetching}
          noFetchedUserRepo={noFetchedUserRepo}
          error={error}
        />
      </FormGroup>
    );
  }
}

export default Template;

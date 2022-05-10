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
 *  UserTemplate.js
 *  UserTemplate field group component
 */
import React, { Component, Fragment } from "react";
import { Docs, Links } from "../../../utils/constants/Docs";
import { Button, FormGroup, FormText, Input } from "reactstrap";
import { ErrorLabel, InputHintLabel, InputLabel } from "../../../utils/components/formlabels/FormLabels";
import { CoreErrorAlert } from "../../../utils/components/errors/CoreErrorAlert";

const ErrorTemplateFeedback = ({ templates, meta, input }) => {
  if (input.userRepo)
    templates = meta.userTemplates;
  // check template errors and provide adequate feedback
  let alert = null;
  let error = templates.errors && templates.errors.length ?
    templates.errors[0] :
    null;

  if (error) {
    const fatal = !(templates.all && templates.all.length);
    const suggestion = input.userRepo ?
      null :
      (<span>
        You can try refreshing the page. If the error persists, you should contact the development team on&nbsp;
        <a href={Links.GITTER} target="_blank" rel="noreferrer noopener">Gitter</a> or&nbsp;
        <a href={Links.GITHUB} target="_blank" rel="noreferrer noopener">GitHub</a>.
      </span>);

    // extract message and details
    let details = null, errorObject = null;
    if (typeof error === "string") {
      details = error;
      errorObject = { code: 10000 };
    }
    else {
      const first = error[Object.keys(error)[0]];
      if (typeof error === "string") {
        details = first;
        errorObject = { code: 10000 };
      }
      else {
        details = first.userMessage ? first.userMessage : first.reason;
        errorObject = first;
        if (fatal && !input.userRepo)
          errorObject.code = 10000;
      }
    }
    const message = fatal ?
      "Unable to fetch templates." :
      "Some templates could not be fetched.";

    alert = (<CoreErrorAlert details={details} error={errorObject} message={message} suggestion={suggestion} />);
  }
  return alert;
};

class UserTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      missingUrl: false,
      missingRef: false
    };
  }

  fetchTemplates() {
    const { meta } = this.props;

    // check if url or ref are missing
    const { missingUrl, missingRef } = this.state;
    let newState = {
      missingUrl: false,
      missingRef: false
    };
    if (!meta.userTemplates.url)
      newState.missingUrl = true;
    if (!meta.userTemplates.ref)
      newState.missingRef = true;
    if (missingUrl !== newState.missingUrl || missingRef !== newState.missingRef)
      this.setState(newState);

    // try to get user templates if repository data are available
    if (newState.missingUrl || newState.missingRef)
      return;
    return this.props.handlers.getUserTemplates();
  }

  render() {
    const { meta, handlers, config } = this.props;

    // placeholders and links
    let urlExample = "https://github.com/SwissDataScienceCenter/renku-project-template";
    if (config.repositories && config.repositories.length)
      urlExample = config.repositories[0].url;
    let refExample = "0.1.11";
    if (config.repositories && config.repositories.length)
      refExample = config.repositories[0].ref;
    const templatesDocs = (
      <a href={Docs.rtdReferencePage("templates.html")}
        target="_blank" rel="noopener noreferrer">
        Renku templates
      </a>
    );
    return (
      <Fragment>
        <FormGroup className="field-group">
          <InputLabel isRequired="true" text="Repository URL"/>
          <Input
            type="text"
            value={meta.userTemplates.url}
            onChange={(e) => handlers.setTemplateProperty("url", e.target.value)}
            data-cy="url-repository"
            invalid={this.state.missingUrl} />
          {this.state.missingUrl && <ErrorLabel text="Provide a template repository URL" />}
          <FormText>
            A valid {templatesDocs} repository. E.G. { urlExample }
          </FormText>
        </FormGroup>

        <FormGroup className="field-group">
          <InputLabel isRequired="true" text="Repository Reference"/>
          <Input
            type="text"
            value={meta.userTemplates.ref}
            onChange={(e) => handlers.setTemplateProperty("ref", e.target.value)}
            data-cy="ref-repository"
            invalid={this.state.missingRef} />
          {this.state.missingRef && <ErrorLabel text="Provide a template repository reference" />}
          <InputHintLabel text={`Preferably a tag or a commit.
          A branch is also valid, but it is not a static reference E.G. ${refExample}`} />
        </FormGroup>
        <FormGroup className="field-group">
          <Button
            id="fetch-custom-templates" color="primary" size="sm"
            data-cy="fetch-templates-button"
            onClick={() => this.fetchTemplates()}>Fetch templates
          </Button>
        </FormGroup>
      </Fragment>
    );
  }
}

export default UserTemplate;
export { ErrorTemplateFeedback };

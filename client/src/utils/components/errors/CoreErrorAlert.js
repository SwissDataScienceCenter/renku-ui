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
 *  CoreErrorAlert.js
 *  Error Alert for errors coming from renku-core.
 */

import React, { Fragment, useState } from "react";
import { Button, Collapse } from "reactstrap";

import { RenkuAlert } from "../Alert";
import { ExternalLink } from "../ExternalLinks";

function CoreErrorAlert({
  color = null, details = null, dismissible = false, error = {}, message = null, suggestion = null, title = null
}) {
  const [showError, setShowError] = useState(false);

  const toggleShowError = () => setShowError(!showError);

  // return null if there is no error
  if (!error?.code)
    return null;

  // define parameters
  const legacy = error.code < 0 ? true : false;
  const hasDetails = details || legacy || error.userReference ? true : false;

  if (!color) {
    if (legacy || error.code >= 2000)
      color = "danger";
    else if (error.code >= 1000)
      color = "warning";
    else
      color = "info";
  }

  if (!message) {
    if (legacy)
      message = "An error occurred.";
    else
      message = error.userMessage;
  }

  if (!title) {
    if (legacy || error.code >= 2000)
      title = "Error";
    else
      title = "Warning";
  }

  let info = null;
  if (hasDetails) {
    if (details) {
      info = (<code>{details}</code>);
    }
    else if (legacy) {
      info = (<code>{error.reason}</code>);
    }
    else {
      info = (
        <p className="mb-0">
          You can find more information about this error at the following link:
          <br />
          <ExternalLink url={error.userReference} title={error.userReference} role="text" />
        </p>
      );
    }
  }

  const detailsObject = hasDetails ?
    (<Fragment>
      <Collapse className="mb-2" isOpen={showError}>{info}</Collapse>
      <Button color="link" className="font-italic btn-sm" onClick={toggleShowError}>
        [{showError ? "Hide" : "Show"} details]
      </Button>
    </Fragment>) :
    null;
  const suggestionObject = suggestion ?
    (<div><small>{suggestion}</small></div>) :
    null;

  return (
    <RenkuAlert color={color} dismissible={dismissible} timeout={0}>
      <h3>{title}</h3>
      <p>{message}</p>
      {detailsObject}
      {suggestionObject}
    </RenkuAlert>
  );
}

export { CoreErrorAlert };

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
 * Components for interacting with the notebook server (renku-notebooks)
 *
 */

import React, { Component } from 'react';
import { NotebookAdmin, LaunchNotebookServer } from './Notebooks.container';

class Admin extends Component {
  render() {
    const client = this.props.client;
    // FIXME Using a private field, but this code will all change soon anyway.
    const jupyterHubUrl = client.jupyterhubUrl
    const adminUiUrl = `${jupyterHubUrl}/services/notebooks/ui/`
    return <NotebookAdmin adminUiUrl={adminUiUrl} />
  }
}

export default { Admin };
export { LaunchNotebookServer }

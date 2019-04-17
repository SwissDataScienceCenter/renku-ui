/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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
 *  Notebooks.state.js
 *  Redux-based state-management code.
 */

import { Schema, StateKind, StateModel } from '../model/Model';

const notebooksSchema = new Schema({
  notebooks: {
    schema: {
      polling: {initial: null},
      all: {initial: {}}
    }
  }
});

class NotebooksModel extends StateModel {
  constructor(client) {
    super(notebooksSchema, StateKind.REDUX);
    this.client = client;
  }

  fetchNotebooks(first) {
    if (first) {
      this.setUpdating({notebooks: {all: true}});
    }
    return this.client.getNotebookServers()
      .then(resp => {
        this.set('notebooks.all', resp.data);
      });
  }

  startNotebookPolling() {
    const oldPoller = this.get('notebooks.polling');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        return this.fetchNotebooks();
      }, 3000);
      this.set('notebooks.polling', newPoller);

      // fetch immediatly
      return this.fetchNotebooks(true);
    }
  }

  stopNotebookPolling() {
    const poller = this.get('notebooks.polling');
    if (poller) {
      this.set('notebooks.polling', null);
      clearTimeout(poller);
    }
  }

  stopNotebook(serverName) {
    // manually set the state instead of waiting for the promise to resolve
    const updatedState = {
      notebooks: {
        all: {
          [serverName]: {
            ready: false,
            pending: "stop"
          }
        }
      }
    }
    this.setObject(updatedState);
    return this.client.stopNotebookServer(serverName);
  }
}

export default NotebooksModel;

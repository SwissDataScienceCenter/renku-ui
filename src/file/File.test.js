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
 *  Files.test.js
 *  Tests for file.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import { testClient as client } from '../api-client'
import { generateFakeUser } from '../app-state/UserState.test';
import { ShowFile, JupyterButton } from './File.present';

describe('rendering', () => {
  const users = [
    { type: "anonymous", data: generateFakeUser(true) },
    { type: "logged", data: generateFakeUser() }
  ];

  const props = {
    filePath: "/projects/1/files/blob/myFolder/myNotebook.ipynb",
    match: { url: "/projects/1", params: { id: "1" } },
    launchNotebookUrl: "/projects/1/launchNotebook",
  };

  for (let user of users) {
    it(`renders JupyterButton for ${user.type} user`, () => {
      const div = document.createElement('div');
      // * fix for tooltips https://github.com/reactstrap/reactstrap/issues/773#issuecomment-357409863
      document.body.appendChild(div);
      ReactDOM.render(
        <MemoryRouter>
          <JupyterButton user={user.data} client={client} {...props} />
        </MemoryRouter>, div);
    });

    it(`renders ShowFile for ${user.type} user`, () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      ReactDOM.render(
        <MemoryRouter>
          <ShowFile user={user.data} client={client} {...props} />
        </MemoryRouter>, div);
    });
  }
});

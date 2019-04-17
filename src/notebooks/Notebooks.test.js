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
  * Tests for the notebook server component
  */

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import { Notebooks } from './Notebooks.container';
import { cleanAnnotations, ExpectedAnnotations } from '../api-client/notebook-servers';
import { testClient as client } from '../api-client'
import { generateFakeUser } from '../app-state/UserState.test';

describe('rendering', () => {
  const loggedUser = generateFakeUser();

  it('renders home without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Notebooks client={client} user={loggedUser} />
      </MemoryRouter>, div);
  });
});

describe('notebook server clean annotation', () => {
  const baseAnnotations = ExpectedAnnotations["renku.io"].default;
  it('renku.io default', () => {
    const fakeAnswer = {};
    const elaboratedAnnotations = cleanAnnotations(fakeAnswer, "renku.io");
    const expectedAnnotations = {...baseAnnotations}
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations)); 
  });
  it('renku.io elaborated', () => {
    const namespace = "myCoolNampsace";
    const branch = "anotherBranch"

    const fakeAnswer = { "renku.io/namespace": namespace, "renku.io/branch": branch };
    const elaboratedAnnotations = cleanAnnotations(fakeAnswer, "renku.io");
    const expectedAnnotations = {...baseAnnotations, namespace, branch}
    expect(JSON.stringify(elaboratedAnnotations)).toBe(JSON.stringify(expectedAnnotations)); 
  });
});

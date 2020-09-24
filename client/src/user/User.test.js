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
 *  User.state.js
 *  Tests for user code.
 */

import { Schema } from "../model";
import { userSchema } from "../model/RenkuModels";
import { user as fakeUser } from "../api-client/test-samples";

/**
 * Generate a fake user to be injected in the other tests
 *
 * @param {boolean} anonymous - True to ask for an anonymous user (no id nor username)
 *
 * @returns {object} The user's data
 */
function generateFakeUser(anonymous = false) {
  const globalSchema = new Schema(userSchema);
  let user = globalSchema.createInitialized();

  user.fetched = new Date();
  if (!anonymous) {
    user.logged = true;
    user.data = fakeUser;
  }

  return user;
}

describe("Fake user generation", () => {
  it("Anonymous user", () => {
    const fakeUser = generateFakeUser(true);
    expect(fakeUser.fetched).not.toBeNull();
    expect(fakeUser.logged).toEqual(false);
    expect(fakeUser.data).not.toBeNull();
    expect(Object.keys(fakeUser.data)).not.toBeNull();
    expect(Object.keys(fakeUser.data).length).toEqual(0);
  });
  it("Logged user", () => {
    const fakeUser = generateFakeUser();
    expect(fakeUser.fetched).not.toBeNull();
    expect(fakeUser.logged).toEqual(true);
    expect(fakeUser.data).not.toBeNull();
    expect(Object.keys(fakeUser.data)).not.toBeNull();
    expect(Object.keys(fakeUser.data).length).toBeGreaterThan(0);
    expect(fakeUser.data.username.length).toBeGreaterThan(0);
  });
});

// eslint-disable-next-line
export { generateFakeUser };

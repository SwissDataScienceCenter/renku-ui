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
 *  ProjectNew.test.js
 *  New project test code.
 */

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";

import { StateModel, globalSchema } from "../../model";
import { validateTitle, checkTitleDuplicates, NewProject, ForkProject } from "./index";
import { getDataFromParams } from "./ProjectNew.container";
import { RESERVED_TITLE_NAMES } from "./ProjectNew.state";
import { testClient as client } from "../../api-client";
import { btoaUTF8 } from "../../utils/Encoding";
import { generateFakeUser } from "../../user/User.test";


const fakeHistory = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
});
fakeHistory.push({
  pathname: "/projects",
  search: "?page=1"
});
const fakeLocation = { pathname: "" };

describe("helper functions", () => {
  it("validateTitle", () => {
    // missing title
    expect(validateTitle()).toContain("missing");
    expect(validateTitle("")).toContain("missing");
    expect(validateTitle("anyTitle")).toBe(null);

    // reserved words -- they must be the only word in the sentence to return an error
    for (let i = 0; i < 10; i++) {
      const randomNumber = Math.floor(Math.random() * Math.floor(32));
      const reservedWord = RESERVED_TITLE_NAMES[randomNumber];
      if (randomNumber < RESERVED_TITLE_NAMES.length / 5)
        expect(validateTitle("prefix " + reservedWord)).toBe(null);
      else if (randomNumber > RESERVED_TITLE_NAMES.length / 5 * 4)
        expect(validateTitle(reservedWord + " suffix")).toBe(null);
      else
        expect(validateTitle(reservedWord)).toContain("Reserved");
    }

    // first char
    expect(validateTitle("_underscore")).toContain("must start with a letter or a number");
    expect(validateTitle("1_underscore")).toBe(null);
    expect(validateTitle("an_underscore")).toBe(null);

    // any valid char
    expect(validateTitle("äñ_")).toContain("must contain at least one letter");
    expect(validateTitle("äañ_")).toBe(null);
  });

  it("checkTitleDuplicates", () => {
    const projectsPaths = ["username/exist", "username/exist-different", "group/exist"];

    // no previous projects
    expect(checkTitleDuplicates("exist", "username", [])).toBe(false);
    expect(checkTitleDuplicates("exist", "group", null)).toBe(false);

    // different name
    expect(checkTitleDuplicates("notExists", "username", projectsPaths)).toBe(false);
    expect(checkTitleDuplicates("exist-different", "group", projectsPaths)).toBe(false);

    // same final name
    expect(checkTitleDuplicates("exist", "group", projectsPaths)).toBe(true);
    expect(checkTitleDuplicates("exist-different", "username", projectsPaths)).toBe(true);
    expect(checkTitleDuplicates("existä", "group", projectsPaths)).toBe(true);
    expect(checkTitleDuplicates("exist-äõî-different", "username", projectsPaths)).toBe(true);
  });

  it("getDataFromParams", () => {
    function encode(params) {
      return { data: btoaUTF8(JSON.stringify(params)) };
    }

    let params = { title: "pre-filled" };
    let urlParams = encode(params);

    // title
    let decoded = getDataFromParams(urlParams);
    expect(decoded).toMatchObject(params);

    // complex
    params = {
      title: "test",
      namespace: "renku-qa",
      template: "Custom/python-minimal",
      url: "https://github.com/SwissDataScienceCenter/renku-project-template",
      ref: "0.1.16",
      visibility: "private",
      variables: {
        description: "description here"
      }
    };
    urlParams = encode(params);
    decoded = getDataFromParams(urlParams);
    expect(decoded).toMatchObject(params);
  });
});

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const templates = { custom: false, repositories: [{}] };

  const anonymousUser = generateFakeUser(true);
  const loggedUser = generateFakeUser();
  const users = [{ type: "anonymous", data: anonymousUser }, { type: "logged", data: loggedUser }];

  for (const user of users) {
    it(`renders NewProject without crashing for ${user.type} user`, async () => {
      const div = document.createElement("div");
      // Fix UncontrolledTooltip error. https://github.com/reactstrap/reactstrap/issues/773
      document.body.appendChild(div);
      await act(async () => {
        ReactDOM.render(
          <MemoryRouter>
            <NewProject
              client={client}
              model={model}
              history={fakeHistory}
              location={fakeLocation}
              templates={templates}
              user={user.data}
            />
          </MemoryRouter>
          , div);
      });
    });
  }

  it("renders ForkProject without crashing for logged user", async () => {
    const div = document.createElement("div");
    // Fix UncontrolledTooltip error. https://github.com/reactstrap/reactstrap/issues/773
    document.body.appendChild(div);
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <ForkProject
            client={client}
            model={model}
            history={fakeHistory}
            user={loggedUser}
          />
        </MemoryRouter>
        , div);
    });
  });
});

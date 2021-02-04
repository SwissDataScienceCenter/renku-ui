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
 *  ProjectList.test.js
 *  Tests for project/list.
 */

import React from "react";
import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import TestRenderer, { act } from "react-test-renderer";

import { testClient as client } from "../../api-client";
import { generateFakeUser } from "../../user/User.test";
import { Url } from "../../utils/url";
import { tests } from "./ProjectList.container";
import { ProjectList } from "./";


describe("helper functions", () => {
  it("removeDefaultParams", () => {
    const { removeDefaultParams } = tests.functions;
    const { DEFAULT_PARAMS } = tests.defaults;
    let result;

    // Nothing left when passing only defaults.
    result = removeDefaultParams(DEFAULT_PARAMS);
    expect(result).toMatchObject({});
    expect(Object.keys(result)).toHaveLength(0);

    // Only the modified parameter left.
    result = removeDefaultParams({ ...DEFAULT_PARAMS, page: 123 });
    expect(result).toMatchObject({ page: 123 });
    expect(Object.keys(result)).toHaveLength(1);

    // Remove the `section` parameter correctly.
    result = removeDefaultParams({ ...DEFAULT_PARAMS, page: 123, section: "any" });
    expect(result).toMatchObject({ page: 123, section: "any" });
    expect(Object.keys(result)).toHaveLength(2);
    result = removeDefaultParams({ ...DEFAULT_PARAMS, page: 123, section: "any" }, true);
    expect(result).not.toMatchObject({ page: 123, section: "any" });
    expect(result).toMatchObject({ page: 123 });
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("buildPreciseUrl", () => {
    const { buildPreciseUrl, removeDefaultParams } = tests.functions;
    const { DEFAULT_PARAMS } = tests.defaults;
    const { sectionMap } = tests.maps;
    let result;

    // Contain all the passed parameters and not more.
    result = buildPreciseUrl(DEFAULT_PARAMS);
    for (const [param, value] of Object.entries(DEFAULT_PARAMS))
      expect(result).toContain(`${param}=${value}`);
    result = buildPreciseUrl(removeDefaultParams(DEFAULT_PARAMS));
    expect(result).not.toContain("?");

    // Change the section when `target` is provided.
    const paramsWithSection = { ...DEFAULT_PARAMS, section: sectionMap.starred };
    result = buildPreciseUrl(paramsWithSection, sectionMap.all);
    expect(result).not.toContain(sectionMap.starred);
    expect(result).toContain(sectionMap.all);
  });

  it("getSection", () => {
    const { getSection } = tests.functions;
    const { sectionMap } = tests.maps;
    let result;

    // Verify that the result is unambiguous.
    const location = {
      pathname: Url.get(Url.pages.projects.starred)
    };
    result = getSection(location);
    expect(result).toBe(sectionMap.starred);
    expect(result).not.toBe(sectionMap.own);
    expect(result).not.toBe(sectionMap.all);
  });
});


describe("rendering", () => {
  const loggedUser = generateFakeUser();
  const anonymousUser = generateFakeUser(true);
  const fakeHistory = createMemoryHistory({
    initialEntries: ["/"],
    initialIndex: 0,
  });
  fakeHistory.push({
    pathname: "/projects/all",
    search: "?page=1"
  });


  //TestRenderer
  it("Renders ProjectList for logged user", async () => {
    await act(async () => {
      TestRenderer.create(
        <MemoryRouter>
          <ProjectList client={client} history={fakeHistory} location={fakeHistory.location} user={loggedUser} />
        </MemoryRouter>
      );
    });
  });

  it("Renders ProjectList for anonymous user", async () => {
    await act(async () => {
      TestRenderer.create(
        <MemoryRouter>
          <ProjectList client={client} history={fakeHistory} location={fakeHistory.location} user={anonymousUser} />
        </MemoryRouter>
      );
    });
  });

  it("Redirects only anonymous user when accessing an illegal url", async () => {
    fakeHistory.push({
      pathname: "/projects/all",
      search: "?page=1&searchIn=users"
    });
    let rendered, props;

    // Logged users can use searchIn=users
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectList client={client} history={fakeHistory} location={fakeHistory.location} user={loggedUser} />
        </MemoryRouter>
      );
    });
    props = rendered.root.findByType(ProjectList).props;
    expect(props).toMatchObject({ client: {}, history: {}, location: {}, user: {} });
    expect(props.history.location.search).toContain("searchIn=users");
    expect(props.history.location.search).not.toContain("searchIn=projects");

    // Anonymous users can't use searchIn=users, they should be redirected to searchIn=projects
    await act(async () => {
      rendered = TestRenderer.create(
        <MemoryRouter>
          <ProjectList client={client} history={fakeHistory} location={fakeHistory.location} user={anonymousUser} />
        </MemoryRouter>
      );
    });
    props = rendered.root.findByType(ProjectList).props;
    expect(props).toMatchObject({ client: {}, history: {}, location: {}, user: {} });
    expect(props.history.location.search).not.toContain("searchIn=users");
    expect(props.history.location.search).toContain("searchIn=projects");
  });
});

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

import { MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";
import TestRenderer, { act } from "react-test-renderer";
import { Provider } from "react-redux";

import { testClient as client } from "../../api-client";
import { generateFakeUser } from "../../user/User.test";
import { Url } from "../../utils/helpers/url";
import { tests } from "./ProjectList.container";
import AppContext from "../../utils/context/appContext";
import { ProjectList } from "./";
import { globalSchema, StateModel } from "../../model";
import { Suspense } from "react";

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
    result = removeDefaultParams({
      ...DEFAULT_PARAMS,
      page: 123,
      section: "any",
    });
    expect(result).toMatchObject({ page: 123, section: "any" });
    expect(Object.keys(result)).toHaveLength(2);
    result = removeDefaultParams(
      { ...DEFAULT_PARAMS, page: 123, section: "any" },
      true
    );
    expect(result).not.toMatchObject({ page: 123, section: "any" });
    expect(result).toMatchObject({ page: 123 });
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("buildPreciseUrl", () => {
    const { buildPreciseUrl, removeDefaultParams } = tests.functions;
    const { DEFAULT_PARAMS } = tests.defaults;
    const { SECTION_MAP } = tests.maps;
    let result;

    // Contain all the passed parameters and not more.
    result = buildPreciseUrl(DEFAULT_PARAMS);
    for (const [param, value] of Object.entries(DEFAULT_PARAMS))
      expect(result).toContain(`${param}=${value}`);
    result = buildPreciseUrl(removeDefaultParams(DEFAULT_PARAMS));
    expect(result).not.toContain("?");

    // Change the section when `target` is provided.
    const paramsWithSection = {
      ...DEFAULT_PARAMS,
      section: SECTION_MAP.starred,
    };
    result = buildPreciseUrl(paramsWithSection, SECTION_MAP.all);
    expect(result).not.toContain(SECTION_MAP.starred);
    expect(result).toContain(SECTION_MAP.all);
  });

  it("getSection", () => {
    const { getSection } = tests.functions;
    const { SECTION_MAP } = tests.maps;
    let result;

    // Verify that the result is unambiguous.
    const location = {
      pathname: Url.get(Url.pages.projects.starred),
    };
    result = getSection(location);
    expect(result).toBe(SECTION_MAP.starred);
    expect(result).not.toBe(SECTION_MAP.own);
    expect(result).not.toBe(SECTION_MAP.all);
  });
});

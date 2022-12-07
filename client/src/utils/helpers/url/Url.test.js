/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 *  Url.test.js
 *  Tests for Url.
 */

import { UrlRule, Url, getSearchParams, isSessionUrl } from "./Url";


describe("UrlRule private class", () => {
  it("Initialization values and errors", () => {
    // Verify all the parameters, and try to trigger all possible errors based on wrong parameters.
    let rule;

    // output
    expect(() => new UrlRule("wrong_type"))
      .toThrow("required <output> parameter must be a function");
    rule = new UrlRule(() => "/");
    expect(rule.output).toBeInstanceOf(Function);
    expect(rule.required).toBeInstanceOf(Array);
    expect(rule.required).toHaveLength(0);

    // required
    expect(() => new UrlRule(() => "/", "wrong_type"))
      .toThrow("<required> parameter must be an array");
    expect(() => new UrlRule(() => "/", ["input1", "input2"]))
      .toThrow("<output> function must have an argument to assign an object");
    expect(() => new UrlRule(() => "/", ["input1", 21]))
      .toThrow("<required> parameter must contain only strings");
    rule = new UrlRule((data) => "/", ["input1", "input2"]);
    expect(rule.required).toBeInstanceOf(Array);
    expect(rule.required).toHaveLength(2);

    // validation
    expect(() => new UrlRule((data) => "/", ["input1", "input2"], "wrong_type"))
      .toThrow("optional <validation> parameter must be a function");
    rule = new UrlRule((data) => "/", ["input1", "input2"], (data) => true);
    expect(rule.validation).toBeInstanceOf(Function);

    // examples
    expect(() => new UrlRule(() => "/", [], null, "wrong_type"))
      .toThrow("optional <examples> parameter must be an array");
    expect(() => new UrlRule(() => "/", [], null, ["input1", 21]))
      .toThrow("<examples> parameter must contain only strings");
    rule = new UrlRule(() => "/", [], null, ["/", "/test"]);
    expect(rule.examples).toBeInstanceOf(Array);
    expect(rule.examples).toHaveLength(2);
  });

  it("Methods", () => {
    // Create static rule.
    let rule;
    rule = new UrlRule(() => "/");
    expect(rule.get()).toBe("/");

    // Create dynamic rule without validation.
    rule = new UrlRule((data) => `/${data.param1}/something`, ["param1"]);
    expect(() => rule.get({ wrongParam: "test" })).toThrow();
    expect(() => rule.get("wrong_type")).toThrow();
    expect(() => rule.get({ param1: false })).not.toThrow();
    expect(rule.get({ param1: "test" })).toBe("/test/something");

    // Create dynamic rule with validation.
    rule = new UrlRule(
      (data) => `/${data.param1}/something`,
      ["param1"],
      (data) => { if (typeof data.param1 !== "string") throw new Error("You must specify <param1>"); return true; }
    );
    expect(() => rule.get({ wrongParam: "test" })).toThrow();
    expect(() => rule.get({ param1: false })).toThrow();
    expect(rule.get({ param1: "test" })).toBe("/test/something");
  });

  it("Realistic rule example", () => {
    // Create a realistic rule.
    const projectValidation = (data) => {
      if (typeof data.namespace !== "string")
        throw new Error("Project url requires a <namespace> of type string.");
      else if (data.namespace.length < 3)
        throw new Error("Project url requires a <namespace> of minimum 3 letters.");
      else if (typeof data.path !== "string")
        throw new Error("Project url requires a <path> of type string.");
      else if (data.path.length < 3)
        throw new Error("Project url requires a <path> of minimum 3 letters.");
      return true;
    };
    const rule = new UrlRule(
      (data) => `/projects/${data.namespace}/${data.path}`,
      ["namespace", "path"],
      projectValidation,
      ["/projects/fake-user/fake-project"]
    );

    // Verify single properties and try to manually invoke functions.
    expect(rule.output).toBeInstanceOf(Function);
    expect(rule.required).toBeInstanceOf(Array);
    expect(rule.required).toHaveLength(2);
    expect(rule.validation).toBeInstanceOf(Function);
    expect(rule.examples).toBeInstanceOf(Array);
    expect(rule.examples).toHaveLength(1);
    expect(rule.examples[0]).toBe("/projects/fake-user/fake-project");

    const data = { namespace: "fake-user", path: "fake-project" };
    expect(() => rule.validation({})).toThrow();
    expect(() => rule.validation({ ...data, path: 12345 })).toThrow();
    expect(() => rule.validation(data)).not.toThrow();
    expect(rule.output(data)).toBe(rule.examples[0]);
    expect(rule.output({})).not.toBe(rule.examples[0]);

    // Compare with the `get` method.
    expect(() => rule.get({ ...data, path: 12345 })).toThrow();
    expect(() => rule.get({})).toThrow();
    expect(rule.get(data)).toBe(rule.examples[0]);
  });
});

describe("Url session validation", () => {
  it("Test valid and invalid session url", () => {
    expect(isSessionUrl("projects/namespaceProject/projectName/sessions")).toBe(true);
    expect(isSessionUrl("projects/namespaceProject/projectName")).toBe(false);
    expect(isSessionUrl("projects/namespaceProject/projectName/sessions/new")).toBe(true);
    expect(isSessionUrl("projects/namespaceProject/projectName/sessions/show/sessionName")).toBe(true);
    expect(isSessionUrl("projects/namespaceProject/sessions")).toBe(false);

    const namespaceSeveralLevels = "namespaceProjectSubGroup1/namespaceProjectSubGroup2/namespaceProjectSubGroup1";
    expect(isSessionUrl(`projects/${namespaceSeveralLevels}/projectName/sessions`))
      .toBe(true);
    expect(isSessionUrl("projects/datasets")).toBe(false);
    expect(isSessionUrl("projects/sessions")).toBe(false);
    expect(isSessionUrl("sessions")).toBe(true);
    expect(isSessionUrl("/")).toBe(false);
  });
});

describe("Url helper class", () => {
  it("Test string page", () => {
    Url.pages.hijacked = "staticPage";
    const url = Url.get(Url.pages.hijacked);
    expect(url).toBe("staticPage");
  });

  it("Test UrlRule page", () => {
    // Create fake UrlRule
    const projectValidation = (data) => {
      if (data.path && typeof data.path !== "string")
        throw new Error("Project path must be a string.");
      return true;
    };
    const rule = new UrlRule(
      (data) => `/projects/${data.namespace}/${data.path ? data.path : ""}`,
      ["namespace"],
      projectValidation,
      ["/projects/ns/", "/projects/ns/ph"]
    );
    Url.pages.hijacked = rule;

    // Check successful query and errors
    expect(() => { Url.get(Url.pages.hijacked); }).toThrow();
    expect(() => { Url.get(Url.pages.hijacked, "wrong_type"); }).toThrow();
    expect(() => { Url.get(Url.pages.hijacked, { namespace: 123 }); }).not.toThrow();
    expect(() => { Url.get(Url.pages.hijacked, { namespace: "ns" }); }).not.toThrow();
    expect(() => { Url.get(Url.pages.hijacked, { path: 123 }); }).toThrow();
    expect(() => { Url.get(Url.pages.hijacked, { path: "ph" }); }).toThrow();
    expect(() => { Url.get(Url.pages.hijacked, { namespace: 123, path: "ph" }); }).not.toThrow();

    expect(Url.get(Url.pages.hijacked, { namespace: "ns" })).toBe(rule.examples[0]);
    expect(Url.get(Url.pages.hijacked, { namespace: "ns", path: "ph" })).toBe(rule.examples[1]);
  });

  it("Omit `base`", () => {
    Url.pages.hijacked = { base: "/staticPage" };
    const url = Url.get(Url.pages.hijacked);
    expect(url).toBe("/staticPage");
    expect(url).toBe(Url.get(Url.pages.hijacked.base));
  });

  it("Get full Url", () => {
    Url.pages.hijacked = "/staticPage";
    expect(Url.get(Url.pages.hijacked)).toBe("/staticPage");
    expect(() => { Url.get(Url.pages.hijacked, {}, false); }).not.toThrow();
    expect(() => { Url.get(Url.pages.hijacked, {}, true); }).toThrow();
    const fakeBaseUrl = "https://Ican'texists/sub/";
    Url.setBaseUrl(fakeBaseUrl);
    expect(() => { Url.get(Url.pages.hijacked, {}, true); }).not.toThrow();
    expect(Url.get(Url.pages.hijacked, {}, true)).toBe("https://Ican'texists/sub/staticPage");
    expect(() => { Url.setBaseUrl("http://AnotherUrl"); }).toThrow("base url can't be set multiple times");
  });

  it("Test specific pages", () => {
    const { get, pages } = Url;
    expect(get(pages.landing)).toBe("/");

    expect(get(pages.projects)).toBe("/projects");
    expect(get(pages.projects.all)).toBe("/projects/all");
    expect(get(pages.projects.all, { q: "test", searchIn: "projects" }))
      .toBe("/projects/all?q=test&searchIn=projects");

    expect(() => { get(pages.project); }).toThrow();
    expect(get(pages.project, { namespace: "ns", path: "ph" })).toBe("/projects/ns/ph");
    expect(get(pages.project, { namespace: "gr1/gr2", path: "ph" })).toBe("/projects/gr1/gr2/ph");
  });
});

describe("getSearchParams function", () => {
  const SEARCH = {
    nothing: "",
    page: "?q=test",
    many: "?page=4&perPage=50&ascending=true",
    legacy: "?page=4&perPage=50&orderSearchAsc=false",
    overlapping: "?page=4&perPage=50&orderSearchAsc=false&ascending=true",
  };

  beforeAll(() => {
    // ? This works fine locally, but it fails in the GitHub actions where the workaround
    // ? is to delete global.window.location each time.
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: { href: "/", search: "" }
    });
  });

  it("Basic behavior", () => {
    delete global.window.location;
    window.location = { search: SEARCH.nothing };
    let params = getSearchParams();
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(0);

    delete global.window.location;
    window.location = { search: SEARCH.page };
    params = getSearchParams();
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(1);
    expect(params).toMatchObject({ q: "test" });

    delete global.window.location;
    window.location = { search: SEARCH.many };
    params = getSearchParams();
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(3);
    expect(params).toMatchObject({ page: 4, ascending: true, perPage: 50 });
  });

  it("Expected parameters", () => {
    delete global.window.location;
    window.location = { search: SEARCH.many };
    const expectedParams = { "page": 1, "q": null };
    const params = getSearchParams(expectedParams);
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(4);
    expect(params).toMatchObject({ page: 4, ascending: true, perPage: 50, q: null });
  });

  it("Converted legacy", () => {
    const convertParams = { orderSearchAsc: "ascending" };
    const expectedParams = { "page": 1, "q": null };
    let params;

    delete global.window.location;
    window.location = { search: SEARCH.legacy };
    params = getSearchParams(null, convertParams);
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(3);
    expect(params).toMatchObject({ page: 4, ascending: false, perPage: 50 });

    delete global.window.location;
    window.location = { search: SEARCH.legacy };
    params = getSearchParams(expectedParams, convertParams);
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(4);
    expect(params).toMatchObject({ page: 4, ascending: false, perPage: 50, q: null });

    delete global.window.location;
    window.location = { search: SEARCH.overlapping };
    params = getSearchParams(expectedParams, convertParams);
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(4);
    expect(params).toMatchObject({ page: 4, ascending: true, perPage: 50, q: null });
  });

  it("No conversion", () => {
    delete global.window.location;
    window.location = { search: SEARCH.many };
    const params = getSearchParams(null, null, false);
    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(3);
    expect(params).toMatchObject({ page: "4", ascending: "true", perPage: "50" });
  });
});

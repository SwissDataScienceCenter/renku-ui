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
 * Tests for the session components
 */

import { describe, expect, it } from "vitest";

import { ExpectedAnnotations } from "./Notebooks.state";
import { NotebooksHelper } from "./index";

const simplifiedGlobalOptions = {
  default_url: {
    default: "/lab",
    options: ["/lab", "/rstudio"],
    type: "enum",
  },
  cpu_request: {
    default: 1,
    options: [0.5, 1, 2],
    type: "enum",
  },
  mem_request: {
    default: "1G",
    options: ["1G", "2G"],
    type: "enum",
  },
  lfs_auto_fetch: {
    default: false,
    type: "boolean",
  },
  gpu_request: {
    default: 0,
    type: "int",
  },
};

describe("notebook server clean annotation", () => {
  const domain = ExpectedAnnotations.domain;
  const baseAnnotations = ExpectedAnnotations[domain].default;

  const namespace = "myCoolNamespace";
  const branch = "anotherBranch";
  const projectName = "funkyProject";
  const repository = `https://fake.repo/${namespace}/${projectName}`;
  const defaultImageUsedText = "True";
  const defaultImageUsedBool = true;

  it("renku.io default", () => {
    const fakeAnswer = {};
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(
      fakeAnswer,
      domain
    );
    const expectedAnnotations = { ...baseAnnotations };
    expect(elaboratedAnnotations).toEqual(expectedAnnotations);
  });
  it("renku.io mixed", () => {
    const fakeAnswer = {
      [`${domain}/namespace`]: namespace,
      [`${domain}/branch`]: branch,
      [`${domain}/projectName`]: projectName,
      [`${domain}/repository`]: repository,
      [`${domain}/default_image_used`]: defaultImageUsedText,
    };
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(
      fakeAnswer,
      domain
    );
    const expectedAnnotations = {
      ...baseAnnotations,
      namespace,
      branch,
      projectName,
      repository,
      default_image_used: defaultImageUsedBool,
    };
    expect(elaboratedAnnotations).toEqual(expectedAnnotations);
  });
  it("renku.io occasionally missing.", () => {
    const fakeAnswer = {
      [`${domain}/namespace`]: namespace,
      branch: branch,
      [`${domain}/projectName`]: projectName,
      repository: repository,
      default_image_used: defaultImageUsedText,
    };
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(
      fakeAnswer,
      domain
    );
    const expectedAnnotations = {
      ...baseAnnotations,
      namespace,
      branch,
      projectName,
      repository,
      default_image_used: defaultImageUsedBool,
    };
    expect(elaboratedAnnotations).toEqual(expectedAnnotations);
  });
  it("renku.io double-clean", () => {
    const fakeAnswer = {
      [`${domain}/namespace`]: namespace,
      [`${domain}/branch`]: branch,
      [`${domain}/projectName`]: projectName,
      [`${domain}/repository`]: repository,
      [`${domain}/default_image_used`]: defaultImageUsedText,
    };
    const firstPassAnnotations = NotebooksHelper.cleanAnnotations(
      fakeAnswer,
      domain
    );
    const elaboratedAnnotations = NotebooksHelper.cleanAnnotations(
      firstPassAnnotations,
      domain
    );
    const expectedAnnotations = {
      ...baseAnnotations,
      namespace,
      branch,
      projectName,
      repository,
      default_image_used: defaultImageUsedBool,
    };
    expect(elaboratedAnnotations).toEqual(expectedAnnotations);
  });
});

describe("parse project level session options", () => {
  it("valid content", () => {
    const content = `
      [interactive]
      defaultUrl = /tree
      mem_request = 2
      lfs_auto_fetch = True
    `;
    const parsedContent = NotebooksHelper.parseProjectOptions(content);

    // check keys
    expect(Object.keys(parsedContent).length).toBe(3);
    expect(Object.keys(parsedContent)).toContain("lfs_auto_fetch");
    expect(Object.keys(parsedContent)).toContain("mem_request");
    expect(Object.keys(parsedContent)).toContain("default_url");
    expect(Object.keys(parsedContent)).not.toContain("defaultUrl");

    // check values
    expect(parsedContent.default_url).toBe("/tree");
    expect(parsedContent.mem_request).not.toBe("2");
    expect(parsedContent.mem_request).toBe(2);
    expect(parsedContent.lfs_auto_fetch).not.toBe("True");
    expect(parsedContent.lfs_auto_fetch).not.toBe("true");
    expect(parsedContent.lfs_auto_fetch).toBe(true);
  });

  it("invalid content", () => {
    let content = `
      [nonRenku]
      default_url = /tree`;
    let parsedContent = NotebooksHelper.parseProjectOptions(content);
    expect(Object.keys(parsedContent).length).toBe(0);

    content = `
      [renku "anything"]
      default_url = /tree`;
    parsedContent = NotebooksHelper.parseProjectOptions(content);
    expect(Object.keys(parsedContent).length).toBe(0);

    const contents = ["just invalid text", true, 1, null];
    contents.forEach((content) => {
      const noContent = NotebooksHelper.parseProjectOptions(content);
      expect(Object.keys(noContent).length).toBe(0);
    });
  });
});

describe("verify project level options validity according to deployment global options", () => {
  it("valid options", () => {
    const testValues = [
      { option: "default_url", value: "/lab", result: true },
      { option: "default_url", value: "anyString", result: true },
      { option: "default_url", value: "", result: true },
      { option: "default_url", value: 12345, result: false },
      { option: "default_url", value: true, result: false },
      { option: "cpu_request", value: 1, result: true },
      { option: "cpu_request", value: 2, result: true },
      { option: "cpu_request", value: 10, result: false },
      { option: "cpu_request", value: "1", result: false },
      { option: "cpu_request", value: true, result: false },
      { option: "lfs_auto_fetch", value: false, result: true },
      { option: "lfs_auto_fetch", value: true, result: true },
      { option: "lfs_auto_fetch", value: "true", result: false },
      { option: "lfs_auto_fetch", value: "abc", result: false },
      { option: "lfs_auto_fetch", value: 1, result: false },
      { option: "gpu_request", value: 1, result: true },
      { option: "gpu_request", value: 2, result: true },
      { option: "gpu_request", value: 10, result: true },
      { option: "gpu_request", value: "1", result: false },
      { option: "gpu_request", value: true, result: false },
    ];

    testValues.forEach((testSet) => {
      const result = NotebooksHelper.checkOptionValidity(
        simplifiedGlobalOptions,
        testSet.option,
        testSet.value
      );
      expect(result).toBe(testSet.result);
    });
  });
});

describe("verify project settings validity", () => {
  it("valid settings", () => {
    const SETTINGS = [
      { valid: false, text: { object: "notValid" } },
      { valid: false, text: false },
      { valid: false, text: "random" },
      { valid: false, text: "" },
      { valid: true, text: "image" },
    ];
    const VALUES = [
      { valid: false, text: { object: "notValid" } },
      { valid: false, text: true },
      { valid: false, text: "" },
      { valid: true, text: "url" },
      { valid: true, text: "any string would work, this may be improved" },
    ];

    // only a combination of valid setting name and setting value return true
    for (const setting of SETTINGS) {
      for (const value of VALUES) {
        const test = NotebooksHelper.checkSettingValidity(
          setting.text,
          value.text
        );
        expect(test).toEqual(setting.valid && value.valid);
      }
    }
  });
});

describe("verify defaults", () => {
  it("get defaults", () => {
    const projectOptions = {
      config: {
        "interactive.default_url": "/lab",
        "interactive.fake": "test value",
        "interactive.mem_request": "2G",
        "interactive.cpu_request": "2",
        "renku.lfs_threshold": "100 kb",
      },
      default: {
        "interactive.default_url": "/lab",
        "renku.lfs_threshold": "100 kb",
      },
    };
    const projectDefaults = NotebooksHelper.getProjectDefault(
      simplifiedGlobalOptions,
      projectOptions
    );

    // Correct overwriting
    expect(projectDefaults.defaults.global["mem_request"]).not.toBe(
      projectOptions.config["interactive.mem_request"]
    );
    expect(projectDefaults.defaults.global["mem_request"]).toBe(
      simplifiedGlobalOptions["mem_request"].default
    );
    expect(projectDefaults.defaults.project["mem_request"]).toBe(
      projectOptions.config["interactive.mem_request"]
    );

    expect(projectDefaults.defaults.global["default_url"]).toBe(
      projectDefaults.defaults.project["default_url"]
    );
    expect(projectDefaults.defaults.global["default_url"]).toBe(
      simplifiedGlobalOptions["default_url"].default
    );
    expect(projectDefaults.defaults.project["default_url"]).toBe(
      projectOptions.config["interactive.default_url"]
    );

    // No leaks of project-only values to default values
    expect(projectDefaults.defaults.project).toHaveProperty("fake");
    expect(projectDefaults.defaults.global).not.toHaveProperty("fake");

    // No leaks of non-sessions options
    expect(projectDefaults.defaults.project).not.toHaveProperty(
      "renku.lfs_threshold"
    );
    expect(projectDefaults.defaults.project).not.toHaveProperty(
      "lfs_threshold"
    );

    // No leaks of prefix
    expect(projectDefaults.defaults.project).toHaveProperty("default_url");
    expect(projectDefaults.defaults.project).not.toHaveProperty(
      "interactive.default_url"
    );
  });
});

describe("ci helper functions", () => {
  it("getCiJobStatus", () => {
    expect(NotebooksHelper.getCiJobStatus({ status: "running" })).toBe(
      NotebooksHelper.ciStatuses.wrong
    );
    expect(NotebooksHelper.getCiJobStatus({ id: 1, status: "running" })).toBe(
      NotebooksHelper.ciStatuses.running
    );
    expect(NotebooksHelper.getCiJobStatus({ id: 1, status: "canceled" })).toBe(
      NotebooksHelper.ciStatuses.failure
    );
    expect(NotebooksHelper.getCiJobStatus({ id: 1, status: "success" })).toBe(
      NotebooksHelper.ciStatuses.success
    );
    expect(NotebooksHelper.getCiJobStatus({ id: 1, status: "fake" })).toBe(
      NotebooksHelper.ciStatuses.wrong
    );
    expect(NotebooksHelper.getCiJobStatus()).toBe(
      NotebooksHelper.ciStatuses.wrong
    );
  });
});

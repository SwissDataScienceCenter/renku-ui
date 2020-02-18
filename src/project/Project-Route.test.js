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
 *  Project-Route.test.js
 *  Tests for project route extraction
 */


import { splitProjectSubRoute } from './Project';

describe('basic route extraction', () => {
  it('handles project-with-namespace-only routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/overview");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace 2-level sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/overview/stats");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace file paths 1', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/files/blob/README.md");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace file paths 2', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/files/blob/root/sub1/sub2/foo.txt");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace issues listing', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/collaboration/issues");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace issue display', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/collaboration/issues/1/");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace datasets listing', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/datasets/issues");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace dataset display', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/datasets/1/");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
  it('handles project-with-namespace dataset modify', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/project-name/datasets/1/modify");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/project-name');
    expect(pathComponents.baseUrl).toEqual('/projects/namespace/project-name');
    expect(pathComponents.namespace).toEqual('namespace');
  });
})

describe('id route extraction', () => {
  it('handles project-id routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/1");
    expect(pathComponents.projectPathWithNamespace).toEqual(null);
    expect(pathComponents.projectId).toEqual('1');
    expect(pathComponents.baseUrl).toEqual('/projects/1');
    expect(pathComponents.namespace).toEqual(null);
  });
  it('handles project-id sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/1/overview");
    expect(pathComponents.projectPathWithNamespace).toEqual(null);
    expect(pathComponents.projectId).toEqual('1');
    expect(pathComponents.baseUrl).toEqual('/projects/1');
    expect(pathComponents.namespace).toEqual(null);
  });
  it('handles project-id 2-level sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/1/overview/stats");
    expect(pathComponents.projectPathWithNamespace).toEqual(null);
    expect(pathComponents.projectId).toEqual('1');
    expect(pathComponents.baseUrl).toEqual('/projects/1');
    expect(pathComponents.namespace).toEqual(null);
  });
  it('handles project-id file paths 1', () => {
    const pathComponents = splitProjectSubRoute("/projects/1/files/blob/README.md");
    expect(pathComponents.projectPathWithNamespace).toEqual(null);
    expect(pathComponents.projectId).toEqual('1');
    expect(pathComponents.baseUrl).toEqual('/projects/1');
    expect(pathComponents.namespace).toEqual(null);
  });
  it('handles project-id file paths 2', () => {
    const pathComponents = splitProjectSubRoute("/projects/1/files/blob/root/sub1/sub2/foo.txt");
    expect(pathComponents.projectPathWithNamespace).toEqual(null);
    expect(pathComponents.projectId).toEqual('1');
    expect(pathComponents.baseUrl).toEqual('/projects/1');
    expect(pathComponents.namespace).toEqual(null);
  });
})

describe('nested route extraction', () => {
  it('handles project-with-namespace-only routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/subgroup/project-name");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/subgroup/project-name');
    expect(pathComponents.namespace).toEqual("namespace/subgroup");
  });
  it('handles project-with-namespace sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/subgroup/project-name/overview");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/subgroup/project-name');
    expect(pathComponents.namespace).toEqual("namespace/subgroup");
  });
  it('handles project-with-namespace 2-level sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/subgroup/project-name/overview/stats");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/subgroup/project-name');
    expect(pathComponents.namespace).toEqual("namespace/subgroup");
  });
})

describe('tricky route extraction', () => {
  it('handles project named "overview" project-with-namespace-only routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/overview");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/overview');
    expect(pathComponents.namespace).toEqual("namespace");
  });
  it('handles project named "overview" project-with-namespace sub routes', () => {
    const pathComponents = splitProjectSubRoute("/projects/namespace/overview/overview");
    expect(pathComponents.projectPathWithNamespace).toEqual('namespace/overview');
    expect(pathComponents.namespace).toEqual("namespace");
  });
})

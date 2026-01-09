/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

type NewDocLinkArgs = {
  language: string;
  version: string;
};

type NewDocLinkFn = (args: NewDocLinkArgs) => string;

const DEFAULT_NEW_DOC_LINK_ARGS: NewDocLinkArgs = {
  language: "en",
  version: "latest",
};

export const NEW_DOCS_ROOT = "https://docs.renkulab.io/";

function newDocsBase({ language, version }: NewDocLinkArgs): string {
  return `${NEW_DOCS_ROOT}${language}/${version}/`;
}

function newDocsLinkPage(page: string): NewDocLinkFn {
  const page_ = page.startsWith("/") ? page.substring(1) : page;
  return (args: NewDocLinkArgs) => newDocsBase(args) + page_;
}

const newDocsAdminOperationsRemoteClustersFn: NewDocLinkFn = newDocsLinkPage(
  "docs/admins/operation/remote"
);
export const NEW_DOCS_ADMIN_OPERATIONS_REMOTE_CLUSTERS =
  newDocsAdminOperationsRemoteClustersFn(DEFAULT_NEW_DOC_LINK_ARGS);

const newDocsAdminOperationsRemoteSessionsFn: NewDocLinkFn = newDocsLinkPage(
  "docs/admins/operation/remote-sessions"
);

export const NEW_DOCS_ADMIN_OPERATIONS_REMOTE_SESSIONS =
  newDocsAdminOperationsRemoteSessionsFn(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_DATA_CONNECTORS_FROM_REPO = newDocsLinkPage(
  "docs/users/data/guides/connect-data/connect-data-from-data-repositories"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_MIGRATION_INFO = newDocsLinkPage(
  "docs/users/migrate-v1-v2/migrate-renku-1-project-to-renku-2"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_HOW_TO_USE_OWN_DOCKER_IMAGE = newDocsLinkPage(
  "docs/users/sessions/guides/environments/use-your-own-docker-image-for-renku-session"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_COMMUNITY_PORTAL = newDocsLinkPage(
  "docs/users/community"
)(DEFAULT_NEW_DOC_LINK_ARGS); //same as NEW_DOCS_GET_HELP

export const NEW_DOCS_DOCUMENTATION = newDocsLinkPage("")(
  DEFAULT_NEW_DOC_LINK_ARGS
);

export const NEW_DOCS_RESEARCH = newDocsLinkPage("docs/users")(
  DEFAULT_NEW_DOC_LINK_ARGS
);

export const NEW_DOCS_TEACHING = newDocsLinkPage(
  "docs/users/use-cases/teaching/set-up-course-in-classic-mode"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_QUICK_START_TUTORIAL = newDocsLinkPage(
  "docs/users/getting-started"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_MIGRATE_AWAY_FROM_GITLAB = newDocsLinkPage(
  "docs/users/migrate-v1-v2/migrate-from-gitlab"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_CREATE_PROJECT = newDocsLinkPage(
  "docs/users/getting-started/create-project"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_CREATE_ENV_CUSTOM_PACKAGES_INSTALLED = newDocsLinkPage(
  "docs/users/sessions/guides/environments/create-environment-with-custom-packages-installed"
)(DEFAULT_NEW_DOC_LINK_ARGS);

export const NEW_DOCS_HOW_RENKU_WORKS = newDocsLinkPage(
  "docs/users/knowledge-base/about"
)(DEFAULT_NEW_DOC_LINK_ARGS);

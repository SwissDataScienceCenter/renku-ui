/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { generatePath } from "react-router";

import { getDataConnectorScope } from "~/features/dataConnectorsV2/components/dataConnector.utils";
import type { NamespaceKind } from "~/features/projectsV2/api/namespace.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

export type BreadcrumbEntityType =
  | "user"
  | "group"
  | "project"
  | "dataConnector"
  | "source";

export interface BreadcrumbLevel {
  type?: BreadcrumbEntityType;
  label: string;
  to?: string;
}

interface NamespaceLevelFields {
  namespaceKind?: NamespaceKind;
  namespaceName?: string;
}

export function getNamespacePageUrl(
  slug: string,
  namespaceKind?: NamespaceKind,
): string | undefined {
  if (namespaceKind === "group")
    return generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, { slug });
  if (namespaceKind === "user")
    return generatePath(ABSOLUTE_ROUTES.v2.users.show.root, { username: slug });
  return undefined;
}

export function getProjectPageUrl(namespace: string, slug: string): string {
  return generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace,
    slug,
  });
}

export function parseProjectOwnedNamespace(namespace: string): {
  namespace: string;
  slug: string;
} {
  const [parent = "", slug = ""] = namespace.split("/");
  return { namespace: parent, slug };
}

function namespaceLevel(
  slug: string,
  { namespaceKind, namespaceName }: NamespaceLevelFields,
): BreadcrumbLevel {
  const type =
    namespaceKind === "group"
      ? "group"
      : namespaceKind === "user"
        ? "user"
        : undefined;
  return {
    type,
    label: namespaceName || slug,
    to: getNamespacePageUrl(slug, namespaceKind),
  };
}

function projectLevel(
  namespace: string,
  slug: string,
  name?: string,
): BreadcrumbLevel {
  return {
    type: "project",
    label: name || slug,
    to: getProjectPageUrl(namespace, slug),
  };
}

function sourceLevel(source?: string, sourceUrl?: string): BreadcrumbLevel {
  return {
    type: "source",
    label: source ?? "unknown",
    to: sourceUrl,
  };
}

function currentLevel(
  type: BreadcrumbEntityType,
  slug: string,
): BreadcrumbLevel {
  return { type, label: slug };
}

export function buildProjectBreadcrumbLevels({
  namespace,
  namespaceKind,
  namespaceName,
  slug,
}: NamespaceLevelFields & {
  namespace: string;
  slug: string;
}): BreadcrumbLevel[] {
  return [
    namespaceLevel(namespace, { namespaceKind, namespaceName }),
    currentLevel("project", slug),
  ];
}

export function buildDataConnectorBreadcrumbLevels({
  namespace,
  namespaceKind,
  namespaceName,
  projectName,
  slug,
  source,
  sourceUrl,
}: NamespaceLevelFields & {
  namespace?: string;
  projectName?: string;
  slug: string;
  source?: string;
  sourceUrl?: string;
}): BreadcrumbLevel[] {
  const scope = getDataConnectorScope(namespace);
  const namespaceFields = { namespaceKind, namespaceName };
  const current = currentLevel("dataConnector", slug);
  switch (scope) {
    case "global":
      return [sourceLevel(source, sourceUrl), current];
    case "namespace":
      return [namespaceLevel(namespace ?? "", namespaceFields), current];
    case "project": {
      const parsed = parseProjectOwnedNamespace(namespace ?? "");
      return [
        namespaceLevel(parsed.namespace, namespaceFields),
        projectLevel(parsed.namespace, parsed.slug, projectName),
        current,
      ];
    }
  }
}

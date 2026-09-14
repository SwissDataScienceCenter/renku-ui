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

import { skipToken } from "@reduxjs/toolkit/query";

import type { DataConnectorRead } from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  getDataConnectorDoi,
  getDataConnectorIdentifier,
  getDataConnectorScope,
  useGetDataConnectorSource,
} from "~/features/dataConnectorsV2/components/dataConnector.utils";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import {
  useGetNamespacesByNamespaceProjectsAndSlugQuery,
  useGetNamespacesByNamespaceSlugQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import {
  buildDataConnectorBreadcrumbLevels,
  buildProjectBreadcrumbLevels,
  parseProjectOwnedNamespace,
  type BreadcrumbLevel,
} from "./entityBreadcrumb.utils";

function getBreadcrumbQueryArgs(
  project: Project | undefined,
  dataConnector: DataConnectorRead | undefined,
): {
  namespaceSlug?: string;
  ownerProject?: { namespace: string; slug: string };
} {
  if (project) return { namespaceSlug: project.namespace };
  if (!dataConnector?.namespace) return {};
  const scope = getDataConnectorScope(dataConnector.namespace);
  if (scope === "namespace") {
    return { namespaceSlug: dataConnector.namespace };
  }
  if (scope === "project") {
    const { namespace, slug } = parseProjectOwnedNamespace(
      dataConnector.namespace,
    );
    return { namespaceSlug: namespace, ownerProject: { namespace, slug } };
  }
  return {};
}

function isQueryReady(
  hasArgs: boolean,
  query: { isLoading: boolean; isUninitialized: boolean },
): boolean {
  if (!hasArgs) return true;
  return !query.isLoading && !query.isUninitialized;
}

export type EntityBreadcrumbProps =
  | { project: Project; dataConnector?: never }
  | { dataConnector: DataConnectorRead; project?: never };

export function useEntityBreadcrumb(props: EntityBreadcrumbProps): {
  clipboardText: string;
  isReady: boolean;
  levels: BreadcrumbLevel[];
} {
  const project = props.project;
  const dataConnector = props.dataConnector;
  const { namespaceSlug, ownerProject } = getBreadcrumbQueryArgs(
    project,
    dataConnector,
  );

  const namespaceQuery = useGetNamespacesByNamespaceSlugQuery(
    namespaceSlug ? { namespaceSlug } : skipToken,
  );
  const ownerProjectQuery = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    ownerProject
      ? { namespace: ownerProject.namespace, slug: ownerProject.slug }
      : skipToken,
  );
  const { isLoading: isLoadingSource, source } =
    useGetDataConnectorSource(dataConnector);
  const doi = getDataConnectorDoi(dataConnector);

  const isReady =
    isQueryReady(!!namespaceSlug, namespaceQuery) &&
    isQueryReady(!!ownerProject, ownerProjectQuery) &&
    !isLoadingSource;

  const namespaceKind = namespaceQuery.data?.namespace_kind;
  const namespaceName = namespaceQuery.data?.name;
  const projectName = ownerProjectQuery.data?.name;
  const sourceUrl = doi ? `https://doi.org/${doi}` : undefined;

  let levels: BreadcrumbLevel[] = [];
  if (isReady && project) {
    levels = buildProjectBreadcrumbLevels({
      namespace: project.namespace,
      namespaceKind,
      namespaceName,
      slug: project.slug,
    });
  } else if (isReady && dataConnector) {
    levels = buildDataConnectorBreadcrumbLevels({
      namespace: dataConnector.namespace,
      namespaceKind,
      namespaceName,
      projectName,
      slug: dataConnector.slug,
      source,
      sourceUrl,
    });
  }

  const clipboardText = props.project
    ? `${props.project.namespace}/${props.project.slug}`
    : getDataConnectorIdentifier(props.dataConnector);

  return { clipboardText, isReady, levels };
}

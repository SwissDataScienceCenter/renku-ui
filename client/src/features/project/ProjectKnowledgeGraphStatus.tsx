/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../api-client";
import KnowledgeGraphStatus from "../../file/KnowledgeGraphStatus.container";
import { Url } from "../../utils/helpers/url";

import type { StateModelProject } from "./Project.d";

type ProjectKnowledgeGraphStatusProps = {
  createGraphWebhook: unknown;
  displaySuccessMessage: unknown;
  fetchDatasets: unknown;
  fetchGraphStatus: unknown;
  graphStatus: boolean;
  history: unknown;
  location: unknown;
  model: unknown;
};

function ProjectKnowledgeGraphStatus(props: ProjectKnowledgeGraphStatusProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const httpProjectUrl = projectMetadata.httpUrl;
  const lockStatus = project.lockStatus;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const migration = project.migration;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;
  const projectId = projectMetadata.id;
  const isPrivate = projectMetadata.visibility == "private";

  const forkedData = project.forkedFromProject;
  const forked =
    forkedData != null && Object.keys(forkedData).length > 0 ? true : false;

  const graphProgress = project.webhook.progress;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewStatusUrl = Url.get(
    Url.pages.project.overview.status,
    projectUrlProps
  );
  const projectsUrl = Url.get(Url.pages.projects);
  return (
    <KnowledgeGraphStatus
      createGraphWebhook={props.createGraphWebhook}
      displaySuccessMessage={props.displaySuccessMessage}
      forked={forked}
      fetchAfterBuild={props.fetchDatasets}
      fetchGraphStatus={props.fetchGraphStatus}
      graphStatus={props.graphStatus}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      isPrivate={isPrivate}
      lineagesUrl={lineagesUrl}
      location={props.location}
      lockStatus={lockStatus}
      logged={user.logged}
      maintainer={maintainer}
      migration={migration}
      model={props.model}
      overviewStatusUrl={overviewStatusUrl}
      progress={graphProgress}
      projectId={projectId}
      projectPathWithNamespace={projectPathWithNamespace}
      projectsUrl={projectsUrl}
      warningMessage="Knowledge Graph integration has not been turned on."
    />
  );
}

export default ProjectKnowledgeGraphStatus;

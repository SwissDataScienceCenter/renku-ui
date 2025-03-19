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

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleUp,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import { Link } from "react-router";
import { useMatch } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import { Url } from "../../../../utils/helpers/url";
import { ProjectMigrationLevel } from "../../projectEnums";
import { projectKgApi } from "../../projectKg.api";
import { useCoreSupport } from "../../useProjectCoreSupport";
import { getRenkuLevel } from "../../utils/migrations";

interface ProjectStatusIconProps {
  branch: string;
  gitUrl: string;
  isMaintainer: boolean;
  projectId: number;
  projectNamespace: string;
  projectPath: string;
}
export function ProjectStatusIcon({
  branch,
  gitUrl,
  isMaintainer,
  projectId,
  projectNamespace,
  projectPath,
}: ProjectStatusIconProps) {
  const kgStatus = projectKgApi.useGetProjectIndexingStatusQuery(
    projectId ? projectId : skipToken,
    {
      refetchOnMountOrArgChange: 20,
    }
  );
  const { coreSupport, getMigrationStatusQuery: migrationStatus } =
    useCoreSupport({
      gitUrl,
      branch,
    });
  const { backendAvailable } = coreSupport;
  const kgActivated = kgStatus.data?.activated === true;
  const migrationLevel = getRenkuLevel(migrationStatus.data, backendAvailable);
  const settingsUrl = Url.get(Url.pages.project.settings, {
    namespace: projectNamespace,
    path: projectPath,
  });
  const matchRoute = useMatch(settingsUrl);
  const maintainerText =
    isMaintainer && matchRoute == null ? " Click to see details." : "";

  if (!kgStatus.isLoading && !kgActivated)
    return (
      <ProjectStatusElement
        color="danger"
        icon={faExclamationCircle}
        linkUrl={settingsUrl}
        text={`Project metadata not indexed.${maintainerText}`}
      />
    );
  if (
    !migrationStatus.isLoading &&
    migrationLevel?.level === ProjectMigrationLevel.LevelX
  )
    return (
      <ProjectStatusElement
        color="danger"
        icon={faExclamationCircle}
        linkUrl={settingsUrl}
        text={`Project not supported on this version of RenkuLab.${maintainerText}`}
      />
    );
  if (
    !migrationStatus.isLoading &&
    migrationLevel?.level === ProjectMigrationLevel.LevelE
  )
    return (
      <ProjectStatusElement
        color="danger"
        icon={faExclamationCircle}
        linkUrl={settingsUrl}
        text={`Error checking the project version, please reload.${maintainerText}`}
      />
    );
  if (
    !migrationStatus.isLoading &&
    migrationLevel?.level === ProjectMigrationLevel.Level5
  )
    return (
      <ProjectStatusElement
        color="danger"
        icon={faExclamationCircle}
        linkUrl={settingsUrl}
        text={`Project very outdated, might be unstable.${maintainerText}`}
      />
    );
  if (
    !migrationStatus.isLoading &&
    migrationLevel?.level === ProjectMigrationLevel.Level4 &&
    isMaintainer
  )
    return (
      <ProjectStatusElement
        color="warning"
        icon={faArrowAltCircleUp}
        linkUrl={settingsUrl}
        text={`Project update suggested.${maintainerText}`}
      />
    );
  return null;
}

interface ProjectStatusElementProps {
  color: string;
  icon: IconProp;
  linkUrl: string;
  text: string;
}
function ProjectStatusElement({
  color,
  icon,
  linkUrl,
  text,
}: ProjectStatusElementProps) {
  const localId = "project-status-icon";
  return (
    <div className="d-inline-block me-2" data-cy={`${localId}-element`}>
      <Link className={`small text-${color}`} id={localId} to={linkUrl}>
        <FontAwesomeIcon color={color} icon={icon} />
      </Link>
      <UncontrolledTooltip placement="top" target={localId}>
        {text}
      </UncontrolledTooltip>
    </div>
  );
}

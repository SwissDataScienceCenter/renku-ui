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

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Collapse,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleUp,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faPlusCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

import { RenkuRepositories } from "../../../utils/constants/Repositories";
import { ChevronDown, ChevronUp } from "../../../utils/ts-wrappers";
import { CoreErrorContent } from "../../../utils/definitions";
import {
  CoreSectionError,
  MigrationStatus,
  ProjectIndexingStatusResponse,
} from "../Project";
import { MigrationStartScopes, ProjectIndexingStatuses } from "../ProjectEnums";
import { ProjectSettingsGeneral as ProjectSettingsGeneralLegacy } from "../../../project/settings";
import { projectCoreApi } from "../projectCoreApi";
import { projectKgApi } from "../projectKgApi";
import { Loader } from "../../../components/Loader";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Docs } from "../../../utils/constants/Docs";
import { ACCESS_LEVELS } from "../../../api-client";

import styles from "./ProjectSettings.module.scss";

// ****** INTERFACES, ENUMS, CONST ****** //
const TemplateSourceRenku = "renku";

export enum ProjectMigrationLevel {
  Level1 = "1-all-good", // ? success
  Level2 = "2-some-info-no-update", // ? info
  Level3 = "3-minor-update", // ? info
  Level4 = "4-suggested-update", // ? warning
  Level5 = "5-required-update", // ? danger
  LevelE = "error", // ? danger
  LevelX = "x-unknown", // ? danger
}

export enum ProjectIndexingLevel {
  Level1 = "1-all-good", // ? success
  Level2 = "2-some-info-no-update", // ? info
  Level5 = "5-required-update", // ? danger
  LevelE = "error", // ? danger
  LevelX = "x-unknown", // ? danger
}

export type RenkuMigrationLevel = {
  automated: boolean;
  level:
    | ProjectMigrationLevel.Level1
    | ProjectMigrationLevel.Level3
    | ProjectMigrationLevel.Level4
    | ProjectMigrationLevel.Level5
    | ProjectMigrationLevel.LevelE
    | ProjectMigrationLevel.LevelX;
};

export type TemplateMigrationLevel = {
  automated: boolean;
  level:
    | ProjectMigrationLevel.Level1
    | ProjectMigrationLevel.Level2
    | ProjectMigrationLevel.Level3
    | ProjectMigrationLevel.LevelE
    | ProjectMigrationLevel.LevelX;
};

/**
 * Replace the longer dev suffix (E.G: ".dev22+g1262f766") with a shorter
 * "-dev" generic suffix.
 * @param version - stringy version (SemVer like)
 * @returns either same string or shorter string ending with "-dev"
 */
export function cleanVersion(version?: string): string {
  if (!version) return "";
  const regex = /dev\d+\+/;
  if (regex.test(version)) {
    // ! return version.substring(0, version.indexOf(".dev")) + "-dev";
    // ! TMP just for testing links - revert this
    return version.substring(0, version.indexOf(".dev"));
  }
  return version;
}

/**
 * Get the Renku Python URL for the target release
 */
export function getReleaseUrl(version?: string): string | null {
  if (!version) return null;
  const cleanedVersion = cleanVersion(version);
  if (!cleanedVersion.endsWith("-dev"))
    return `${RenkuRepositories.Python}/releases/tag/v${cleanedVersion}`;
  return null;
}

/**
 * Get the Renku Python URL for comparing the commits
 */
export function getCompareUrl(
  projectVersion?: string,
  latestVersion?: string
): React.ReactNode {
  if (!projectVersion || !latestVersion) return null;
  const cleanedProjectVersion = cleanVersion(projectVersion);
  const cleanedLatestVersion = cleanVersion(latestVersion);
  if (
    !cleanedProjectVersion.endsWith("-dev") &&
    !cleanedLatestVersion.endsWith("-dev")
  )
    return `${RenkuRepositories.Python}/compare/v${cleanedProjectVersion}...v${cleanedLatestVersion}`;
  return null;
}

export function getMigrationLevel(
  migrationStatus: MigrationStatus | undefined,
  backendAvailable: boolean
): ProjectMigrationLevel | null {
  // ? REF: https://www.notion.so/Project-status-889f7a0f16574c84a4b7af344683623b
  if (!migrationStatus) return null;
  if (migrationStatus.errorProject) return ProjectMigrationLevel.LevelE;
  const { details } = migrationStatus;
  if (!details || !details.project_supported)
    return ProjectMigrationLevel.LevelX;
  const coreCompatibility =
    details.core_compatibility_status.type === "detail"
      ? details.core_compatibility_status
      : null;
  const dockerfileRenku =
    details.dockerfile_renku_status.type === "detail"
      ? details.dockerfile_renku_status
      : null;
  const template =
    details.template_status.type === "detail" ? details.template_status : null;
  const templateError =
    details.template_status.type === "error" ? details.template_status : null;
  // level 5 && 4 -- mind that a level 5 could be temporarily classified as 4 if backendAvailable is still undefined
  if (coreCompatibility?.migration_required) {
    if (backendAvailable !== false) return ProjectMigrationLevel.Level4;
    return ProjectMigrationLevel.Level5;
  }
  // level 3
  if (
    !coreCompatibility?.migration_required &&
    (dockerfileRenku?.newer_renku_available ||
      template?.newer_template_available)
  )
    return ProjectMigrationLevel.Level3;
  // level 2 && 1
  if (!dockerfileRenku?.newer_renku_available) {
    // template missing/error
    if (
      templateError ||
      !template?.template_source ||
      template?.template_source === TemplateSourceRenku
    )
      return ProjectMigrationLevel.Level2;
    if (!templateError && !template?.newer_template_available)
      return ProjectMigrationLevel.Level1;
  }

  return ProjectMigrationLevel.LevelX;
}

export function getRenkuLevel(
  migrationStatus: MigrationStatus | undefined,
  backendAvailable: boolean
): RenkuMigrationLevel | null {
  let automated = false;
  if (!migrationStatus) return null;
  if (migrationStatus.errorProject)
    return { automated, level: ProjectMigrationLevel.LevelE };
  const { details } = migrationStatus;
  if (!details || !details.project_supported)
    return { automated, level: ProjectMigrationLevel.LevelX };
  const coreCompatibility =
    details.core_compatibility_status.type === "detail"
      ? details.core_compatibility_status
      : null;
  const dockerfileRenku =
    details.dockerfile_renku_status.type === "detail"
      ? details.dockerfile_renku_status
      : null;
  if (dockerfileRenku?.automated_dockerfile_update) automated = true;
  // level 5 && 4
  if (coreCompatibility?.migration_required) {
    if (backendAvailable !== false)
      return { automated, level: ProjectMigrationLevel.Level4 };
    return { automated, level: ProjectMigrationLevel.Level5 };
  }
  // level 3 && 1
  if (!coreCompatibility?.migration_required) {
    if (dockerfileRenku?.newer_renku_available)
      return { automated, level: ProjectMigrationLevel.Level3 };
    return { automated, level: ProjectMigrationLevel.Level1 };
  }
  return { automated: false, level: ProjectMigrationLevel.LevelX };
}

export function getTemplateLevel(
  migrationStatus: MigrationStatus | undefined,
  backendAvailable: boolean
): TemplateMigrationLevel | null {
  let automated = false;
  if (!migrationStatus) return null;
  if (migrationStatus.errorTemplate)
    return { automated, level: ProjectMigrationLevel.LevelE };
  const { details } = migrationStatus;
  if (!details || !details.project_supported)
    return { automated, level: ProjectMigrationLevel.LevelX };
  const template =
    details.template_status.type === "detail" ? details.template_status : null;
  const templateError =
    details.template_status.type === "error" ? details.template_status : null;

  if (template?.automated_template_update) automated = true;
  if (template?.newer_template_available)
    return { automated, level: ProjectMigrationLevel.Level3 };
  if (
    templateError ||
    !template?.template_source ||
    template?.template_source === TemplateSourceRenku
  )
    return { automated, level: ProjectMigrationLevel.Level2 };
  if (!templateError && !template?.newer_template_available)
    return { automated, level: ProjectMigrationLevel.Level1 };

  return { automated: false, level: ProjectMigrationLevel.LevelX };
}

// ****** SETTINGS COMPONENTS ****** //

interface ProjectSettingsGeneralWrapperProps {
  client: unknown;
  metadata: {
    accessLevel: number;
    defaultBranch: string;
    externalUrl: string;
    id: number;
    [key: string]: unknown;
  };
  migration: {
    core: {
      backendAvailable: boolean;
      fetched: Date;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
function ProjectSettingsGeneralWrapper(
  props: ProjectSettingsGeneralWrapperProps
) {
  const isMaintainer =
    props.metadata?.accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const checkingSupport = props.migration?.core?.fetched ? false : true;
  return (
    <>
      <ProjectSettingsGeneral
        branch={props.metadata?.defaultBranch}
        checkingSupport={checkingSupport}
        gitUrl={props.metadata?.externalUrl}
        isMaintainer={isMaintainer}
        isSupported={props.migration?.core?.backendAvailable}
        projectId={props.metadata?.id}
      />
      <ProjectSettingsGeneralLegacy {...props} />
    </>
  );
}
export { ProjectSettingsGeneralWrapper as ProjectSettingsGeneral };

interface ProjectSettingsGeneralProps {
  branch?: string;
  checkingSupport: boolean;
  gitUrl: string;
  projectId: number;
  isMaintainer: boolean;
  isSupported: boolean;
}
function ProjectSettingsGeneral({
  branch,
  checkingSupport,
  gitUrl,
  isMaintainer,
  isSupported,
  projectId,
}: ProjectSettingsGeneralProps) {
  return (
    <Card className="border-rk-light mb-4">
      <CardBody>
        <Row>
          <Col>
            <ProjectMigrationStatus
              branch={branch}
              checkingSupport={checkingSupport}
              gitUrl={gitUrl}
              isMaintainer={isMaintainer}
              isSupported={isSupported}
            />
            <ProjectKnowledgeGraph
              projectId={projectId}
              isMaintainer={isMaintainer}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

// ****** MIGRATION STATUS ****** //

interface ProjectMigrationStatusProps {
  branch?: string;
  checkingSupport: boolean;
  gitUrl: string;
  isMaintainer: boolean;
  isSupported: boolean;
}
function ProjectMigrationStatus({
  branch,
  checkingSupport,
  gitUrl,
  isMaintainer,
  isSupported,
}: ProjectMigrationStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleShowDetails = () => setShowDetails(!showDetails);

  const skip = !gitUrl || !branch;
  const { data, isLoading, error, refetch } =
    projectCoreApi.useGetMigrationStatusQuery({ gitUrl, branch }, { skip });
  const [startMigration, migrationStatus] =
    projectCoreApi.useStartMigrationMutation();

  if (isLoading || skip || checkingSupport) {
    return (
      <CompositeTitle
        icon={faTimesCircle}
        loading={true}
        showDetails={showDetails}
        title="Fetching project data..."
        toggleShowDetails={toggleShowDetails}
      />
    );
  }

  // ? This is a very unexpected error from the core service
  if (error || data?.errorProject) {
    const errorElement = error ? (
      <RtkErrorAlert error={{ ...error }} />
    ) : (
      <ProjectSettingsGeneralCoreError
        errorData={data.error as CoreErrorContent | CoreSectionError}
      />
    );
    return (
      <>
        <CompositeTitle
          icon={faExclamationCircle}
          level="danger"
          loading={false}
          showDetails={showDetails}
          title="Error on project version"
          toggleShowDetails={toggleShowDetails}
        />
        <Collapse isOpen={showDetails}>{errorElement}</Collapse>
      </>
    );
  }

  const migrationLevel = getMigrationLevel(data, isSupported);
  const buttonUpdate = (scope: MigrationStartScopes) => {
    buttonDisabled = true;
    buttonText = "Updating";
    if (scope === MigrationStartScopes.OnlyTemplate)
      buttonText = "Updating template";
    if (scope === MigrationStartScopes.OnlyVersion)
      buttonText = "Updating version";
    startMigration({
      gitUrl,
      branch,
      scope,
    }).then(() => {
      buttonDisabled = true;
      buttonText = "Updating";
      if (scope === MigrationStartScopes.OnlyTemplate)
        buttonText = "Updating template";
      if (scope === MigrationStartScopes.OnlyVersion)
        buttonText = "Updating version";
      setTimeout(() => {
        refetch();
      }, 2000);
    });
  };

  let buttonAction: undefined | (() => void);
  let buttonText: undefined | string;
  const buttonIcon = faArrowAltCircleUp;
  let buttonDisabled = false;
  let icon = faInfoCircle;
  let level = "danger";
  let title = "Unknown project status";
  if (migrationLevel === ProjectMigrationLevel.Level5) {
    icon = faExclamationCircle;
    title = "Project update required";
    buttonText = "Update";
    buttonAction = () => {
      buttonUpdate(MigrationStartScopes.All);
    };
  } else if (migrationLevel === ProjectMigrationLevel.Level4) {
    icon = faExclamationCircle;
    level = "warning";
    title = "Project update required";
    buttonText = "Update";
    buttonAction = () => {
      buttonUpdate(MigrationStartScopes.All);
    };
  } else if (migrationLevel === ProjectMigrationLevel.Level3) {
    icon = faExclamationCircle;
    level = "info";
    title = "Project update available";
    buttonText = "Update";
    buttonAction = () => {
      buttonUpdate(MigrationStartScopes.All);
    };
  } else if (migrationLevel === ProjectMigrationLevel.Level2) {
    icon = faCheckCircle;
    level = "info";
    title = "Project up to date*";
  } else if (migrationLevel === ProjectMigrationLevel.Level1) {
    icon = faCheckCircle;
    level = "success";
    title = "Project up to date";
  }

  // handle maintainer status and ongoing update
  if (!isMaintainer) {
    buttonDisabled = true;
  }
  if (migrationStatus.isLoading) {
    buttonDisabled = true;
    buttonText = "Updating";
  }

  return (
    <>
      <CompositeTitle
        buttonAction={buttonAction}
        buttonDisabled={buttonDisabled}
        buttonIcon={buttonIcon}
        buttonText={buttonText}
        icon={icon}
        level={level}
        loading={isLoading}
        showDetails={showDetails}
        title={title}
        toggleShowDetails={toggleShowDetails}
      />
      <ProjectMigrationStatusDetails
        data={data}
        isSupported={isSupported}
        showDetails={showDetails}
      />
    </>
  );
}

interface ProjectMigrationStatusDetailsProps {
  // isMaintainer: boolean;
  data: MigrationStatus | undefined;
  isSupported: boolean;
  showDetails: boolean;
}
function ProjectMigrationStatusDetails({
  data,
  isSupported,
  showDetails,
}: ProjectMigrationStatusDetailsProps) {
  // Renku Version details
  const docker =
    data?.details?.dockerfile_renku_status.type === "detail"
      ? data.details.dockerfile_renku_status
      : null;
  const metadata =
    data?.details?.core_compatibility_status.type === "detail"
      ? data.details.core_compatibility_status
      : null;
  const renkuProjectVersion = cleanVersion(docker?.dockerfile_renku_version);
  const renkuLatestVersion = cleanVersion(docker?.latest_renku_version);

  let renkuDetails: React.ReactNode = <span>No details</span>;
  const renkuMigrationLevel = getRenkuLevel(data, isSupported);
  const renkuTitleId = "settings-renku-version";
  const renkuTitle = "Renku version";
  const renkuTitleDocsUrl = Docs.rtdHowToGuide("general/upgrading-renku.html");
  const renkuTitleInfo =
    "The Renku version defined what Renku features are supported. Keep it updated!";
  let renkuLevel = "danger";
  let renkuIcon = faExclamationCircle;
  let renkuText: string | React.ReactNode = "No data";
  if (renkuMigrationLevel?.level === ProjectMigrationLevel.LevelX) {
    renkuText = "Unknown version";
    renkuDetails = (
      <span>Details not available for this unknown version of Renku.</span>
    );
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.LevelE) {
    renkuDetails = (
      <ProjectSettingsGeneralCoreError
        errorData={data?.error as CoreSectionError}
      />
    );
  }
  if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level5) {
    renkuIcon = faExclamationCircle;
    renkuText = (
      <RenkuVersionOutdated
        renkuLatestVersion={renkuLatestVersion}
        renkuProjectVersion={renkuProjectVersion}
      />
    );
    renkuDetails = (
      <RenkuVersionContext
        docsUrl={renkuTitleDocsUrl}
        latestVersion={metadata?.current_metadata_version}
        migrationLevel={renkuMigrationLevel?.level}
        projectVersion={metadata?.project_metadata_version}
      />
    );
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level4) {
    renkuLevel = "warning";
    renkuIcon = faExclamationCircle;
    renkuText = (
      <RenkuVersionOutdated
        renkuLatestVersion={renkuLatestVersion}
        renkuProjectVersion={renkuProjectVersion}
      />
    );
    renkuDetails = (
      <RenkuVersionContext
        docsUrl={renkuTitleDocsUrl}
        latestVersion={metadata?.current_metadata_version}
        migrationLevel={renkuMigrationLevel?.level}
        projectVersion={metadata?.project_metadata_version}
      />
    );
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level3) {
    renkuLevel = "info";
    renkuIcon = faInfoCircle;
    renkuText = (
      <RenkuVersionOutdated
        renkuLatestVersion={renkuLatestVersion}
        renkuProjectVersion={renkuProjectVersion}
      />
    );
    renkuDetails = (
      <RenkuVersionContext
        docsUrl={renkuTitleDocsUrl}
        migrationLevel={renkuMigrationLevel?.level}
      />
    );
    // ! TODO - finish level 1
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level1) {
    renkuIcon = faCheckCircle;
    renkuLevel = "success";
    renkuText = `v${docker?.dockerfile_renku_version}`;
    renkuDetails = <span>Level 1</span>;
  }

  const contentRenku = (
    <DetailsSection
      details={renkuDetails}
      icon={renkuIcon}
      level={renkuLevel}
      text={renkuText}
      title={renkuTitle}
      titleId={renkuTitleId}
      titleInfo={renkuTitleInfo}
      titleDocsUrl={renkuTitleDocsUrl}
    />
  );

  // Template version details
  // const template =
  //   data?.details?.template_status.type === "detail"
  //     ? data.details.template_status
  //     : null;

  let templateDetails: React.ReactNode = <span>No details</span>;
  const templateMigrationLevel = getTemplateLevel(data, isSupported);
  const templateTitleId = "settings-template-version";
  const templateTitle = "Template version";
  const templateTitleDocsUrl = Docs.rtdReferencePage("templates.html");
  const templateTitleInfo =
    "Templates define the basic framework fo your project.";
  let templateLevel = "danger";
  let templateIcon = faCheckCircle;
  let templateText: string | React.ReactNode = "Unknown version";
  if (templateMigrationLevel?.level === ProjectMigrationLevel.LevelX) {
    templateDetails = (
      <span>Details not available for this unknown version of template.</span>
    );
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.LevelE) {
    templateText = "Error";
    templateDetails = (
      <ProjectSettingsGeneralCoreError
        errorData={data?.details?.template_status as CoreSectionError}
      />
    );
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.Level3) {
    // New version available
    templateLevel = "info";
    templateIcon = faArrowAltCircleUp;
    templateDetails = (
      <RenkuTemplateContext
        automated={templateMigrationLevel.automated}
        templateDetails={data?.details}
      />
    );
    templateText = <RenkuTemplateOutdated templateDetails={data?.details} />;
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.Level2) {
    // Some details missing
    templateLevel = "info";
    templateIcon = faExclamationCircle;
    templateDetails = (
      <RenkuTemplateContext
        automated={templateMigrationLevel.automated}
        templateDetails={data?.details}
      />
    );
    templateText = <RenkuTemplateOutdated templateDetails={data?.details} />;
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.Level1) {
    templateLevel = "success";
    templateIcon = faCheckCircle;
    // ! TODO: EXPAND RenkuTemplateOutdated and add templateDetails to handle Level1
    templateDetails = <span>Level 1</span>;
    templateText = <RenkuTemplateOutdated templateDetails={data?.details} />;
  }

  const contentTemplate = (
    <DetailsSection
      details={templateDetails}
      icon={templateIcon}
      level={templateLevel}
      text={templateText}
      title={templateTitle}
      titleId={templateTitleId}
      titleInfo={templateTitleInfo}
      titleDocsUrl={templateTitleDocsUrl}
    />
  );

  return (
    <Collapse isOpen={showDetails}>
      {contentRenku}
      {contentTemplate}
    </Collapse>
  );
}

// ****** KNOWLEDGE GRAPH ****** //

interface ProjectKnowledgeGraphProps {
  isMaintainer: boolean;
  projectId: number;
}
function ProjectKnowledgeGraph({
  isMaintainer,
  projectId,
}: ProjectKnowledgeGraphProps) {
  const LONG_POLLING = 2 * 60 * 1000;
  const NO_POLLING = 0;
  const SHORT_POLLING = 5 * 1000;

  const [showDetails, setShowDetails] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(0);
  const toggleShowDetails = () => setShowDetails(!showDetails);

  const skip = !projectId;
  const { data, isLoading, isUninitialized, error, refetch } =
    projectKgApi.useGetProjectIndexingStatusQuery(projectId, {
      refetchOnMountOrArgChange: 20,
      skip,
      pollingInterval,
    });
  const [activateIndexing, activateIndexingStatus] =
    projectKgApi.useActivateIndexingMutation();

  // Add polling for non-activated projects
  useEffect(() => {
    if (!isUninitialized && !isLoading) {
      if (!data?.activated) setPollingInterval(LONG_POLLING);
      else if (data?.details?.status === ProjectIndexingStatuses.InProgress)
        setPollingInterval(SHORT_POLLING);
      else setPollingInterval(NO_POLLING);
    }
  }, [
    data,
    isUninitialized,
    isLoading,
    LONG_POLLING,
    NO_POLLING,
    SHORT_POLLING,
  ]);

  if (isLoading || skip) {
    return (
      <CompositeTitle
        icon={faTimesCircle}
        loading={true}
        showDetails={showDetails}
        title="Fetching project metadata..."
        toggleShowDetails={toggleShowDetails}
      />
    );
  }

  if (error) {
    return (
      <>
        <CompositeTitle
          icon={faExclamationCircle}
          level="danger"
          loading={false}
          showDetails={showDetails}
          title="Error on project metadata"
          toggleShowDetails={toggleShowDetails}
        />
        <Collapse isOpen={showDetails}>
          <RtkErrorAlert error={{ ...error }} />
        </Collapse>
      </>
    );
  }

  let icon = faCheckCircle;
  let level = "success";
  let title = "Knowledge Graph metadata";
  if (!data?.activated) {
    title = "Activate Knowledge Graph integration";
    level = "danger";
    icon = faExclamationCircle;
  } else if (data?.progress?.done !== data?.progress?.total) {
    title = "Knowledge Graph metadata (processing)";
    level = "info";
  } else if (data.details?.status === ProjectIndexingStatuses.Failure) {
    level = "info";
  }

  const canUpdate = !data?.activated // ! && user.hasPermissions
    ? true
    : false;
  const buttonIcon = canUpdate ? faPlusCircle : faArrowAltCircleUp;
  let buttonDisabled = false;
  let buttonText = canUpdate ? "Activate" : undefined;
  if (activateIndexingStatus.isLoading) {
    buttonDisabled = true;
    buttonText = "Activating";
  }
  const buttonAction = () => {
    buttonText = "Activating";
    buttonDisabled = true;
    activateIndexing(projectId).then(() => {
      buttonText = "Activating";
      buttonDisabled = true;
      setTimeout(() => {
        refetch();
      }, 2000);
    });
  };

  // ! TODO: only for users with permissions! A.K.A isMaintainer
  // ! TODO: handle errors on click: activateIndexingStatus.isError
  return (
    <>
      <CompositeTitle
        buttonAction={buttonAction}
        buttonDisabled={buttonDisabled}
        buttonIcon={buttonIcon}
        buttonText={buttonText}
        icon={icon}
        level={level}
        loading={isLoading}
        showDetails={showDetails}
        title={title}
        toggleShowDetails={toggleShowDetails}
      />
      <KnowledgeGraphDetails data={data} showDetails={showDetails} />
    </>
  );
}

interface KnowledgeGraphDetailsProps {
  data: ProjectIndexingStatusResponse | undefined;
  showDetails: boolean;
}
function KnowledgeGraphDetails({
  data,
  showDetails,
}: KnowledgeGraphDetailsProps) {
  let content: React.ReactNode;
  if (!data) {
    content = <p>No details available</p>;
  } else {
    const titleId = "settings-kg-indexing";
    const titleInfo =
      "Service that processes project's metadata. RenkuLab requires it for most functionalities.";
    const titleDocsUrl = Docs.rtdTopicGuide(
      "miscellaneous/knowledge-graph.html"
    );
    if (data.activated) {
      const level =
        data.details?.status === ProjectIndexingStatuses.Success
          ? "success"
          : "info";
      let text = "Knowledge Graph integration"; // ? should overwrite this with something more specific
      let detailsElement: React.ReactNode = undefined;
      if (data.progress?.done === data.progress?.total) {
        if (data.details?.status === ProjectIndexingStatuses.Success) {
          text = "Everything processed";
        } else if (data.details?.status === ProjectIndexingStatuses.Failure) {
          text = "Everything processed but an error was raised";
          if (data.details?.message)
            detailsElement = <span>Error details: {data.details.message}</span>;
        }
      } else {
        text = "Processing data";
      }
      if (data.details?.status === ProjectIndexingStatuses.InProgress) {
        const detailsFirstPart = (
          <span>
            The Knowledge Graph is processing project&apos;s events. Some
            information about the local entities might be outdated until this
            process has finished.
          </span>
        );
        if (data.progress?.done === data.progress?.total) {
          detailsElement = detailsFirstPart;
        } else {
          detailsElement = (
            <>
              {detailsFirstPart}
              <br />
              <span className="d-block mt-2">
                Processing status: {data.progress?.percentage}%
              </span>
            </>
          );
        }
      }

      content = (
        <DetailsSection
          details={detailsElement}
          icon={faCheckCircle}
          level={level}
          text={text}
          title="Knowledge Graph metadata"
          titleId={titleId}
          titleInfo={titleInfo}
          titleDocsUrl={titleDocsUrl}
        />
      );
    } else {
      const detailsText = (
        <span>
          The Knowledge Graph integration must be activated to use this project
          from the RenkuLab web interfaces. Otherwise, the functionalities will
          be limited and the project will not be discoverable from the search
          page. <MoreInfoLink url={titleDocsUrl} />
        </span>
      );
      content = (
        <DetailsSection
          details={detailsText}
          icon={faExclamationCircle}
          level="danger"
          text="Not activated"
          title="Knowledge Graph metadata"
          titleId={titleId}
          titleInfo={titleInfo}
          titleDocsUrl={titleDocsUrl}
        />
      );
    }
  }
  return <Collapse isOpen={showDetails}>{content}</Collapse>;
}

interface ProjectSettingsGeneralCoreErrorProps {
  errorData: CoreErrorContent | CoreSectionError;
}
function ProjectSettingsGeneralCoreError({
  errorData,
}: ProjectSettingsGeneralCoreErrorProps) {
  return <CoreErrorAlert error={errorData} />;
}

// ****** HELPERS ****** //
interface MoreInfoLinkProps {
  url: string;
}
function MoreInfoLink({ url }: MoreInfoLinkProps) {
  return (
    <span className="d-inline-block">
      <ExternalLink
        url={url}
        role="text"
        iconSup={true}
        iconAfter={true}
        title="More info"
      />
    </span>
  );
}

interface CompositeTitleProps {
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  buttonIcon?: IconProp;
  buttonText?: string;
  level?: string;
  loading: boolean;
  icon: IconProp;
  showDetails: boolean;
  title: string;
  toggleShowDetails: () => void;
}
function CompositeTitle({
  buttonAction,
  buttonDisabled,
  buttonIcon,
  buttonText,
  level,
  loading,
  icon,
  showDetails,
  title,
  toggleShowDetails,
}: CompositeTitleProps) {
  const finalIcon = loading ? (
    <Loader inline={true} size={14} />
  ) : (
    <FontAwesomeIcon icon={icon} />
  );
  const color = level ? `text-${level}` : "";
  const caret = showDetails ? <ChevronUp /> : <ChevronDown />;
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ? (
      <FontAwesomeIcon icon={buttonIcon} />
    ) : null;
    const finalButtonText = (
      <>
        {finalButtonIcon} {buttonText}
      </>
    );
    const buttonActionStyle = {
      disabled: buttonDisabled,
      color: level !== "success" ? level : "secondary",
      size: "sm",
    };
    if (buttonAction)
      button = (
        <Button {...buttonActionStyle} onClick={() => buttonAction()}>
          {finalButtonText}
        </Button>
      );
    // ? this case _should_ not happen
    else button = <Button {...buttonActionStyle}>{finalButtonText}</Button>;
  }

  return (
    <>
      <div className={styles.projectStatusSection}>
        <h6 className="d-flex align-items-center w-100 mb-0">
          <div className={`me-2 ${color}`}>{finalIcon}</div>
          <div>{title}</div>
          {loading ? null : (
            <>
              <div
                className="mx-3 cursor-pointer"
                onClick={() => toggleShowDetails()}
              >
                {caret}
              </div>
              <div className="ms-auto">{button}</div>
            </>
          )}
        </h6>
      </div>
    </>
  );
}

interface DetailsSectionProps {
  buttonAction?: () => void;
  buttonIcon?: IconProp;
  buttonText?: string;
  details?: React.ReactElement;
  level?: string;
  icon: IconProp;
  text: string | React.ReactNode;
  title: string;
  titleId: string;
  titleInfo?: string;
  titleDocsUrl?: string;
}
function DetailsSection({
  buttonAction,
  buttonIcon,
  buttonText,
  details,
  level,
  icon,
  text,
  title,
  titleId,
  titleInfo,
  titleDocsUrl,
}: DetailsSectionProps) {
  const finalIcon = <FontAwesomeIcon icon={icon} />;
  const color = level ? `text-${level}` : "";
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ? (
      <FontAwesomeIcon icon={buttonIcon} />
    ) : null;
    const finalButtonText = (
      <>
        {finalButtonIcon} {buttonText}
      </>
    );
    if (buttonAction)
      button = (
        <Button color={level} size="sm" onClick={() => buttonAction()}>
          {finalButtonText}
        </Button>
      );
    else
      button = (
        <Button color={level} size="sm">
          {finalButtonText}
        </Button>
      );
  }

  const detailsContent = details ? (
    <div className="mt-2">
      <small className="fst-italic">{details}</small>
    </div>
  ) : null;

  let titlePopover: React.ReactNode = null;
  if (titleInfo) {
    const externalLinkStyles = {
      className: "text-rk-white",
      role: "text",
      iconSup: true,
      iconAfter: true,
    };
    const titleUrl = titleDocsUrl ? (
      <span>
        <br />
        <ExternalLink
          url={titleDocsUrl}
          {...externalLinkStyles}
          title="More info"
        />
      </span>
    ) : null;
    titlePopover = (
      <UncontrolledTooltip placement="top" target={titleId} autohide={false}>
        {titleInfo} {titleUrl}
      </UncontrolledTooltip>
    );
  }

  const textElement: React.ReactNode =
    typeof text === "string" ? <span>{text}</span> : text;

  return (
    <>
      <div className={styles.projectStatusDetailsSection}>
        <div className="d-flex align-items-center w-100">
          <div>
            <span id={titleId}>{title}</span>
            {titlePopover}
          </div>
          <div className={`mx-3 ${color}`}>{finalIcon}</div>
          <div>{textElement}</div>
          <div className="ms-auto">{button}</div>
        </div>
        {detailsContent}
      </div>
    </>
  );
}

interface RenkuVersionOutdatedProps {
  renkuLatestVersion: string;
  renkuProjectVersion: string;
}
function RenkuVersionOutdated({
  renkuLatestVersion,
  renkuProjectVersion,
}: RenkuVersionOutdatedProps) {
  const renkuProjectCompareUrl = getCompareUrl(
    renkuProjectVersion,
    renkuLatestVersion
  );
  const renkuProjectReleaseUrl = getReleaseUrl(renkuLatestVersion);
  const renkuProjectVersionElement = renkuProjectCompareUrl ? (
    <ExternalLink
      role="text"
      url={renkuProjectCompareUrl}
      title={renkuProjectVersion}
    />
  ) : (
    <span>{renkuProjectVersion}</span>
  );
  const renkuLatestVersionElement = renkuProjectReleaseUrl ? (
    <ExternalLink
      role="text"
      url={renkuProjectReleaseUrl}
      title={renkuLatestVersion}
    />
  ) : (
    <span>{renkuLatestVersion}</span>
  );
  return (
    <>
      {renkuProjectVersionElement} ({renkuLatestVersionElement} avaliable)
    </>
  );
}

interface RenkuVersionContextProps {
  docsUrl: string;
  latestVersion?: string;
  migrationLevel: ProjectMigrationLevel;
  projectVersion?: string;
}
function RenkuVersionContext({
  docsUrl,
  latestVersion,
  migrationLevel,
  projectVersion,
}: RenkuVersionContextProps) {
  const moreInfoLink = <MoreInfoLink url={docsUrl} />;
  const linkToRenku = (
    <ExternalLink role="text" url={RenkuRepositories.Python} title="Renku" />
  );
  if (migrationLevel === ProjectMigrationLevel.Level5) {
    return (
      <>
        <span>
          The project is strongly outdated and most interaction on RenkuLab will
          not be available (E.G. with datasets, workflows, session settings,
          ...).
        </span>
        <br />
        <span>
          This happens because the underlying {linkToRenku} project metadata is
          still on version {projectVersion} while the latest version is{" "}
          {latestVersion}. {moreInfoLink}
        </span>
      </>
    );
  } else if (migrationLevel === ProjectMigrationLevel.Level4) {
    return (
      <>
        <span>
          The project is outdated. You can still use it on RenkuLab but some
          features might not be available.
        </span>
        <br />
        <span>
          This happens because the underlying {linkToRenku} project metadata is
          still on version {projectVersion} while the latest version is{" "}
          {latestVersion}. {moreInfoLink}
        </span>
      </>
    );
  } else if (migrationLevel === ProjectMigrationLevel.Level3) {
    return (
      <>
        <span>
          There is a new {linkToRenku} version. Updating should be safe since it
          is a minor step. {moreInfoLink}
        </span>
      </>
    );
  }

  return null;
}

interface RenkuTemplateOutdatedProps {
  templateDetails: MigrationStatus["details"];
}
function RenkuTemplateOutdated({
  templateDetails,
}: RenkuTemplateOutdatedProps) {
  const template =
    templateDetails?.template_status.type === "detail"
      ? templateDetails.template_status
      : null;
  if (!template) return null;
  if (template.template_source !== TemplateSourceRenku) {
    const deltaUrl = `${template.template_source}/compare/${template.project_template_version}...${template.latest_template_version}`;
    const deltaLink = (
      <ExternalLink
        role="text"
        url={deltaUrl}
        title={template.project_template_version}
      />
    );
    const latestUrl = `${template.template_source}/releases/tag/${template.latest_template_version}`;
    const latestLink = (
      <ExternalLink
        role="text"
        url={latestUrl}
        title={template.latest_template_version}
      />
    );
    return (
      <>
        {deltaLink} ({latestLink} avaliable)
      </>
    );
  } else if (template.template_source === TemplateSourceRenku) {
    if (template.newer_template_available)
      return (
        <>
          {template.project_template_version} (
          {template.latest_template_version} avaliable)
        </>
      );
    return <>{template.project_template_version}</>;
  }
  // ! TODO: EXPAND THIS, handle Level1
  return <span>NOT IMPLEMENTED YET</span>;
}

interface RenkuTemplateContextProps {
  automated: boolean;
  templateDetails: MigrationStatus["details"];
}
function RenkuTemplateContext({
  automated,
  templateDetails,
}: RenkuTemplateContextProps) {
  const template =
    templateDetails?.template_status.type === "detail"
      ? templateDetails.template_status
      : null;

  if (template?.newer_template_available) {
    const templateManualLink = (
      <ExternalLink
        role="text"
        url={Docs.rtdPythonReferencePage("commands/template.html")}
        title="Renku Update"
      />
    );
    let updateInfo: React.ReactNode = null;
    if (automated) {
      updateInfo = (
        <>You can click on the Update button to automatically update it.</>
      );
    } else if (template.template_source !== TemplateSourceRenku) {
      updateInfo = (
        <>
          Automatic update is not available. You can update the template
          manually in a session by using the {templateManualLink} command.
        </>
      );
    }

    let templateElement: React.ReactNode = null;
    let extraInfo: React.ReactNode = null;
    if (template.template_source !== TemplateSourceRenku) {
      let templateUrl = template?.template_source;
      if (template?.latest_template_version)
        templateUrl += `/tree/${template?.latest_template_version}`;
      else if (template?.template_ref)
        templateUrl += `/tree/${template?.template_ref}`;
      templateElement =
        templateUrl && template?.template_id ? (
          <ExternalLink
            role="text"
            url={templateUrl}
            title={template?.template_id}
          />
        ) : null;
    } else {
      templateElement = template?.template_id ? (
        <span>{template.template_id}</span>
      ) : null;
      extraInfo = (
        <>
          <br />
          <span>
            Mind that the project uses a default template from this RenkuLab
            deployment, therefore there is no link to a remote reference
            template you can check. You can still check the full description
            when creating a new project using the same template id.
          </span>
        </>
      );
    }

    return (
      <span>
        There is a new version for the template {templateElement} used in this
        project. {updateInfo} {extraInfo}{" "}
        <MoreInfoLink url={Docs.rtdReferencePage("templates.html")} />
      </span>
    );
  } else if (template?.template_source === TemplateSourceRenku) {
    return (
      <span>
        We could not find updates for the {template?.template_id} template used
        in this project.
        <br />
        Mind that the project uses a default template from this RenkuLab
        deployment that is cached locally. We cannot verify whether a newer
        version was recently published in the remote repository.{" "}
        <MoreInfoLink url={Docs.rtdReferencePage("templates.html")} />
      </span>
    );
  }
  // ! TODO
  // ! else { return <span>All good!</span> }

  return <span>NOT IMPLEMENTED YET</span>;
}

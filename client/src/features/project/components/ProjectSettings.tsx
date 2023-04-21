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
import { Button, Card, CardBody, Col, Collapse, Row, UncontrolledTooltip } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleUp, faCheckCircle, faExclamationCircle, faInfoCircle, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { ChevronDown, ChevronUp } from "../../../utils/ts-wrappers";
import { CoreErrorContent } from "../../../utils/definitions";
import { CoreSectionError, MigrationStatus, ProjectIndexingStatusResponse } from "../Project";
import { ProjectIndexingStatuses } from "../ProjectEnums";
import { ProjectSettingsGeneral as ProjectSettingsGeneralLegacy } from "../../../project/settings";
import { projectVersionApi } from "../projectVersionApi";
import { projectKgApi } from "../projectKgApi";
import { Loader } from "../../../components/Loader";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { ErrorAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Docs } from "../../../utils/constants/Docs";

import styles from "./ProjectSettings.module.scss";


// ****** INTERFACES AND ENUMS ****** //
/* eslint-disable no-multi-spaces */
export enum ProjectMigrationLevel {
  Level1 = "1-all-good",            // ? success
  Level2 = "2-some-info-no-update", // ? info
  Level3 = "3-minor-update",        // ? info
  Level4 = "4-suggested-update",    // ? warning
  Level5 = "5-required-update",     // ? danger
  LevelE = "error",                 // ? danger
  LevelX = "x-unknown"              // ? danger
}

export enum ProjectIndexingLevel {
  Level1 = "1-all-good",            // ? success
  Level2 = "2-some-info-no-update", // ? info
  Level5 = "5-required-update",     // ? danger
  LevelE = "error",                 // ? danger
  LevelX = "x-unknown"              // ? danger
}
/* eslint-enable no-multi-spaces */

function getMigrationLevel(migrationStatus: MigrationStatus): ProjectMigrationLevel {
  // ? REF: https://www.notion.so/Project-status-889f7a0f16574c84a4b7af344683623b
  if (migrationStatus.errorProject)
    return ProjectMigrationLevel.LevelE;
  const { details } = migrationStatus;
  if (!details || !details.project_supported)
    return ProjectMigrationLevel.LevelX;
  // level 1, 2 or 3
  const coreCompatibility = details.core_compatibility_status.type === "detail" ?
    details.core_compatibility_status : null;
  const dockerfileRenku = details.dockerfile_renku_status.type === "detail" ?
    details.dockerfile_renku_status : null;
  const template = details.template_status.type === "detail" ?
    details.template_status : null;
  const templateError = details.template_status.type === "error" ?
    details.template_status : null;
  // level 1, 2, 3
  if (coreCompatibility?.migration_required) {
    // if (details.dockerfile_renku_status.type === "detail" && )
    if (!dockerfileRenku?.newer_renku_available && !templateError && !template?.newer_template_available)
      return ProjectMigrationLevel.Level1;
    // ! CONTINUE FROM HERE
  }
  // level >=4

  return ProjectMigrationLevel.LevelX;
}


// ****** SETTINGS COMPONENTS ****** //

interface ProjectSettingsGeneralWrapperProps {
  client: unknown;
  metadata: {
    defaultBranch: string;
    externalUrl: string;
    id: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
function ProjectSettingsGeneralWrapper(props: ProjectSettingsGeneralWrapperProps) {
  return (<>
    <ProjectSettingsGeneral
      branch={props.metadata?.defaultBranch}
      gitUrl={props.metadata?.externalUrl}
      projectId={props.metadata?.id}
    />
    <ProjectSettingsGeneralLegacy {...props} />
  </>);
}
export { ProjectSettingsGeneralWrapper as ProjectSettingsGeneral };


interface ProjectSettingsGeneralProps {
  branch?: string;
  gitUrl: string;
  projectId: number;
}
function ProjectSettingsGeneral({ branch, gitUrl, projectId }: ProjectSettingsGeneralProps) {
  return (
    <Card className="border-rk-light mb-4">
      <CardBody> {/* className="lh-lg" */}
        <Row>
          <Col>
            <h4 className="mb-3">Project status</h4>
            <MigrationStatus branch={branch} gitUrl={gitUrl} />
            <KnowledgeGraph projectId={projectId} />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}


// ****** MIGRATION STATUS ****** //

interface MigrationStatusProps {
  branch?: string;
  gitUrl: string;
}
function MigrationStatus({ branch, gitUrl }: MigrationStatusProps) {
  const skip = !gitUrl || !branch;
  const { data, isLoading, error } = projectVersionApi.useGetMigrationStatusQuery(
    { gitUrl, branch }, { skip }
  );

  if (isLoading || skip)
    return (<SettingsPropsCard><Loader /></SettingsPropsCard>);

  // ? This is a very unexpected error from the core service, we don't need more precision.
  if (error) {
    return (
      <SettingsPropsCard>
        <ErrorAlert>
          Unexpected error while checking the project status.
        </ErrorAlert>
      </SettingsPropsCard>
    );
  }

  // ! TODO: expand error handling
  if (data?.errorProject)
    return (<ProjectSettingsGeneralCoreError errorData={data.error as CoreErrorContent | CoreSectionError} />);

  return (
    <>
      <h5>Up-to-date or not</h5>
      <p>Loading: {isLoading ? "true" : "false"}</p>
      <p>Skipping: {skip ? "true" : "false"}</p>
      <p>data Migration: {JSON.stringify(data)}</p>
    </>
  );
}


// ****** KNOWLEDGE GRAPH ****** //

interface KnowledgeGraphProps {
  projectId: number;
}
function KnowledgeGraph({ projectId }: KnowledgeGraphProps) {
  const LONG_POLLING = 2 * 60 * 1000;
  const NO_POLLING = 0;
  const SHORT_POLLING = 5 * 1000;

  const [showDetails, setShowDetails] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(0);
  const toggleShowDetails = () => setShowDetails(!showDetails);

  const skip = !projectId;
  const { data, isLoading, isUninitialized, error, refetch } = projectKgApi.useGetProjectIndexingStatusQuery(
    projectId, { refetchOnMountOrArgChange: 20, skip, pollingInterval }
  );
  const [activateIndexing, activateIndexingStatus] = projectKgApi.useActivateIndexingMutation();

  // Add polling for non-activated projects
  useEffect(() => {
    if (!isUninitialized && !isLoading) {
      if (!data?.activated)
        setPollingInterval(LONG_POLLING);
      else if (data?.details?.status === ProjectIndexingStatuses.InProgress)
        setPollingInterval(SHORT_POLLING);
      else
        setPollingInterval(NO_POLLING);
    }
  }, [data, isUninitialized, isLoading, LONG_POLLING, NO_POLLING, SHORT_POLLING]);

  if (isLoading || skip)
    return (<SettingsPropsCard><Loader /></SettingsPropsCard>);

  // ! TODO: expand error handling
  if (error) {
    return (
      <SettingsPropsCard>
        <ErrorAlert>
          {JSON.stringify(error)}
        </ErrorAlert>
      </SettingsPropsCard>
    );
  }

  let icon = faCheckCircle;
  let level = "success";
  let title = "Knowledge Graph metadata";
  if (!data?.activated) {
    title = "Activate Knowledge Graph integration";
    level = "danger";
    icon = faExclamationCircle;
  }
  else if (data?.progress?.done !== data?.progress?.total) {
    title = "Knowledge Graph metadata (processing)";
    level = "info";
  }
  else if (data.details?.status === ProjectIndexingStatuses.Failure) {
    level = "info";
  }

  const canUpdate = !data?.activated ? // ! && user.hasPermissions
    true :
    false;
  const buttonIcon = faArrowAltCircleUp;
  let buttonDisabled = false;
  let buttonText = canUpdate ?
    "Activate" :
    undefined;
  if (activateIndexingStatus.isLoading) {
    buttonDisabled = true;
    buttonText = "Activating";
  }
  // ! activateIndexingStatus.isError
  const buttonAction = () => {
    buttonText = "Activating";
    buttonDisabled = true;
    activateIndexing(projectId).then(() => {
      buttonText = "Activating";
      buttonDisabled = true;
      setTimeout(() => { refetch(); }, 2000);
    });
  };

  // ! TODO: update button
  // ! --> only for users with permissions!
  // ! TODO continue from here
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
function KnowledgeGraphDetails({ data, showDetails }: KnowledgeGraphDetailsProps) {
  let content: React.ReactNode;
  if (!data) {
    content = <p>No details available</p>;
  }
  else {
    const titleId = "settings-kg-indexing";
    const titleInfo = "Service that processes project's metadata. RenkuLab requires it for most functionalities.";
    const titleDocsUrl = Docs.rtdTopicGuide("miscellaneous/knowledge-graph.html");
    if (data.activated) {
      const level = (data.details?.status === ProjectIndexingStatuses.Success) ?
        "success" :
        "info";
      let text = "Knowledge Graph integration"; // ? should overwrite this with something more specific
      let detailsElement: React.ReactNode = undefined;
      if (data.progress?.done === data.progress?.total) {
        if (data.details?.status === ProjectIndexingStatuses.Success) {
          text = "Everything processed";
        }
        else if (data.details?.status === ProjectIndexingStatuses.Failure) {
          text = "Everything processed but an error was raised";
          if (data.details?.message)
            detailsElement = (<span>Error details: {data.details.message}</span>);
        }
      }
      else {
        text = "Processing data";
      }
      if (data.details?.status === ProjectIndexingStatuses.InProgress) {
        const detailsFirstPart = (<span>
          The Knowledge Graph is processing project&apos;s events. Some information
          about the local entities might be outdated until this process has finished.
        </span>);
        if (data.progress?.done === data.progress?.total) {
          detailsElement = detailsFirstPart;
        }
        else {
          detailsElement = (<>
            {detailsFirstPart}<br />
            <span className="d-block mt-2">Processing status: {data.progress?.percentage}%</span>
          </>);
        }
      }

      content = (<DetailsSection
        details={detailsElement}
        icon={faCheckCircle}
        level={level}
        text={text}
        title="Knowledge Graph metadata"
        titleId={titleId}
        titleInfo={titleInfo}
        titleDocsUrl={titleDocsUrl}
      />);
    }
    else {
      const detailsText = (<span>
        The Knowledge Graph integration must be activated to use this project from the RenkuLab web interfaces.
        Otherwise, the functionalities will be limited and the project  will not be discoverable from the search page.
        {" "}<ExternalLink url={titleDocsUrl} role="text" iconSup={true} iconAfter={true} title="More info" />
      </span>);
      content = (<DetailsSection
        details={detailsText}
        icon={faExclamationCircle}
        level="danger"
        text="Not activated"
        title="Knowledge Graph metadata"
        titleId={titleId}
        titleInfo={titleInfo}
        titleDocsUrl={titleDocsUrl}
      />);
    }
  }
  return (<>
    <Collapse isOpen={showDetails}>{content}</Collapse>
  </>);
}


interface ProjectSettingsGeneralCoreErrorProps {
  errorData: CoreErrorContent | CoreSectionError;
}
function ProjectSettingsGeneralCoreError({ errorData }: ProjectSettingsGeneralCoreErrorProps) {
  return (<SettingsPropsCard><CoreErrorAlert error={errorData} /></SettingsPropsCard>);
}


// ****** HELPERS ****** //

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
  toggleShowDetails: () => void
}
function CompositeTitle({
  buttonAction, buttonDisabled, buttonIcon, buttonText, level, loading, icon, showDetails, title, toggleShowDetails
}: CompositeTitleProps) {
  const finalIcon = loading ?
    (<Loader inline={true} size={14} />) :
    (<FontAwesomeIcon icon={icon} />);
  const color = level ?
    `text-${level}` :
    "";
  const caret = showDetails ?
    (<ChevronUp />) :
    (<ChevronDown />);
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ?
      (<FontAwesomeIcon icon={buttonIcon} />) :
      null;
    const finalButtonText = (<>{finalButtonIcon} {buttonText}</>);
    const buttonActionStyle = { disabled: buttonDisabled, color: level, size: "sm" };
    if (buttonAction)
      button = (<Button {...buttonActionStyle} onClick={() => buttonAction()}>{finalButtonText}</Button>);
    else // ? this case _should_ not happen
      button = (<Button {...buttonActionStyle}>{finalButtonText}</Button>);
  }

  return (<>
    <div className={styles.projectStatusSection}>
      <h5 className="d-flex align-items-center w-100 mb-0">
        <div className={`me-2 ${color}`}>{finalIcon}</div>
        <div>{title}</div>
        <div className="mx-3 cursor-pointer" onClick={() => toggleShowDetails()}>{caret}</div>
        <div className="ms-auto">{button}</div>
      </h5>
    </div>
  </>);
}


interface DetailsSectionProps {
  buttonAction?: () => void;
  buttonIcon?: IconProp;
  buttonText?: string;
  details?: React.ReactElement;
  level?: string;
  icon: IconProp;
  text: string;
  title: string;
  titleId: string;
  titleInfo?: string
  titleDocsUrl?: string
}
function DetailsSection({
  buttonAction, buttonIcon, buttonText, details, level, icon, text, title, titleId, titleInfo, titleDocsUrl
}: DetailsSectionProps) {
  const finalIcon = (<FontAwesomeIcon icon={icon} />);
  const color = level ?
    `text-${level}` :
    "";
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ?
      (<FontAwesomeIcon icon={buttonIcon} />) :
      null;
    const finalButtonText = (<>{finalButtonIcon} {buttonText}</>);
    if (buttonAction)
      button = (<Button color={level} size="sm" onClick={() => buttonAction()}>{finalButtonText}</Button>);
    else
      button = (<Button color={level} size="sm">{finalButtonText}</Button>);
  }

  const detailsContent = details ?
    (<div className="mt-2"><small className="fst-italic">{details}</small></div>) :
    null;

  let titlePopover: React.ReactNode = null;
  if (titleInfo) {
    const externalLinkStyles = { className: "text-rk-white", role: "text", iconSup: true, iconAfter: true };
    const titleUrl = titleDocsUrl ?
      (<span><br /><ExternalLink url={titleDocsUrl} {...externalLinkStyles} title="More info" /></span>) :
      null;
    titlePopover = (
      <UncontrolledTooltip placement="top" target={titleId} delay={{ show: 0, hide: 2000 }}>
        {titleInfo} {titleUrl}
      </UncontrolledTooltip>
    );
  }

  return (<>
    <div className={styles.projectStatusDetailsSection}>
      <div className="d-flex align-items-center w-100">
        <div><span id={titleId}>{title}</span>{titlePopover}</div>
        <div className={`mx-3 ${color}`}>{finalIcon}</div>
        <div><span>{text}</span></div>
        <div className="ms-auto">{button}</div>
      </div>
      {detailsContent}
    </div>
  </>);
}


// ! TEMP
interface SettingsPropsCardProps {
  children: React.ReactNode
}
function SettingsPropsCard({ children }: SettingsPropsCardProps) {
  return (
    <Card className="border-rk-light mb-4">
      <CardBody> {/* className="lh-lg" */}
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

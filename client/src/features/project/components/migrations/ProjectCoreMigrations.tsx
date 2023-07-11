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

import React, { useCallback, useState } from "react";
import {
  faArrowAltCircleUp,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "reactstrap";

import { ExternalLink } from "../../../../components/ExternalLinks";
import { CoreErrorAlert } from "../../../../components/errors/CoreErrorAlert";
import { RtkOrCoreError } from "../../../../components/errors/RtkErrorAlert";
import { Docs } from "../../../../utils/constants/Docs";
import { TemplateSourceRenku } from "../../../../utils/constants/Migrations";
import { RenkuRepositories } from "../../../../utils/constants/Repositories";
import { CoreErrorContent } from "../../../../utils/definitions";
import {
  CoreSectionError,
  MigrationStatus,
  MigrationStatusDetails,
} from "../../Project";
import { projectCoreApi } from "../../projectCoreApi";
import {
  MigrationStartScopes,
  ProjectMigrationLevel,
} from "../../projectEnums";
import { useCoreSupport } from "../../useProjectCoreSupport";
import {
  canUpdateProjectAutomatically,
  cleanVersion,
  getCompareUrl,
  getMigrationLevel,
  getReleaseUrl,
  getRenkuLevel,
  getTemplateLevel,
} from "../../utils/migrations";
import {
  CompositeTitle,
  DetailsSection,
  MoreInfoLink,
} from "./MigrationHelpers";

interface ProjectMigrationStatusProps {
  branch?: string;
  gitUrl: string;
  isMaintainer: boolean;
}

export function ProjectMigrationStatus({
  branch,
  gitUrl,
  isMaintainer,
}: ProjectMigrationStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleShowDetails = () => setShowDetails(!showDetails);

  const { coreSupport } = useCoreSupport({
    gitUrl,
    branch,
  });
  const {
    backendAvailable,
    computed: coreSupportComputed,
    backendErrorMessage: coreSupportError,
  } = coreSupport;
  const isSupported = coreSupportComputed && backendAvailable;
  const checkingSupport = !coreSupportComputed && !coreSupportError;

  const skip = !gitUrl || !branch;
  const { data, isLoading, isFetching, error } =
    projectCoreApi.useGetMigrationStatusQuery(
      { gitUrl, branch },
      { refetchOnMountOrArgChange: 60 * 5, skip }
    );
  const [startMigration, migrationStatus] =
    projectCoreApi.useStartMigrationMutation();
  const updateProject = useCallback(
    (scope: MigrationStartScopes) => startMigration({ branch, gitUrl, scope }),
    [branch, gitUrl, startMigration]
  );

  const sectionCyId = "project-version";
  if (isFetching || skip || checkingSupport) {
    const fetchingTitle = isLoading
      ? "Fetching project data..."
      : "Refreshing project data...";
    return (
      <>
        <CompositeTitle
          icon={faTimesCircle}
          loading={true}
          sectionId={sectionCyId}
          showDetails={showDetails}
          title={fetchingTitle}
          toggleShowDetails={toggleShowDetails}
        />
        <RtkOrCoreError error={migrationStatus.error} />
      </>
    );
  }

  if (error) {
    const currentError = migrationStatus.error
      ? migrationStatus.error
      : error
      ? error
      : null;
    return (
      <>
        <CompositeTitle
          icon={faExclamationCircle}
          level="danger"
          loading={false}
          sectionId={sectionCyId}
          showDetails={showDetails}
          title="Error on project version"
          toggleShowDetails={toggleShowDetails}
        />
        <RtkOrCoreError error={currentError} />
      </>
    );
  }

  const migrationLevel = getMigrationLevel(data, isSupported);
  const renkuMigrationLevel = getRenkuLevel(data, isSupported);
  const templateMigrationLevel = getTemplateLevel(data);
  const automatedUpdatePossible = canUpdateProjectAutomatically(
    renkuMigrationLevel,
    templateMigrationLevel
  );

  const buttonIcon = faArrowAltCircleUp;
  const buttonDisabled =
    !isMaintainer || !automatedUpdatePossible || migrationStatus.isLoading;
  const buttonDisabledTooltip = !isMaintainer
    ? "Only maintainers can do this."
    : !automatedUpdatePossible
    ? "Automated update not possible for this project"
    : "Operation ongoing...";
  const buttonId = "button-update-projectMigrationStatus";

  const { buttonAction, buttonText, icon, level, title } =
    getMigrationStatusButtonAction({
      isLoading: migrationStatus.isLoading,
      migrationLevel,
      updateProject,
    });

  return (
    <>
      <CompositeTitle
        buttonAction={buttonAction}
        buttonDisabled={buttonDisabled}
        buttonDisabledTooltip={buttonDisabledTooltip}
        buttonIcon={buttonIcon}
        buttonId={buttonId}
        buttonText={buttonText}
        icon={icon}
        level={level}
        loading={isFetching}
        sectionId={sectionCyId}
        showDetails={showDetails}
        title={title}
        toggleShowDetails={toggleShowDetails}
      />
      <RtkOrCoreError error={migrationStatus.error} />
      <ProjectMigrationStatusDetails
        buttonDisable={buttonDisabled || isFetching}
        data={data}
        isMaintainer={isMaintainer}
        isSupported={isSupported}
        showDetails={showDetails}
        updateProject={updateProject}
      />
    </>
  );
}

function getMigrationStatusButtonAction({
  isLoading,
  migrationLevel,
  updateProject,
}: {
  isLoading: boolean;
  migrationLevel: ProjectMigrationLevel | null;
  updateProject: (scope: MigrationStartScopes) => void;
}) {
  if (migrationLevel === ProjectMigrationLevel.Level5) {
    return {
      buttonAction: () => updateProject(MigrationStartScopes.All),
      buttonText: isLoading ? "Updating" : "Update",
      icon: faExclamationCircle,
      level: "danger",
      title: "Project update required",
    };
  }

  if (migrationLevel === ProjectMigrationLevel.Level4) {
    return {
      buttonAction: () => updateProject(MigrationStartScopes.All),
      buttonText: isLoading ? "Updating" : "Update",
      icon: faExclamationCircle,
      level: "warning",
      title: "Project update required",
    };
  }

  if (migrationLevel === ProjectMigrationLevel.Level3) {
    return {
      buttonAction: () => updateProject(MigrationStartScopes.All),
      buttonText: isLoading ? "Updating" : "Update",
      icon: faExclamationCircle,
      level: "info",
      title: "Project update available",
    };
  }

  if (migrationLevel === ProjectMigrationLevel.Level2) {
    return {
      buttonAction: null,
      buttonText: null,
      icon: faCheckCircle,
      level: "info",
      title: "Project up to date*",
    };
  }

  if (migrationLevel === ProjectMigrationLevel.Level1) {
    return {
      buttonAction: null,
      buttonText: null,
      icon: faCheckCircle,
      level: "success",
      title: "Project up to date",
    };
  }

  return {
    buttonAction: null,
    buttonText: null,
    icon: faInfoCircle,
    level: "danger",
    title: "Unknown project status",
  };
}

interface ProjectMigrationStatusDetailsProps {
  buttonDisable: boolean;
  data: MigrationStatus | undefined;
  isMaintainer: boolean;
  isSupported: boolean;
  showDetails: boolean;
  updateProject: (scope: MigrationStartScopes) => void;
}

function ProjectMigrationStatusDetails({
  buttonDisable,
  data,
  isMaintainer,
  isSupported,
  showDetails,
  updateProject,
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
  const renkuProjectVersion = cleanVersion(
    docker?.dockerfile_renku_version,
    true
  );
  const renkuLatestVersion = cleanVersion(docker?.latest_renku_version, true);

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
      <span>Details are not available for this unknown version of Renku.</span>
    );
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.LevelE) {
    renkuDetails = (
      <ProjectSettingsGeneralCoreError
        errorData={data?.error as CoreSectionError}
      />
    );
  } else if (
    renkuMigrationLevel?.level !== undefined &&
    [
      ProjectMigrationLevel.Level5,
      ProjectMigrationLevel.Level4,
      ProjectMigrationLevel.Level3,
      ProjectMigrationLevel.Level1,
    ].includes(renkuMigrationLevel?.level)
  ) {
    renkuText = (
      <RenkuVersionOutdated
        renkuLatestVersion={renkuLatestVersion}
        renkuProjectVersion={renkuProjectVersion}
      />
    );
    renkuDetails = (
      <RenkuVersionContext
        automated={renkuMigrationLevel?.automated}
        docsUrl={renkuTitleDocsUrl}
        isMaintainer={isMaintainer}
        latestVersion={metadata?.current_metadata_version}
        migrationLevel={renkuMigrationLevel?.level}
        projectVersion={metadata?.project_metadata_version}
      />
    );
  }
  if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level5) {
    renkuIcon = faExclamationCircle;
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level4) {
    renkuLevel = "warning";
    renkuIcon = faExclamationCircle;
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level3) {
    renkuLevel = "info";
    renkuIcon = faInfoCircle;
  } else if (renkuMigrationLevel?.level === ProjectMigrationLevel.Level1) {
    renkuIcon = faCheckCircle;
    renkuLevel = "success";
  }

  const renkuVersionButtonShow =
    isMaintainer && canUpdateProjectAutomatically(renkuMigrationLevel);
  const renkuButtonText = buttonDisable ? "Updating version" : "Update version";
  const renkuButtonAction = !renkuVersionButtonShow
    ? undefined
    : () => updateProject(MigrationStartScopes.OnlyVersion);

  const contentRenku = (
    <DetailsSection
      buttonAction={renkuButtonAction}
      buttonDisabled={buttonDisable}
      buttonIcon={faArrowAltCircleUp}
      buttonText={renkuButtonText}
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
  let templateDetails: React.ReactNode = <span>No details</span>;
  const templateMigrationLevel = getTemplateLevel(data);
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
      <span>
        Details are not available for this unknown version of template.
      </span>
    );
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.LevelE) {
    templateText = "Error";
    // ? Do not show template error on very outdated projects. They frequently error.
    // ? We can consider removing this in the future if it doesn't occur that often anymore.
    if (
      renkuMigrationLevel?.level === ProjectMigrationLevel.Level5 ||
      renkuMigrationLevel?.level === ProjectMigrationLevel.Level4
    ) {
      templateDetails = (
        <span>
          Older project versions might not expose some template details and
          trigger an error. This usually disappears after updating the Renku
          version.
        </span>
      );
    } else {
      templateDetails = (
        <ProjectSettingsGeneralCoreError
          errorData={data?.details?.template_status as CoreSectionError}
        />
      );
    }
  } else if (
    templateMigrationLevel?.level !== undefined &&
    [
      ProjectMigrationLevel.Level3,
      ProjectMigrationLevel.Level2,
      ProjectMigrationLevel.Level1,
    ].includes(templateMigrationLevel?.level)
  ) {
    templateDetails = (
      <RenkuTemplateContext
        automated={templateMigrationLevel?.automated}
        isMaintainer={isMaintainer}
        templateDetails={data?.details}
      />
    );
    templateText = <RenkuTemplateOutdated templateDetails={data?.details} />;
  }

  if (templateMigrationLevel?.level === ProjectMigrationLevel.Level3) {
    // New version available
    templateLevel = "info";
    templateIcon = faArrowAltCircleUp;
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.Level2) {
    // Some details missing
    templateLevel = "info";
    templateIcon = faExclamationCircle;
  } else if (templateMigrationLevel?.level === ProjectMigrationLevel.Level1) {
    // All up-to-date
    templateLevel = "success";
    templateIcon = faCheckCircle;
  }

  const templateButtonShow =
    isMaintainer && canUpdateProjectAutomatically(null, templateMigrationLevel);
  const templateButtonText = buttonDisable
    ? "Updating template"
    : "Update template";
  const templateButtonAction = !templateButtonShow
    ? undefined
    : () => updateProject(MigrationStartScopes.OnlyTemplate);

  const contentTemplate = (
    <DetailsSection
      buttonAction={templateButtonAction}
      buttonDisabled={buttonDisable}
      buttonIcon={faArrowAltCircleUp}
      buttonText={templateButtonText}
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

interface ProjectSettingsGeneralCoreErrorProps {
  errorData: CoreErrorContent | CoreSectionError;
}

function ProjectSettingsGeneralCoreError({
  errorData,
}: ProjectSettingsGeneralCoreErrorProps) {
  return <CoreErrorAlert error={errorData} />;
}

interface RenkuVersionOutdatedProps {
  renkuLatestVersion: string;
  renkuProjectVersion: string;
}

function RenkuVersionOutdated({
  renkuLatestVersion,
  renkuProjectVersion,
}: RenkuVersionOutdatedProps) {
  const renkuProjectReleaseUrl = getReleaseUrl(renkuProjectVersion);
  const renkuLatestReleaseUrl = getReleaseUrl(renkuLatestVersion);
  const renkuProjectCompareUrl = getCompareUrl(
    renkuProjectVersion,
    renkuLatestVersion
  );

  const renkuProjectVersionElement = renkuProjectReleaseUrl ? (
    <ExternalLink
      role="text"
      url={renkuProjectReleaseUrl}
      title={renkuProjectVersion}
    />
  ) : (
    <span>{renkuProjectVersion}</span>
  );

  const renkuLatestVersionElement = renkuLatestReleaseUrl ? (
    <ExternalLink
      role="text"
      url={renkuLatestReleaseUrl}
      title={renkuLatestVersion}
    />
  ) : (
    <span>{renkuLatestVersion}</span>
  );

  const renkuCompareVersionElement = renkuProjectCompareUrl ? (
    <span>
      {" "}
      -{" "}
      <ExternalLink role="text" url={renkuProjectCompareUrl} title="compare" />
    </span>
  ) : null;

  return renkuLatestVersion !== renkuProjectVersion ? (
    <>
      {renkuProjectVersionElement} ({renkuLatestVersionElement} avaliable
      {renkuCompareVersionElement})
    </>
  ) : (
    <>{renkuLatestVersionElement}</>
  );
}

interface RenkuVersionContextProps {
  automated?: boolean;
  docsUrl: string;
  isMaintainer: boolean;
  latestVersion?: string;
  migrationLevel: ProjectMigrationLevel;
  projectVersion?: string;
}

function RenkuVersionContext({
  automated,
  docsUrl,
  isMaintainer,
  latestVersion,
  migrationLevel,
  projectVersion,
}: RenkuVersionContextProps) {
  const moreInfoLink = <MoreInfoLink url={docsUrl} />;
  const linkToRenku = (
    <ExternalLink role="text" url={RenkuRepositories.Python} title="Renku" />
  );
  if (
    migrationLevel === ProjectMigrationLevel.Level5 ||
    migrationLevel === ProjectMigrationLevel.Level4
  ) {
    const outdatedMessage =
      migrationLevel === ProjectMigrationLevel.Level5
        ? "The project is very outdated. An upgrade is necessary to support the project from the RenkuLab UI."
        : "The project is outdated. You can still use it on RenkuLab but some features might not be available.";
    const updateInfo = automated
      ? "You can click on the Update button to update the version."
      : "Automatic updates are not available; please use the migrate command in a session.";
    return (
      <>
        {outdatedMessage}
        <br />
        <span>
          This happens because the underlying {linkToRenku} project metadata is
          still on version {projectVersion} while the latest version is{" "}
          {latestVersion}.
        </span>
        <br />
        <span>
          {updateInfo} {moreInfoLink}
        </span>
      </>
    );
  } else if (migrationLevel === ProjectMigrationLevel.Level3) {
    return (
      <>
        <span>
          There is a new {linkToRenku} version.
          {isMaintainer
            ? " Updating brings new features and bug-fixes; it should be safe on this project since it is a minor update."
            : ""}{" "}
          {moreInfoLink}
        </span>
      </>
    );
  } else if (migrationLevel === ProjectMigrationLevel.Level1) {
    return (
      <>
        <span>
          This project uses the latest {linkToRenku} version. {moreInfoLink}
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
  if (
    template.newer_template_available &&
    template.template_source !== TemplateSourceRenku &&
    template.template_source !== template.project_template_version
  ) {
    const deltaUrl = `${template.template_source}/compare/${template.project_template_version}...${template.latest_template_version}`;
    const deltaLink = (
      <ExternalLink
        role="text"
        url={deltaUrl}
        title={template.project_template_version}
      />
    );
    const latestUrl = `${template.template_source}/tree/${template.latest_template_version}`;
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
  } else if (
    template.template_source === TemplateSourceRenku ||
    !template.template_source
  ) {
    if (template.newer_template_available)
      return (
        <>
          {template.project_template_version} (
          {template.latest_template_version} avaliable)
        </>
      );
    return <>{template.project_template_version}</>;
  } else if (
    !template.newer_template_available ||
    template.template_source === template.project_template_version
  ) {
    const templateUrl = `${template.template_source}/tree/${template.project_template_version}`;
    return (
      <ExternalLink
        role="text"
        url={templateUrl}
        title={template.project_template_version}
      />
    );
  }
  return <>{template.project_template_version}</>;
}

interface RenkuTemplateContextProps {
  automated: boolean;
  isMaintainer: boolean;
  templateDetails: MigrationStatus["details"];
}

function RenkuTemplateContext({
  automated,
  isMaintainer,
  templateDetails,
}: RenkuTemplateContextProps) {
  const template =
    templateDetails?.template_status.type === "detail"
      ? templateDetails.template_status
      : null;

  if (template?.newer_template_available) {
    return (
      <RenkuTemplateContextNewerTemplateAvailable
        automated={automated}
        isMaintainer={isMaintainer}
        template={template}
      />
    );
  }

  if (template?.template_source === TemplateSourceRenku) {
    return (
      <span>
        We could not find updates of the {template?.template_id} template used
        in this project.
        <br />
        Mind that this project uses a default template from this RenkuLab
        deployment that is cached locally. We cannot verify whether a newer
        version was recently published in the remote repository.{" "}
        <MoreInfoLink url={Docs.rtdReferencePage("templates.html")} />
      </span>
    );
  }

  return (
    <span>
      You are using the latest version of the{" "}
      {template?.type === "detail" && (
        <RenkuTemplateContextTemplateElement template={template} />
      )}{" "}
      template used in this project.{" "}
      <MoreInfoLink url={Docs.rtdReferencePage("templates.html")} />
    </span>
  );
}

function RenkuTemplateContextNewerTemplateAvailable({
  automated,
  isMaintainer,
  template,
}: Pick<RenkuTemplateContextProps, "automated" | "isMaintainer"> & {
  template: Exclude<
    MigrationStatusDetails["template_status"],
    CoreSectionError
  >;
}) {
  return (
    <span>
      There is a new version of the template{" "}
      <RenkuTemplateContextTemplateElement template={template} /> used in this
      project.{" "}
      <RenkuTemplateContextUpdateInfo
        automated={automated}
        isMaintainer={isMaintainer}
        templateSource={template.template_source}
      />{" "}
      <RenkuTemplateContextExtraInfo template={template} />{" "}
      <MoreInfoLink url={Docs.rtdReferencePage("templates.html")} />
    </span>
  );
}

function RenkuTemplateContextUpdateInfo({
  automated,
  isMaintainer,
  templateSource,
}: Pick<RenkuTemplateContextProps, "automated" | "isMaintainer"> & {
  templateSource: string;
}) {
  if (isMaintainer && automated) {
    return <>You can click on the Update button to automatically update it.</>;
  }

  if (isMaintainer && templateSource !== TemplateSourceRenku) {
    return (
      <>
        Automatic update is not available. You can update the template manually
        in a session by using the{" "}
        <ExternalLink
          role="text"
          url={Docs.rtdPythonReferencePage("commands/template.html")}
          title="Renku Update"
        />{" "}
        command.
      </>
    );
  }

  return null;
}

function RenkuTemplateContextTemplateElement({
  template,
}: {
  template: Exclude<
    MigrationStatusDetails["template_status"],
    CoreSectionError
  >;
}) {
  if (template.template_source !== TemplateSourceRenku) {
    const templateUrlSuffix = template.latest_template_version
      ? `/tree/${template.latest_template_version}`
      : template.template_ref
      ? `/tree/${template.template_ref}`
      : "";
    const templateUrl = `${template.template_source}${templateUrlSuffix}`;
    return templateUrl && template.template_id ? (
      <ExternalLink
        role="text"
        url={templateUrl}
        title={template?.template_id}
      />
    ) : null;
  }

  return template.template_id ? <span>{template.template_id}</span> : null;
}

function RenkuTemplateContextExtraInfo({
  template,
}: {
  template: Exclude<
    MigrationStatusDetails["template_status"],
    CoreSectionError
  >;
}) {
  if (template.template_source === TemplateSourceRenku) {
    return (
      <>
        <br />
        <span>
          Mind that this project uses a default template from this RenkuLab
          deployment; therefore, there is no link to a remote reference template
          you can check. You can still check the full description when creating
          a new project using the same template id.
        </span>
      </>
    );
  }

  return null;
}

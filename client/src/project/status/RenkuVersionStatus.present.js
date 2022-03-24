/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React, { Fragment, useState } from "react";
import { Button, Collapse, Spinner } from "reactstrap";

import human from "human-time";

import { AskMaintainer, ManualUpdateInstructions, MigrationSuccessAlert, MigrationInfoAlert, MigrationWarnAlert,
  isMigrationFailure, isMigrationCheckLoading } from "./MigrationUtils";
import { migrationCheckToRenkuVersionStatus, RENKU_VERSION_SCENARIOS, RENKU_UPDATE_MODE } from "./MigrationUtils";
import { MigrationStatus } from "../Project";
import { Loader } from "../../utils/components/Loader";
import { Docs } from "../../utils/constants/Docs";
import { CoreErrorAlert } from "../../utils/components/errors/CoreErrorAlert";

function updateNotRequired(renkuVersionStatus) {
  return renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED;
}


function UpdateSection(props) {
  // This is not actually useful yet, but it is a small step towards matching the style
  // proposed by the designer.
  return <div>
    {props.children}
  </div>;
}

/**
 * Compute an estimate of how long the migration will take in seconds.
 * @param {int} commitCount
 * @returns
 */
function commitCountToMigrationTimeSecs(commitCount) {
  return (0.01 * commitCount) + 30;
}

function MigrationTimeEstimate({ current_metadata_version, project_metadata_version, statistics }) {
  if ((current_metadata_version == null) || (statistics == null)) return null;
  if (current_metadata_version !== "9") return null;
  if (project_metadata_version === "9") return null;
  if (statistics.data?.commit_count == null) return null;
  const migrationDurS = commitCountToMigrationTimeSecs(statistics.data.commit_count);
  // remove 'ago' from the duration
  const humanMigrationDur = human(migrationDurS).slice(0, -4);
  return <span>
    The update should take about {humanMigrationDur}.
  </span>;
}

function UpdateInfo({
  backendAvailable, current_metadata_version, project_metadata_version, renkuVersionStatus, statistics
}) {
  if (updateNotRequired(renkuVersionStatus)) {
    return <div>
      <strong>A new version of renku is available.</strong> <br />
      If you wish to take advantage new features, you can update to the latest version.
      <MigrationTimeEstimate current_metadata_version={current_metadata_version}
        project_metadata_version={project_metadata_version} statistics={statistics} />
    </div>;
  }
  const updateMessage = backendAvailable ?
    null :
    (<p className="lh-sm">You can launch and work in interactive sessions,{" "}
      but to make changes to the project from the UI{" "}
      you will need to <strong>update the renku version</strong>.</p>);
  return (
    <div>
      {updateMessage}
      <MigrationTimeEstimate current_metadata_version={current_metadata_version}
        project_metadata_version={project_metadata_version} statistics={statistics} />
    </div>)
  ;
}

function AutoUpdateButton({ externalUrl, maintainer, migration_status, onMigrateProject, renkuVersionStatus }) {
  const buttonColor = updateNotRequired(renkuVersionStatus) ?
    "info" :
    "warning";
  if (maintainer) {
    return <Button
      color={buttonColor}
      disabled={migration_status === MigrationStatus.MIGRATING || migration_status === MigrationStatus.FINISHED}
      onClick={() => onMigrateProject({ skip_migrations: false, skip_docker_update: false,
        skip_template_update: false, force_template_update: false })} >
      {migration_status === MigrationStatus.MIGRATING || migration_status === MigrationStatus.FINISHED ?
        <span><Spinner size="sm" /> Updating...</span> : "Update"
      }
    </Button>;
  }
  return <p className="lh-sm">
    You do not have the required permissions to update this project, but you can{" "}
    <AskMaintainer externalUrl={externalUrl} /> to do that for you.
  </p>;
}

const docUrl = Docs.rtdHowToGuide("upgrading-renku.html#upgrading-your-image-to-use-the-latest-renku-cli-version");

function RenkuVersionAutomaticUpdateSection({
  backendAvailable, current_metadata_version, externalUrl, launchNotebookUrl, maintainer,
  migration_status, onMigrateProject, project_metadata_version, renkuVersionStatus, statistics
}) {
  const linkClassName = updateNotRequired(renkuVersionStatus) ?
    "" :
    "link-alert-warning";
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const updateDetails = (maintainer) ?
    <Fragment>
      <AutoUpdateButton externalUrl={externalUrl} maintainer={maintainer}
        migration_status={migration_status} onMigrateProject={onMigrateProject}
        renkuVersionStatus={renkuVersionStatus} />
      <br/><br/>
      <UpdateSection>
        <Button color="link" className={`ps-0 mb-2 ${linkClassName} text-start`} onClick={toggleOpen}>
          <i>Do you prefer manual instructions?</i>
        </Button>
        <Collapse isOpen={isOpen}>
          <ManualUpdateInstructions docUrl={docUrl} launchNotebookUrl={launchNotebookUrl}/>
        </Collapse>
      </UpdateSection>
    </Fragment> :
    <div className="lh-sm">
      You do not have the required permissions to update this project, but you can{" "}
      <AskMaintainer externalUrl={externalUrl} /> to do that for you.
    </div>;

  return <Fragment>
    <UpdateInfo backendAvailable={backendAvailable} current_metadata_version={current_metadata_version}
      project_metadata_version={project_metadata_version} renkuVersionStatus={renkuVersionStatus}
      statistics={statistics} />
    {updateDetails}
  </Fragment>;
}

function RenkuVersionManualUpdateSection({
  backendAvailable, current_metadata_version, externalUrl, launchNotebookUrl, maintainer,
  project_metadata_version, renkuVersionStatus, statistics
}) {
  return <Fragment>
    <UpdateInfo backendAvailable={backendAvailable} current_metadata_version={current_metadata_version}
      project_metadata_version={project_metadata_version} renkuVersionStatus={renkuVersionStatus}
      statistics={statistics} />
    {
      maintainer ?
        <UpdateSection>
          <ManualUpdateInstructions docUrl={docUrl} launchNotebookUrl={launchNotebookUrl}
            introText="Automatic update is not possible, but you" />
        </UpdateSection> :
        <p className="lh-sm">
          You do not have the required permissions to update this project, but you can{" "}
          <AskMaintainer externalUrl={externalUrl} /> to do that for you.
        </p>
    }
  </Fragment>;
}

function RenkuVersionStatusBody({
  externalUrl, launchNotebookUrl, logged, maintainer, migration, onMigrateProject, statistics
}) {
  const fullVersionStatus = migrationCheckToRenkuVersionStatus(migration.check);
  const { renkuVersionStatus, updateMode } = fullVersionStatus;
  const { migration_status } = migration;
  const { backendAvailable } = migration.core;

  const current_metadata_version = migration?.check?.core_compatibility_status?.current_metadata_version;
  const project_metadata_version = migration?.check?.core_compatibility_status?.project_metadata_version;
  const updateProps = {
    backendAvailable, current_metadata_version, externalUrl, launchNotebookUrl, maintainer, migration_status,
    onMigrateProject, project_metadata_version, renkuVersionStatus, statistics
  };

  let updateSection = null;

  switch (updateMode) {
    case RENKU_UPDATE_MODE.UPDATE_AUTO:
      updateSection = <RenkuVersionAutomaticUpdateSection {...updateProps} />;
      break;
    case RENKU_UPDATE_MODE.UPDATE_MANUAL:
      updateSection = <RenkuVersionManualUpdateSection {...updateProps} />;
      break;
    default:
      break;
  }
  let body = null, message = null;
  switch (renkuVersionStatus) {
    case RENKU_VERSION_SCENARIOS.RENKU_UP_TO_DATE:
      body = <MigrationSuccessAlert>
        This project is using the latest version of renku.
      </MigrationSuccessAlert>;
      break;
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED:
      body = <MigrationInfoAlert>
        {updateSection}
      </MigrationInfoAlert>;
      break;
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED:
      message = (backendAvailable) ?
        <div><strong>Updating to the latest version of renku is highly recommended</strong>.
          <p className="lh-sm">
            Although this project is compatible with the RenkuLab UI, it is using an older version of{" "}
            renku.
          </p>
        </div> :
        <strong>This project is not compatible with the RenkuLab UI.</strong>;
      body = (<MigrationWarnAlert>
        {message}
        {updateSection}
      </MigrationWarnAlert>);
      break;
    case RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED:
      body = <MigrationWarnAlert>
        This project appears to be using an experimental version of Renku.&nbsp;<br /><br />
        You can launch and work in interactive sessions, but creating or modifying datasets&nbsp;
        are not supported from the UI.
      </MigrationWarnAlert>;
      break;
    default:
      break;
  }

  return body;
}

function RenkuVersionInfo({ migration }) {
  const { core_renku_version, project_renku_version } = migration.check;
  const { newer_renku_available, dockerfile_renku_version } =
    migration.check.dockerfile_renku_status;
  const shownRenkuVersion = dockerfile_renku_version ?? project_renku_version;

  const { project_metadata_version, current_metadata_version } = migration.check.core_compatibility_status;

  return newer_renku_available === true || newer_renku_available == null ?
    <table style={{ borderSpacing: "10px 5px" }}>
      <tbody>
        <tr>
          <th className="mr-2" scope="row">Project Renku Version</th>
          <td className="mr-2"><span id="project_version">{shownRenkuVersion}</span></td>
          <td style={{ fontSize: "smaller" }}>(v{project_metadata_version})</td></tr>
        <tr>
          <th scope="row">Latest Renku Version</th>
          <td>{core_renku_version}</td>
          <td style={{ fontSize: "smaller" }}>(v{current_metadata_version})</td></tr>
      </tbody>
    </table> :
    <table style={{ borderSpacing: "10px 5px" }}>
      <tbody>
        <tr>
          <th scope="row">Project / Latest Renku Version</th>
          <td><span id="project_version">{shownRenkuVersion}</span></td>
          <td></td>
        </tr>
      </tbody>
    </table>;
}

function GuardedRenkuVersionStatusBody(props) {
  const { externalUrl, launchNotebookUrl, logged, lockStatus, maintainer,
    migration, onMigrateProject, statistics } = props;

  if (!logged) return null;
  if (lockStatus?.locked === true) {
    return <div className="text-muted">
      This project is currently being modified. You will be able to view the{" "}
      project update options once the changes to the project are complete.
    </div>;
  }

  return <RenkuVersionStatusBody
    externalUrl={externalUrl} launchNotebookUrl={launchNotebookUrl} logged={logged} maintainer={maintainer}
    migration={migration} onMigrateProject={onMigrateProject} statistics={statistics} />;
}


function RenkuVersionStatus(props) {
  if (isMigrationCheckLoading(props.loading, props.migration)) return <Loader />;

  const { migration } = props;
  const { migration_status, migration_error } = migration;
  const { check_error } = migration.check;

  if (isMigrationFailure({ check_error, migration_error, migration_status })) {
    let error;
    if (migration_error?.code)
      error = migration_error;
    else if (check_error?.code)
      error = check_error;
    else
      return null;
    return (<CoreErrorAlert error={error} />);
  }

  return (
    <div>
      <RenkuVersionInfo migration={migration} />
      <GuardedRenkuVersionStatusBody {...props} />
    </div>
  );
}

export default RenkuVersionStatus;

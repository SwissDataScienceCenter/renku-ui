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

import { ManualUpdateInstructions, MigrationSuccessAlert, MigrationInfoAlert, MigrationWarnAlert,
  isMigrationFailure, isMigrationCheckLoading } from "./MigrationUtils";
import { migrationCheckToRenkuVersionStatus, RENKU_VERSION_SCENARIOS } from "./MigrationUtils";
import { MigrationStatus } from "../Project";
import { ExternalLink, Loader } from "../../utils/UIComponents";

function updateNotRequired(renkuVersionStatus) {
  return renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_AUTO ||
    renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_MANUAL;
}


function UpdateSection(props) {
  // This is not actually useful yet, but it is a small step towards matching the style
  // proposed by the designer.
  return <div>
    {props.children}
  </div>;
}

function UpdateInfo({ renkuVersionStatus }) {
  if (updateNotRequired(renkuVersionStatus)) {
    return <p>
      If you wish to take advantage of new features, you can update to the latest version of{" "}
      <strong>renku</strong>.
    </p>;
  }
  return <p>An update is necessary to work with datasets from the UI.</p>;
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
  return <p>
    <strong>You do not have the required permissions to update this project.</strong> You can{" "}
    <ExternalLink role="text" size="sm"
      title="ask a project maintainer" url={`${externalUrl}/project_members`} /> to do that for you.
  </p>;
}

const docUrl = "https://renku.readthedocs.io/en/latest/how-to-guides/upgrading-renku.html" +
"#upgrading-your-image-to-use-the-latest-renku-cli-version";

function RenkuVersionAutomaticUpdateSection(
  { externalUrl, maintainer, migration_status, onMigrateProject, launchNotebookUrl, renkuVersionStatus }) {
  const linkClassName = updateNotRequired(renkuVersionStatus) ?
    "" :
    "link-alert-warning";
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  return <Fragment>
    <UpdateInfo renkuVersionStatus={renkuVersionStatus} />
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
  </Fragment>;
}

function RenkuVersionManualUpdateSection({ renkuVersionStatus, launchNotebookUrl }) {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  // Shall we display a different message for maintainer / not maintainer
  const linkClassName = updateNotRequired(renkuVersionStatus) ?
    "" :
    "link-alert-warning";
  return <Fragment>
    <UpdateInfo renkuVersionStatus={renkuVersionStatus} />
    <UpdateSection>
      <Button color="link" className={`ps-0 mb-2 ${linkClassName} text-start`} onClick={toggleOpen}>
        <i>Automated update is not possible, but you can follow these instructions to update manually.</i>
      </Button>
      <Collapse isOpen={isOpen}>
        <ManualUpdateInstructions docUrl={docUrl} launchNotebookUrl={launchNotebookUrl}/>
      </Collapse>
    </UpdateSection>
  </Fragment>;
}

function RenkuVersionStatusBody({ externalUrl, maintainer, migration, onMigrateProject, launchNotebookUrl }) {

  let body = null;
  let updateSection = null;

  const renkuVersionStatus = migrationCheckToRenkuVersionStatus(migration.check);
  const { migration_status } = migration;
  const updateProps = { externalUrl, maintainer, migration_status, onMigrateProject,
    renkuVersionStatus, launchNotebookUrl };


  switch (renkuVersionStatus) {
    case RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED :
      body = <MigrationWarnAlert>
        This project appears to be using an experimental version of Renku. Migration is not supported.
      </MigrationWarnAlert>;
      break;
    case RENKU_VERSION_SCENARIOS.RENKU_UP_TO_DATE :
      body = <MigrationSuccessAlert>
        This project is using the latest version of renku.
      </MigrationSuccessAlert>;
      break;
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_AUTO:
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED_AUTO :
      updateSection = <RenkuVersionAutomaticUpdateSection {...updateProps} />;
      break;
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_MANUAL:
    case RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED_MANUAL:
      updateSection = <RenkuVersionManualUpdateSection {...updateProps} />;
      break;
    default:
      break;
  }

  // new version available
  if (body === null && updateSection) {
    const newVersionText = <p>
      A new version of <strong>renku</strong> is available.
    </p>;
    body = ((renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_AUTO) ||
      (renkuVersionStatus === RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED_MANUAL)) ?
      (<MigrationInfoAlert>
        {newVersionText}
        {updateSection}
      </MigrationInfoAlert>) :
      (<MigrationWarnAlert>
        {newVersionText}
        {updateSection}
      </MigrationWarnAlert>);
  }
  return body;
}

function RenkuVersionInfo({ migration }) {
  const { core_renku_version, project_renku_version } = migration.check;
  const { newer_renku_available, dockerfile_renku_version } =
    migration.check.dockerfile_renku_status;
  const shownRenkuVersion = dockerfile_renku_version ?? project_renku_version;
  return newer_renku_available === true || newer_renku_available == null ?
    <p>
      <strong>Project Renku Version</strong> {shownRenkuVersion}<br />
      <strong>Latest Renku Version</strong> {core_renku_version}<br />
    </p> :
    <p>
      <strong>Project / Latest Renku Version</strong> {shownRenkuVersion}<br />
    </p>;
}

function RenkuVersionStatus(props) {
  if (isMigrationCheckLoading(props.loading, props.migration)) return <Loader />;

  const { migration_status, migration_error } = props.migration;
  const { check_error } = props.migration.check;

  if (isMigrationFailure({ check_error, migration_error, migration_status })) return null;

  const { maintainer, onMigrateProject, launchNotebookUrl, externalUrl } = props;

  return <div>
    <RenkuVersionInfo migration={props.migration} />
    <RenkuVersionStatusBody
      externalUrl={externalUrl} maintainer={maintainer}
      migration={props.migration} onMigrateProject={onMigrateProject}
      launchNotebookUrl={launchNotebookUrl} />
  </div>;
}

export default RenkuVersionStatus;

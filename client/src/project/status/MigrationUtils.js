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

import React from "react";
import { Link } from "react-router-dom";
import { faGithub, faGitter } from "@fortawesome/free-brands-svg-icons";

import { MigrationStatus } from "../Project";
import { ErrorAlert, InfoAlert, SuccessAlert, WarnAlert } from "../../utils/components/Alert";
import { ExternalIconLink, ExternalLink } from "../../utils/components/ExternalLinks";
import { Links } from "../../utils/constants/Docs";


function GeneralErrorMessage({ error_while, error_what, error_reason }) {
  return <ErrorAlert>
    <p>
      Error while { error_while } the { error_what } version. Please reload the page to try again.
      If the problem persists you should contact the development team on{" "}
      <ExternalIconLink url={Links.GITTER} icon={faGitter} title="Gitter" />{" "}
      or create an issue in {" "}
      <ExternalIconLink url={`${Links.GITHUB}/issues`} icon={faGithub} title="GitHub" />.
    </p>
    <div><strong>Error Message</strong><pre style={{ whiteSpace: "pre-wrap" }}>{error_reason}</pre></div>
  </ErrorAlert>;
}

function MigrationInfoAlert(props) {
  return <InfoAlert timeout={0} dismissible={false}>
    {props.children}
  </InfoAlert>;
}

function MigrationSuccessAlert(props) {
  return <SuccessAlert timeout={0} dismissible={false}>
    {props.children}
  </SuccessAlert>;
}

function MigrationWarnAlert(props) {
  return <WarnAlert dismissible={false}>
    {props.children}
  </WarnAlert>;
}

/**
 * This function is used to check if the warning sign in the project should be displayed.
 * Receives as a parameter the migration property that comes from the backend.
 */
function shouldDisplayVersionWarning(migration) {
  const { migration_status, migration_error } = migration;
  const { check_error, project_supported } = migration.check;
  if (isMigrationFailure({ check_error, migration_error, migration_status }))
    return true;
  if (project_supported === false )
    return true;

  const { core_compatibility_status } = migration.check;
  const { migration_required } = core_compatibility_status;
  return migration_required;
}

const RENKU_VERSION_SCENARIOS = {
  PROJECT_NOT_SUPPORTED: "PROJECT_NOT_SUPPORTED",
  RENKU_UP_TO_DATE: "RENKU_UP_TO_DATE",
  NEW_VERSION_NOT_REQUIRED: "NEW_VERSION_NOT_REQUIRED",
  NEW_VERSION_REQUIRED: "NEW_VERSION_REQUIRED",
};

const RENKU_UPDATE_MODE = {
  PROJECT_NOT_SUPPORTED: "PROJECT_NOT_SUPPORTED",
  UP_TO_DATE: "UP_TO_DATE",
  UPDATE_AUTO: "UPDATE_AUTO",
  UPDATE_MANUAL: "UPDATE_MANUAL",
};


function migrationCheckToRenkuVersionStatus({ project_supported, dockerfile_renku_status, core_compatibility_status }) {
  if (project_supported === false) {
    return {
      renkuVersionStatus: RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED,
      updateMode: RENKU_UPDATE_MODE.PROJECT_NOT_SUPPORTED
    };
  }

  const { migration_required } = core_compatibility_status;
  if (dockerfile_renku_status.newer_renku_available === false) {
    return {
      renkuVersionStatus: RENKU_VERSION_SCENARIOS.RENKU_UP_TO_DATE,
      updateMode: RENKU_UPDATE_MODE.UP_TO_DATE
    };
  }
  const updateMode = (dockerfile_renku_status.automated_dockerfile_update) ?
    RENKU_UPDATE_MODE.UPDATE_AUTO :
    RENKU_UPDATE_MODE.UPDATE_MANUAL;
  const renkuVersionStatus = (migration_required) ?
    RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED :
    RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED;
  return { renkuVersionStatus, updateMode };
}

function isMigrationCheckLoading(loading, migration) {
  const { check_error, project_supported } = migration.check;
  const fetching = project_supported == null && check_error == null;
  return loading || fetching;
}

function isMigrationFailure({ check_error, migration_error, migration_status }) {
  if (check_error)
    return true;
  return migration_status === MigrationStatus.ERROR && migration_error;
}

function ShowMigrationFailure({ check_error, migration_error, migration_status }) {
  if (check_error) {
    return <GeneralErrorMessage
      error_while="checking"
      error_what="project template"
      error_reason={check_error.reason} />;
  }
  if (migration_status === MigrationStatus.ERROR && migration_error
    && (migration_error.dockerfile_update_failed || migration_error.migrations_failed)) {
    return <GeneralErrorMessage
      error_while="updating"
      error_what="project template"
      error_reason={migration_error.reason} />;
  }
  return null;
}

function ManualUpdateInstructions({ docUrl, launchNotebookUrl, introText }) {
  if (introText == null)
    introText = "You";

  return <p className="lh-sm">
    {introText} can launch a <Link to={launchNotebookUrl}>session</Link> and follow the{" "}
    <ExternalLink role="text" size="sm" url={docUrl} title="instructions for upgrading" />.
  </p>;
}

function AskMaintainer({ externalUrl, title }) {
  if (title == null)
    title = "ask a project maintainer";

  return <ExternalLink role="text" size="sm" title={title} url={`${externalUrl}/-/project_members`} />;
}

export { AskMaintainer, GeneralErrorMessage, MigrationInfoAlert, MigrationSuccessAlert, MigrationWarnAlert };
export { ManualUpdateInstructions };
export { ShowMigrationFailure, isMigrationFailure };
export { migrationCheckToRenkuVersionStatus, RENKU_VERSION_SCENARIOS, RENKU_UPDATE_MODE };
export { isMigrationCheckLoading, shouldDisplayVersionWarning };

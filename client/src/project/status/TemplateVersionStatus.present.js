/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

import {
  ManualUpdateInstructions, MigrationSuccessAlert, MigrationWarnAlert, isMigrationFailure, isMigrationCheckLoading
} from "./MigrationUtils";
import { MigrationStatus } from "../Project";
import { ExternalLink } from "../../utils/components/ExternalLinks";
import { Loader } from "../../utils/components/Loader";
import { Docs } from "../../utils/constants/Docs";

const TEMPLATE_VERSION_SCENARIOS = {
  PROJECT_NOT_SUPPORTED: "PROJECT_NOT_SUPPORTED",
  TEMPLATE_NOT_VERSIONED: "TEMPLATE_NOT_VERSIONED",
  TEMPLATE_UP_TO_DATE: "TEMPLATE_UP_TO_DATE",
  NEW_TEMPLATE_AUTO: "NEW_TEMPLATE_AUTO", //new template auto with renku
  NEW_TEMPLATE_MANUAL: "NEW_TEMPLATE_MANUAL"
};

function getTemplateVersionStatus({ automated_template_update, newer_template_available,
  project_supported, template_id }) {
  if (!project_supported) return TEMPLATE_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED;
  if (template_id === null) return TEMPLATE_VERSION_SCENARIOS.TEMPLATE_NOT_VERSIONED;
  if (!newer_template_available) return TEMPLATE_VERSION_SCENARIOS.TEMPLATE_UP_TO_DATE;
  if (automated_template_update)
    return TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_AUTO;
  return TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_MANUAL;
}


function TemplateUpdateSection({
  launchNotebookUrl, logged, maintainer, projectTemplateStatus, migration_status, onMigrateProject, externalUrl
}) {

  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const docUrl = Docs.rtdPythonReferencePage("commands.html?highlight=template#module-renku.cli.migrate");

  const automaticUpdateAction = maintainer ?
    /* check if this is correct... maybe we can use the other button instead */
    <Button
      color="warning"
      className="float-end"
      disabled={migration_status === MigrationStatus.MIGRATING || migration_status === MigrationStatus.FINISHED}
      onClick={() => onMigrateProject({
        skip_migrations: true, skip_docker_update: true,
        skip_template_update: false, force_template_update: false
      })}>
      {migration_status === MigrationStatus.MIGRATING || migration_status === MigrationStatus.FINISHED ?
        <span><Spinner size="sm" /> Updating...</span> :
        "Update"
      }
    </Button>
    :
    <p>
      <strong>You do not have the required permissions to update this projects template.</strong>
      &nbsp;You can <ExternalLink role="text" size="sm"
        title="ask a project maintainer" url={`${externalUrl}/-/project_members`} /> to
      do that for you.
    </p>;

  const UpdateActions = (
    <Fragment>
      <p>
        If you wish to take advantage of new features, you can update to the latest version of
        the <strong>template</strong>.
        {/**
         * TODO: provide more information about the template when that is possible.
         * <ExternalLink role="text" size="sm"
         * title="See the template repository" url={`${template_source}`} /> to learn more about
         * the new features.
         */}
      </p>
      {
        projectTemplateStatus === TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_AUTO ?
          automaticUpdateAction :
          null
      }
      <Button color="link" className="ps-0 mb-2 link-alert-warning text-start" onClick={toggleOpen}>
        {
          projectTemplateStatus === TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_AUTO ?
            (<i>Do you prefer manual instructions?</i>) :
            (<i>Automated update is not possible, but you can follow these instructions to update manually.</i>)
        }
      </Button>
      <Collapse isOpen={isOpen}>
        <ManualUpdateInstructions docUrl={docUrl} launchNotebookUrl={launchNotebookUrl} />
      </Collapse>
    </Fragment>
  );

  return (
    <MigrationWarnAlert>
      <p>A new version of the <strong>project template</strong> is available.</p>
      {logged ? UpdateActions : null}
    </MigrationWarnAlert>
  );
}

function TemplateSource({ template_source }) {
  const components = template_source.split("/");
  // if there are no '/', then template_source is not a URL
  if (components.length < 2)
    return template_source;
  const lastComponent = components[components.length - 1];
  return <ExternalLink role="text" size="sm"
    title={lastComponent} url={template_source} />;
}

function TemplateVersion({ template_ref, version }) {
  return (template_ref) ?
    <span>{template_ref} / <i>{version}</i></span> :
    <span><i>{version}</i></span>;
}

function TemplateVersionInfo({ check }) {
  if (!check) return null;

  const { latest_template_version, newer_template_available, project_template_version,
    template_id, template_ref, template_source } = check.template_status;

  if (template_id == null) return null;
  return newer_template_available ?
    <p>
      <strong>Template</strong> <TemplateSource template_source={template_source} /> {" "}
      &gt; {template_id}  <br />
      <strong>Project Template Version</strong> {" "}
      <TemplateVersion template_ref={template_ref} version={project_template_version} /> <br />
      <strong>Latest Template Version</strong> {" "}
      <TemplateVersion template_ref={template_ref} version={latest_template_version} />
    </p> : <p>
      <strong>Template</strong> <TemplateSource template_source={template_source} /> {" "}
      &gt; {template_id}  <br />
      <strong>Project / Latest Template Version</strong> {" "}
      <TemplateVersion template_ref={template_ref} version={project_template_version} />
    </p>;
}

function TemplateVersionBody({ externalUrl, launchNotebookUrl, logged, maintainer, migration, onMigrateProject }) {

  const { migration_status } = migration;
  const { project_supported } = migration.check;

  const { automated_template_update, template_id, template_source, newer_template_available }
    = migration.check.template_status;

  const projectTemplateStatus = getTemplateVersionStatus({
    automated_template_update, project_supported, template_id, newer_template_available,
  });

  switch (projectTemplateStatus) {
    case TEMPLATE_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED:
      return <MigrationWarnAlert>
        Automatic upgrading of the <strong>template</strong> version is not supported with this project.
      </MigrationWarnAlert>;
    case TEMPLATE_VERSION_SCENARIOS.TEMPLATE_NOT_VERSIONED:
      //if the template has no version it cant be migrated
      return <p> This project does not use a versioned template.<br /></p>;
    case TEMPLATE_VERSION_SCENARIOS.TEMPLATE_UP_TO_DATE:
      return <MigrationSuccessAlert>
        This project is using the latest version of the template.
      </MigrationSuccessAlert>;
    case TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_AUTO:
    case TEMPLATE_VERSION_SCENARIOS.NEW_TEMPLATE_MANUAL:
      return <TemplateUpdateSection
        externalUrl={externalUrl}
        launchNotebookUrl={launchNotebookUrl}
        logged={logged}
        maintainer={maintainer}
        migration_status={migration_status}
        onMigrateProject={onMigrateProject}
        projectTemplateStatus={projectTemplateStatus}
        template_source={template_source}
      />;
    default:
      return null;
  }
}

function GuardedTemplateVersionBody({ externalUrl, launchNotebookUrl, lockStatus, logged,
  maintainer, migration, onMigrateProject }) {
  if (!logged) return null;
  if (lockStatus?.locked === true) {
    return <div className="text-muted">
      This project is currently being modified. You will be able to view the{" "}
      template update options once the changes to the project are complete.
    </div>;
  }
  return <TemplateVersionBody externalUrl={externalUrl} launchNotebookUrl={launchNotebookUrl} logged={logged}
    maintainer={maintainer} migration={migration} onMigrateProject={onMigrateProject} />;
}

function TemplateStatus(props) {
  const { externalUrl, launchNotebookUrl, lockStatus, logged, maintainer, onMigrateProject } = props;
  const { check_error } = props.migration.check;
  const { migration_status, migration_error } = props.migration;
  if (isMigrationCheckLoading(props.loading, props.migration)) return <Loader />;
  if (isMigrationFailure({ check_error, migration_error, migration_status })) return null;

  return <div>
    <TemplateVersionInfo check={props.migration.check} />
    <GuardedTemplateVersionBody externalUrl={externalUrl} launchNotebookUrl={launchNotebookUrl}
      lockStatus={lockStatus} logged={logged} maintainer={maintainer} migration={props.migration}
      onMigrateProject={onMigrateProject} />
  </div>;
}

export default TemplateStatus;

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

import React, { Fragment } from "react";

import { MigrationSuccessAlert, MigrationWarnAlert,
  ShowMigrationFailure, isMigrationFailure, isMigrationCheckLoading } from "./MigrationUtils";

import { Loader } from "../../utils/UIComponents";

function RenkuLabVersionInfo({ core_compatibility_status }) {

  if (!core_compatibility_status) return null;

  const { project_metadata_version, current_metadata_version } = core_compatibility_status;

  return <p>
    { project_metadata_version === current_metadata_version ?
      <Fragment><strong>Project / Server Metadata Version</strong> {project_metadata_version}</Fragment> :
      <Fragment>
        <strong>Project Metadata Version</strong> {project_metadata_version}<br />
        <strong>Server Metadata Version</strong> {current_metadata_version}
      </Fragment>
    }
  </p>;
}

function RenkuLabCompatibilityBody({ project_supported, migration_required }) {
  if (project_supported === false) {
    return <MigrationWarnAlert>
      This project appears to be using an experimental version of Renku.&nbsp;<br /><br />
      You can work with datasets in interactive sessions, but creating or modifying datasets&nbsp;
      are not supported from the UI.
    </MigrationWarnAlert>;
  }
  if (migration_required === false)
    return <MigrationSuccessAlert>This project and the RenkuLab UI are compatible.</MigrationSuccessAlert>;
  return <MigrationWarnAlert>
    <p>
      This project is not compatible with the RenkuLab UI.
    </p>
    <p>
      You can work with datasets in interactive sessions, but to create or modify datasets,
      you will need to update the <strong>renku version.</strong>
    </p>
  </MigrationWarnAlert>;
}

/**
 * Show the RenkuLab compatibility status.
 * @param {object} props {migration: projectSchema.migration, loading: bool}
 * @returns Component
 */
function RenkuLabCompatibilityStatus({ loading, migration }) {
  if (isMigrationCheckLoading(loading, migration)) return <Loader />;

  const { migration_status, migration_error } = migration;
  const { check_error, project_supported } = migration.check;
  const migrationErrorProps = { check_error, migration_error, migration_status };
  if (isMigrationFailure(migrationErrorProps))
    return <ShowMigrationFailure {...migrationErrorProps} />;

  const { core_compatibility_status } = migration.check;
  const { migration_required } = core_compatibility_status;

  return <div>
    <RenkuLabVersionInfo core_compatibility_status={core_compatibility_status} />
    <RenkuLabCompatibilityBody
      project_supported={project_supported}
      migration_required={migration_required}
    />
  </div>;
}

export default RenkuLabCompatibilityStatus;

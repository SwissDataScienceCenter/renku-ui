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

import { migrationCheckToRenkuVersionStatus, RENKU_VERSION_SCENARIOS, RENKU_UPDATE_MODE } from "./MigrationUtils";
import { shouldDisplayVersionWarning } from "./MigrationUtils";

const exampleMigrationChecks = {
  current: {
    "project_supported": true,
    "dockerfile_renku_status": {
      "latest_renku_version": "1.0.0",
      "dockerfile_renku_version": "1.0.0",
      "automated_dockerfile_update": false,
      "newer_renku_available": false
    },
    "core_compatibility_status": {
      "project_metadata_version": "9",
      "migration_required": false,
      "current_metadata_version": "9"
    },
    "core_renku_version": "1.0.0",
    "project_renku_version": "1.0.0",
    "template_status": {
      "newer_template_available": false,
      "template_id": "python-minimal",
      "automated_template_update": false,
      "template_ref": null,
      "project_template_version": "1.0.0",
      "template_source": "renku",
      "latest_template_version": "1.0.0"
    }
  },
  notSupported: {
    "project_supported": false,
  },
  notRequired: {
    "project_supported": true,
    "dockerfile_renku_status": {
      "latest_renku_version": "1.0.1",
      "dockerfile_renku_version": "1.0.0",
      "automated_dockerfile_update": true,
      "newer_renku_available": true
    },
    "core_compatibility_status": {
      "project_metadata_version": "9",
      "migration_required": false,
      "current_metadata_version": "9"
    },
    "core_renku_version": "1.0.1",
    "project_renku_version": "1.0.0",
    "template_status": {
      "newer_template_available": false,
      "template_id": "python-minimal",
      "automated_template_update": false,
      "template_ref": null,
      "project_template_version": "1.0.0",
      "template_source": "renku",
      "latest_template_version": "1.0.0"
    }
  },
  requiredAuto: {
    "project_supported": true,
    "dockerfile_renku_status": {
      "latest_renku_version": "1.0.1",
      "dockerfile_renku_version": "0.16.0",
      "automated_dockerfile_update": true,
      "newer_renku_available": true
    },
    "core_compatibility_status": {
      "project_metadata_version": "8",
      "migration_required": true,
      "current_metadata_version": "9"
    },
    "core_renku_version": "1.0.1",
    "project_renku_version": "0.16.0",
    "template_status": {
      "newer_template_available": false,
      "template_id": "python-minimal",
      "automated_template_update": false,
      "template_ref": null,
      "project_template_version": "1.0.0",
      "template_source": "renku",
      "latest_template_version": "1.0.0"
    }
  },
  requiredManual: {
    "project_supported": true,
    "dockerfile_renku_status": {
      "latest_renku_version": "1.0.0",
      "dockerfile_renku_version": null,
      "automated_dockerfile_update": false,
      "newer_renku_available": null
    },
    "core_compatibility_status": {
      "project_metadata_version": "7",
      "migration_required": true,
      "current_metadata_version": "9"
    },
    "core_renku_version": "1.0.0",
    "project_renku_version": "0.11.3",
    "template_status": {
      "newer_template_available": false,
      "template_id": null,
      "automated_template_update": false,
      "template_ref": null,
      "project_template_version": null,
      "template_source": null,
      "latest_template_version": null
    }
  },
};


describe("test version status", () => {
  it("handles up-to-date", () => {
    const result = migrationCheckToRenkuVersionStatus(exampleMigrationChecks.current);
    expect(result.renkuVersionStatus).toEqual(RENKU_VERSION_SCENARIOS.RENKU_UP_TO_DATE);
  });
  it("handles not supported", () => {
    const result = migrationCheckToRenkuVersionStatus(exampleMigrationChecks.notSupported);
    expect(result.renkuVersionStatus).toEqual(RENKU_VERSION_SCENARIOS.PROJECT_NOT_SUPPORTED);
  });
  it("handles new version not required", () => {
    const result = migrationCheckToRenkuVersionStatus(exampleMigrationChecks.notRequired);
    expect(result.renkuVersionStatus).toEqual(RENKU_VERSION_SCENARIOS.NEW_VERSION_NOT_REQUIRED);
    expect(result.updateMode).toEqual(RENKU_UPDATE_MODE.UPDATE_AUTO);
  });
  it("handles new version not required, auto-update possible", () => {
    const result = migrationCheckToRenkuVersionStatus(exampleMigrationChecks.requiredAuto);
    expect(result.renkuVersionStatus).toEqual(RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED);
    expect(result.updateMode).toEqual(RENKU_UPDATE_MODE.UPDATE_AUTO);
  });
  it("handles new version not required, auto-update not possible", () => {
    const result = migrationCheckToRenkuVersionStatus(exampleMigrationChecks.requiredManual);
    expect(result.renkuVersionStatus).toEqual(RENKU_VERSION_SCENARIOS.NEW_VERSION_REQUIRED);
    expect(result.updateMode).toEqual(RENKU_UPDATE_MODE.UPDATE_MANUAL);
  });
});


describe("test display warning", () => {
  it("handles up-to-date", () => {
    const result = shouldDisplayVersionWarning({ check: exampleMigrationChecks.current });
    expect(result).toEqual(false);
  });
  it("handles not supported", () => {
    const result = shouldDisplayVersionWarning({ check: exampleMigrationChecks.notSupported });
    expect(result).toEqual(true);
  });
  it("handles new version not required", () => {
    const result = shouldDisplayVersionWarning({ check: exampleMigrationChecks.notRequired });
    expect(result).toEqual(false);
  });
  it("handles new version not required, auto-update possible", () => {
    const result = shouldDisplayVersionWarning({ check: exampleMigrationChecks.requiredAuto });
    expect(result).toEqual(true);
  });
  it("handles new version not required, auto-update not possible", () => {
    const result = shouldDisplayVersionWarning({ check: exampleMigrationChecks.requiredManual });
    expect(result).toEqual(true);
  });
});

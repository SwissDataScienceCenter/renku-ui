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

import {
  MigrationStatus,
  RenkuMigrationLevel,
  TemplateMigrationLevel,
} from "../Project";
import { ProjectMigrationLevel } from "../projectEnums";
import { TemplateSourceRenku } from "../../../utils/constants/Migrations";
import { RenkuRepositories } from "../../../utils/constants/Repositories";

/**
 * Replace the longer dev suffix (E.G: ".dev22+g1262f766") with a shorter
 * "-dev" generic suffix.
 * @param version - stringy version (SemVer like)
 * @param excludeRc - whether to remove the Release Candidate suffix
 * @returns either same string or shorter string ending with "-dev"
 */
export function cleanVersion(version?: string, excludeRc?: boolean): string {
  if (!version) return "";
  let cleanedVersion = version;
  if (excludeRc) {
    const rcRegex = /rc\d+/;
    if (rcRegex.test(version))
      cleanedVersion = version.substring(0, version.indexOf("rc"));
  }
  const regex = /dev\d+\+/;
  if (regex.test(cleanedVersion)) {
    return version.substring(0, cleanedVersion.indexOf(".dev")) + "-dev";
    // ? Use the following when developing on PR deployments
    // ? return cleanedVersion.substring(0, cleanedVersion.indexOf(".dev"));
  }
  return cleanedVersion;
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
 * Get the Renku Python URL for comparing the releases
 */
export function getCompareUrl(
  projectVersion?: string,
  latestVersion?: string
): React.ReactNode {
  if (!projectVersion || !latestVersion || projectVersion === latestVersion)
    return null;
  const cleanedProjectVersion = cleanVersion(projectVersion);
  const cleanedLatestVersion = cleanVersion(latestVersion);
  if (
    !cleanedProjectVersion.endsWith("-dev") &&
    !cleanedLatestVersion.endsWith("-dev") &&
    cleanedProjectVersion !== cleanedLatestVersion
  )
    return `${RenkuRepositories.Python}/compare/v${cleanedProjectVersion}...v${cleanedLatestVersion}`;
  return null;
}

/**
 * Return the correct migration level based on migration status and core
 * service availability
 */
export function getMigrationLevel(
  migrationStatus: MigrationStatus | undefined,
  backendAvailable: boolean | undefined
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

/**
 * Return the correct renku migration level (i.e. renku-core project)
 * based on migration status and core service availability
 */
export function getRenkuLevel(
  migrationStatus?: MigrationStatus,
  backendAvailable?: boolean
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
    if (backendAvailable === false)
      return { automated, level: ProjectMigrationLevel.Level5 };
    return { automated, level: ProjectMigrationLevel.Level4 };
  }
  // level 3 && 1
  if (!coreCompatibility?.migration_required) {
    if (dockerfileRenku?.newer_renku_available)
      return { automated, level: ProjectMigrationLevel.Level3 };
    return { automated, level: ProjectMigrationLevel.Level1 };
  }
  return { automated: false, level: ProjectMigrationLevel.LevelX };
}

/**
 * Return the correct template migration level based on migration status
 * and core service availability
 */
export function getTemplateLevel(
  migrationStatus: MigrationStatus | undefined
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

/**
 * Verify whether project can be automatically updated or not.
 * Pass only 1 argument to check just one section.
 */
export function canUpdateProjectAutomatically(
  renkuMigrationLevel?: RenkuMigrationLevel | null,
  templateMigrationLevel?: TemplateMigrationLevel | null
): boolean {
  if (
    renkuMigrationLevel &&
    renkuMigrationLevel.automated &&
    (renkuMigrationLevel.level === ProjectMigrationLevel.Level3 ||
      renkuMigrationLevel.level === ProjectMigrationLevel.Level4 ||
      renkuMigrationLevel.level === ProjectMigrationLevel.Level5)
  ) {
    return true;
  }
  if (
    templateMigrationLevel &&
    templateMigrationLevel.automated &&
    templateMigrationLevel.level === ProjectMigrationLevel.Level3
  ) {
    return true;
  }
  return false;
}

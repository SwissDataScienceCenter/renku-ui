/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useCallback, useMemo } from "react";
import { ArrowLeft, BoxArrowInUp, XLg } from "react-bootstrap-icons";
import { useLocation } from "react-router";
import { Button, ModalFooter } from "reactstrap";
import { Loader } from "../../../../components/Loader.tsx";
import { isRenkuLegacy } from "../../../../utils/helpers/HelperFunctionsV2.ts";
import { GitlabProjectsToMigrate } from "../../../projectMigrationV2/ProjectMigration.types.ts";

interface ProjectMigrationFooterProps {
  isReadyMigrationResult: boolean;
  isLoadingMigration: boolean;
  isLoadingSessionValues: boolean;
  step: number;
  setStep: (step: number) => void;
  setSelectedProject: (project: GitlabProjectsToMigrate | null) => void;
  hasGitlabProjectList: boolean;
  toggle: () => void;
}

export function ProjectMigrationFooter({
  isReadyMigrationResult,
  isLoadingMigration,
  isLoadingSessionValues,
  step,
  setStep,
  setSelectedProject,
  hasGitlabProjectList,
  toggle,
}: ProjectMigrationFooterProps) {
  const location = useLocation();
  const isRenkuV1 = isRenkuLegacy(location.pathname);
  const buttonClasses = useMemo(
    () => ({
      outline: isRenkuV1 ? "outline-rk-green" : "outline-primary",
      primary: isRenkuV1 ? "rk-green" : "primary",
    }),
    [isRenkuV1]
  );

  const handleBack = useCallback(() => {
    setStep(1);
    setSelectedProject(null);
  }, [setSelectedProject, setStep]);

  return (
    <ModalFooter>
      {!isReadyMigrationResult && (
        <>
          {hasGitlabProjectList && step === 2 ? (
            <Button color={buttonClasses.outline} onClick={handleBack}>
              <ArrowLeft className={cx("bi", "me-1")} /> Back
            </Button>
          ) : (
            <Button color={buttonClasses.outline} onClick={toggle}>
              <XLg className={cx("bi", "me-1")} /> Cancel
            </Button>
          )}
          {step === 2 && (
            <Button
              color={buttonClasses.primary}
              disabled={isLoadingMigration || isLoadingSessionValues}
              type="submit"
              form="project-migration-form"
            >
              {isLoadingMigration ? (
                <Loader className="me-1" inline size={16} />
              ) : (
                <>
                  <BoxArrowInUp className={cx("bi", "me-1")} />
                  Migrate project to Renku 2.0
                </>
              )}
            </Button>
          )}
        </>
      )}
      {isReadyMigrationResult && (
        <Button color={buttonClasses.outline} onClick={toggle}>
          Close
        </Button>
      )}
    </ModalFooter>
  );
}

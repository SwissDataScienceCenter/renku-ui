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
import { useCallback, useState } from "react";
import { BoxArrowInUp } from "react-bootstrap-icons";
import { ModalBody, ModalHeader } from "reactstrap";
import { GitlabProjectsToMigrate } from "./ProjectMigration.types";
import ScrollableModal from "../../components/modal/ScrollableModal";
import GitlabProjectList from "./GitlabProjectList";
import MigrationForm from "../project/components/projectMigration/ProjectMigrationForm";
import ProjectMigrationFooter from "../project/components/projectMigration/ProjectMigrationFooter";
import { useMigrationForm } from "../project/components/projectMigration/hooks/useMigrationForm";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { SuccessAlert } from "../../components/Alert";
import { Link } from "react-router";

interface MigrationV2ModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function MigrationV2Modal({
  isOpen,
  toggle,
}: MigrationV2ModalProps) {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] =
    useState<GitlabProjectsToMigrate | null>(null);

  const {
    control,
    errors,
    watch,
    setValue,
    reset,
    handleSubmit,
    dirtyFields,
    containerImage,
    defaultUrl,
    result,
    onSubmit,
    linkToProject,
    resetResult,
  } = useMigrationForm();

  const handleProjectSelect = (project: GitlabProjectsToMigrate) => {
    setSelectedProject(project);
    reset({
      name: project.name,
      namespace: "",
      slug: project.path,
      visibility: project.visibility === "public" ? "public" : "private",
    });
    setStep(2);
  };

  const handleClose = useCallback(() => {
    reset();
    resetResult();
    setStep(1);
    setSelectedProject(null);
    toggle();
  }, [reset, resetResult, setStep, toggle]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      isOpen={isOpen}
      size="lg"
      toggle={handleClose}
    >
      <ModalHeader toggle={handleClose}>
        <BoxArrowInUp className={cx("bi", "me-1")} />
        {step === 1
          ? "Select project to migrate"
          : "Migrate project to Renku 2.0"}
      </ModalHeader>
      <ModalBody className="p-4">
        {result.error && <RtkErrorAlert error={result.error} />}
        {step === 1 ? (
          <>
            <div className="h-100">
              <GitlabProjectList onSelectProject={handleProjectSelect} />
            </div>
          </>
        ) : (
          <MigrationForm
            codeRepository={selectedProject?.http_url_to_repo ?? ""}
            isReadyMigrationResult={!!result.data}
            control={control}
            errors={errors}
            setValue={setValue}
            watch={watch}
            dirtyFields={dirtyFields}
            selectedProject={selectedProject}
            onSubmit={onSubmit}
            handleSubmit={handleSubmit}
          />
        )}
        {result?.data && (
          <SuccessAlert dismissible={false} timeout={0}>
            <p>This project has been successfully migrated to Renku 2.0</p>
            <Link
              className={cx("btn", "btn-sm", "btn-success", "text-white")}
              to={linkToProject}
            >
              Go to the 2.0 version of the project
            </Link>
          </SuccessAlert>
        )}
      </ModalBody>
      <ProjectMigrationFooter
        isReadyMigrationResult={!!result.data}
        isLoadingMigration={result.isLoading}
        isLoadingSessionValues={!containerImage || !defaultUrl}
        step={step}
        setStep={setStep}
        setSelectedProject={setSelectedProject}
        hasGitlabProjectList={true}
        toggle={handleClose}
      />
    </ScrollableModal>
  );
}

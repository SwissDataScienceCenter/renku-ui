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
import { BoxArrowInUp } from "react-bootstrap-icons";
import { Link } from "react-router";
import { ModalBody, ModalHeader } from "reactstrap";
import { SuccessAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import { useMigrationForm } from "./hooks/useMigrationForm";
import { ProjectMetadata } from "./ProjectMigration.types";
import ProjectMigrationFooter from "./ProjectMigrationFooter";
import MigrationForm from "./ProjectMigrationForm";

interface MigrationV1ModalProps {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata: ProjectMetadata;
  description?: string;
  tagList?: string[];
}

export default function MigrationV1Modal({
  isOpen,
  toggle,
  projectMetadata,
  description,
  tagList,
}: MigrationV1ModalProps) {
  const {
    control,
    errors,
    watch,
    setValue,
    handleSubmit,
    dirtyFields,
    containerImage,
    defaultUrl,
    result,
    onSubmit,
    linkToProject,
    reset,
    resetResult,
  } = useMigrationForm({
    initialValues: {
      name: projectMetadata.title,
      namespace: "",
      slug: projectMetadata.path,
      visibility:
        projectMetadata.visibility === "public" ? "public" : "private",
      keywords: tagList ?? [],
      codeRepositories: [projectMetadata.httpUrl ?? ""],
    },
  });

  return (
    <ScrollableModal
      backdrop="static"
      centered
      isOpen={isOpen}
      size="lg"
      toggle={() => {
        reset();
        resetResult();
        toggle();
      }}
    >
      <ModalHeader toggle={toggle}>
        <BoxArrowInUp className={cx("bi", "me-1")} />
        Migrate project to Renku 2.0
      </ModalHeader>
      <ModalBody className="p-4">
        {result.error && <RtkErrorAlert error={result.error} />}
        <MigrationForm
          description={description}
          keywords={tagList}
          codeRepository={projectMetadata.httpUrl ?? ""}
          isReadyMigrationResult={!!result.data}
          control={control}
          errors={errors}
          setValue={setValue}
          watch={watch}
          dirtyFields={dirtyFields}
          projectMetadata={projectMetadata}
          onSubmit={onSubmit}
          handleSubmit={handleSubmit}
        />
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
        step={2}
        hasGitlabProjectList={false}
        toggle={toggle}
      />
    </ScrollableModal>
  );
}

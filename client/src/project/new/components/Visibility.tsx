/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
/**
 *  renku-ui
 *
 *  Visibility.js
 *  Visibility field group component
 */
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Button, FormGroup, Modal, ModalBody, ModalHeader } from "reactstrap";
import VisibilitiesInput, {
  Visibilities,
  VISIBILITY_ITEMS,
} from "../../../components/visibility/Visibility";
import {
  NewProjectHandlers,
  NewProjectInputs,
  NewProjectMeta,
} from "./newProject.d";
import { LoadingLabel } from "../../../components/formlabels/FormLabels";
import { GitlabLinks } from "../../../utils/constants/Docs";
import { ExternalLink } from "../../../components/ExternalLinks";
import { useUpdateProjectMutation } from "../../../features/project/projectKgApi";
import { useGetProjectByIdQuery } from "../../../features/project/projectGitlabApi";
import { useGetGroupByPathQuery } from "../../../features/projects/projectsApi";
import { computeVisibilities } from "../../../utils/helpers/HelperFunctions";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { SuccessAlert, WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { useProjectMetadataQuery } from "../../../features/projects/projectsKgApi";

interface VisibilityProps {
  handlers: NewProjectHandlers;
  meta: NewProjectMeta;
  input: NewProjectInputs;
}

const Visibility = ({ handlers, meta, input }: VisibilityProps) => {
  const error = meta.validation.errors["visibility"];

  return (
    <FormGroup className="field-group">
      <VisibilitiesInput
        isLoadingData={
          meta.namespace.fetching ||
          !meta.namespace.visibilities ||
          !input.visibility
        }
        namespaceVisibility={meta.namespace.visibility}
        isInvalid={!!error && !input.visibilityPristine}
        data-cy="visibility-select"
        isRequired={true}
        onChange={(value: string) => handlers.setProperty("visibility", value)}
        value={input.visibility ?? null}
      />
    </FormGroup>
  );
};

interface EditVisibilityModalConfirmationProps {
  onConfirm: (visibility: Visibilities) => void;
  toggleModal: () => void;
  isOpen: boolean;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  message: ReactNode;
  visibility: Visibilities;
}

function EditVisibilityModalConfirmation({
  isOpen,
  toggleModal,
  onConfirm,
  isError,
  isLoading,
  isSuccess,
  message,
  visibility,
}: EditVisibilityModalConfirmationProps) {
  const buttons = !isError && !isLoading && !isSuccess && (
    <div className="mt-2 d-flex flex-row gap-2 justify-content-end">
      <Button
        className="float-right mt-1 btn-outline-rk-green"
        onClick={toggleModal}
        data-cy="cancel-visibility-btn"
      >
        Cancel
      </Button>
      <Button
        className="float-right mt-1 btn-rk-green"
        onClick={() => onConfirm(visibility)}
        data-cy="update-visibility-btn"
      >
        Agree
      </Button>
    </div>
  );

  const modalContent =
    visibility === Visibilities.Private
      ? "Users will not find this project anymore unless you explicitly add them to the Members list. "
      : "Please note that users will not need your explicit permission to see this project. ";
  const content =
    isError || isSuccess ? (
      message
    ) : isLoading ? (
      <LoadingLabel text="Updating visibility" />
    ) : (
      <>
        {modalContent}
        Check the{" "}
        <ExternalLink
          url={GitlabLinks.PROJECT_VISIBILITY}
          role="text"
          title="visibility documentation"
        />{" "}
        for more details.
      </>
    );

  return (
    <Modal isOpen={isOpen} toggle={() => toggleModal()} size="lg">
      <ModalHeader toggle={() => toggleModal()}>
        Change visibility to{" "}
        {VISIBILITY_ITEMS.find((item) => item.value === visibility)?.title}
      </ModalHeader>
      <ModalBody>
        {content}
        {buttons}
      </ModalBody>
    </Modal>
  );
}

interface VisibilityProps {
  namespace: {
    name: string;
    kind: string;
  };
  forkedProjectId: number;
  pathWithNamespace: string;
}

const EditVisibility = ({
  namespace,
  forkedProjectId,
  pathWithNamespace,
}: VisibilityProps) => {
  const [updateProject, { isLoading, isSuccess, isError, error, reset }] =
    useUpdateProjectMutation();
  const {
    data: projectData,
    isFetching: isFetchingProject,
    isLoading: isLoadingProject,
    refetch: refetchProjectData,
  } = useProjectMetadataQuery(
    { projectPath: pathWithNamespace }, // ! TODO: check missing ID
    { skip: !pathWithNamespace }
  );
  const {
    data: forkProjectData,
    isFetching: isFetchingForkProject,
    isLoading: isLoadingForkProject,
  } = useGetProjectByIdQuery(forkedProjectId, { skip: !forkedProjectId });
  const {
    data: namespaceData,
    isFetching: isFetchingNamespace,
    isLoading: isLoadingNamespace,
  } = useGetGroupByPathQuery(namespace.name, {
    skip: namespace.kind != "group",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [newVisibility, setNewVisibility] = useState<Visibilities>();
  const [availableVisibilities, setAvailableVisibilities] = useState(
    computeVisibilities([])
  );

  useEffect(() => {
    const namespaces = [];
    if (!isFetchingForkProject && !isLoadingForkProject && forkProjectData)
      namespaces.push(forkProjectData.visibility);
    if (!isFetchingNamespace && !isLoadingNamespace && namespaceData)
      namespaces.push(namespaceData.visibility);
    setAvailableVisibilities(computeVisibilities(namespaces));
  }, [
    isFetchingForkProject,
    isLoadingForkProject,
    forkProjectData,
    isFetchingNamespace,
    isLoadingNamespace,
    namespaceData,
  ]);

  useEffect(() => {
    if (projectData) setNewVisibility(projectData.visibility);
  }, [projectData]);

  const onConfirm = useCallback(
    (newVisibility: Visibilities) => {
      if (projectData)
        updateProject({
          projectPathWithNamespace: projectData.path,
          visibility: newVisibility,
        });
    },
    [projectData, updateProject]
  );

  const onChange = useCallback(
    (visibility: Visibilities) => {
      if (newVisibility !== visibility) {
        setIsOpen(true);
        setNewVisibility(visibility);
      }
    },
    [setIsOpen, setNewVisibility, newVisibility]
  );

  const onCancel = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isSuccess) {
      setNewVisibility(projectData?.visibility);
    } else {
      reset();
      refetchProjectData(); //make sure the visibility is updated
    }
  }, [isOpen, isSuccess, projectData?.visibility, refetchProjectData, reset]);

  const message =
    isError && error ? (
      <RtkErrorAlert error={error} dismissible={false} />
    ) : isSuccess ? (
      <SuccessAlert dismissible={false} timeout={0}>
        The visibility of the project has been modified
      </SuccessAlert>
    ) : (
      ""
    );

  if (!isLoadingProject && !isFetchingProject && !projectData)
    return (
      <WarnAlert dismissible={false}>
        Knowledge Graph integration must be enabled to change visibility from
        the RenkuLab web interface.
      </WarnAlert>
    );

  if (isLoadingProject && isFetchingProject && !projectData) return <Loader />;

  return (
    projectData && (
      <div>
        <VisibilitiesInput
          isLoadingData={
            isFetchingProject ||
            isLoadingProject ||
            !projectData?.visibility ||
            isFetchingForkProject
          }
          namespaceVisibility={availableVisibilities.default as Visibilities}
          isInvalid={isError}
          data-cy="edit-visibility-select"
          isRequired={false}
          onChange={onChange}
          value={newVisibility || projectData?.visibility}
          isForked={!!forkedProjectId}
          includeRequiredLabel={false}
        />
        <EditVisibilityModalConfirmation
          onConfirm={onConfirm}
          isOpen={isOpen}
          toggleModal={onCancel}
          isError={isError}
          isLoading={isLoading}
          isSuccess={isSuccess}
          message={message}
          visibility={newVisibility || projectData?.visibility}
        />
      </div>
    )
  );
};

export default Visibility;
export { EditVisibility };

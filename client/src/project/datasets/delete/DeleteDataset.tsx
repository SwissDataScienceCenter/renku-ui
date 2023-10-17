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

import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  FormText,
} from "reactstrap";

import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { Loader } from "../../../components/Loader";
import type { DatasetCore } from "../../../features/project/Project";
import { useDeleteDatasetMutation } from "../../../features/datasets/datasetsCore.api";
import {
  CoreErrorContent,
  CoreErrorResponse,
  CoreVersionUrl,
} from "../../../utils/types/coreService.types";
import { Url } from "../../../utils/helpers/url";

function ModalContent({
  closeModal,
  dataset,
  deleteDataset,
  serverErrors,
  submitLoader,
}: DatasetDeleteModalProps) {
  if (serverErrors) {
    if (typeof serverErrors === "string") {
      serverErrors = {
        code: 2000,
        userMessage: serverErrors,
        devMessage: serverErrors,
      };
    }
    return (
      <Col>
        <CoreErrorAlert error={serverErrors} />
      </Col>
    );
  }

  if (!submitLoader.isSubmitting && submitLoader.text) {
    return (
      <div className="d-flex flex-row-reverse">
        <FormText color="primary">
          <Loader inline size={16} /> {submitLoader.text}
          <br />
        </FormText>
      </div>
    );
  }

  return (
    <Col>
      <p>
        Are you sure you want to delete dataset <strong>{dataset.name}</strong>?
      </p>
      <div className="d-flex flex-row-reverse">
        <Button
          type="submit"
          onClick={deleteDataset}
          disabled={submitLoader.isSubmitting}
          className="mt-1 btn-rk-pink"
        >
          {submitLoader.isSubmitting ? (
            <FormText color="primary">
              <Loader inline size={16} /> Deleting dataset...
            </FormText>
          ) : (
            "Delete dataset"
          )}
        </Button>
        <Button
          disabled={submitLoader.isSubmitting}
          className="mt-1 me-2 btn-outline-rk-pink"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </div>
    </Col>
  );
}

type DatasetDeleteModalProps = {
  closeModal: () => void;
  dataset: DeleteDatasetProps["dataset"];
  deleteDataset: () => void;
  history: DeleteDatasetProps["history"];
  modalOpen: DeleteDatasetProps["modalOpen"];
  serverErrors: CoreErrorContent | string | undefined;
  submitLoader: { isSubmitting: boolean; text: string | undefined };
};

function DatasetDeleteModal(props: DatasetDeleteModalProps) {
  return (
    <Modal isOpen={props.modalOpen} toggle={props.closeModal}>
      <ModalHeader toggle={props.closeModal}>Delete Dataset</ModalHeader>
      <ModalBody>
        <Row className="mb-3">
          <ModalContent {...props} />
        </Row>
      </ModalBody>
    </Modal>
  );
}

export type DeleteDatasetErrorResponse = {
  error: string;
  result: null | undefined;
};

export type DeleteDatasetSuccessResponse = {
  error: null | undefined;
  result: {
    remote_branch: string;
  };
};

export interface DeleteDatasetProps extends CoreVersionUrl {
  dataset: DatasetCore;
  history: ReturnType<typeof useHistory>;
  externalUrl: string;
  onCancel: () => void;
  modalOpen: boolean;
  projectPathWithNamespace: string;
  setModalOpen: (modalOpen: boolean) => void;
}

function DeleteDataset(props: DeleteDatasetProps) {
  const [serverErrors, setServerErrors] = useState<
    CoreErrorContent | string | undefined
  >(undefined);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState<string | undefined>(
    undefined
  );

  const [deleteDataset, deleteDatasetStatus] = useDeleteDatasetMutation();

  const projectDatasetsUrl = Url.get(Url.pages.project.datasets, {
    path: props.projectPathWithNamespace,
  });

  // handle deleting dataset
  useEffect(() => {
    if (deleteDatasetStatus.error && "data" in deleteDatasetStatus.error) {
      const errorResponse = deleteDatasetStatus.error.data as CoreErrorResponse;
      setSubmitting(false);
      setServerErrors(errorResponse.error);
    } else if (deleteDatasetStatus.error) {
      // ? This cases is unlikely to happen with the current implementation of renku-core
      setSubmitting(false);
      const errorMessage =
        "There was an unexpected problem deleting the dataset: " +
        deleteDatasetStatus.error.toString();
      setServerErrors(errorMessage);
    } else if (deleteDatasetStatus.isSuccess) {
      setSubmitting(false);
      setSubmitLoaderText("Dataset deleted, you will be redirected soon...");
      props.history.push({
        pathname: projectDatasetsUrl,
        state: { reload: true },
      });
    }
  }, [deleteDatasetStatus, props.history, projectDatasetsUrl]);

  const localDeleteDataset = () => {
    setSubmitting(true);
    setServerErrors(undefined);
    setSubmitLoaderText(undefined);
    deleteDataset({
      apiVersion: props.apiVersion,
      gitUrl: props.externalUrl,
      metadataVersion: props.metadataVersion,
      slug: props.dataset.slug,
    });
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setServerErrors(undefined);
      props.setModalOpen(false);
    }
  };

  return (
    <DatasetDeleteModal
      dataset={props.dataset}
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      deleteDataset={localDeleteDataset}
      serverErrors={serverErrors}
      submitLoader={{ isSubmitting, text: submitLoaderText }}
      history={props.history}
    />
  );
}

export default DeleteDataset;

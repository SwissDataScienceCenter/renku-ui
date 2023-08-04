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

import React, { useState } from "react";
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

function ModalContent({
  closeModal,
  dataset,
  deleteDataset,
  serverErrors,
  submitLoader,
}: DatasetDeleteModalProps) {
  if (serverErrors) {
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
  serverErrors: string | undefined;
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

type DeleteDatasetResponse = {
  data: DeleteDatasetErrorResponse | DeleteDatasetSuccessResponse;
};

type DatasetDeleteClient = {
  deleteDataset: (
    projectUrl: string,
    datasetName: string,
    versionUrl: string
  ) => Promise<DeleteDatasetResponse>;
};

export interface DeleteDatasetProps {
  client: DatasetDeleteClient;
  dataset: DatasetCore;
  history: ReturnType<typeof useHistory>;
  externalUrl: string;
  onCancel: () => void;
  modalOpen: boolean;
  projectPathWithNamespace: string;
  setModalOpen: (modalOpen: boolean) => void;
  versionUrl: string;
}

function DeleteDataset(props: DeleteDatasetProps) {
  const [serverErrors, setServerErrors] = useState<string | undefined>(
    undefined
  );
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState<string | undefined>(
    undefined
  );

  const closeModal = () => {
    if (!isSubmitting) {
      setServerErrors(undefined);
      props.setModalOpen(false);
    }
  };

  const deleteDataset = () => {
    setServerErrors(undefined);
    setSubmitting(true);
    setSubmitLoaderText(undefined);
    // ! TODO - use useDeleteDatasetMutation here
    props.client
      .deleteDataset(props.externalUrl, props.dataset.name, props.versionUrl)
      .then((response) => {
        setSubmitting(false);
        if (response.data.error != null) {
          setServerErrors(response.data.error);
          return;
        }
        setSubmitLoaderText("Dataset deleted, you will be redirected soon...");
        props.history.push({
          pathname: `/projects/${props.projectPathWithNamespace}/datasets`,
          state: { reload: true },
        });
      })
      .catch(() => {
        setSubmitting(false);
        setServerErrors(
          "There was an unexpected problem deleting the dataset. You may want to try again."
        );
      });
  };

  return (
    <DatasetDeleteModal
      dataset={props.dataset}
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      deleteDataset={deleteDataset}
      serverErrors={serverErrors}
      submitLoader={{ isSubmitting, text: submitLoaderText }}
      history={props.history}
    />
  );
}

export default DeleteDataset;

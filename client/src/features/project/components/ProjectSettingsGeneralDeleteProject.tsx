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

import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useHistory } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
} from "reactstrap";
import { ErrorAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { useDeleteProjectMutation } from "../projectKgApi";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";

interface ProjectSettingsGeneralDeleteProjectProps {
  isMaintainer: boolean;
  notifications: Notifications;
  projectPathWithNamespace: string;
  userLogged: boolean;
}

export const ProjectSettingsGeneralDeleteProject = ({
  isMaintainer,
  notifications,
  projectPathWithNamespace,
  userLogged,
}: ProjectSettingsGeneralDeleteProjectProps) => {
  const [deleteProject, result] = useDeleteProjectMutation();
  const onDeleteProject = useCallback(() => {
    deleteProject({ projectPathWithNamespace });
  }, [deleteProject, projectPathWithNamespace]);

  const [confirmText, setConfirmText] = useState<string>("");
  const onChangeConfirmBox = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConfirmText(event.target.value);
    },
    []
  );

  const confirmMatches = confirmText === projectPathWithNamespace;
  const disabled =
    !userLogged || !isMaintainer || !confirmMatches || result.isLoading;

  const [showModal, setShowModal] = useState<boolean>(false);
  const onOpenModal = useCallback(() => setShowModal(true), []);
  const onCloseModal = useCallback(() => {
    setConfirmText("");
    setShowModal(false);
  }, []);
  const toggleModal = useCallback(() => {
    setConfirmText("");
    setShowModal((showModal) => !showModal);
  }, []);

  const history = useHistory();
  useEffect(() => {
    if (result.isSuccess) {
      addNotification({ notifications, projectPathWithNamespace });
      history.push("/");
    }
  }, [history, notifications, projectPathWithNamespace, result.isSuccess]);
  useEffect(() => {
    if (result.isError) {
      setConfirmText("");
      setShowModal(false);
    }
  }, [result.isError]);

  if (!userLogged || !isMaintainer) return null;

  return (
    <Card data-cy="project-settings-general-delete-project">
      <CardBody>
        <CardTitle className="fs-6 lh-base text-danger">
          Delete project
        </CardTitle>
        {result.error && <ShowError error={result.error} />}
        <p className="mb-0">
          Deleting the project will remove its repository and all related
          resources, including datasets, issues and merge requests.
        </p>
        <p>Learn more</p>
        <p className="text-danger">Deleted projects cannot be restored!</p>
        <Button color="danger" onClick={onOpenModal}>
          Delete project
        </Button>
        <Modal
          isOpen={showModal || result.isLoading}
          toggle={result.isLoading ? undefined : toggleModal}
          centered
          size="lg"
        >
          {result.isLoading ? (
            <ModalBody>
              <h3 className="fs-6 lh-base text-danger fw-bold">
                Deleting your project...
              </h3>
              <div className="py-5 d-flex justify-content-center">
                <span>
                  <Loader />
                </span>
              </div>
            </ModalBody>
          ) : (
            <ModalBody>
              <h3 className="fs-6 lh-base text-danger fw-bold">
                Are you absolutely sure?
              </h3>
              <p>Deleted projects cannot be restored.</p>
              <Form className="form-rk-green">
                <Label>
                  <p className="m-0">Enter the following to confirm:</p>
                  <p className="m-0">
                    <code>{projectPathWithNamespace}</code>
                  </p>
                </Label>
                <Input
                  name="project-settings-general-delete-confirm-box"
                  type="text"
                  value={confirmText}
                  onChange={onChangeConfirmBox}
                />
                <div className="mt-2 d-flex flex-row justify-content-end">
                  <Button color="outline-danger" onClick={onCloseModal}>
                    Cancel, keep project
                  </Button>
                  <Button
                    color="outline-danger"
                    className="ms-2"
                    disabled={disabled}
                    onClick={onDeleteProject}
                  >
                    Yes, delete this project
                  </Button>
                </div>
              </Form>
            </ModalBody>
          )}
        </Modal>
      </CardBody>
    </Card>
  );
};

const ShowError = ({
  error,
}: {
  error: FetchBaseQueryError | SerializedError;
}) => {
  if ("status" in error && error.status === 403) {
    return (
      <ErrorAlert>
        <h5>Forbidden</h5>
        <p className="mb-0">
          You do not have the necessary permissions to delete this project.
        </p>
      </ErrorAlert>
    );
  }

  return (
    <ErrorAlert>
      <h5>Unexpected Error</h5>
      <p className="mb-0">Could not delete this project.</p>
    </ErrorAlert>
  );
};

export interface Notifications {
  addSuccess: (
    topic: string,
    desc?: ReactNode,
    link?: string,
    linkText?: string,
    awareLocations?: string[],
    longDesc?: string
  ) => Notifications;
}

const addNotification = ({
  notifications,
  projectPathWithNamespace,
}: {
  notifications: Notifications;
  projectPathWithNamespace: string;
}) => {
  notifications.addSuccess(
    NOTIFICATION_TOPICS.PROJECT_DELETED,
    <>
      Project <code>{projectPathWithNamespace}</code> deleted
    </>
  );
};

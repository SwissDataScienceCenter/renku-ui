/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Box2, Boxes, PlayCircle, PlusLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom-v5-compat";
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import {
  CustomEnvFormContent,
  ExistingEnvFormContent,
  SessionLauncherForm,
} from "../../SessionLauncherFormContent";
import { useAddSessionLauncherMutation } from "../../sessionsV2.api";
import { SessionLauncherEnvironment } from "../../sessionsV2.types";
import { InfoAlert } from "../../../../components/Alert";

interface AddSessionLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}
function AddSessionCustomImageModal({
  isOpen,
  toggle,
}: AddSessionLauncherModalProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: project } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const [addSessionLauncher, result] = useAddSessionLauncherMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<SessionLauncherForm, unknown>({
    defaultValues: {
      name: "",
      environment_kind: "container_image",
      container_image: "",
      default_url: "",
    },
  });
  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { default_url, name } = data;
      const environment: SessionLauncherEnvironment = {
        environment_kind: "container_image",
        container_image: data.container_image,
      };
      addSessionLauncher({
        project_id: projectId ?? "",
        resource_class_id: data.resourceClass.id,
        name,
        default_url: default_url.trim() ? default_url : undefined,
        ...environment,
      });
    },
    [addSessionLauncher, projectId]
  );

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggle}>
          <Boxes className={cx("bi", "me-1")} />
          Provide a custom image
        </ModalHeader>
        <ModalBody>
          <p>
            Create a session launcher from a custom image. You can provide an
            image URL from a registry, for example from https://hub.docker.com
          </p>
          <InfoAlert dismissible={false} timeout={0}>
            The image must be public.
          </InfoAlert>
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <CustomEnvFormContent
            control={control}
            errors={errors}
            setValue={setValue}
          />
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="primary"
            data-cy="add-launcher-custom-button"
            disabled={result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add Session launcher
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
function AddSessionExistingEnvModal({
  isOpen,
  toggle,
}: AddSessionLauncherModalProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: project } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const [addSessionLauncher, result] = useAddSessionLauncherMutation();

  const {
    control,
    formState: { errors, touchedFields },
    handleSubmit,
    reset,
    watch,
    setValue,
    resetField,
  } = useForm<SessionLauncherForm, unknown>({
    defaultValues: {
      name: "",
      environment_kind: "global_environment",
      environment_id: "",
      default_url: "",
    },
  });
  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { default_url, name, resourceClass } = data;
      const environment: SessionLauncherEnvironment = {
        environment_kind: "global_environment",
        environment_id: data.environment_id,
      };
      addSessionLauncher({
        project_id: projectId ?? "",
        resource_class_id: resourceClass.id,
        name,
        default_url: default_url.trim() ? default_url : undefined,
        ...environment,
      });
    },
    [addSessionLauncher, projectId]
  );

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      scrollable
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <Box2 className={cx("bi", "me-1")} />
        Select an existing environment
      </ModalHeader>
      <ModalBody>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <p>
            Reuse an environment already defined on RenkuLab to create an
            interactive session for your project.
          </p>
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <ExistingEnvFormContent
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            touchedFields={touchedFields}
            resetField={resetField}
          />
        </Form>
      </ModalBody>
      <ModalFooter className="gap-2">
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={result.isLoading}
          type="submit"
          onClick={handleSubmit(onSubmit)}
          data-cy="add-session-launcher-button"
        >
          {result.isLoading ? (
            <>
              <Loader className="me-1" inline size={16} />
              Adding Session launcher
            </>
          ) : (
            <>
              <PlusLg className={cx("bi", "me-1")} />
              Add Session launcher
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function Step1AddSessionModal({
  toggleModal,
  isOpen,
}: {
  toggleModal: () => void;
  isOpen: boolean;
}) {
  const [isOpenCustomEnv, setIsOpenCustomEnv] = useState(false);
  const [isOpenExistingEnv, setIsOpenExistingEnv] = useState(false);
  const toggleCustom = useCallback(() => {
    setIsOpenCustomEnv((open) => !open);
  }, []);
  const toggleExisting = useCallback(() => {
    setIsOpenExistingEnv((open) => !open);
  }, []);
  const goNextStep = useCallback(
    (isCustom: boolean) => {
      if (isCustom) {
        toggleCustom();
        toggleModal();
      } else {
        toggleExisting();
        toggleModal();
      }
    },
    [toggleModal, toggleCustom, toggleExisting]
  );

  return (
    <>
      <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>
          <PlayCircle className={cx("bi", "me-1")} />
          Add session launcher
        </ModalHeader>
        <ModalBody>
          <p>
            Define an interactive environment in which to do your work and share
            it with others.
          </p>
          <p>
            Everyone who can see the project can launch a session. Running
            sessions are only accessible by the person who launched it.
          </p>
          <p>
            All project code repositories and data sources will be automatically
            mounted in your session.
          </p>
          <Row className="gap-3">
            <Col className="d-grid" xs={12}>
              <Button
                color="outline-primary"
                data-cy="add-existing-environment"
                onClick={() => goNextStep(false)}
              >
                <Box2 className={cx("bi", "me-1")} />
                Select an existing environment
              </Button>
            </Col>
            <Col className="d-grid" xs={12}>
              <Button
                color="outline-primary"
                data-cy="add-custom-image"
                onClick={() => goNextStep(true)}
              >
                <Boxes className={cx("bi", "me-1")} />
                Provide a custom image
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      <AddSessionCustomImageModal
        isOpen={isOpenCustomEnv}
        toggle={toggleCustom}
      />
      <AddSessionExistingEnvModal
        isOpen={isOpenExistingEnv}
        toggle={toggleExisting}
      />
    </>
  );
}

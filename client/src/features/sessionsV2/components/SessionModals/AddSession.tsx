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

import { useParams } from "react-router-dom-v5-compat";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../../projectsV2/api/projectV2.enhanced-api.ts";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAddSessionLauncherMutation } from "../../sessionsV2.api.ts";
import { useForm } from "react-hook-form";
import {
  CustomEnvFormContent,
  ExistingEnvFormContent,
  SessionLauncherForm,
} from "../../SessionLauncherFormContent.tsx";
import { useCallback, useEffect, useState } from "react";
import { SessionLauncherEnvironment } from "../../sessionsV2.types.ts";
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
import { Link45deg, PlusLg, XLg } from "react-bootstrap-icons";
import cx from "classnames";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert.tsx";
import { Loader } from "../../../../components/Loader.tsx";
import rkIconSessions from "../../../../styles/icons/sessions.svg";
import styles from "../../../ProjectPageV2/ProjectPageContent/ProjectOverview/ProjectOverview.module.scss";
import stylesButton from "../../../../components/buttons/Buttons.module.scss";
import EnvironmentIcon from "../../../../components/icons/EnvironmentIcon.tsx";

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
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader toggle={toggle} className="pb-0">
          <span>
            <Link45deg size={30} className="me-2 flex-shrink-0" />
            Provide a custom image
          </span>
        </ModalHeader>
        <ModalBody>
          <p>
            Create a session launcher from a custom image. You can provide an
            image URL from a registry, for example from https://hub.docker.com
            Note: image must be publicly accessible!
          </p>
          {result.error && <RtkErrorAlert error={result.error} />}

          <CustomEnvFormContent control={control} errors={errors} />
        </ModalBody>
        <ModalFooter className="pt-0">
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            disabled={result.isLoading}
            type="submit"
            data-cy="add-launcher-custom-btn"
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
      const { default_url, name } = data;
      const environment: SessionLauncherEnvironment = {
        environment_kind: "global_environment",
        environment_id: data.environment_id,
      };
      addSessionLauncher({
        project_id: projectId ?? "",
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
      <ModalHeader toggle={toggle} className="pb-0">
        <span>
          <EnvironmentIcon size={30} className="me-2" />
          Select an existing environment
        </span>
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <p>
            Reuse an environment already defined on RenkuLab to create an
            interactive session for your project.
          </p>
          {result.error && <RtkErrorAlert error={result.error} />}
          <ExistingEnvFormContent
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            touchedFields={touchedFields}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          disabled={result.isLoading}
          type="submit"
          onClick={handleSubmit(onSubmit)}
          data-cy="add-session-launcher-btn"
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
      <Modal size={"lg"} isOpen={isOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>
          <span className="d-flex align-items-center">
            <img
              src={rkIconSessions}
              className={cx("rk-icon", "rk-icon-lg", "me-2")}
            />
            <small className="text-uppercase">Add session launcher</small>
          </span>
        </ModalHeader>
        <ModalBody className="pt-0">
          <p className="fw-500 fst-normal">
            Define an interactive environment in which to do your work and share
            it with others.
            <br />
            Everyone who can see the project can launch a session. Running
            sessions are only accessible by the person who launched it.
            <br />
            All project code repositories and data sources will be automatically
            mounted in your session.
          </p>
          <Row className="mb-3">
            <Col xs={12}>
              <Button
                onClick={() => goNextStep(false)}
                className={cx(
                  "w-100",
                  "bg-transparent",
                  "text-dark",
                  "rounded-3",
                  "my-2",
                  "py-3",
                  "border-black",
                  styles.BorderDashed,
                  stylesButton.EmptyButton
                )}
                data-cy="add-existing-environment"
              >
                <EnvironmentIcon size={30} className="me-2" />
                Select an existing environment
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                onClick={() => goNextStep(true)}
                className={cx(
                  "w-100",
                  "bg-transparent",
                  "text-dark",
                  "rounded-3",
                  "my-2",
                  "py-3",
                  "border-black",
                  styles.BorderDashed,
                  stylesButton.EmptyButton
                )}
                data-cy="add-custom-image"
              >
                <Link45deg className={cx("me-2", "rk-icon-lg")} />
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

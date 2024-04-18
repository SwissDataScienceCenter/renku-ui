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
import { PlusLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom-v5-compat";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useGetProjectsByNamespaceAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import buttonStyles from "../../styles/components/_custom_buttons.module.scss";
import SessionLauncherFormContent, {
  SessionLauncherForm,
} from "./SessionLauncherFormContent";
import sessionsV2Api, { useAddSessionLauncherMutation } from "./sessionsV2.api";
import { SessionLauncherEnvironment } from "./sessionsV2.types";

export default function AddSessionLauncherButton({
  styleBtn,
}: {
  styleBtn: "iconBtn" | "iconTextBtn";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      {styleBtn === "iconTextBtn" ? (
        <Button className="btn-rk-green" onClick={toggle}>
          <PlusLg className={cx("bi", "me-1")} />
          Add session
        </Button>
      ) : (
        <Button className={buttonStyles.PlusIconButton} onClick={toggle}>
          <PlusLg size="20" />
        </Button>
      )}
      <AddSessionLauncherModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddSessionLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionLauncherModal({
  isOpen,
  toggle,
}: AddSessionLauncherModalProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();
  const { data: project } = useGetProjectsByNamespaceAndSlugQuery(
    namespace && slug ? { namespace, slug } : skipToken
  );
  const projectId = project?.id;

  const { data: environments } =
    sessionsV2Api.endpoints.getSessionEnvironments.useQueryState();

  const [addSessionLauncher, result] = useAddSessionLauncherMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<SessionLauncherForm, unknown>({
    defaultValues: {
      name: "",
      description: "",
      environment_kind: "global_environment",
      environment_id: "",
      container_image: "",
      default_url: "",
    },
  });
  const onSubmit = useCallback(
    (data: SessionLauncherForm) => {
      const { default_url, description, name } = data;
      const environment: SessionLauncherEnvironment =
        data.environment_kind === "global_environment"
          ? {
              environment_kind: "global_environment",
              environment_id: data.environment_id,
            }
          : {
              environment_kind: "container_image",
              container_image: data.container_image,
            };
      addSessionLauncher({
        project_id: projectId ?? "",
        name,
        description: description.trim() ? description : undefined,
        default_url: default_url.trim() ? default_url : undefined,
        ...environment,
      });
    },
    [addSessionLauncher, projectId]
  );

  useEffect(() => {
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environment_kind", "container_image");
    }
  }, [environments, setValue]);

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
          Add session
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}

          <SessionLauncherFormContent
            control={control}
            errors={errors}
            watch={watch}
          />
        </ModalBody>
        <ModalFooter className="pt-0">
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button disabled={result.isLoading} type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add Session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

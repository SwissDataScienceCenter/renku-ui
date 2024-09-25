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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
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
import SessionEnvironmentFormContent, {
  SessionEnvironmentForm,
} from "./SessionEnvironmentFormContent";
import { useAddSessionEnvironmentMutation } from "./adminSessions.api";
import { safeParse } from "../sessionsV2/session.utils";

export default function AddSessionEnvironmentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-outline-rk-green" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Session Environment
      </Button>
      <AddSessionEnvironmentModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddSessionEnvironmentModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionEnvironmentModal({
  isOpen,
  toggle,
}: AddSessionEnvironmentModalProps) {
  const [addSessionEnvironment, result] = useAddSessionEnvironmentMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SessionEnvironmentForm>({
    defaultValues: {
      container_image: "",
      default_url: "",
      description: "",
      name: "",
    },
  });
  const onSubmit = useCallback(
    (data: SessionEnvironmentForm) => {
      addSessionEnvironment({
        container_image: data.container_image,
        name: data.name,
        default_url: data.default_url.trim() ? data.default_url : undefined,
        description: data.description.trim() ? data.description : undefined,
        port: data.port ?? undefined,
        working_directory: data.working_directory.trim()
          ? data.working_directory
          : undefined,
        mount_directory: data.mount_directory.trim()
          ? data.working_directory
          : undefined,
        uid: data.uid ?? undefined,
        gid: data.gid ?? undefined,
        command: safeParse(data.command),
        args: safeParse(data.args),
      });
    },
    [addSessionEnvironment]
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
        <ModalHeader toggle={toggle}>Add session environment</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}

          <SessionEnvironmentFormContent control={control} errors={errors} />
        </ModalBody>
        <ModalFooter>
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
            Add Environment
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

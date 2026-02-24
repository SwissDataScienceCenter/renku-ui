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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterclockwise, Pencil, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  InputGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { useProject } from "~/routes/projects/root";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import SecretsMountDirectoryField from "../../../projectsV2/fields/SecretsMountDirectoryField";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";

export default function SecretsMountDirectoryComponent() {
  const { project } = useProject();
  const { id: projectId, secrets_mount_directory: secretsMountDirectory } =
    project;
  const permissions = useProjectPermissions({ projectId });

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  const ref = useRef<HTMLButtonElement>(null);

  const mountDir = secretsMountDirectory.startsWith("/")
    ? secretsMountDirectory
    : `<work-dir>/${secretsMountDirectory}`;

  return (
    <>
      <InputGroup>
        <Input type="text" value={mountDir} readOnly />
        <PermissionsGuard
          disabled={null}
          enabled={
            <>
              <Button color="outline-primary" innerRef={ref} onClick={toggle}>
                <Pencil className="bi" />
                <span className="visually-hidden">Edit</span>
              </Button>
              <UncontrolledTooltip target={ref}>
                Edit the secrets mount location
              </UncontrolledTooltip>
            </>
          }
          requestedPermission="write"
          userPermissions={permissions}
        />
      </InputGroup>
      <UpdateSecretsMountDirectoryModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface UpdateSecretsMountDirectoryModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function UpdateSecretsMountDirectoryModal({
  isOpen,
  toggle,
}: UpdateSecretsMountDirectoryModalProps) {
  const { project } = useProject();
  const { id: projectId } = project;

  const [patchProject, result] = usePatchProjectsByProjectIdMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<UpdateSecretsMountDirectoryFrom>({
    defaultValues: {
      secretsMountDirectory: project.secrets_mount_directory,
    },
  });

  const submitHandler = useCallback(
    (data: UpdateSecretsMountDirectoryFrom) => {
      patchProject({
        "If-Match": project.etag ?? "",
        projectId,
        projectPatch: {
          secrets_mount_directory: data.secretsMountDirectory,
        },
      });
    },
    [patchProject, project.etag, projectId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  const onReset = useCallback(() => {
    patchProject({
      "If-Match": project.etag ?? "",
      projectId,
      projectPatch: {
        secrets_mount_directory: "",
      },
    });
  }, [patchProject, project.etag, projectId]);

  useEffect(() => {
    reset({
      secretsMountDirectory: project.secrets_mount_directory,
    });
  }, [project, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form noValidate onSubmit={onSubmit}>
        <ModalHeader tag="h2" toggle={toggle}>
          <Pencil className={cx("bi", "me-1")} />
          Update secrets mount location
        </ModalHeader>
        <ModalBody>
          <p>
            Change the location where secrets will be mounted in sessions. Note
            that the change will only apply to new sessions.
          </p>

          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <SecretsMountDirectoryField
            control={control}
            errors={errors}
            formId="update-secrets-mount-directory"
            name="secretsMountDirectory"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button color="outline-primary" onClick={onReset}>
            <ArrowCounterclockwise className={cx("bi", "me-1")} />
            Reset to default value
          </Button>
          <Button
            color="primary"
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Update secrets mount location
          </Button>
        </ModalFooter>
      </Form>
    </ScrollableModal>
  );
}

interface UpdateSecretsMountDirectoryFrom {
  secretsMountDirectory: string;
}

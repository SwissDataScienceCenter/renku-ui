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

import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import { Loader } from "~/components/Loader";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import {
  usePatchResourcePoolsByResourcePoolIdMutation,
  type ResourcePoolWithId,
} from "../sessionsV2/api/computeResources.api";
import type { ResourcePoolForm } from "./adminComputeResources.types";
import ResourcePoolRemoteSection from "./forms/ResourcePoolRemoteSection";

interface UpdateResourcePoolRemoteButtonProps {
  resourcePool: ResourcePoolWithId;
}

export default function UpdateResourcePoolRemoteButton({
  resourcePool,
}: UpdateResourcePoolRemoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button size="sm" color="outline-primary" onClick={toggle}>
        Update
      </Button>
      <UpdateResourcePoolRemoteModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourcePoolRemoteModalProps {
  isOpen: boolean;
  resourcePool: ResourcePoolWithId;
  toggle: () => void;
}

function UpdateResourcePoolRemoteModal({
  isOpen,
  resourcePool,
  toggle,
}: UpdateResourcePoolRemoteModalProps) {
  const { name, id, remote } = resourcePool;

  const [updateResourcePool, result] =
    usePatchResourcePoolsByResourcePoolIdMutation();

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<UpdateResourcePoolRemoteForm>({
    defaultValues: {
      remote: {
        enabled: remote != null,
        kind: remote?.kind ?? "firecrest",
        providerId: remote?.provider_id ?? "",
        apiUrl: remote?.api_url ?? "",
        systemName: remote?.system_name ?? "",
        partition: remote?.partition ?? "",
      },
    },
  });
  const onSubmit = useCallback(
    (data: UpdateResourcePoolRemoteForm) => {
      const remote = data.remote.enabled
        ? {
            kind: data.remote.kind,
            provider_id: data.remote.providerId?.trim()
              ? data.remote.providerId.trim()
              : undefined,
            api_url: data.remote.apiUrl.trim(),
            system_name: data.remote.systemName.trim(),
            partition: data.remote.partition?.trim()
              ? data.remote.partition.trim()
              : undefined,
          }
        : {};
      updateResourcePool({ resourcePoolId: id, resourcePoolPatch: { remote } });
    },
    [id, updateResourcePool]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    reset({
      remote: {
        enabled: remote != null,
        kind: remote?.kind ?? "firecrest",
        providerId: remote?.provider_id ?? "",
        apiUrl: remote?.api_url ?? "",
        systemName: remote?.system_name ?? "",
        partition: remote?.partition ?? "",
      },
    });
  }, [remote, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  const formPrefix = `updateResourcePoolRemote-${id}-`;

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Update {name}&apos;s remote configuration
      </ModalHeader>
      <ModalBody>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}></Form>
        {result.error && <RtkOrNotebooksError error={result.error} />}

        <ResourcePoolRemoteSection
          control={control}
          formPrefix={formPrefix}
          name="remote"
        />
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          color="primary"
          disabled={!isDirty || result.isLoading}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Update remote
        </Button>
      </ModalFooter>
    </Modal>
  );
}

type UpdateResourcePoolRemoteForm = Pick<ResourcePoolForm, "remote">;

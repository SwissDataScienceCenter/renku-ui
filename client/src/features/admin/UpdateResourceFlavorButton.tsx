/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { CheckLg, PencilSquare, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  usePatchResourceFlavorsByResourceFlavorIdMutation,
  type ResourceFlavor,
} from "../sessionsV2/api/computeResources.api";
import type { ResourceFlavorForm } from "./adminComputeResources.types";
import { buildResourceFlavorPatch } from "./adminComputeResources.utils";
import { LinkedResourceClassesSummary } from "./LinkedResourceClasses";
import ResourceFlavorFormContent from "./ResourceFlavorFormContent";

function toFormValues(resourceFlavor: ResourceFlavor): ResourceFlavorForm {
  return {
    name: resourceFlavor.name,
    description: resourceFlavor.description ?? "",
    cpu: resourceFlavor.cpu,
    memory: resourceFlavor.memory,
    gpu: resourceFlavor.gpu,
    default_storage: resourceFlavor.default_storage,
    max_storage: resourceFlavor.max_storage,
  };
}

interface UpdateResourceFlavorButtonProps {
  resourceFlavor: ResourceFlavor;
}

export default function UpdateResourceFlavorButton({
  resourceFlavor,
}: UpdateResourceFlavorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-primary" onClick={toggle} size="sm">
        <PencilSquare className={cx("bi", "me-1")} />
        Update
      </Button>
      <UpdateResourceFlavorModal
        isOpen={isOpen}
        resourceFlavor={resourceFlavor}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourceFlavorModalProps {
  isOpen: boolean;
  resourceFlavor: ResourceFlavor;
  toggle: () => void;
}

function UpdateResourceFlavorModal({
  isOpen,
  resourceFlavor,
  toggle,
}: UpdateResourceFlavorModalProps) {
  const [updateResourceFlavor, result] =
    usePatchResourceFlavorsByResourceFlavorIdMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResourceFlavorForm>({
    defaultValues: toFormValues(resourceFlavor),
  });

  useEffect(() => {
    reset(toFormValues(resourceFlavor));
  }, [reset, resourceFlavor]);

  const onSubmit = useCallback(
    (data: ResourceFlavorForm) => {
      updateResourceFlavor({
        resourceFlavorId: resourceFlavor.id,
        resourceFlavorPatch: buildResourceFlavorPatch(data),
      });
    },
    [resourceFlavor.id, updateResourceFlavor],
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        Update {resourceFlavor.name}
      </ModalHeader>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <WarnAlert dismissible={false}>
            <LinkedResourceClassesSummary
              emptyMessage="No resource class links to this flavor yet."
              intro="These resource classes link to this flavor and will change with it:"
              resourceFlavorId={resourceFlavor.id}
              skip={!isOpen}
            />
          </WarnAlert>
          <ResourceFlavorFormContent
            control={control}
            errors={errors}
            idPrefix={`updateResourceFlavor-${resourceFlavor.id}`}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle} type="button">
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button color="primary" type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update Resource Flavor
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

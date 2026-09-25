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
  usePatchResourceFlavoursByResourceFlavourIdMutation,
  type ResourceFlavourWithId,
} from "../sessionsV2/api/computeResources.api";
import type { ResourceFlavourForm } from "./adminComputeResources.types";
import { buildResourceFlavourPatch } from "./adminComputeResources.utils";
import { LinkedResourceClassesSummary } from "./LinkedResourceClasses";
import ResourceFlavourFormContent from "./ResourceFlavourFormContent";

function toFormValues(
  resourceFlavour: ResourceFlavourWithId,
): ResourceFlavourForm {
  return {
    name: resourceFlavour.name,
    description: resourceFlavour.description ?? "",
    cpu: resourceFlavour.cpu,
    memory: resourceFlavour.memory,
    gpu: resourceFlavour.gpu,
    default_storage: resourceFlavour.default_storage,
    max_storage: resourceFlavour.max_storage,
  };
}

interface UpdateResourceFlavourButtonProps {
  resourceFlavour: ResourceFlavourWithId;
}

export default function UpdateResourceFlavourButton({
  resourceFlavour,
}: UpdateResourceFlavourButtonProps) {
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
      <UpdateResourceFlavourModal
        isOpen={isOpen}
        resourceFlavour={resourceFlavour}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourceFlavourModalProps {
  isOpen: boolean;
  resourceFlavour: ResourceFlavourWithId;
  toggle: () => void;
}

function UpdateResourceFlavourModal({
  isOpen,
  resourceFlavour,
  toggle,
}: UpdateResourceFlavourModalProps) {
  const [updateResourceFlavour, result] =
    usePatchResourceFlavoursByResourceFlavourIdMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResourceFlavourForm>({
    defaultValues: toFormValues(resourceFlavour),
  });

  useEffect(() => {
    reset(toFormValues(resourceFlavour));
  }, [reset, resourceFlavour]);

  const onSubmit = useCallback(
    (data: ResourceFlavourForm) => {
      updateResourceFlavour({
        resourceFlavourId: resourceFlavour.id,
        resourceFlavourPatch: buildResourceFlavourPatch(data),
      });
    },
    [resourceFlavour.id, updateResourceFlavour],
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
        Update {resourceFlavour.name}
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
              emptyMessage="No resource class links to this flavour yet."
              intro="These resource classes link to this flavour and will change with it:"
              resourceFlavourId={resourceFlavour.id}
              skip={!isOpen}
            />
          </WarnAlert>
          <ResourceFlavourFormContent
            control={control}
            errors={errors}
            idPrefix={`updateResourceFlavour-${resourceFlavour.id}`}
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
            Update Resource Flavour
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

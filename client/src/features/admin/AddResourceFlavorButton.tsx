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

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import { usePostResourceFlavorsMutation } from "../sessionsV2/api/computeResources.api";
import type { ResourceFlavorForm } from "./adminComputeResources.types";
import { buildResourceFlavor } from "./adminComputeResources.utils";
import ResourceFlavorFormContent from "./ResourceFlavorFormContent";

const DEFAULT_VALUES: ResourceFlavorForm = {
  name: "",
  description: "",
  cpu: 1,
  memory: 1,
  gpu: 0,
  default_storage: 1,
  max_storage: 1,
};

export default function AddResourceFlavorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="primary" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Resource Flavor
      </Button>
      <AddResourceFlavorModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddResourceFlavorModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddResourceFlavorModal({
  isOpen,
  toggle,
}: AddResourceFlavorModalProps) {
  const [addResourceFlavor, result] = usePostResourceFlavorsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResourceFlavorForm>({ defaultValues: DEFAULT_VALUES });

  const onSubmit = useCallback(
    (data: ResourceFlavorForm) => {
      addResourceFlavor({ resourceFlavorPost: buildResourceFlavor(data) });
    },
    [addResourceFlavor],
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
      reset(DEFAULT_VALUES);
    }
  }, [reset, result.isSuccess, toggle]);

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
        Add resource flavor
      </ModalHeader>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <p>
            A resource flavor is a named shape that resource classes can link to
            instead of setting their own CPU, memory, GPU and disk values.
          </p>
          <ResourceFlavorFormContent
            control={control}
            errors={errors}
            idPrefix="addResourceFlavor"
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
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add Resource Flavor
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

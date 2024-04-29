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

import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import {
  useAddResourcePoolMutation,
  useGetResourcePoolsQuery,
} from "./adminComputeResources.api";

export default function AddResourcePoolButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Resource Pool
      </Button>
      <AddResourcePoolModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddResourcePoolModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddResourcePoolModal({ isOpen, toggle }: AddResourcePoolModalProps) {
  const { data: resourcePools } = useGetResourcePoolsQuery();
  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap(({ classes }) => classes)
        .find((c) => c.default),
    [resourcePools]
  );

  const [addResourcePool, result] = useAddResourcePoolMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddResourcePoolForm>({
    defaultValues: {
      name: "",
      public: false,
      quotaCpu: 1,
      quotaMemory: 1,
      quotaGpu: 0,
      idleThreshold: null,
      hibernationThreshold: null,
    },
  });
  const onSubmit = useCallback(
    (data: AddResourcePoolForm) => {
      const populatedClass = defaultSessionClass
        ? {
            name: defaultSessionClass.name,
            cpu: defaultSessionClass.cpu,
            memory: defaultSessionClass.memory,
            gpu: defaultSessionClass.gpu,
            max_storage: defaultSessionClass.max_storage,
            default_storage: defaultSessionClass.default_storage,
            default: true,
          }
        : null;
      addResourcePool({
        name: data.name,
        public: data.public,
        classes: populatedClass ? [populatedClass] : [],
        quota: {
          cpu: data.quotaCpu,
          memory: data.quotaMemory,
          gpu: data.quotaGpu,
        },
        idle_threshold: data.idleThreshold,
        hibernation_threshold: data.hibernationThreshold,
      });
    },
    [addResourcePool, defaultSessionClass]
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
      <ModalHeader toggle={toggle}>Add resource pool</ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addResourcePoolName">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id="addResourcePoolName"
                  placeholder="resource pool"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>

          <div>
            <Controller
              control={control}
              name="public"
              render={({ field }) => (
                <>
                  <div className="form-check">
                    <Input
                      type="radio"
                      className="form-check-input"
                      name="addResourcePoolPublicRadio"
                      id="addResourcePoolPublicOn"
                      autoComplete="off"
                      checked={field.value}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(true)}
                    />
                    <Label
                      className={cx("form-check-label", "ms-2")}
                      for="addResourcePoolPublicOn"
                    >
                      Public (anyone can access)
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      className="form-check-input"
                      name="addResourcePoolPublicRadio"
                      id="addResourcePoolPublicOff"
                      autoComplete="off"
                      checked={!field.value}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(false)}
                    />
                    <Label
                      className={cx("form-check-label", "ms-2")}
                      for="addResourcePoolPublicOff"
                    >
                      Private pool (requires special access)
                    </Label>
                  </div>
                </>
              )}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          disabled={result.isLoading}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Add Resource Pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface AddResourcePoolForm {
  name: string;
  public: boolean;

  quotaCpu: number;
  quotaMemory: number;
  quotaGpu: number;
  idleThreshold: number | null;
  hibernationThreshold: number | null;
}

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
import {
  ConnectedServiceForm,
  CreateProviderParams,
} from "../connectedServices/api/connectedServices.types";
import { useCreateProviderMutation } from "../connectedServices/connectedServicesLegacy.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import ConnectedServiceFormContent from "./ConnectedServiceFormContent";

export default function AddConnectedServiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-outline-rk-green" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Service Provider
      </Button>
      <AddConnectedServiceModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddConnectedServiceModalProps {
  isOpen: boolean;
  toggle: () => void;
}
function AddConnectedServiceModal({
  isOpen,
  toggle,
}: AddConnectedServiceModalProps) {
  const [createProvider, result] = useCreateProviderMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ConnectedServiceForm>({
    defaultValues: {
      id: "",
      kind: "gitlab",
      app_slug: "",
      client_id: "",
      client_secret: "",
      display_name: "",
      scope: "",
      url: "",
      use_pkce: false,
    },
  });
  const onSubmit = useCallback(
    (data: CreateProviderParams) => {
      createProvider({
        id: data.id,
        kind: data.kind,
        app_slug: data.app_slug,
        client_id: data.client_id,
        client_secret: data.client_secret,
        display_name: data.display_name,
        scope: data.scope,
        url: data.url,
        use_pkce: data.use_pkce,
      });
    },
    [createProvider]
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
        <ModalHeader toggle={toggle}>Add provider</ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addConnectedServiceId">
              Id
            </Label>
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.id && "is-invalid")}
                  id="addConnectedServiceId"
                  placeholder="Provider id"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
          </div>

          <ConnectedServiceFormContent control={control} errors={errors} />
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
            Add provider
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

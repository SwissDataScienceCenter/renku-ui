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
import { CheckLg, PencilSquare, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
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
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";

import {
  ConnectedServiceForm,
  UpdateProviderParams,
} from "../connectedServices/api/connectedServices.types";
import ConnectedServiceFormContent from "./ConnectedServiceFormContent";
import {
  Provider,
  ProviderKind,
  usePatchOauth2ProvidersByProviderIdMutation,
} from "../connectedServices/api/connectedServices.api";

interface UpdateConnectedServiceButtonProps {
  provider: Provider;
}
export default function UpdateConnectedServiceButton({
  provider,
}: UpdateConnectedServiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-rk-green" onClick={toggle}>
        <PencilSquare className={cx("bi", "me-1")} />
        Edit
      </Button>
      <UpdateConnectedServiceModal
        provider={provider}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateConnectedServiceModalProps {
  provider: Provider;
  isOpen: boolean;
  toggle: () => void;
}

function UpdateConnectedServiceModal({
  provider,
  isOpen,
  toggle,
}: UpdateConnectedServiceModalProps) {
  const [updateProvider, result] =
    usePatchOauth2ProvidersByProviderIdMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<ConnectedServiceForm>({
    defaultValues: {
      kind: undefined,
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
    (data: UpdateProviderParams) => {
      updateProvider({
        providerId: provider.id,
        providerPatch: {
          kind: data.kind,
          app_slug: data.app_slug,
          client_id: data.client_id,
          client_secret: data.client_secret,
          display_name: data.display_name,
          scope: data.scope,
          url: data.url,
          use_pkce: data.use_pkce,
        },
      });
    },
    [provider.id, updateProvider]
  );

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
    reset();
  }, [result.isSuccess, reset, toggle]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  useEffect(() => {
    reset({
      kind: provider.kind as ProviderKind | undefined,
      app_slug: provider.app_slug,
      client_id: provider.client_id,
      display_name: provider.display_name,
      scope: provider.scope,
      url: provider.url,
      use_pkce: provider.use_pkce,
      ...(provider.client_secret &&
        provider.client_secret !== "redacted" && {
          client_secret: provider.client_secret,
        }),
    });
  }, [provider, reset]);

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
        <ModalHeader toggle={toggle}>Update provider</ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addConnectedServiceId">
              Id
            </Label>
            <Input
              className={cx("form-control")}
              disabled={true}
              id="addConnectedServiceId"
              placeholder="Provider id"
              type="text"
              value={provider.id}
            />
          </div>

          <ConnectedServiceFormContent control={control} errors={errors} />
        </ModalBody>
        <ModalFooter>
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button disabled={result.isLoading || !isDirty} type="submit">
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update provider
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

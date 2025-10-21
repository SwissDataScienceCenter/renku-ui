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
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import ScrollableModal from "~/components/modal/ScrollableModal";
import { Loader } from "../../components/Loader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import {
  Provider,
  ProviderKind,
  usePatchOauth2ProvidersByProviderIdMutation,
} from "../connectedServices/api/connectedServices.api";
import { ProviderForm } from "../connectedServices/api/connectedServices.types";
import ConnectedServiceFormContent from "./ConnectedServiceFormContent";

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
      <Button color="outline-primary" onClick={toggle}>
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
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<ProviderForm>({
    defaultValues: {
      kind: undefined,
      app_slug: "",
      client_id: "",
      client_secret: "",
      display_name: "",
      scope: "",
      url: "",
      use_pkce: false,
      image_registry_url: "",
      oidc_issuer_url: "",
    },
  });
  const onSubmit = useCallback(
    (data: ProviderForm) => {
      const oidc_issuer_url =
        data.kind === "generic_oidc" ? data.oidc_issuer_url : "";
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
          image_registry_url: data.image_registry_url,
          oidc_issuer_url: oidc_issuer_url,
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
      image_registry_url: provider.image_registry_url ?? "",
      oidc_issuer_url: provider.oidc_issuer_url ?? "",
      ...(provider.client_secret &&
        provider.client_secret !== "redacted" && {
          client_secret: provider.client_secret,
        }),
    });
  }, [provider, reset]);

  return (
    <ScrollableModal
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
        <ModalHeader tag="h2" toggle={toggle}>
          Update intergation
        </ModalHeader>
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

          <ConnectedServiceFormContent control={control} />
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={result.isLoading || !isDirty}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update integration
          </Button>
        </ModalFooter>
      </Form>
    </ScrollableModal>
  );
}

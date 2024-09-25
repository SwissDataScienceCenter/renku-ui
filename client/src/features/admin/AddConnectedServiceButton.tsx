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
import { Control, Controller, FieldErrors, useForm } from "react-hook-form";
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
  Provider,
} from "../connectedServices/connectedServices.types";
import { useCreateProviderMutation } from "../connectedServices/connectedServices.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";

export default function AddConnectedServiceButton() {
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
      kind: "",
      client_id: "",
      client_secret: "",
      display_name: "",
      scope: "api",
      url: "",
    },
  });
  const onSubmit = useCallback(
    (data: Provider) => {
      createProvider({
        id: data.id,
        kind: data.kind,
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

interface ConnectedServiceFormContentProps {
  control: Control<ConnectedServiceForm, unknown>;
  errors: FieldErrors<ConnectedServiceForm>;
}
function ConnectedServiceFormContent({
  control,
  errors,
}: ConnectedServiceFormContentProps) {
  return (
    <>
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

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceKind">
          Kind
        </Label>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.kind && "is-invalid")}
              id="addConnectedServiceKind"
              placeholder="Provider kind (gitlab or github)"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a kind</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceClientId">
          Client ID
        </Label>
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.id && "is-invalid")}
              id="addConnectedServiceClientId"
              placeholder="Client ID"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide an id</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceClientSecret">
          Client Secret
        </Label>
        <Controller
          control={control}
          name="client_secret"
          render={({ field }) => (
            <Input
              className={cx(
                "form-control",
                errors.client_secret && "is-invalid"
              )}
              id="addConnectedServiceClientSecret"
              placeholder="Client Secret"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a client secret</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceDisplayName">
          Display Name
        </Label>
        <Controller
          control={control}
          name="display_name"
          render={({ field }) => (
            <Input
              className={cx(
                "form-control",
                errors.display_name && "is-invalid"
              )}
              id="addConnectedServiceDisplayName"
              placeholder="Display name"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a display name</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceScope">
          Scope
        </Label>
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.scope && "is-invalid")}
              id="addConnectedServiceScope"
              placeholder="Scope"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a scope</div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="addConnectedServiceUrl">
          URL
        </Label>
        <Controller
          control={control}
          name="url"
          render={({ field }) => (
            <Input
              className={cx("form-control", errors.url && "is-invalid")}
              id="addConnectedServiceUrl"
              placeholder="URL"
              type="text"
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a URL</div>
      </div>
    </>
  );
}

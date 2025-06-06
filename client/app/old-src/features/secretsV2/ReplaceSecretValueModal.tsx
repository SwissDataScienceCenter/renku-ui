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
import { useCallback, useEffect, useMemo } from "react";
import { Pencil, Save, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { InfoAlert } from "../../components/Alert";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import {
  usePatchUserSecretMutation,
  type SecretWithId,
} from "../usersV2/api/users.api";
import SecretValueField from "./fields/SecretValueField";

interface ReplaceSecretValueModalProps {
  isOpen: boolean;
  isV2?: boolean;
  secret: SecretWithId;
  toggle: () => void;
}

export default function ReplaceSecretValueModal({
  isOpen,
  isV2,
  secret,
  toggle,
}: ReplaceSecretValueModalProps) {
  const {
    id: secretId,
    data_connector_ids: dataConnectorIds,
    session_secret_slot_ids: sessionSecretSlotIds,
  } = secret;

  const [patchUserSecret, result] = usePatchUserSecretMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<ReplaceSecretValueForm>({
    defaultValues: {
      value: "",
    },
  });

  const submitHandler = useCallback(
    (data: ReplaceSecretValueForm) => {
      patchUserSecret({
        secretId,
        secretPatch: {
          value: data.value,
        },
      });
    },
    [patchUserSecret, secretId]
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    reset({
      value: "",
    });
  }, [reset, secret]);

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

  const usageAlert =
    (sessionSecretSlotIds.length > 0 || dataConnectorIds.length > 0) && isV2 ? (
      <InfoAlert dismissible={false} timeout={0}>
        This secret is used for{" "}
        {sessionSecretSlotIds.length > 1 ? (
          <>{sessionSecretSlotIds.length} session secrets</>
        ) : sessionSecretSlotIds.length == 1 ? (
          <>1 session secret</>
        ) : null}
        {sessionSecretSlotIds.length > 0 && dataConnectorIds.length > 0 ? (
          <> and </>
        ) : null}
        {dataConnectorIds.length > 1 ? (
          <>{dataConnectorIds.length} data connectors</>
        ) : dataConnectorIds.length == 1 ? (
          <>1 data connector</>
        ) : null}
        .
      </InfoAlert>
    ) : sessionSecretSlotIds.length > 0 || dataConnectorIds.length > 0 ? (
      <InfoAlert dismissible={false} timeout={0}>
        This secret is in use in Renku 2.0.
      </InfoAlert>
    ) : null;

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <Form
        className={cx(!isV2 && "form-rk-green")}
        data-cy="replace-secret-value-form"
        noValidate
        onSubmit={onSubmit}
      >
        <ModalHeader toggle={toggle}>
          <Save className={cx("bi", "me-1")} />
          Replace secret value
        </ModalHeader>
        <ModalBody>
          <p>
            Here you can replace the value of the secret named{" "}
            <span className="fw-bold">{secret.name}</span>. The change will
            apply only to new sessions.
          </p>

          {usageAlert}

          {result.error && (
            <RtkOrNotebooksError error={result.error} dismissible={false} />
          )}

          <SecretValueField control={control} errors={errors} name="value" />
        </ModalBody>
        <ModalFooter>
          <Button
            color={isV2 ? "outline-primary" : "outline-rk-green"}
            onClick={toggle}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color={isV2 ? "primary" : "rk-green"}
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Replace value
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface ReplaceSecretValueForm {
  value: string;
}

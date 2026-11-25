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
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { BoxArrowInLeft, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  ButtonGroup,
  Form,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { WarnAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import type { SessionSecretSlot } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdSessionSecretsMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import SavedSecretNameField from "./fields/SavedSecretNameField";
import SelectUserSecretField from "./fields/SelectUserSecretField";
import useSaveNewSessionSecret, {
  useDefaultSecretName,
} from "./useSaveNewSessionSecret.hook";

interface ProvideSessionSecretModalContentProps {
  isOpen: boolean;
  previousStepAlert?: ReactNode;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

export default function ProvideSessionSecretModalContent({
  isOpen,
  previousStepAlert,
  secretSlot,
  toggle,
}: ProvideSessionSecretModalContentProps) {
  const [mode, setMode] = useState<"new-value" | "existing">("new-value");

  useEffect(() => {
    if (!isOpen) {
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("new-value");
    }
  }, [isOpen]);

  return (
    <>
      <ModalHeader tag="h2" toggle={toggle}>
        Provide session secret
      </ModalHeader>
      <ModalBody className="pb-0">
        {previousStepAlert}

        <ButtonGroup>
          <Input
            type="radio"
            className="btn-check"
            id="provide-session-secret-mode-new-value"
            value="new-value"
            checked={mode == "new-value"}
            onChange={() => setMode("new-value")}
          />
          <Label
            for="provide-session-secret-mode-new-value"
            className={cx("btn", "btn-outline-primary")}
            data-cy="provide-session-secret-mode-new-value-tab"
          >
            <PlusLg className={cx("bi", "me-1")} />
            Provide a new secret value
          </Label>
          <Input
            type="radio"
            className="btn-check"
            id="provide-session-secret-mode-existing"
            value="existing"
            checked={mode == "existing"}
            onChange={() => setMode("existing")}
          />
          <Label
            for="provide-session-secret-mode-existing"
            className={cx("btn", "btn-outline-primary")}
            data-cy="provide-session-secret-mode-existing-tab"
          >
            <BoxArrowInLeft className={cx("bi", "me-1")} />
            Use an existing secret value
          </Label>
        </ButtonGroup>
      </ModalBody>
      {mode === "new-value" ? (
        <ProvideSessionSecretModalNewValueContent
          isOpen={isOpen}
          secretSlot={secretSlot}
          toggle={toggle}
        />
      ) : (
        <ProvideSessionSecretModalExistingContent
          isOpen={isOpen}
          secretSlot={secretSlot}
          toggle={toggle}
        />
      )}
    </>
  );
}

interface ProvideSessionSecretModalNewValueContentProps {
  isOpen: boolean;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

function ProvideSessionSecretModalNewValueContent({
  isOpen,
  secretSlot,
  toggle,
}: ProvideSessionSecretModalNewValueContentProps) {
  const {
    error,
    isLoading,
    reset: resetSave,
    save,
    status,
  } = useSaveNewSessionSecret(secretSlot);
  const defaultName = useDefaultSecretName(secretSlot);

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<ProvideNewSecretValueForm>({
    defaultValues: { name: "", value: "" },
  });

  const onSubmit = useMemo(() => handleSubmit(save), [handleSubmit, save]);

  useEffect(() => {
    reset({ name: "", value: "" });
  }, [reset, secretSlot]);

  useEffect(() => {
    if (defaultName && getValues("name") === "") {
      setValue("name", defaultName);
    }
  }, [defaultName, getValues, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      resetSave();
    }
  }, [isOpen, reset, resetSave]);

  useEffect(() => {
    if (status === "saved") {
      toggle();
    }
  }, [status, toggle]);

  return (
    <Form noValidate onSubmit={onSubmit}>
      <ModalBody>
        {error && <RtkOrDataServicesError error={error} dismissible={false} />}
        {status === "renameFailed" && (
          <WarnAlert dismissible={false}>
            The secret is saved, but its name could not be changed. You can
            rename it on the User Secrets page.
          </WarnAlert>
        )}

        <SavedSecretNameField
          control={control}
          errors={errors}
          name="name"
          placeholder={secretSlot.name}
        />

        <div className="mb-3">
          <Label for="provide-session-secret-new-value">Secret value</Label>
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <textarea
                id="provide-session-secret-new-value"
                className={cx("form-control", errors.value && "is-invalid")}
                placeholder="Your secret value..."
                rows={6}
                data-cy="provide-session-secret-mode-new-value-input"
                {...field}
              />
            )}
            rules={{ required: "Please provide a value" }}
          />
          <div className="invalid-feedback">
            {errors.value?.message ? (
              <>{errors.value?.message}</>
            ) : (
              <>Invalid secret value</>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="provide-session-secret-close-button"
          onClick={toggle}
        >
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        {status !== "renameFailed" && (
          <Button
            color="primary"
            disabled={isLoading}
            data-cy="provide-session-secret-save-button"
            type="submit"
          >
            {isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Save new secret
          </Button>
        )}
      </ModalFooter>
    </Form>
  );
}

interface ProvideNewSecretValueForm {
  name: string;
  value: string;
}

interface ProvideSessionSecretModalExistingContentProps {
  isOpen: boolean;
  secretSlot: SessionSecretSlot;
  toggle: () => void;
}

function ProvideSessionSecretModalExistingContent({
  isOpen,
  secretSlot,
  toggle,
}: ProvideSessionSecretModalExistingContentProps) {
  const { id: slotId, project_id: projectId } = secretSlot;

  const [patchSessionSecrets, result] =
    usePatchProjectsByProjectIdSessionSecretsMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProvideExistingSecretForm>({
    defaultValues: { secretId: "" },
  });

  const submitHandler = useCallback(
    (data: ProvideExistingSecretForm) => {
      patchSessionSecrets({
        projectId,
        sessionSecretPatchList: [
          { secret_slot_id: slotId, secret_id: data.secretId },
        ],
      });
    },
    [patchSessionSecrets, projectId, slotId],
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler],
  );

  useEffect(() => {
    reset({ secretId: "" });
  }, [reset, secretSlot]);

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

  return (
    <Form noValidate onSubmit={onSubmit}>
      <ModalBody>
        {result.error && (
          <RtkOrDataServicesError error={result.error} dismissible={false} />
        )}

        <SelectUserSecretField
          control={control}
          errors={errors}
          name="secretId"
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="provide-session-secret-close-button"
          onClick={toggle}
        >
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          color="primary"
          data-cy="provide-session-secret-use-secret-button"
          disabled={result.isLoading}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <BoxArrowInLeft className={cx("bi", "me-1")} />
          )}
          Use secret
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface ProvideExistingSecretForm {
  secretId: string;
}

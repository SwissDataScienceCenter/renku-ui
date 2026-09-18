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
import { useCallback, useEffect, useMemo } from "react";
import { FiletypeKey, PlusLg, XLg } from "react-bootstrap-icons"; // eslint-disable-line spellcheck/spell-checker
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import { usePostUserSshKeyMutation } from "~/features/usersV2/api/users.api";
import { SSH_KEY_NAME_LENGTH_LIMIT } from "./sshKeys.constants";

interface AddSshKeyModalProps {
  isOpen: boolean;
  toggle: () => void;
}

interface AddSshKeyForm {
  name: string;
  publicKey: string;
}

export default function AddSshKeyModal({
  isOpen,
  toggle,
}: AddSshKeyModalProps) {
  const [postUserSshKey, result] = usePostUserSshKeyMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<AddSshKeyForm>({
    defaultValues: { name: "", publicKey: "" },
  });

  const submitHandler = useCallback(
    (data: AddSshKeyForm) => {
      postUserSshKey({
        sshKeyPost: {
          name: data.name || null,
          public_key: data.publicKey.trim(),
        },
      });
    },
    [postUserSshKey],
  );
  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler],
  );

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
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <Form data-cy="add-ssh-key-form" noValidate onSubmit={onSubmit}>
        <ModalHeader tag="h2" toggle={toggle}>
          <FiletypeKey className="me-1" />
          Add a new SSH key
        </ModalHeader>
        <ModalBody>
          <p>
            Add a public SSH key to use it to connect to your sessions over SSH.
          </p>

          {result.error && (
            <RtkOrDataServicesError error={result.error} dismissible={false} />
          )}

          <div className="mb-3">
            <Label for="add-ssh-key-name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field: { ref, ...rest } }) => (
                <Input
                  className={cx(errors.name && "is-invalid")}
                  id="add-ssh-key-name"
                  innerRef={ref}
                  placeholder="Example: My laptop"
                  type="text"
                  {...rest}
                />
              )}
              rules={{
                maxLength: {
                  value: SSH_KEY_NAME_LENGTH_LIMIT,
                  message: `Name cannot exceed ${SSH_KEY_NAME_LENGTH_LIMIT} characters`,
                },
              }}
            />
            <div className="invalid-feedback">
              {errors.name?.message ? (
                <>{errors.name.message}</>
              ) : (
                <>Invalid name</>
              )}
            </div>
          </div>

          <div>
            <Label for="add-ssh-key-public-key">Public key</Label>
            <Controller
              name="publicKey"
              control={control}
              render={({ field }) => (
                <textarea
                  id="add-ssh-key-public-key"
                  aria-describedby="add-ssh-key-public-key-help"
                  autoComplete="off"
                  className={cx(
                    "form-control",
                    errors.publicKey && "is-invalid",
                  )}
                  // eslint-disable-next-line spellcheck/spell-checker
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPXhsNCQyI4HlAkaUIujCoGv3isiGoDR/MpS2yKlMfPY max@laptop"
                  rows={6}
                  spellCheck={false}
                  {...field}
                />
              )}
              rules={{
                required: "Please provide a public key",
                pattern: {
                  value: /^(ssh|ecdsa|sk)-\S+\s+\S+/,
                  message: "This does not look like a valid SSH public key",
                },
              }}
            />
            <div className="invalid-feedback">
              {errors.publicKey?.message ? (
                <>{errors.publicKey.message}</>
              ) : (
                <>Invalid public key</>
              )}
            </div>
            <FormText id="add-ssh-key-public-key-help" tag="div">
              Paste the contents of your public key file, e.g.{" "}
              <code>~/.ssh/id_ed25519.pub</code>.
              <br />
              Never paste your private key!
            </FormText>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            color="primary"
            disabled={!isDirty || result.isLoading}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PlusLg className={cx("bi", "me-1")} />
            )}
            Add key
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

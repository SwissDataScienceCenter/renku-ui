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
import { useCallback, useEffect } from "react";
import { Database, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import {
  DataConnectorRead,
  DepositProvider,
  usePostDepositMutation,
} from "../api/data-connectors.api";

interface CreateDepositionForm {
  name: string;
  path: string;
  provider: DepositProvider;
}
type ProviderOption = { value: DepositProvider; label: string };
const providerOptions: ProviderOption[] = [
  { value: "zenodo", label: "Zenodo" },
];

interface DepositCreationModalProps {
  dataConnector: DataConnectorRead;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}
export default function DepositCreationModal({
  dataConnector,
  isOpen,
  setOpen,
}: DepositCreationModalProps) {
  const { control, handleSubmit, reset } = useForm<CreateDepositionForm>({
    defaultValues: {
      name: "",
      path: "",
      provider: providerOptions[0].value,
    },
  });
  const [postDeposit, result] = usePostDepositMutation();

  const onSubmit = useCallback(
    (data: CreateDepositionForm) => {
      postDeposit({
        depositPost: {
          data_connector_id: dataConnector.id,
          name: data.name,
          path: data.path,
          provider: data.provider,
        },
      });
    },
    [dataConnector.id, postDeposit]
  );

  useEffect(() => {
    if (!result.isSuccess || !isOpen) {
      return;
    }
    setOpen(false);
  }, [isOpen, result.isSuccess, setOpen]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal centered data-cy="deposit-creation-modal" isOpen={isOpen} size="lg">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader tag="h2">
          <Database className={cx("bi", "me-1")} /> Export files as a new
          dataset
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <FormGroup
            className={cx("d-flex", "flex-column", "gap-3", "field-group")}
            noMargin
          >
            <div>
              <Label for="name">Name</Label>
              <Controller
                control={control}
                name="name"
                rules={{ required: "A name is required to create a deposit" }}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dataset name"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                    <div className="invalid-feedback">
                      {fieldState.error?.message
                        ? fieldState.error.message
                        : "Please enter a name."}
                    </div>
                  </>
                )}
              />
              <FormText>
                A name to identify the deposit. This is used only locally.
              </FormText>
            </div>

            <div>
              <Label for="path">Folder</Label>
              <Controller
                control={control}
                name="path"
                rules={{ required: "A path is required to create a deposit" }}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="path"
                      type="text"
                      placeholder="Folder (e.g. /data/processed)"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                    <div className="invalid-feedback">Please enter a path.</div>
                  </>
                )}
              />
              <FormText>
                The source folder on the data connector (e.g. /data/processed)
                where the files to be deposited are located.
              </FormText>
            </div>

            <div>
              <Label for="provider">Target Provider</Label>
              <Controller
                control={control}
                name="provider"
                rules={{
                  required: "A provider is required to create a deposit",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      className="shadow-none"
                      id="provider"
                      invalid={!!fieldState.error}
                      placeholder="Target provider (e.g. Zenodo)"
                      type="select"
                      {...field}
                    >
                      {providerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Input>
                    <div className="invalid-feedback">
                      Please select a provider.
                    </div>
                  </>
                )}
              />
              <FormText>
                The platform where you want to deposit the files.
              </FormText>
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            data-cy="create-deposit-modal-button"
            type="submit"
          >
            <PlusLg className={cx("bi", "me-1")} />
            Start dataset creation
          </Button>
          <Button color="outline-primary" onClick={() => setOpen(false)}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

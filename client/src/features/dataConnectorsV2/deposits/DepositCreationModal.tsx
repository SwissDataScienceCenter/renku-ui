import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudArrowUp, PlusLg, XLg } from "react-bootstrap-icons";
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

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import {
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
} from "~/features/connectedServices/api/connectedServices.api";
import { ProviderKind } from "~/features/connectedServices/api/connectedServices.generated-api";
import { DataConnectorRead, DepositProvider } from "../api/data-connectors.api";
import { usePostDepositsMutation } from "../api/data-connectors.enhanced-api";

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
  // Posting deposition
  const { control, handleSubmit, reset, watch } = useForm<CreateDepositionForm>(
    {
      defaultValues: {
        name: "",
        path: "",
        provider: providerOptions[0].value,
      },
    }
  );
  const [postDeposit, result] = usePostDepositsMutation();

  // Fetch connection information for the selected provider
  const userSelectedProvider = watch("provider");
  const [targetProviderString, setTargetProviderString] =
    useState<ProviderKind | null>(null);

  useEffect(() => {
    const next: ProviderKind | null = ["zenodo"].includes(userSelectedProvider)
      ? userSelectedProvider
      : null;
    setTargetProviderString((prev) => (prev === next ? prev : next));
  }, [userSelectedProvider]);

  const {
    data: providers,
    error: providersError,
    isLoading: isLoadingProviders,
  } = useGetOauth2ProvidersQuery(targetProviderString ? undefined : skipToken);

  const targetProvider = useMemo(() => {
    return providers?.find(
      (provider) => provider.kind === targetProviderString
    );
  }, [providers, targetProviderString]);

  const {
    data: connections,
    error: connectionsError,
    isLoading: isLoadingConnections,
  } = useGetOauth2ConnectionsQuery(targetProvider ? undefined : skipToken);
  const targetConnection = useMemo(() => {
    return connections?.find(
      (connection) => connection.provider_id === targetProvider?.id
    );
  }, [connections, targetProvider]);

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;

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
          <CloudArrowUp className={cx("bi", "me-1")} />
          Export data
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <FormGroup
            className={cx("d-flex", "flex-column", "gap-3", "field-group")}
            noMargin
          >
            <div>
              <Label for="name">Name</Label>
              <Controller
                control={control}
                name="name"
                rules={{
                  required:
                    "A name is required to identify the Export activity",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Name (local)"
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
                A name to identify the Export activity. This will be used as the
                draft deposit name on the target provider.
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
                where the files to be exported are located.
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
              {/* // ! TODO: show proper connection status indication (E.G. Requires integration) */}
              {isLoading ? (
                "loading"
              ) : error ? (
                <RtkOrDataServicesError error={error} />
              ) : (
                <p>Connection: {targetConnection?.status ?? "N/A"}</p>
              )}
              <FormText>
                The target platform where you want to export the files.
                Different platforms might have different
                limitations/requirements.
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
            Start data export
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

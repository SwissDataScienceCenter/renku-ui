import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { ArrowRepeat, InfoCircle, Pencil, XLg } from "react-bootstrap-icons";
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
import { Deposit } from "../api/data-connectors.api";
import { usePatchDepositsByDepositIdMutation } from "../api/data-connectors.enhanced-api";
import DepositIntegrationInfo from "./DepositIntegrationInfo";
import { EditDepositionForm } from "./deposits.types";

interface DepositEditModalProps {
  deposit?: Deposit;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}
export default function DepositEditModal({
  deposit,
  isOpen,
  setOpen,
}: DepositEditModalProps) {
  // Patch deposition
  const { control, handleSubmit, reset } = useForm<EditDepositionForm>({
    defaultValues: {
      name: deposit?.name ?? "",
    },
  });

  const [patchDeposit, result] = usePatchDepositsByDepositIdMutation();

  // Fetch connection information for the target provider
  const {
    data: providers,
    error: providersError,
    isLoading: isLoadingProviders,
  } = useGetOauth2ProvidersQuery(deposit?.provider ? undefined : skipToken);

  const targetProvider = useMemo(() => {
    return providers?.find((provider) => provider.kind === deposit?.provider);
  }, [providers, deposit?.provider]);

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
    (data: EditDepositionForm) => {
      patchDeposit({
        depositId: deposit!.id ?? "",
        depositPatch: {
          name: data.name,
        },
      });
    },
    [deposit, patchDeposit]
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
          <Pencil className={cx("bi", "me-1")} />
          Edit data export
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <p>
            <InfoCircle className={cx("bi", "me-1")} />
            Some fields cannot be edited. If you need to change them, please
            delete this export and create a new one with the desired
            configuration.
          </p>

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
              <Input
                disabled
                id="path"
                type="text"
                value={deposit?.path ?? ""}
              />
              <FormText>
                The source folder on the data connector (e.g. /data/processed)
                where the files to be exported are located.
              </FormText>
            </div>

            <div>
              <Label for="path">Target Provider</Label>
              <Input
                disabled
                id="provider"
                type="text"
                value={deposit?.provider ?? ""}
              />
              <FormText>
                The target platform where the files will be exported.
              </FormText>
              <div className="mt-1">
                <DepositIntegrationInfo
                  connection={targetConnection}
                  isError={!!error}
                  isLoading={isLoading}
                  provider={targetProvider}
                />
              </div>
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            data-cy="create-deposit-modal-button"
            type="submit"
          >
            <ArrowRepeat className={cx("bi", "me-1")} />
            Restart data export
          </Button>
          <Button color="outline-primary" onClick={() => setOpen(false)}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

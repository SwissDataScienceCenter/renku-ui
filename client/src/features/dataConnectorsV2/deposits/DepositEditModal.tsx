import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { ArrowRepeat, Pencil, XLg } from "react-bootstrap-icons";
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
import { Loader } from "~/components/Loader";
import {
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
} from "~/features/connectedServices/api/connectedServices.api";
import { Deposit } from "../api/data-connectors.api";
import {
  usePatchDepositsByDepositIdMutation,
  usePostDepositsByDepositIdJobMutation,
} from "../api/data-connectors.enhanced-api";
import DepositIntegrationInfo from "./DepositIntegrationInfo";
import { EditDepositionForm } from "./deposits.types";

interface DepositEditModalProps {
  deposit: Deposit;
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
      path: deposit?.path ?? "",
    },
  });

  // Mutations
  const [patchDeposit, patchDepositResult] =
    usePatchDepositsByDepositIdMutation();
  const [postJob, postJobResult] = usePostDepositsByDepositIdJobMutation();

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

  // Handle form submission
  const onSubmit = useCallback(
    async (data: EditDepositionForm) => {
      if (!deposit?.id) return;

      // Patch if needed
      const depositPatch = {
        ...(data.name !== deposit.name ? { name: data.name } : {}),
        ...(data.path !== deposit.path ? { path: data.path } : {}),
      };

      if (Object.keys(depositPatch).length > 0) {
        const patchResult = await patchDeposit({
          depositId: deposit.id,
          depositPatch,
        });

        if (patchResult.error) return;
      }

      // Restart job
      await postJob({ depositId: deposit.id });
    },
    [deposit, patchDeposit, postJob]
  );

  // Close modal after successful post job
  useEffect(() => {
    if (!postJobResult.isSuccess || !isOpen) {
      return;
    }
    setOpen(false);
  }, [isOpen, postJobResult.isSuccess, setOpen]);

  // Reset form and mutation results when modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      patchDepositResult.reset();
      postJobResult.reset();
    }
  }, [isOpen, reset, patchDepositResult, postJobResult]);

  return (
    <Modal centered data-cy="deposit-creation-modal" isOpen={isOpen} size="lg">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader tag="h2">
          <Pencil className={cx("bi", "me-1")} />
          Edit data export
        </ModalHeader>
        <ModalBody>
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
              <Label for="path">Target Provider</Label>
              <Input
                disabled
                id="provider"
                type="text"
                value={deposit?.provider ?? ""}
              />
              <FormText>
                The target platform where the files will be exported. If you
                need to change it, please delete this export and create a new
                one with the desired configuration.
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

          {patchDepositResult.error && (
            <RtkOrDataServicesError
              className="mt-3"
              error={patchDepositResult.error}
            />
          )}
          {!patchDepositResult.error && postJobResult.error && (
            <RtkOrDataServicesError
              className="mt-3"
              error={postJobResult.error}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            data-cy="create-deposit-modal-button"
            type="submit"
          >
            {postJobResult.isLoading || patchDepositResult.isLoading ? (
              <>
                <Loader className="me-1" inline size={16} />
                Processing...
              </>
            ) : (
              <>
                <ArrowRepeat className={cx("bi", "me-1")} />
                Edit and restart data export
              </>
            )}
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

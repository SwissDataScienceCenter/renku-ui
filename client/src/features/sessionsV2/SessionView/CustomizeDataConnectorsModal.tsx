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

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect, useMemo } from "react";
import { Database } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
import { Form } from "reactstrap";

import { Loader } from "~/components/Loader";
import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import DataConnectorScopeSource from "~/features/dataConnectorsV2/components/DataConnectorScopeSource";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import {
  usePatchSessionLaunchersByLauncherIdDataConnectorsMutation as useUpdateLauncherDataConnectorsMutation,
  type DataConnectorAccessPolicyName,
  type SessionLauncher,
  type SessionLauncherDataConnector,
} from "../api/sessionLaunchersV2.api";
import LauncherResourceModal, {
  AccessPolicySelect,
  LauncherResourceTable,
  LauncherResourceUpdateConfirmation,
} from "./LauncherResourceModal";
import {
  DATA_CONNECTOR_ACCESS_OPTIONS,
  resolveDataConnectorAccessPolicy,
} from "./launcherResources.constants";

const READ_WRITE_DISABLED: readonly DataConnectorAccessPolicyName[] = [
  "readWrite",
];

const DATA_CONNECTOR_COLUMN_WIDTHS = ["50%", "30%", "20%"] as const;

interface DataConnectorAccessField {
  isStorageReadOnly: boolean;
  linkId: string;
  name: string;
  policy: DataConnectorAccessPolicyName;
}

interface DataConnectorsForm {
  dataConnectors: DataConnectorAccessField[];
}

function getDefaultValues(
  links: DataConnectorToProjectLink[],
  dataConnectorsMap: Record<string, DataConnectorRead>,
  savedPolicies: SessionLauncherDataConnector[] | undefined,
): DataConnectorsForm {
  return {
    dataConnectors: links.flatMap((link) => {
      const dataConnector = dataConnectorsMap[link.data_connector_id];
      if (dataConnector == null) {
        return [];
      }
      const isStorageReadOnly = dataConnector.storage.readonly;
      const savedPolicy = savedPolicies?.find(
        (entry) => entry.data_connector_link_id === link.id,
      )?.policy;
      return [
        {
          isStorageReadOnly,
          linkId: link.id,
          name: dataConnector.name,
          policy: resolveDataConnectorAccessPolicy(
            isStorageReadOnly,
            savedPolicy,
          ),
        },
      ];
    }),
  };
}

interface DataConnectorAccessRowProps {
  control: Control<DataConnectorsForm>;
  dataConnector: DataConnectorRead;
  index: number;
  isStorageReadOnly: boolean;
  name: string;
}

function DataConnectorAccessRow({
  control,
  dataConnector,
  index,
  isStorageReadOnly,
  name,
}: DataConnectorAccessRowProps) {
  return (
    <tr data-cy="launcher-data-connector-row">
      <td className="align-middle">
        <span className={cx("d-block", "text-truncate", "fw-bold")}>
          {name}
        </span>
      </td>
      <td className={cx("align-middle", "min-w-0")}>
        <DataConnectorScopeSource
          dataConnector={dataConnector}
          textClassName="text-truncate"
        />
      </td>
      <td className="align-middle">
        <Controller
          control={control}
          name={`dataConnectors.${index}.policy`}
          render={({ field }) => {
            const { ref, ...fieldProps } = field;
            return (
              <AccessPolicySelect
                ariaLabel={`Access for ${name}`}
                data-cy={`launcher-data-connector-access_${index}`}
                disabledValues={
                  isStorageReadOnly ? READ_WRITE_DISABLED : undefined
                }
                innerRef={ref}
                options={DATA_CONNECTOR_ACCESS_OPTIONS}
                {...fieldProps}
              />
            );
          }}
        />
      </td>
    </tr>
  );
}

interface CustomizeDataConnectorsModalProps {
  dataConnectorLinks: DataConnectorToProjectLink[];
  dataConnectorsError?: FetchBaseQueryError | SerializedError;
  dataConnectorsMap: Record<string, DataConnectorRead>;
  isLoading?: boolean;
  isOpen: boolean;
  launcher: SessionLauncher;
  policiesError?: FetchBaseQueryError | SerializedError;
  savedPolicies?: SessionLauncherDataConnector[];
  toggle: () => void;
}

export default function CustomizeDataConnectorsModal({
  dataConnectorLinks,
  dataConnectorsError,
  dataConnectorsMap,
  isLoading = false,
  isOpen,
  launcher,
  policiesError,
  savedPolicies,
  toggle,
}: CustomizeDataConnectorsModalProps) {
  const [updateLauncherDataConnectors, updateResult] =
    useUpdateLauncherDataConnectorsMutation();
  const defaultValues = useMemo(
    () =>
      getDefaultValues(dataConnectorLinks, dataConnectorsMap, savedPolicies),
    [dataConnectorLinks, dataConnectorsMap, savedPolicies],
  );
  const dataConnectorByLinkId = useMemo(() => {
    const byLinkId: Record<string, DataConnectorRead> = {};
    for (const link of dataConnectorLinks) {
      const dataConnector = dataConnectorsMap[link.data_connector_id];
      if (dataConnector != null) {
        byLinkId[link.id] = dataConnector;
      }
    }
    return byLinkId;
  }, [dataConnectorLinks, dataConnectorsMap]);

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<DataConnectorsForm>({ defaultValues });
  const { fields } = useFieldArray({ control, name: "dataConnectors" });
  const onSave = handleSubmit((form) => {
    if (savedPolicies == null) {
      return;
    }
    updateLauncherDataConnectors({
      launcherId: launcher.id,
      sessionLauncherDataConnectorPatchList: form.dataConnectors.map((row) => ({
        data_connector_link_id: row.linkId,
        policy: row.policy,
      })),
    });
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      updateResult.reset();
    }
  }, [isOpen, reset, updateResult]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    reset(defaultValues);
  }, [defaultValues, isLoading, reset]);

  return (
    <LauncherResourceModal
      dataCy="customize-data-connectors-modal"
      description="Limit access to data connectors in this launcher."
      icon={<Database className={cx("bi", "me-1")} />}
      isDirty={isDirty && savedPolicies != null && !isLoading}
      isOpen={isOpen}
      isSaving={updateResult.isLoading}
      isSuccess={updateResult.isSuccess}
      onSave={onSave}
      successContent={
        <LauncherResourceUpdateConfirmation launcher={launcher} />
      }
      title={`Customize Data Connectors in ${launcher.name}`}
      toggle={toggle}
    >
      {!isLoading && dataConnectorsError != null && (
        <RtkOrDataServicesError error={dataConnectorsError} />
      )}
      {!isLoading && policiesError != null && (
        <RtkOrDataServicesError error={policiesError} />
      )}
      {updateResult.error != null && (
        <RtkOrDataServicesError error={updateResult.error} />
      )}
      {isLoading && <Loader />}
      {!isLoading &&
        savedPolicies != null &&
        dataConnectorsError == null &&
        fields.length < 1 && (
          <p className={cx("fst-italic", "mb-0")}>
            No data connectors included
          </p>
        )}
      {!isLoading && savedPolicies != null && fields.length > 0 && (
        <Form noValidate onSubmit={onSave}>
          <LauncherResourceTable
            columnWidths={DATA_CONNECTOR_COLUMN_WIDTHS}
            dataCy="launcher-data-connectors-table"
            headers={["Data connector", "Source", "Access level"]}
          >
            {fields.map((field, index) => {
              const dataConnector = dataConnectorByLinkId[field.linkId];
              if (!dataConnector) {
                return null;
              }
              return (
                <DataConnectorAccessRow
                  key={field.id}
                  control={control}
                  dataConnector={dataConnector}
                  index={index}
                  isStorageReadOnly={field.isStorageReadOnly}
                  name={field.name}
                />
              );
            })}
          </LauncherResourceTable>
        </Form>
      )}
    </LauncherResourceModal>
  );
}

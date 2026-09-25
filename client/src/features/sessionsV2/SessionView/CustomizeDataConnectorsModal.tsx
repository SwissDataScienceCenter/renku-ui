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
import { useEffect, useMemo } from "react";
import { Database } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
import { Form } from "reactstrap";

import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import type {
  DataConnectorAccessPolicyName,
  SessionLauncher,
} from "../api/sessionLaunchersV2.api";
import LauncherResourceModal, {
  AccessPolicySelect,
  LauncherResourceTable,
} from "./LauncherResourceModal";
import {
  DATA_CONNECTOR_ACCESS_OPTIONS,
  getDefaultDataConnectorAccessPolicy,
} from "./launcherResources.constants";

const READ_WRITE_DISABLED: readonly DataConnectorAccessPolicyName[] = [
  "readWrite",
];

interface DataConnectorAccessField {
  isStorageReadOnly: boolean;
  linkId: string;
  name: string;
  policy: DataConnectorAccessPolicyName;
  slug: string;
}

interface DataConnectorsForm {
  dataConnectors: DataConnectorAccessField[];
}

function getDefaultValues(
  links: DataConnectorToProjectLink[],
  dataConnectorsMap: Record<string, DataConnectorRead>,
): DataConnectorsForm {
  return {
    dataConnectors: links.flatMap((link) => {
      const dataConnector = dataConnectorsMap[link.data_connector_id];
      if (dataConnector == null) {
        return [];
      }
      const isStorageReadOnly = dataConnector.storage.readonly;
      return [
        {
          isStorageReadOnly,
          linkId: link.id,
          name: dataConnector.name,
          policy: getDefaultDataConnectorAccessPolicy(isStorageReadOnly),
          slug: dataConnector.slug,
        },
      ];
    }),
  };
}

interface DataConnectorAccessRowProps {
  control: Control<DataConnectorsForm>;
  index: number;
  isStorageReadOnly: boolean;
  name: string;
  slug: string;
}

function DataConnectorAccessRow({
  control,
  index,
  isStorageReadOnly,
  name,
  slug,
}: DataConnectorAccessRowProps) {
  return (
    <tr data-cy="launcher-data-connector-row">
      <td className="align-middle">{name}</td>
      <td className={cx("align-middle", "text-break")}>{slug}</td>
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
        {isStorageReadOnly && (
          <small className="text-body-secondary">
            This data connector is read-only.
          </small>
        )}
      </td>
    </tr>
  );
}

interface CustomizeDataConnectorsModalProps {
  dataConnectorLinks: DataConnectorToProjectLink[];
  dataConnectorsMap: Record<string, DataConnectorRead>;
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

export default function CustomizeDataConnectorsModal({
  dataConnectorLinks,
  dataConnectorsMap,
  isOpen,
  launcher,
  toggle,
}: CustomizeDataConnectorsModalProps) {
  const defaultValues = useMemo(
    () => getDefaultValues(dataConnectorLinks, dataConnectorsMap),
    [dataConnectorLinks, dataConnectorsMap],
  );

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<DataConnectorsForm>({ defaultValues });
  const { fields } = useFieldArray({ control, name: "dataConnectors" });
  const onSave = handleSubmit(() => {});

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  return (
    <LauncherResourceModal
      dataCy="customize-data-connectors-modal"
      description="Limit access to data connectors in this launcher."
      icon={<Database className={cx("bi", "me-1")} />}
      isDirty={isDirty}
      isOpen={isOpen}
      onSave={onSave}
      title={`Customize Data Connectors in ${launcher.name}`}
      toggle={toggle}
    >
      {fields.length < 1 ? (
        <p className={cx("fst-italic", "mb-0")}>No data connectors included</p>
      ) : (
        <Form noValidate onSubmit={onSave}>
          <LauncherResourceTable
            dataCy="launcher-data-connectors-table"
            headers={["Data connector name", "Slug", "Access"]}
          >
            {fields.map((field, index) => (
              <DataConnectorAccessRow
                key={field.id}
                control={control}
                index={index}
                isStorageReadOnly={field.isStorageReadOnly}
                name={field.name}
                slug={field.slug}
              />
            ))}
          </LauncherResourceTable>
        </Form>
      )}
    </LauncherResourceModal>
  );
}

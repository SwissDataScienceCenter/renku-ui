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
import { useCallback } from "react";
import { Globe, Lock } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { ButtonGroup, Input, Label } from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { WarnAlert } from "../../../../components/Alert";
import { slugFromTitle } from "../../../../utils/helpers/HelperFunctions";

import { CLOUD_STORAGE_TOTAL_STEPS } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import { useGetCloudStorageSchemaQuery } from "../../../project/components/cloudStorage/projectCloudStorage.api";
import type {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageSchema,
} from "../../../project/components/cloudStorage/projectCloudStorage.types";
import { getSchemaOptions } from "../../../project/utils/projectCloudStorage.utils";
import {
  AddStorageAdvanced,
  AddStorageAdvancedToggle,
  AddStorageOptions,
  AddStorageType,
  type AddStorageStepProps,
} from "../../../project/components/cloudStorage/AddOrEditCloudStorage";
import { ProjectNamespaceControl } from "../../../projectsV2/fields/ProjectNamespaceFormField";
import SlugFormField from "../../../projectsV2/fields/SlugFormField";
import type { CloudStorageSecretGet } from "../../../projectsV2/api/storagesV2.api";

import { type DataConnectorFlat } from "../dataConnector.utils";
import DataConnectorModalResult, {
  type AuxiliaryCommandStatus,
} from "./DataConnectorModalResult";
import DataConnectorSaveCredentialsInfo from "./DataConnectorSaveCredentialsInfo";

interface AddOrEditDataConnectorProps {
  flatDataConnector: DataConnectorFlat;
  schema: CloudStorageSchema[];
  setFlatDataConnector: (newDetails: Partial<DataConnectorFlat>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storageSecrets: CloudStorageSecretGet[];
  validationSucceeded: boolean;
}

interface DataConnectorModalBodyProps {
  dataConnectorResultName: string | undefined;
  flatDataConnector: DataConnectorFlat;
  credentialSaveStatus: AuxiliaryCommandStatus;
  projectLinkStatus: AuxiliaryCommandStatus;
  redraw: boolean;
  schemaQueryResult: SchemaQueryResult;
  setFlatDataConnectorSafe: (
    newDataConnector: Partial<DataConnectorFlat>
  ) => void;
  setStateSafe: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  success: boolean;
  validationSucceeded: boolean;
  storageSecrets: CloudStorageSecretGet[];
}

type SchemaQueryResult = ReturnType<typeof useGetCloudStorageSchemaQuery>;

export default function DataConnectorModalBody({
  dataConnectorResultName,
  flatDataConnector,
  credentialSaveStatus,
  projectLinkStatus,
  redraw,
  schemaQueryResult,
  setFlatDataConnectorSafe,
  setStateSafe,
  state,
  storageSecrets,
  success,
  validationSucceeded,
}: DataConnectorModalBodyProps) {
  const {
    data: schema,
    error: schemaError,
    isFetching: schemaIsFetching,
  } = schemaQueryResult;
  if (redraw) return <Loader />;
  if (success) {
    return (
      <DataConnectorModalResult
        alreadyExisted={!!flatDataConnector.dataConnectorId}
        credentialSaveStatus={credentialSaveStatus}
        dataConnectorResultName={dataConnectorResultName}
        projectLinkStatus={projectLinkStatus}
      />
    );
  }
  if (schemaIsFetching || !schema) return <Loader />;
  if (schemaError) return <RtkOrNotebooksError error={schemaError} />;
  return (
    <>
      {!flatDataConnector.dataConnectorId && (
        <p>
          Add published datasets from data repositories for use in your project.
          Or, connect to cloud storage to read and write custom data.
        </p>
      )}
      <AddOrEditDataConnector
        schema={schema}
        setState={setStateSafe}
        setFlatDataConnector={setFlatDataConnectorSafe}
        state={state}
        flatDataConnector={flatDataConnector}
        storageSecrets={storageSecrets}
        validationSucceeded={validationSucceeded}
      />
    </>
  );
}

function AddOrEditDataConnector({
  schema,
  setFlatDataConnector,
  setState,
  state,
  flatDataConnector,
  storageSecrets,
  validationSucceeded,
}: AddOrEditDataConnectorProps) {
  const setStorage = useCallback(
    (newDetails: Partial<CloudStorageDetails>) => {
      setFlatDataConnector({ ...newDetails });
    },
    [setFlatDataConnector]
  );
  const CloudStorageContentByStep =
    state.step >= 0 && state.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapCloudStorageStepToElement[state.step]
      : null;
  if (CloudStorageContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle state={state} setState={setState} />
        </div>
        <CloudStorageContentByStep
          schema={schema}
          state={state}
          storage={flatDataConnector}
          setState={setState}
          setStorage={setStorage}
          storageSecrets={storageSecrets}
          isV2={true}
          validationSucceeded={validationSucceeded}
        />
      </>
    );
  const DataConnectorContentByStep =
    state.step >= 0 && state.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapDataConnectorStepToElement[state.step]
      : null;
  if (DataConnectorContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle state={state} setState={setState} />
        </div>
        <DataConnectorContentByStep
          flatDataConnector={flatDataConnector}
          schema={schema}
          state={state}
          setState={setState}
          setFlatDataConnector={setFlatDataConnector}
          storageSecrets={storageSecrets}
          validationSucceeded={validationSucceeded}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}

export interface DataConnectorMountForm {
  name: string;
  namespace: string;
  slug: string;
  visibility: string;
  mountPoint: string;
  readOnly: boolean;
  saveCredentials: boolean;
}
type DataConnectorMountFormFields =
  | "name"
  | "namespace"
  | "slug"
  | "visibility"
  | "mountPoint"
  | "readOnly"
  | "saveCredentials";
export function DataConnectorMount({
  schema,
  setFlatDataConnector,
  setState,
  flatDataConnector,
  state,
  validationSucceeded,
}: AddOrEditDataConnectorProps) {
  const {
    control,
    formState: { errors, touchedFields },
    setValue,
    getValues,
  } = useForm<DataConnectorMountForm>({
    mode: "onChange",
    defaultValues: {
      name: flatDataConnector.name || "",
      namespace: flatDataConnector.namespace || "",
      visibility: flatDataConnector.visibility || "private",
      slug: flatDataConnector.slug || "",
      mountPoint:
        flatDataConnector.mountPoint ||
        `${flatDataConnector.schema?.toLowerCase()}`,
      readOnly: flatDataConnector.readOnly ?? false,
      saveCredentials: state.saveCredentials,
    },
  });
  const onFieldValueChange = useCallback(
    (field: DataConnectorMountFormFields, value: string | boolean) => {
      setValue(field, value);
      if (field === "name") {
        if (!touchedFields.slug && !flatDataConnector.dataConnectorId)
          setValue("slug", slugFromTitle(value as string));
        if (
          !touchedFields.mountPoint &&
          !touchedFields.slug &&
          !flatDataConnector.dataConnectorId
        )
          setValue("mountPoint", slugFromTitle(value as string));
      }

      if (
        field === "slug" &&
        !touchedFields.mountPoint &&
        !flatDataConnector.dataConnectorId
      )
        setValue("mountPoint", value as string);
      if (field === "saveCredentials") {
        setState({ saveCredentials: !!value });
        return;
      }
      setFlatDataConnector({ ...getValues() });
    },
    [
      getValues,
      setState,
      setFlatDataConnector,
      flatDataConnector.dataConnectorId,
      setValue,
      touchedFields.mountPoint,
      touchedFields.slug,
    ]
  );

  const options = getSchemaOptions(
    schema,
    true,
    flatDataConnector.schema,
    flatDataConnector.provider
  );
  const secretFields =
    options == null
      ? []
      : Object.values(options).filter((o) => o && o.convertedType === "secret");
  const hasPasswordFieldWithInput = secretFields.some(
    (o) => flatDataConnector.options && flatDataConnector.options[o.name]
  );

  return (
    <form className="form-rk-green" data-cy="data-connector-edit-mount">
      <h5>Final details</h5>
      <p>We need a few more details to mount your data properly.</p>

      <div className="mb-3">
        <Label className="form-label" for="name">
          Name
        </Label>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              id="name"
              type="string"
              {...field}
              className={cx("form-control", errors.name && "is-invalid")}
              onChange={(e) => {
                field.onChange(e);
                onFieldValueChange("name", e.target.value);
              }}
            />
          )}
        />
        <div className="invalid-feedback">
          {errors.name?.message?.toString()}
        </div>
        <div className={cx("form-text", "text-muted")}>
          This name serves as a brief description for the connector and will
          help you identify it.
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="namespace">
          Owner
        </Label>

        <Controller
          name="namespace"
          control={control}
          render={({ field }) => {
            const fields: Partial<typeof field> = { ...field };
            delete fields?.ref;
            return (
              <ProjectNamespaceControl
                {...fields}
                className={cx(errors.namespace && "is-invalid")}
                data-cy={"data-controller-namespace-input"}
                id="namespace"
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange("namespace", e?.slug ?? "");
                }}
              />
            );
          }}
          rules={{
            required: true,
            maxLength: 99,
            pattern:
              /^(?!.*\.git$|.*\.atom$|.*[-._][-._].*)[a-zA-Z0-9][a-zA-Z0-9\-_.]*$/,
          }}
        />
        <div className="invalid-feedback">
          {errors.name?.message?.toString()}
        </div>
        {flatDataConnector.namespace && flatDataConnector.slug ? (
          <div className={cx("form-text", "text-muted")}>
            The url for this data connector will be{" "}
            <b>{`${flatDataConnector.namespace}/${flatDataConnector.slug}`}</b>.
          </div>
        ) : (
          <div className={cx("form-text", "text-muted")}>
            The owner and slug together form the url for this data connector.
          </div>
        )}
      </div>

      <SlugFormField
        control={control}
        entityName="data-connector"
        errors={errors}
        name="slug"
      />

      <div className="mb-3">
        <Label className="form-label" for="visibility">
          Visibility
        </Label>

        <div>
          <Controller
            aria-describedby="data-controller-visibility-help"
            name="visibility"
            control={control}
            render={({ field }) => (
              <>
                <ButtonGroup id="visibility">
                  <Input
                    type="radio"
                    className="btn-check"
                    data-cy="data-controller-visibility-public"
                    id="data-controller-visibility-public"
                    {...field}
                    value="public"
                    checked={field.value === "public"}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldValueChange("visibility", e.target.value);
                    }}
                  />
                  <Label
                    for="data-controller-visibility-public"
                    className={cx("btn", "btn-outline-primary")}
                  >
                    <Globe className={cx("bi", "me-1")} />
                    Public
                  </Label>
                  <Input
                    type="radio"
                    className="btn-check"
                    data-cy="data-controller-visibility-private"
                    id="data-controller-visibility-private"
                    {...field}
                    value="private"
                    checked={field.value === "private"}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldValueChange("visibility", e.target.value);
                    }}
                  />
                  <Label
                    for="data-controller-visibility-private"
                    className={cx("btn", "btn-outline-primary")}
                  >
                    <Lock className={cx("bi", "me-1")} />
                    Private
                  </Label>
                </ButtonGroup>
                {field.value === "public" && (
                  <div
                    id="data-controller-visibility-help"
                    className={cx("form-text", "text-muted")}
                  >
                    This data connector is visible to everyone.
                  </div>
                )}
                {field.value === "private" && (
                  <div className={cx("form-text", "text-muted")}>
                    This data connector is visible to you and members of
                    projects to which it is connected.
                  </div>
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="mountPoint">
          Mount point
        </Label>

        <Controller
          name="mountPoint"
          control={control}
          render={({ field }) => (
            <input
              id="mountPoint"
              type="string"
              {...field}
              className={cx("form-control", errors.mountPoint && "is-invalid")}
              onChange={(e) => {
                field.onChange(e);
                onFieldValueChange("mountPoint", e.target.value);
              }}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a mount point.</div>
        <div className={cx("form-text", "text-muted")}>
          This is the name of the folder where you will find your external
          storage in sessions. You should pick something different from the
          folders used in the projects repository, and from folders mounted by
          other storage services.
        </div>
      </div>

      <div>
        <Label className="form-label" for="readOnly">
          Read-only
        </Label>

        <Controller
          name="readOnly"
          control={control}
          render={({ field }) => (
            <input
              id="readOnly"
              type="checkbox"
              {...field}
              className={cx(
                "form-check-input",
                "ms-1",
                errors.readOnly && "is-invalid"
              )}
              onChange={(e) => {
                field.onChange(e);
                onFieldValueChange("readOnly", e.target.checked);
              }}
              value=""
              checked={flatDataConnector.readOnly ?? false}
            />
          )}
          rules={{ required: true }}
        />
        {!flatDataConnector.readOnly && (
          <div className="mt-1">
            <WarnAlert dismissible={false}>
              <p className="mb-0">
                You are mounting this storage in read-write mode. If you have
                read-only access, please check the box to prevent errors with
                some storage types.
              </p>
            </WarnAlert>
          </div>
        )}
        <div className={cx("form-text", "text-muted")}>
          Check this box to mount the storage in read-only mode. You should
          always check this if you do not have credentials to write. You can use
          this in any case to prevent accidental data modifications.
        </div>
      </div>

      {flatDataConnector.dataConnectorId == null &&
        hasPasswordFieldWithInput &&
        validationSucceeded && (
          <DataConnectorSaveCredentialsInfo
            control={control}
            onFieldValueChange={onFieldValueChange}
            state={state}
          />
        )}
    </form>
  );
}

const mapCloudStorageStepToElement: {
  [key: number]: React.ComponentType<AddStorageStepProps>;
} = {
  0: AddStorageAdvanced,
  1: AddStorageType,
  2: AddStorageOptions,
};

const mapDataConnectorStepToElement: {
  [key: number]: React.ComponentType<AddOrEditDataConnectorProps>;
} = {
  3: DataConnectorMount,
};

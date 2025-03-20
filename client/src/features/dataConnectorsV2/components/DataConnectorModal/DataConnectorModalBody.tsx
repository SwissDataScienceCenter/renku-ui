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
import { ButtonGroup, FormText, Input, Label } from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { WarnAlert } from "../../../../components/Alert";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import { slugFromTitle } from "../../../../utils/helpers/HelperFunctions";

import { CLOUD_STORAGE_TOTAL_STEPS } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  AddCloudStorageState,
  CloudStorageDetails,
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
import type { DataConnectorSecret } from "../../api/data-connectors.api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";

import DataConnectorModalResult from "./DataConnectorModalResult";
import DataConnectorSaveCredentialsInfo from "./DataConnectorSaveCredentialsInfo";
import type { Project } from "../../../projectsV2/api/projectV2.api";

interface AddOrEditDataConnectorProps {
  storageSecrets: DataConnectorSecret[];
  project?: Project;
}

type DataConnectorModalBodyProps = AddOrEditDataConnectorProps;

export default function DataConnectorModalBody({
  storageSecrets,
  project,
}: DataConnectorModalBodyProps) {
  const { flatDataConnector, schemata, success } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  if (success) {
    return (
      <DataConnectorModalResult
        alreadyExisted={!!flatDataConnector.dataConnectorId}
      />
    );
  }
  if (schemata.length < 1) return <Loader />;
  return (
    <>
      {!flatDataConnector.dataConnectorId && (
        <p className="text-body-secondary">
          Add published datasets from data repositories for use in your project.
          Or, connect to cloud storage to read and write custom data.
        </p>
      )}
      <AddOrEditDataConnector
        storageSecrets={storageSecrets}
        project={project}
      />
    </>
  );
}

function AddOrEditDataConnector({
  storageSecrets,
  project,
}: AddOrEditDataConnectorProps) {
  const { cloudStorageState, flatDataConnector, schemata, validationResult } =
    useAppSelector((state) => state.dataConnectorFormSlice);
  const dispatch = useAppDispatch();
  const setState = useCallback(
    (newState: Partial<AddCloudStorageState>) => {
      dispatch(
        dataConnectorFormSlice.actions.setCloudStorageState({
          cloudStorageState: newState,
        })
      );
    },
    [dispatch]
  );
  const setFlatDataConnector = useCallback(
    (newDetails: Partial<CloudStorageDetails>) => {
      dispatch(
        dataConnectorFormSlice.actions.setFlatDataConnector({
          flatDataConnector: {
            ...newDetails,
          },
          validationSucceeded: null,
        })
      );
    },
    [dispatch]
  );
  const CloudStorageContentByStep =
    cloudStorageState.step >= 0 &&
    cloudStorageState.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapCloudStorageStepToElement[cloudStorageState.step]
      : null;
  if (CloudStorageContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle
            state={cloudStorageState}
            setState={setState}
          />
        </div>
        <CloudStorageContentByStep
          schema={schemata}
          state={cloudStorageState}
          storage={flatDataConnector}
          setState={setState}
          setStorage={setFlatDataConnector}
          storageSecrets={storageSecrets}
          validationSucceeded={validationResult?.isSuccess ?? false}
          isV2={true}
        />
      </>
    );
  const DataConnectorContentByStep =
    cloudStorageState.step >= 0 &&
    cloudStorageState.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapDataConnectorStepToElement[cloudStorageState.step]
      : null;
  if (DataConnectorContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle
            state={cloudStorageState}
            setState={setState}
          />
        </div>
        <DataConnectorContentByStep
          storageSecrets={storageSecrets}
          project={project}
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
export function DataConnectorMount({ project }: AddOrEditDataConnectorProps) {
  const dispatch = useAppDispatch();
  const { cloudStorageState, flatDataConnector, schemata } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
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
      saveCredentials: cloudStorageState.saveCredentials,
    },
  });
  const onFieldValueChange = useCallback(
    (field: DataConnectorMountFormFields, value: string | boolean) => {
      setValue(field, value);
      if (field === "name") {
        if (!touchedFields.slug && !flatDataConnector.dataConnectorId)
          setValue("slug", slugFromTitle(value as string, true, true));
        if (
          !touchedFields.mountPoint &&
          !touchedFields.slug &&
          !flatDataConnector.dataConnectorId
        )
          setValue("mountPoint", slugFromTitle(value as string, true, true));
      }

      if (
        field === "slug" &&
        !touchedFields.mountPoint &&
        !flatDataConnector.dataConnectorId
      )
        setValue("mountPoint", value as string);
      if (field === "saveCredentials") {
        dispatch(
          dataConnectorFormSlice.actions.setCloudStorageState({
            cloudStorageState: { saveCredentials: !!value },
          })
        );
        return;
      }
      dispatch(
        dataConnectorFormSlice.actions.setFlatDataConnector({
          flatDataConnector: { ...getValues() },
        })
      );
    },
    [
      dispatch,
      getValues,
      flatDataConnector.dataConnectorId,
      setValue,
      touchedFields.mountPoint,
      touchedFields.slug,
    ]
  );

  const { validationResult } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  const options = getSchemaOptions(
    schemata,
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
              data-cy="data-connector-name-input"
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
        <Label className="form-label" for="namespace-input">
          Owner
        </Label>

        <Controller
          name="namespace"
          control={control}
          render={({ field }) => {
            const fields: Partial<typeof field> = { ...field };
            delete fields?.ref;
            return (
              //<DataConnectorNamespaceControl
              //  {...fields}
              //  projectId={projectId || ""}
              //  className={cx(errors.namespace && "is-invalid")}
              //  data-cy={"data-controller-namespace-input"}
              //  id="namespace"
              //  inputId="namespace-input"
              //  onChange={(e) => {
              //    field.onChange(e);
              //    onFieldValueChange("namespace", e?.value || "");
              //  }}
              ///>
              <ProjectNamespaceControl
                {...fields}
                className={cx(errors.namespace && "is-invalid")}
                data-cy="data-controller-namespace-input"
                id="namespace"
                inputId="namespace-input"
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange("namespace", e?.slug ?? "");
                }}
                project={project}
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

      <div className="mb-3">
        <Label className="form-label" for="data-connector-slug">
          Slug
        </Label>
        <Controller
          control={control}
          name="slug"
          render={({ field }) => (
            <Input
              aria-describedby="data-connector-SlugHelp"
              className={cx("form-control", errors.slug && "is-invalid")}
              data-cy="data-connector-slug-input"
              id="data-connector-slug"
              type="text"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onFieldValueChange("slug", e.target.value);
              }}
            />
          )}
          rules={{
            required: true,
            maxLength: 99,
            pattern:
              /^(?!.*\.git$|.*\.atom$|.*[-._][-._].*)[a-z0-9][a-z0-9\-_.]*$/,
          }}
        />
        <div className="invalid-feedback">
          Please provide a slug consisting of lowercase letters, numbers, and
          hyphens.
        </div>
        <FormText id="data-connector-SlugHelp" className="input-hint">
          A short, machine-readable identifier for the data connector,
          restricted to lowercase letters, numbers, and hyphens.
        </FormText>
      </div>

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
              data-cy="data-connector-mount-input"
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
              data-cy="data-connector-readonly-input"
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
        validationResult?.isSuccess && (
          <DataConnectorSaveCredentialsInfo
            control={control}
            onFieldValueChange={onFieldValueChange}
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

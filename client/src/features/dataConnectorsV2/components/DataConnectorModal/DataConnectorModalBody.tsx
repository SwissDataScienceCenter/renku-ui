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
import { useCallback, useState } from "react";
import { Globe, Lock } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  ButtonGroup,
  Collapse,
  Input,
  Label,
} from "reactstrap";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import { WarnAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import { slugFromTitle } from "../../../../utils/helpers/HelperFunctions";
import {
  AddStorageAdvanced,
  AddStorageAdvancedToggle,
  AddStorageOptions,
  AddStorageType,
  type AddStorageStepProps,
} from "../../../project/components/cloudStorage/AddOrEditCloudStorage";
import { CLOUD_STORAGE_TOTAL_STEPS } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  AddCloudStorageState,
  CloudStorageDetails,
} from "../../../project/components/cloudStorage/projectCloudStorage.types";
import { getSchemaOptions } from "../../../project/utils/projectCloudStorage.utils";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { ProjectNamespaceControl } from "../../../projectsV2/fields/ProjectNamespaceFormField";
import SlugPreviewFormField from "../../../projectsV2/fields/SlugPreviewFormField.tsx";
import type { DataConnectorSecret } from "../../api/data-connectors.api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";
import DataConnectorModalResult from "./DataConnectorModalResult";
import DataConnectorSaveCredentialsInfo from "./DataConnectorSaveCredentialsInfo";

interface AddOrEditDataConnectorProps {
  dataConnector?: DataConnectorRead | null;
  project?: Project;
  storageSecrets: DataConnectorSecret[];
}

type DataConnectorModalBodyProps = AddOrEditDataConnectorProps;

export default function DataConnectorModalBody({
  dataConnector = null,
  project,
  storageSecrets,
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
        dataConnector={dataConnector}
        project={project}
        storageSecrets={storageSecrets}
      />
    </>
  );
}

function AddOrEditDataConnector({
  dataConnector,
  project,
  storageSecrets,
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
          dataConnector={dataConnector}
          project={project}
          storageSecrets={storageSecrets}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}

export interface DataConnectorMountForm {
  keyword: string;
  keywords: string[];
  mountPoint: string;
  name: string;
  namespace: string;
  readOnly: boolean;
  saveCredentials: boolean;
  slug: string;
  visibility: string;
}
type DataConnectorMountFormFields =
  | "keyword"
  | "keywords"
  | "mountPoint"
  | "name"
  | "namespace"
  | "readOnly"
  | "saveCredentials"
  | "slug"
  | "visibility";

export function DataConnectorMount({
  dataConnector,
}: AddOrEditDataConnectorProps) {
  const dispatch = useAppDispatch();
  const { cloudStorageState, flatDataConnector, schemata } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  const [isAdvancedSettingOpen, setIsAdvancedSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvancedSettingsOpen(
        (isAdvancedSettingOpen) => !isAdvancedSettingOpen
      ),
    []
  );
  const {
    control,
    formState: { dirtyFields, errors, touchedFields },
    setValue,
    watch,
    getValues,
    watch,
  } = useForm<DataConnectorMountForm>({
    mode: "onChange",
    defaultValues: {
      keyword: "",
      keywords: flatDataConnector.keywords || [],
      mountPoint:
        flatDataConnector.mountPoint ||
        `${flatDataConnector.schema?.toLowerCase()}`,
      name: flatDataConnector.name || "",
      namespace: flatDataConnector.namespace || "",
      readOnly: flatDataConnector.readOnly ?? false,
      saveCredentials: cloudStorageState.saveCredentials,
      slug: flatDataConnector.slug || "",
      visibility: flatDataConnector.visibility || "private",
    },
  });
  const currentKeywords = watch("keywords");
  const oldKeywords = dataConnector?.keywords ?? [];

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

  const url = `${flatDataConnector.namespace}/`;
  const currentName = watch("name");
  const currentSlug = watch("slug");
  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

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
              <ProjectNamespaceControl
                {...fields}
                className={cx(errors.namespace && "is-invalid")}
                data-cy="data-controller-namespace-input"
                id="namespace"
                inputId="namespace-input"
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange("namespace", e?.path ?? "");
                }}
                ensureNamespace={flatDataConnector.namespace}
                includeProjectNamespaces={true}
              />
            );
          }}
          rules={{
            required: true,
            maxLength: 99,
            pattern:
              /^(?!.*\.git$|.*\.atom$|.*[-._][-._].*)[a-z0-9][a-z0-9\-_.]*(?<!\.git)(?<!\.atom)(?:\/[a-z0-9][a-z0-9\-_.]*)?$/,
          }}
        />
        <div className="invalid-feedback">
          {errors.name?.message?.toString()}
        </div>
      </div>

      <div className="mb-3">
        <SlugPreviewFormField
          compact={true}
          control={control}
          errors={errors}
          name="slug"
          resetFunction={resetUrl}
          url={url}
          slug={currentSlug}
          dirtyFields={dirtyFields}
          label="Project URL"
          entityName="project"
        />
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
        <Controller
          name="readOnly"
          control={control}
          render={({ field }) => (
            <div className={cx("d-flex", "gap-2")}>
              <Label className={cx("form-label", "mb-0")} for="readOnly">
                Read-only
              </Label>
              <div
                className={cx(
                  "d-flex",
                  "align-item-center",
                  "form-check",
                  "form-switch"
                )}
              >
                <input
                  id="readOnly"
                  role="switch"
                  type="checkbox"
                  {...field}
                  className={cx(
                    "form-check-input",
                    "rounded-pill",
                    "my-auto",
                    "me-2",
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
              </div>
            </div>
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

      <div>
        <Label className="form-label" for="data-connector-slug">
          Keywords
        </Label>

        <Row className="g-2">
          <Col xs={12}>
            <div className={cx("input-group", "input-group-sm")}>
              <Controller
                name="keyword"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      id="keyword"
                      placeholder="Add new keyword"
                      type="string"
                      {...field}
                      className={cx(
                        "form-control",
                        errors.keyword && "is-invalid"
                      )}
                      data-cy="data-connector-keyword-input"
                      onChange={(e) => {
                        field.onChange(e);
                        onFieldValueChange("keyword", e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && field.value) {
                          const newValue = field.value.trim();
                          if (!currentKeywords.includes(newValue)) {
                            const newKeywords = [...currentKeywords, newValue];
                            setValue("keywords", newKeywords);
                          }
                          setValue("keyword", "");
                          onFieldValueChange("keyword", "");
                        }
                      }}
                    />
                    <Button
                      color={field.value ? "primary" : "outline-primary"}
                      data-cy="data-connector-keyword-button"
                      disabled={!field.value}
                      onClick={() => {
                        if (field.value) {
                          const newValue = field.value.trim();
                          if (!currentKeywords.includes(newValue)) {
                            const newKeywords = [...currentKeywords, newValue];
                            setValue("keywords", newKeywords);
                          }
                          setValue("keyword", "");
                          onFieldValueChange("keyword", "");
                        }
                      }}
                      type="button"
                    >
                      <PlusLg className={cx("bi", "me-1")} />
                      Add
                    </Button>
                  </>
                )}
              />
            </div>
          </Col>

          <Col className="d-flex">
            <Controller
              name="keywords"
              control={control}
              render={({ field }) => (
                <>
                  {field.value && field.value.length > 0 && (
                    <KeywordContainer data-cy="data-connector-keywords">
                      {[...currentKeywords]
                        .sort((a, b) => a.localeCompare(b))
                        .map((keyword, index) => (
                          <KeywordBadge
                            data-cy="data-connector-keyword"
                            key={index}
                            highlighted={!oldKeywords?.includes(keyword)}
                            remove={() => {
                              const newKeywords = currentKeywords.filter(
                                (k) => k !== keyword
                              );
                              setValue("keywords", newKeywords);
                              onFieldValueChange("keyword", "");
                            }}
                          >
                            {keyword}
                          </KeywordBadge>
                        ))}
                    </KeywordContainer>
                  )}
                </>
              )}
            />
          </Col>
        </Row>

        <div className={cx("form-text", "text-muted")}>
          Keywords help orginizing your work and are available to search. You
          can use them to group elements that belong together or to create
          specific topics. You can add multiple keywords.
        </div>
      </div>

      <div className="mb-3">
        <button
          className={cx(
            "d-flex",
            "align-items-center",
            "w-100",
            "bg-transparent",
            "border-0",
            "fw-bold",
            "px-0"
          )}
          type="button"
          onClick={toggleIsOpen}
        >
          Advanced settings
          <ChevronFlippedIcon
            className="ms-1"
            flipped={isAdvancedSettingOpen}
          />
        </button>
      </div>

      <Collapse isOpen={isAdvancedSettingOpen}>
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
                className={cx(
                  "form-control",
                  errors.mountPoint && "is-invalid"
                )}
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
      </Collapse>

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

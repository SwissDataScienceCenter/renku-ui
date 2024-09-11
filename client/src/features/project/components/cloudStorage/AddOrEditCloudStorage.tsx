/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ExclamationTriangleFill,
  EyeFill,
  EyeSlashFill,
  KeyFill,
  QuestionCircle,
} from "react-bootstrap-icons";
import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import {
  Badge,
  Button,
  Input,
  InputGroup,
  Label,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from "reactstrap";

import {
  CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER,
  CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE,
  CLOUD_STORAGE_TOTAL_STEPS,
} from "./projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageSchema,
  CloudStorageSchemaOptions,
} from "./projectCloudStorage.types";
import {
  convertFromAdvancedConfig,
  getSchemaOptions,
  getSchemaProviders,
  getSchemaStorage,
  getSourcePathHint,
  hasProviderShortlist,
  parseCloudStorageConfiguration,
} from "../../utils/projectCloudStorage.utils";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { WarnAlert } from "../../../../components/Alert";
import type { CloudStorageSecretGet } from "../../../../features/projectsV2/api/storagesV2.api";

import AddStorageBreadcrumbNavbar from "./AddStorageBreadcrumbNavbar";
import AddStorageMountSaveCredentialsInfo from "./AddStorageMountSaveCredentialsInfo";

import styles from "./CloudStorage.module.scss";

interface AddOrEditCloudStorageProps {
  schema: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
  storageSecrets: CloudStorageSecretGet[];
}

export default function AddOrEditCloudStorage({
  schema,
  setStorage,
  setState,
  state,
  storage,
}: AddOrEditCloudStorageProps) {
  const ContentByStep =
    state.step >= 0 && state.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapStepToElement[state.step]
      : null;

  if (ContentByStep)
    return (
      <>
        <AddStorageAdvancedToggle state={state} setState={setState} />
        <AddStorageBreadcrumbNavbar state={state} setState={setState} />
        <ContentByStep
          schema={schema}
          state={state}
          storage={storage}
          setState={setState}
          setStorage={setStorage}
          storageSecrets={[]}
          validationSucceeded={false}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}

interface AddOrEditCloudStoragePropsV2 extends AddOrEditCloudStorageProps {
  validationSucceeded: boolean;
}

export function AddOrEditCloudStorageV2({
  schema,
  setStorage,
  setState,
  state,
  storage,
  storageSecrets,
  validationSucceeded,
}: AddOrEditCloudStoragePropsV2) {
  const ContentByStep =
    state.step >= 0 && state.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapStepToElement[state.step]
      : null;

  if (ContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle state={state} setState={setState} />
        </div>
        <ContentByStep
          schema={schema}
          state={state}
          storage={storage}
          setState={setState}
          setStorage={setStorage}
          storageSecrets={storageSecrets}
          isV2={true}
          validationSucceeded={validationSucceeded}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}
interface AddStorageAdvancedToggleProps {
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
}
export function AddStorageAdvancedToggle({
  setState,
  state,
}: AddStorageAdvancedToggleProps) {
  const toggleAdvanced = useCallback(() => {
    setState({ advancedMode: !state.advancedMode });
  }, [setState, state.advancedMode]);
  const infoId = "switch-storage-advanced-mode-info";
  return (
    <>
      <div className="form-rk-green">
        <div
          className={cx("form-check", "form-switch", "mb-3", "d-flex")}
          data-cy="cloud-storage-edit-advanced-toggle"
        >
          <Input
            className={cx(
              "form-check-input",
              "rounded-pill",
              "my-auto",
              "me-2"
            )}
            checked={state.advancedMode}
            id="switch-storage-advanced-mode"
            onChange={toggleAdvanced}
            role="switch"
            type="checkbox"
          />
          <Label
            className={cx("form-check-label", "my-auto")}
            for="addCloudStorageAdvancedSwitch"
          >
            Advanced mode{" "}
            <QuestionCircle id={infoId} className={cx("bi", "ms-1")} />
          </Label>
        </div>
      </div>
      <UncontrolledTooltip placement="bottom" target={infoId}>
        Advanced mode uses rclone configurations to set up cloud storage.
      </UncontrolledTooltip>
    </>
  );
}

// *** Add storage: helpers *** //
interface AddStorageStepProps {
  schema: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
  storageSecrets: CloudStorageSecretGet[];
  isV2?: boolean;
  validationSucceeded: boolean;
}

const mapStepToElement: {
  [key: number]: React.ComponentType<AddStorageStepProps>;
} = {
  0: AddStorageAdvanced,
  1: AddStorageType,
  2: AddStorageOptions,
  3: AddStorageMount,
};

interface AddStorageAdvancedForm {
  sourcePath: string;
  configuration: string;
}
export function AddStorageAdvanced({
  storage,
  setStorage,
}: AddStorageStepProps) {
  const {
    control,
    formState: { errors },
  } = useForm<AddStorageAdvancedForm>({
    defaultValues: {
      sourcePath: storage.sourcePath || "",
    },
  });

  const onConfigurationChange = useCallback(
    (value: string) => {
      const config = parseCloudStorageConfiguration(value);
      const { type, provider, ...options } = config;
      setStorage({
        schema: type,
        provider,
        options,
      });
    },
    [setStorage]
  );

  const onSourcePathChange = useCallback(
    (value: string) => {
      setStorage({ sourcePath: value });
    },
    [setStorage]
  );

  const sourcePathHelp = useMemo(() => {
    return getSourcePathHint(storage.schema);
  }, [storage.schema]);

  return (
    <form className="form-rk-green" data-cy="cloud-storage-edit-advanced">
      <div className="mb-3">
        <Controller
          name="sourcePath"
          control={control}
          render={({ field }) => (
            <input
              id="sourcePath"
              type="string"
              {...field}
              className="form-control"
              onChange={(e) => {
                field.onChange(e);
                onSourcePathChange(e.target.value);
              }}
              placeholder={sourcePathHelp.placeholder}
            />
          )}
        />
        <Label className="form-label" for="sourcePath">
          Source path
        </Label>
        <div className={cx("form-text", "text-muted")}>
          {sourcePathHelp.help}
        </div>
      </div>

      <div className="mb-3">
        <h5>Advanced storage configuration</h5>
        <Label className={cx("form-label", "mb-3")} for="addCloudStorageConfig">
          Under the hood, we use{" "}
          <ExternalLink
            showLinkIcon={true}
            iconAfter={true}
            iconSup={true}
            url="https://rclone.org/"
            title="rclone"
            role="link"
          />{" "}
          to mount the cloud storage. Here you can copy/paste the rclone
          configuration you get from{" "}
          <code className="user-select-all">
            rclone config show &lt;name&gt;
          </code>
        </Label>
        <Controller
          control={control}
          name="configuration"
          defaultValue={convertFromAdvancedConfig(storage)}
          render={({ field }) => (
            <textarea
              aria-describedby="addCloudStorageConfigHelp"
              className={cx(
                "form-control",
                errors.configuration && "is-invalid"
              )}
              id="addCloudStorageConfig"
              placeholder={CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER}
              rows={10}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onConfigurationChange(e.target.value);
              }}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">
          Please provide a valid <code>rclone</code> configuration
        </div>
      </div>
    </form>
  );
}

// *** Options helpers *** //

interface OptionTruncatedTextProps {
  collapsedLines?: number;
  linesTolerance?: number;
  text: string;
}
function OptionTruncatedText({
  collapsedLines = 2,
  linesTolerance = 1,
  text,
}: OptionTruncatedTextProps) {
  const [isTruncated, setIsTruncated] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleTruncate = useCallback(() => {
    setIsTruncated((isTruncated) => !isTruncated);
  }, []);

  useEffect(() => {
    // Check if the content overflows its container
    if (contentRef.current) {
      const containerHeight = contentRef.current.clientHeight;
      const contentHeight = contentRef.current.scrollHeight;

      const lineHeight = containerHeight / collapsedLines;
      const tolerance = lineHeight * (linesTolerance + 0.5);

      setIsTruncated(contentHeight > containerHeight + tolerance);
    }
  }, [collapsedLines, linesTolerance, text]);

  const textStyle = {
    maxHeight: isTruncated ? `${collapsedLines * 1.5}em` : "none",
  };

  return (
    <div>
      <div className="overflow-hidden" ref={contentRef} style={textStyle}>
        {text}
      </div>
      {isTruncated && (
        <>
          <span> [...]</span>{" "}
          <Button
            className={cx("p-0", "align-baseline")}
            color="link"
            onClick={toggleTruncate}
            size="sm"
          >
            Show all
          </Button>
        </>
      )}
    </div>
  );
}

interface CheckboxOptionItemProps {
  control: Control<FieldValues, void>;
  defaultValue: boolean | undefined;
  onFieldValueChange: (option: string, value: boolean) => void;
  option: CloudStorageSchemaOptions;
}
function CheckboxOptionItem({
  control,
  defaultValue,
  onFieldValueChange,
  option,
}: CheckboxOptionItemProps) {
  return (
    <>
      <Controller
        name={option.name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <input
            {...field}
            id={option.name}
            type="checkbox"
            className={cx("form-check-input", "me-1")}
            onChange={(e) => {
              field.onChange(e);
              onFieldValueChange(option.name, e.target.checked);
            }}
          />
        )}
      />
      <label htmlFor={option.name}>{option.friendlyName ?? option.name}</label>
    </>
  );
}

interface PasswordOptionItemProps {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  defaultValue: string | undefined;
  isV2?: boolean;
  onFieldValueChange: (option: string, value: string) => void;
  option: CloudStorageSchemaOptions;
  storageSecrets: CloudStorageSecretGet[];
}
function PasswordOptionItem({
  control,
  defaultValue,
  isV2,
  onFieldValueChange,
  option,
  storageSecrets,
}: PasswordOptionItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = useCallback(() => {
    setShowPassword((showPassword) => !showPassword);
  }, []);

  const optionName = option.name;
  if (isV2 && storageSecrets.some((s) => s.name === optionName)) {
    return (
      <PasswordOptionItemStored
        defaultValue={CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE}
        {...{ control, option }}
      />
    );
  }

  const tooltipContainerId = `option-is-secret-${option.name}`;
  return (
    <>
      <label htmlFor={option.name}>
        {option.friendlyName ?? option.name}{" "}
        <div id={tooltipContainerId} className="d-inline">
          <KeyFill className={cx("bi", "ms-1")} />
          <ExclamationTriangleFill
            className={cx("bi", "ms-1", "text-warning")}
          />
        </div>
        <UncontrolledTooltip placement="top" target={tooltipContainerId}>
          {isV2 ? (
            <span>
              This field contains sensitive data (E.G. password, access token,
              ...), which is specific to the user. You can store this value as a
              secret, in which case it will be used for any session you start,
              but the value will not be available to other users.
            </span>
          ) : (
            <span>
              This field contains sensitive data (E.G. password, access token,
              ...). RenkuLab does not store passwords, so you will be asked this
              value again when starting a session.
            </span>
          )}
        </UncontrolledTooltip>
      </label>

      <InputGroup>
        <Controller
          name={option.name}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => (
            <input
              {...field}
              id={option.name}
              type={showPassword ? "text" : "password"}
              className={cx("form-control", "rounded-0", "rounded-start")}
              placeholder={option.convertedDefault?.toString() ?? ""}
              onChange={(e) => {
                field.onChange(e);
                onFieldValueChange(option.name, e.target.value);
              }}
            />
          )}
        />
        <Button
          className="rounded-end"
          id={`show-password-${option.name}`}
          onClick={() => toggleShowPassword()}
        >
          {showPassword ? (
            <EyeFill className="bi" />
          ) : (
            <EyeSlashFill className="bi" />
          )}
          <UncontrolledTooltip
            placement="top"
            target={`show-password-${option.name}`}
          >
            Hide/show sensitive data
          </UncontrolledTooltip>
        </Button>
      </InputGroup>
    </>
  );
}

function PasswordOptionItemStored({
  control,
  defaultValue,
  option,
}: Omit<PasswordOptionItemProps, "onFieldValueChange" | "storageSecrets">) {
  const tooltipContainerId = `option-is-secret-${option.name}`;
  return (
    <>
      <label htmlFor={option.name}>
        {option.friendlyName ?? option.name}{" "}
        <div id={tooltipContainerId} className="d-inline">
          <KeyFill className={cx("bi", "ms-1")} />
          <ExclamationTriangleFill
            className={cx("bi", "ms-1", "text-warning")}
          />
        </div>
        <UncontrolledTooltip placement="top" target={tooltipContainerId}>
          <span>
            The value for this field is stored as a secret. Use the credentials
            dialog to change or clear the value.
          </span>
        </UncontrolledTooltip>
      </label>

      <Controller
        name={option.name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <input
            {...field}
            id={option.name}
            readOnly={true}
            type="text"
            className={cx("form-control", "rounded-0", "rounded-start")}
            placeholder={option.convertedDefault?.toString() ?? ""}
            onChange={() => {}}
          />
        )}
      />
    </>
  );
}

interface InputOptionItemProps {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  defaultValue: string | number | undefined;
  inputType: "dropdown" | "number" | "text";
  onFieldValueChange: (option: string, value: string | number) => void;
  option: CloudStorageSchemaOptions;
}
function InputOptionItem({
  control,
  defaultValue,
  inputType,
  onFieldValueChange,
  option,
}: InputOptionItemProps) {
  const additionalProps: Record<string, string> = {
    ...(inputType === "dropdown" ? { list: `${option.name}__list` } : {}),
  };
  return (
    <>
      <label htmlFor={option.name}>{option.friendlyName ?? option.name}</label>

      <Controller
        name={option.name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => {
          return (
            <>
              <input
                {...field}
                id={option.name}
                type={inputType}
                className="form-control"
                placeholder={
                  option.convertedDefault
                    ? option.convertedDefault?.toString()
                    : inputType === "dropdown"
                    ? option.filteredExamples[0].value
                    : ""
                }
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange(
                    option.name,
                    inputType === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value
                  );
                }}
                {...additionalProps}
              />
              {inputType === "dropdown" && option.filteredExamples.length && (
                <datalist id={`${option.name}__list`}>
                  {option.filteredExamples?.map((e) => (
                    <option
                      key={`${option.name}__list__${e.value}`}
                      value={e.value}
                    />
                  ))}
                </datalist>
              )}
            </>
          );
        }}
      />
    </>
  );
}

// *** Add storage: page 1 of 3, with storage type and provider *** //

export function AddStorageType({
  schema,
  state,
  storage,
  setState,
  setStorage,
  isV2,
}: AddStorageStepProps) {
  const providerRef: RefObject<HTMLDivElement> = useRef(null);
  const scrollToProvider = () => {
    setTimeout(() => {
      if (!providerRef.current) return;
      providerRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const availableSchema = useMemo(
    () => getSchemaStorage(schema, !state.showAllSchema, storage.schema),
    [schema, state.showAllSchema, storage.schema]
  );
  const setFinalSchema = (value: string) => {
    setStorage({ schema: value });
    if (state.showAllSchema) setState({ showAllSchema: false });
    hasProviderShortlist(value) && scrollToProvider();
  };

  const schemaItems = availableSchema.map((s, index) => {
    const topBorder = index === 0 && !isV2 ? "rounded-top-3" : null;
    const itemActive =
      s.prefix === storage.schema ? styles.listGroupItemActive : null;
    return (
      <ListGroupItem
        action
        className={cx("cursor-pointer", topBorder, itemActive)}
        key={s.name}
        value={s.prefix}
        tag="div"
        onClick={() => setFinalSchema(s.prefix)}
        data-cy={`data-storage-${s.prefix}`}
      >
        <p className="mb-0">
          <b>{s.name}</b>
          <br />
          <small>{s.description}</small>
        </p>
      </ListGroupItem>
    );
  });
  const finalSchemaItems = [
    isV2 && (
      <ListGroupItem
        action
        disabled
        className={cx("cursor-pointer", "rounded-top-3")}
        key="_Zenodo"
        tag="div"
      >
        <div
          className={cx("d-flex", "justify-content-between", "fw-bold", "py-2")}
        >
          Zenodo
          <Badge
            pill
            className={cx(
              "fst-italic",
              "text-warning-emphasis",
              "bg-warning-subtle",
              "border",
              "border-warning",
              "alert-warning",
              "opacity-50"
            )}
            title="coming soon"
          >
            {" "}
            coming soon{" "}
          </Badge>
        </div>
      </ListGroupItem>
    ),
    ...schemaItems,
    <ListGroupItem
      action
      className={cx("cursor-pointer", "rounded-bottom-3")}
      key="_show_all"
      tag="div"
      onClick={() => setState({ showAllSchema: !state.showAllSchema })}
    >
      <b>Show {state.showAllSchema ? "less" : "more"}</b>
    </ListGroupItem>,
  ];

  const missingSchema =
    storage.schema && !schema?.find((s) => s.prefix === storage.schema) ? (
      <WarnAlert>
        The storage type <code>{storage.schema}</code> might be invalid. You
        should select a valid storage from the list.
      </WarnAlert>
    ) : null;

  const finalSchema = (
    <div className="mt-3" data-cy="cloud-storage-edit-schema">
      {!isV2 && (
        <>
          <h5>Storage type</h5>
          <p>
            Pick a storage from this list to start our guided procedure. You can
            switch to the Advanced mode if you prefer to manually configure the
            storage using an rclone configuration.
          </p>
        </>
      )}
      {missingSchema}
      <ListGroup
        className={cx("bg-white", "rounded-3", "border", "border-rk-green")}
      >
        {finalSchemaItems}
      </ListGroup>
    </div>
  );

  const setFinalProvider = (value: string) => {
    setStorage({ provider: value });
    if (state.showAllProviders) setState({ showAllProviders: false });
  };

  const availableProviders = useMemo(
    () =>
      getSchemaProviders(
        schema,
        !state.showAllProviders,
        storage.schema,
        storage.provider
      ),
    [schema, state.showAllProviders, storage.schema, storage.provider]
  );
  const providerHasShortlist = useMemo(
    () => hasProviderShortlist(storage.schema),
    [storage.schema]
  );
  const providerItems = availableProviders
    ? availableProviders.map((p, index) => {
        const topBorder = index === 0 ? "rounded-top-3" : null;
        const bottomBorder =
          index === availableProviders.length - 1 && !providerHasShortlist
            ? "rounded-bottom-3"
            : null;
        const itemActive =
          p.name === storage.provider ? styles.listGroupItemActive : null;
        return (
          <ListGroupItem
            action
            className={cx(
              "cursor-pointer",
              topBorder,
              bottomBorder,
              itemActive
            )}
            key={p.name}
            tag="div"
            value={p.name}
            data-cy={`data-provider-${p.name}`}
            onClick={() => setFinalProvider(p.name)}
          >
            <p className="mb-0">
              <b>{p.name}</b>
              <br />
              <small>{p.description}</small>
            </p>
          </ListGroupItem>
        );
      })
    : null;
  const finalProviderItems =
    providerItems && providerHasShortlist
      ? [
          ...providerItems,
          <ListGroupItem
            action
            className={cx("cursor-pointer", "rounded-bottom-3")}
            key="_show_all"
            tag="div"
            onClick={() =>
              setState({ showAllProviders: !state.showAllProviders })
            }
          >
            <b>Show {state.showAllProviders ? "less" : "more"}</b>
          </ListGroupItem>,
        ]
      : providerItems;

  const missingProvider =
    availableProviders &&
    storage.provider &&
    !availableProviders.find((p) => p.name === storage.provider) ? (
      <WarnAlert>
        The storage provider <code>{storage.provider}</code> might be invalid.
        You should select a valid provider from the list.
      </WarnAlert>
    ) : null;

  const finalProviders = providerItems ? (
    <div className="mt-3" data-cy="cloud-storage-edit-providers">
      <h5>Provider</h5>
      <p>
        We support the following providers for this storage type. If you do not
        find yours, you can select Others to manually specify the required
        options, or switch to the Advanced mode to manually configure the
        storage using an rclone configuration.
      </p>
      {missingProvider}
      <div ref={providerRef}>
        <ListGroup
          className={cx("bg-white", "rounded-3", "border", "border-rk-green")}
        >
          {finalProviderItems}
        </ListGroup>
      </div>
    </div>
  ) : null;

  return (
    <>
      {finalSchema}
      {finalProviders}
    </>
  );
}

// *** Add storage: page 2 of 3, with storage options *** //
export function AddStorageOptions({
  isV2,
  schema,
  setState,
  setStorage,
  state,
  storage,
  storageSecrets,
}: AddStorageStepProps) {
  const options = getSchemaOptions(
    schema,
    !state.showAllOptions,
    storage.schema,
    storage.provider
  );
  const { control, setValue, getValues } = useForm();

  const onFieldValueChange = (
    option: string,
    value: string | number | boolean
  ) => {
    setValue(option, value);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sourcePath, ...validOptions } = getValues();
    setStorage({ options: validOptions });
  };

  const optionItems =
    options &&
    options.map((o) => {
      const inputType = !o.convertedType
        ? "text"
        : o.convertedType === "secret"
        ? "password"
        : o.convertedType === "boolean"
        ? "checkbox"
        : o.convertedType === "number"
        ? "number"
        : o.filteredExamples?.length
        ? "dropdown"
        : "text";

      return (
        <div className="mb-3" key={o.name}>
          {inputType === "checkbox" ? (
            <CheckboxOptionItem
              control={control}
              defaultValue={
                storage.options && storage.options[o.name]
                  ? (storage.options[o.name] as boolean)
                  : (o.convertedDefault as boolean) ?? undefined
              }
              onFieldValueChange={onFieldValueChange}
              option={o}
            />
          ) : inputType === "password" ? (
            <PasswordOptionItem
              control={control}
              defaultValue={
                storage.options && storage.options[o.name]
                  ? (storage.options[o.name] as string)
                  : ""
              }
              isV2={isV2}
              onFieldValueChange={onFieldValueChange}
              option={o}
              storageSecrets={storageSecrets}
            />
          ) : (
            <InputOptionItem
              control={control}
              defaultValue={
                storage.options && storage.options[o.name]
                  ? (storage.options[o.name] as string | number | undefined)
                  : ""
              }
              inputType={inputType}
              onFieldValueChange={onFieldValueChange}
              option={o}
            />
          )}
          <div className={cx("form-text", "text-muted")}>
            <OptionTruncatedText text={o.help} />
          </div>
        </div>
      );
    });

  const advancedOptions = options && (
    <>
      <div className={cx("form-check", "form-switch", "mb-3", "d-flex")}>
        <Input
          className={cx("form-check-input", "rounded-pill", "my-auto", "me-2")}
          checked={state.showAllOptions}
          id="switch-storage-advanced-mode"
          onChange={() => setState({ showAllOptions: !state.showAllOptions })}
          role="switch"
          type="checkbox"
        />
        <Label
          className={cx("form-check-label", "my-auto")}
          for="addCloudStorageAdvancedSwitch"
        >
          Show full options list{" "}
        </Label>
      </div>
    </>
  );

  const onSourcePathChange = (value: string) => {
    setValue("sourcePath", value);
    setStorage({ sourcePath: value });
  };

  const sourcePathHelp = useMemo(() => {
    return getSourcePathHint(storage.schema);
  }, [storage.schema]);

  const sourcePath = (
    <div className="mb-3">
      <Label className="form-label" for="sourcePath">
        Source path
      </Label>

      <Controller
        name="sourcePath"
        control={control}
        defaultValue={storage.sourcePath || ""}
        render={({ field }) => (
          <input
            id="sourcePath"
            type="string"
            {...field}
            className="form-control"
            onChange={(e) => {
              field.onChange(e);
              onSourcePathChange(e.target.value);
            }}
            placeholder={sourcePathHelp.placeholder}
          />
        )}
      />
      <div className={cx("form-text", "text-muted")}>{sourcePathHelp.help}</div>
    </div>
  );

  return (
    <form className="form-rk-green" data-cy="cloud-storage-edit-options">
      <h5>Options</h5>
      <p>
        Please fill in all the options required to connect to your storage. Mind
        that the specific fields required depend on your storage configuration.
      </p>
      {sourcePath}
      {optionItems}
      {advancedOptions}
    </form>
  );
}

// *** Add storage: page 3 of 3, with name and mount path *** //

export interface AddStorageMountForm {
  name: string;
  mountPoint: string;
  readOnly: boolean;
  saveCredentials: boolean;
}
type AddStorageMountFormFields =
  | "name"
  | "mountPoint"
  | "readOnly"
  | "saveCredentials";
export function AddStorageMount({
  isV2,
  schema,
  setStorage,
  setState,
  storage,
  state,
  validationSucceeded,
}: AddStorageStepProps) {
  const {
    control,
    formState: { errors, touchedFields },
    setValue,
    getValues,
  } = useForm<AddStorageMountForm>({
    mode: "onChange",
    defaultValues: {
      name: storage.name || "",
      mountPoint:
        storage.mountPoint ||
        `external_storage/${storage.schema?.toLowerCase()}`,
      readOnly: storage.readOnly ?? false,
      saveCredentials: state.saveCredentials,
    },
  });
  const onFieldValueChange = useCallback(
    (field: AddStorageMountFormFields, value: string | boolean) => {
      setValue(field, value);
      if (field === "name" && !touchedFields.mountPoint && !storage.storageId)
        setValue("mountPoint", `external_storage/${value}`);
      if (field === "saveCredentials") {
        if (isV2) {
          setState({ saveCredentials: !!value });
          return;
        }
      }
      setStorage({ ...getValues() });
    },
    [
      getValues,
      isV2,
      setState,
      setStorage,
      storage.storageId,
      setValue,
      touchedFields.mountPoint,
    ]
  );

  const options = getSchemaOptions(
    schema,
    true,
    storage.schema,
    storage.provider
  );
  const secretFields =
    options == null
      ? []
      : Object.values(options).filter((o) => o && o.convertedType === "secret");
  const hasPasswordFieldWithInput = secretFields.some(
    (o) => storage.options && storage.options[o.name]
  );

  return (
    <form className="form-rk-green" data-cy="cloud-storage-edit-mount">
      <h5>Final details</h5>
      <p>We need a few more details to mount your storage properly.</p>

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
          rules={{
            // TODO: check this won't create a duplicate
            validate: (value) =>
              !value
                ? "Please provide a name"
                : /^[a-zA-Z0-9_-]+$/.test(value) ||
                  "Name can only contain letters, numbers, underscores (_), and dashes (-)",
          }}
        />
        <div className="invalid-feedback">
          {errors.name?.message?.toString()}
        </div>
        <div className={cx("form-text", "text-muted")}>
          This name will help you identify the storage. It should be unique for
          this project and can only contain letters, numbers, _, -.
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
              checked={storage.readOnly ?? false}
            />
          )}
          rules={{ required: true }}
        />
        {!storage.readOnly && (
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

      {storage.storageId == null &&
        isV2 &&
        hasPasswordFieldWithInput &&
        validationSucceeded && (
          <AddStorageMountSaveCredentialsInfo
            control={control}
            onFieldValueChange={onFieldValueChange}
            state={state}
          />
        )}
    </form>
  );
}

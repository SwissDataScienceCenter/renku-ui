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
import { RefObject, useCallback, useMemo, useRef, useState } from "react";
import {
  ExclamationTriangleFill,
  EyeFill,
  EyeSlashFill,
  Key,
  QuestionCircle,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Input,
  InputGroup,
  Label,
  ListGroup,
  ListGroupItem,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

import { Loader } from "../../../../components/Loader";
import { CLOUD_STORAGE_TOTAL_STEPS } from "./projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageSchema,
  CloudStorageSchemaOptions,
} from "./projectCloudStorage.types";
import {
  getSchemaOptions,
  getSchemaProviders,
  getSchemaStorage,
  getSourcePathHint,
  hasProviderShortlist,
} from "../../utils/projectCloudStorage.utils";

import styles from "./AddCloudStorageButton.module.scss";

interface AddCloudStorageProps {
  error?: FetchBaseQueryError | SerializedError;
  fetching: boolean;
  schema?: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
}

export default function AddCloudStorage({
  error,
  fetching,
  schema,
  setStorage,
  setState,
  state,
  storage,
}: AddCloudStorageProps) {
  if (error)
    return <h2 className="text-bg-danger">Error - add proper Alert</h2>;
  if (fetching) return <Loader />;

  const ContentByStep =
    state.step >= 1 && state.step <= 6 ? mapStepToElement[state.step] : null;

  if (ContentByStep)
    return (
      <>
        <AddStorageAdvancedToggle state={state} setState={setState} />
        <AddStorageBreadcrumbNavbar state={state} setState={setState} />
        <ContentByStep
          schema={schema as CloudStorageSchema[]} // ? the `loading` variable makes sure it's never undefined
          state={state}
          storage={storage}
          setState={setState}
          setStorage={setStorage}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}

// *** Navigation: breadcrumbs and advanced mode selector *** //

interface AddStorageBreadcrumbNavbarProps {
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
}

function AddStorageBreadcrumbNavbar({
  setState,
  state,
}: AddStorageBreadcrumbNavbarProps) {
  const { step, completedSteps } = state;
  const items = useMemo(() => {
    const steps = Array.from(
      { length: CLOUD_STORAGE_TOTAL_STEPS },
      (_, index) => index + 1
    );
    const items = steps.map((stepNumber) => {
      const active = stepNumber === step;
      const disabled = stepNumber > completedSteps + 1;
      return (
        <BreadcrumbItem active={active} key={stepNumber}>
          <Button
            className={cx(
              "p-0",
              `${active || disabled ? "text-decoration-none" : ""}`
            )}
            color="link"
            disabled={disabled}
            onClick={() => {
              setState({ step: stepNumber });
            }}
          >
            {mapStepToName[stepNumber]}
          </Button>
        </BreadcrumbItem>
      );
    });
    return items;
  }, [completedSteps, setState, step]);

  return <Breadcrumb>{items}</Breadcrumb>;
}

interface AddStorageAdvancedToggleProps {
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
}
function AddStorageAdvancedToggle({
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
        <div className={cx("form-check", "form-switch", "mb-3", "d-flex")}>
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
        Advanced mode uses <code>rclone</code> configurations to set up cloud
        storage.
      </UncontrolledTooltip>
    </>
  );
}

// TODO: re-add and adjust the "Advanced mode" section
// TODO: remember to add the logic to preserve current values; warning on unknown options?

// *** Add storage: helpers *** //

interface AddStorageStepProps {
  schema: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
}

const mapStepToElement: {
  [key: number]: React.ComponentType<AddStorageStepProps>;
} = {
  1: AddStorageType,
  2: AddStorageOptions,
  3: AddStorageMount,
};
const mapStepToName: { [key: number]: string } = {
  1: "Storage",
  2: "Options",
  3: "Mount",
};

// *** Add storage: page 1 of 3, with storage type and provider *** //

function AddStorageType({
  schema,
  state,
  storage,
  setState,
  setStorage,
}: AddStorageStepProps) {
  const providerRef: RefObject<HTMLDivElement> = useRef(null);
  if (!schema) return null;

  const scrollToProvider = () => {
    setTimeout(() => {
      if (!providerRef.current) return;
      providerRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // TODO: useMemo
  const availableSchema = getSchemaStorage(
    schema,
    !state.showAllSchema,
    storage.schema
  );
  const setFinalSchema = (value: string) => {
    setStorage({ schema: value });
    if (state.showAllSchema) setState({ showAllSchema: false });
    hasProviderShortlist(value) && scrollToProvider();
  };

  const schemaItems = availableSchema.map((s, index) => {
    const topBorder = index === 0 ? "rounded-top-3" : null;
    const itemActive =
      s.prefix === storage.schema ? styles.listGroupItemActive : null;
    return (
      <ListGroupItem
        action
        className={cx("cursor-pointer", topBorder, itemActive)}
        key={s.name}
        value={s.prefix}
        tag="div"
        onClick={() => setFinalSchema(s.prefix as string)}
      >
        <p className="mb-0">
          <b>{s.name}</b>
          <br />
          {/* // TODO: fix description, it should be expandable */}
          <small>{s.description ? s.description.substring(0, 60) : ""}</small>
        </p>
      </ListGroupItem>
    );
  });
  const finalSchemaItems = [
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
  const finalSchema = (
    <div className="mt-3">
      <h5>Storage type</h5>
      <p>
        Pick a storage from this list to start our guided procedure. You can
        switch to the Advanced mode if you prefer to manually configure the
        storage using an rclone configuration.
      </p>
      <ListGroup className={cx("bg-white", "rounded-3", styles.listGroup)}>
        {finalSchemaItems}
      </ListGroup>
    </div>
  );

  const setFinalProvider = (value: string) => {
    setStorage({ provider: value });
    if (state.showAllProviders) setState({ showAllProviders: false });
  };

  // TODO: useMemo
  const availableProviders = getSchemaProviders(
    schema,
    !state.showAllProviders,
    storage.schema,
    storage.provider
  );
  const providerItems = availableProviders
    ? availableProviders.map((p, index) => {
        const topBorder = index === 0 ? "rounded-top-3" : null;
        const bottomBorder =
          index === availableProviders.length - 1 &&
          !hasProviderShortlist(storage.schema)
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
            onClick={() => setFinalProvider(p.name)}
          >
            <p className="mb-0">
              <b>{p.name}</b>
              <br />
              <small>
                {p.description ? p.description.substring(0, 60) : ""}
              </small>
            </p>
          </ListGroupItem>
        );
      })
    : null;
  const finalProviderItems =
    providerItems && hasProviderShortlist(storage.schema)
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
  const finalProviders = providerItems ? (
    <div className="mt-3">
      <h5>Provider</h5>
      <p>
        We support the following providers for this storage type. If you do not
        find yours, you can select Others to manually specify the required
        options, or switch to the Advanced mode to manually configure the
        storage using an rclone configuration.
      </p>
      <div ref={providerRef}>
        <ListGroup className={cx("bg-white", "rounded-3", styles.listGroup)}>
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

interface AddStorageOptionsExamplesProps {
  examples: CloudStorageSchemaOptions["examples"];
  name: string;
  provider?: string;
}
function AddStorageOptionsExamples({
  examples,
  name,
  provider,
}: AddStorageOptionsExamplesProps) {
  // TODO: We should use examples as enum, or items in an autocomplete. But sometimes we get just "None" 🥴
  if (!examples?.length) return null;
  const filterExamples = provider
    ? examples.filter((e) => !e.provider || e.provider === provider)
    : examples;
  if (!filterExamples?.length) return null;

  const popoverId = `popover-${name}`;
  const exampleItems = filterExamples.map((e) => {
    return (
      <li className="mb-1" key={e.value}>
        <code>{e.value}</code>
        <br />
        <small>{e.help}</small>
      </li>
    );
  });

  return (
    <>
      <QuestionCircle id={popoverId} className={cx("bi", "ms-1")} />
      <UncontrolledPopover
        target={popoverId}
        placement="right"
        style={{ maxHeight: "98vh", overflow: "auto" }} // eslint-disable-line spellcheck/spell-checker
        trigger="hover focus"
      >
        <PopoverHeader>Examples</PopoverHeader>
        <PopoverBody>
          <ul>{exampleItems}</ul>
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

interface SecretOptionWarningProps {
  isSecret?: boolean;
  name: string;
}
function SecretOptionWarning({
  isSecret = true,
  name,
}: SecretOptionWarningProps) {
  if (!isSecret) return null;
  const id = `option-is-secret-${name}`;
  return (
    <>
      <div id={id} className="d-inline">
        <Key className={cx("bi", "ms-1")} />
        <ExclamationTriangleFill className={cx("bi", "ms-1", "text-warning")} />
      </div>
      <UncontrolledTooltip placement="top" target={id}>
        This field contains sensitive data (E.G. password, access token, ...).
        We currently cannot store it safely, so you might be asked this value
        again when starting a session.
      </UncontrolledTooltip>
    </>
  );
}

function AddStorageOptions({
  schema,
  setState,
  setStorage,
  state,
  storage,
}: AddStorageStepProps) {
  const options = getSchemaOptions(
    schema,
    !state.showAllOptions,
    storage.schema,
    storage.provider
  );

  const [showPassword, setShowPassword] = useState<string[]>([]);
  const getPasswordType = (name: string) => {
    return showPassword.includes(name) ? "text" : "password";
  };
  const swapShowPassword = (name: string) => {
    setShowPassword((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      return [...prev, name];
    });
  };

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

  if (!options) return null;

  const optionItems = options.map((o) => {
    const inputType = !o.convertedType
      ? "text"
      : o.convertedType === "secret"
      ? "password"
      : o.convertedType === "boolean"
      ? "checkbox"
      : o.convertedType === "number"
      ? "number"
      : "text";

    const placeholder = o.examples?.length
      ? o.examples[0].value
        ? o.examples[0].value
        : undefined
      : undefined;

    const examples = (
      <AddStorageOptionsExamples
        examples={o.examples}
        name={o.name}
        provider={storage.provider}
      />
    );

    const warning =
      o.convertedType === "secret" ? (
        <SecretOptionWarning name={o.name} />
      ) : null;

    return (
      <div className="mb-3" key={o.name}>
        <label htmlFor={o.name}>
          {o.friendlyName ?? o.name} {examples} {warning}
        </label>

        {inputType === "checkbox" ? (
          <Controller
            name={o.name}
            control={control}
            defaultValue={o.convertedDefault ?? undefined}
            render={({ field }) => (
              <input
                id={o.name}
                type={inputType}
                {...field}
                className="form-check-input ms-1"
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange(o.name, e.target.checked);
                }}
              />
            )}
          />
        ) : inputType === "password" ? (
          <InputGroup>
            <Controller
              name={o.name}
              control={control}
              defaultValue={o.convertedDefault ?? ""}
              render={({ field }) => (
                <input
                  id={o.name}
                  type={getPasswordType(o.name)}
                  {...field}
                  className={cx("form-control", "rounded-0", "rounded-start")}
                  placeholder={placeholder}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldValueChange(o.name, e.target.value);
                  }}
                />
              )}
            />
            <Button
              className="rounded-end"
              id={`show-password-${o.name}`}
              onClick={() => swapShowPassword(o.name)}
            >
              {getPasswordType(o.name) === "password" ? (
                <EyeSlashFill className={cx("bi")} />
              ) : (
                <EyeFill className={cx("bi")} />
              )}
              <UncontrolledTooltip
                placement="top"
                target={`show-password-${o.name}`}
              >
                Hide/show sensistive data
              </UncontrolledTooltip>
            </Button>
          </InputGroup>
        ) : (
          <Controller
            name={o.name}
            control={control}
            defaultValue={o.convertedDefault ?? ""}
            render={({ field }) => (
              <input
                id={o.name}
                type={inputType}
                {...field}
                className="form-control"
                placeholder={placeholder}
                onChange={(e) => {
                  field.onChange(e);
                  onFieldValueChange(o.name, e.target.value);
                }}
              />
            )}
          />
        )}
        <div className="form-text text-muted">{o.help}</div>
      </div>
    );
  });

  const advancedOptions = (
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

  const sourcePath = (
    <div className="mb-3">
      <Label className="form-label" for="add-storage-name">
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
          />
        )}
      />
      <div className="form-text text-muted">
        {getSourcePathHint(storage.schema)}
      </div>
    </div>
  );

  return (
    <form className="form-rk-green">
      {sourcePath}
      {optionItems}
      {advancedOptions}
    </form>
  );
}

// *** Add storage: page 3 of 3, with name and mount path *** //

function AddStorageMount({ setStorage, storage }: AddStorageStepProps) {
  const {
    control,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm();

  // TODO: add read-only option (if necessary)

  const onFieldValueChange = (field: string, value: string) => {
    setValue(field, value);
    setStorage({ ...getValues() });
    trigger(field);
  };

  return (
    <form className="form-rk-green">
      <div className="mb-3">
        <Label className="form-label" for="add-storage-name">
          Name
        </Label>

        <Controller
          name="name"
          control={control}
          defaultValue={storage.name || ""}
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
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a name</div>
        <div className="form-text text-muted">
          This name will help you identify the storage. It should be unique for
          this project and it can only contains letter, numbers, $, _.
        </div>
      </div>

      <div className="mb-3">
        <Label className="form-label" for="add-storage-name">
          Mount point
        </Label>

        <Controller
          name="mountPoint"
          control={control}
          defaultValue={storage.mountPoint || ""}
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
        <div className="form-text text-muted">
          This is the name of the folder where you will find your external
          storage in the sessions. You should pick something different from the
          folders used in the projects repository.
        </div>
      </div>
    </form>
  );
}

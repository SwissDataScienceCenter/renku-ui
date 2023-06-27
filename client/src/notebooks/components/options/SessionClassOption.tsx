/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useCallback, useEffect, useMemo } from "react";
import cx from "classnames";
import { ChevronDown } from "react-bootstrap-icons";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import Select, {
  ClassNamesConfig,
  GroupBase,
  OptionProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
  components,
} from "react-select";
import { Col, FormGroup, Label } from "reactstrap";
import { ErrorAlert, WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import {
  ResourceClass,
  ResourcePool,
} from "../../../features/dataServices/dataServices";
import { useGetResourcePoolsQuery } from "../../../features/dataServices/dataServicesApi";
import {
  setSessionClass,
  reset,
  useStartSessionOptionsSelector,
} from "../../../features/session/startSessionOptionsSlice";
import styles from "./SessionClassOption.module.scss";
import {
  ProjectConfig,
  StateModelProject,
} from "../../../features/project/Project";
import { useCoreSupport } from "../../../features/project/useProjectCoreSupport";
import { useGetConfigQuery } from "../../../features/project/projectCoreApi";
import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const SessionClassOption = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Project options
  const { defaultBranch, externalUrl: projectRepositoryUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const { data: projectConfig } = useGetConfigQuery(
    {
      projectRepositoryUrl,
      versionUrl,
      // ...(branchName ? { branch: branchName } : {}),
    },
    { skip: !coreSupportComputed }
  );

  // Resource pools
  const enableFakeResourcePools = !!searchParams.get("useFakeResourcePools");

  const {
    data: realResourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery(
    {
      cpuRequest: projectConfig?.config.sessions?.legacyConfig?.cpuRequest,
      gpuRequest: projectConfig?.config.sessions?.legacyConfig?.gpuRequest,
      memoryRequest:
        projectConfig?.config.sessions?.legacyConfig?.memoryRequest,
      storageRequest: projectConfig?.config.sessions?.storage,
    },
    { skip: enableFakeResourcePools || !projectConfig }
  );

  const resourcePools = enableFakeResourcePools
    ? fakeResourcePools
    : realResourcePools;

  const defaultSessionClass = useMemo(
    () =>
      resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  const { sessionClass: currentSessionClassId } =
    useStartSessionOptionsSelector();
  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == currentSessionClassId),
    [currentSessionClassId, resourcePools]
  );

  const dispatch = useDispatch();

  // Reset session class when we navigate away
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Set initial session class
  useEffect(() => {
    if (projectConfig == null || resourcePools == null) {
      return;
    }
    console.log({ projectConfig });
    // const sessionClassIdFromConfig =
    //   projectConfig.config.sessions?.sessionClass ??
    //   projectConfig.default.sessions?.sessionClass;
    const initialSessionClassId =
      // resourcePools
      //   ?.flatMap((pool) => pool.classes)
      //   .find((c) => c.id == sessionClassIdFromConfig)?.id ??
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id)?.id ?? 0;
    dispatch(setSessionClass(initialSessionClassId));
  }, [defaultSessionClass?.id, dispatch, projectConfig, resourcePools]);

  const onChange = useCallback(
    (newValue: SingleValue<ResourceClass>) => {
      if (newValue?.id) {
        dispatch(setSessionClass(newValue?.id));
      }
    },
    [dispatch]
  );

  if (isLoading) {
    return (
      <Col xs={12}>
        Fetching available resource pools... <Loader size={16} inline />
      </Col>
    );
  }

  if (!resourcePools || resourcePools.length == 0 || isError) {
    return (
      <Col xs={12}>
        <ErrorAlert dismissible={false}>
          <h3 className={cx("fs-6", "fw-bold")}>
            Error on loading available session resource pools
          </h3>
          <p className="mb-0">
            You can still attempt to launch a session, but the operation may not
            be successful.
          </p>
        </ErrorAlert>
      </Col>
    );
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Session class</Label>
        <SessionRequirements
          projectConfig={projectConfig}
          resourcePools={resourcePools}
        />
        <SessionClassSelector
          resourcePools={resourcePools}
          currentSessionClass={currentSessionClass}
          defaultSessionClass={defaultSessionClass}
          onChange={onChange}
        />
      </FormGroup>
    </Col>
  );
};

interface SessionRequirementsProps {
  projectConfig: ProjectConfig | undefined;
  resourcePools: ResourcePool[];
}

function SessionRequirements({
  projectConfig,
  resourcePools,
}: SessionRequirementsProps) {
  if (!projectConfig) {
    return null;
  }

  const cpuRequest = projectConfig?.config.sessions?.legacyConfig?.cpuRequest;
  const memoryRequest =
    projectConfig?.config.sessions?.legacyConfig?.memoryRequest;
  const storageRequest = projectConfig?.config.sessions?.storage;
  const gpuRequest = projectConfig?.config.sessions?.legacyConfig?.gpuRequest;

  if (!cpuRequest && !memoryRequest && !storageRequest && !gpuRequest) {
    return null;
  }

  const noMatchingClass = !resourcePools
    .flatMap((pool) => pool.classes)
    .some((c) => c.matches);

  return (
    <>
      <div
        className={cx("d-flex", "flex-row", "flex-wrap", styles.requirements)}
      >
        <span className="me-3">Session requirements:</span>
        {cpuRequest && (
          <>
            {" "}
            <span className="me-3">{cpuRequest} CPUs</span>
          </>
        )}
        {memoryRequest && (
          <>
            {" "}
            <span className="me-3">{memoryRequest} GB RAM</span>
          </>
        )}
        {storageRequest && (
          <>
            {" "}
            <span className="me-3">{storageRequest} GB Disk</span>
          </>
        )}
        {gpuRequest && (
          <>
            {" "}
            <span>{gpuRequest} GPUs</span>
          </>
        )}
      </div>
      {noMatchingClass && (
        <WarnAlert className="mb-1">
          <p className="mb-0">
            It seems that no session class you have access to can match the
            compute requirements to launch a session
          </p>
        </WarnAlert>
      )}
    </>
  );
}

interface SessionClassSelectorProps {
  resourcePools: ResourcePool[];
  currentSessionClass?: ResourceClass | undefined;
  defaultSessionClass?: ResourceClass | undefined;
  onChange?: (newValue: SingleValue<ResourceClass>) => void;
  disabled?: boolean;
}

export const SessionClassSelector = ({
  resourcePools,
  currentSessionClass,
  defaultSessionClass,
  onChange,
  disabled,
}: SessionClassSelectorProps) => {
  const options = useMemo(
    () => makeGroupedOptions(resourcePools),
    [resourcePools]
  );

  return (
    <Select
      options={options}
      value={currentSessionClass}
      defaultValue={defaultSessionClass}
      getOptionValue={(option) => `${option.id}`}
      getOptionLabel={(option) => option.name}
      onChange={onChange}
      isDisabled={disabled}
      isClearable={false}
      isSearchable={false}
      unstyled
      classNames={selectClassNames}
      components={selectComponents}
      // for dev
      // menuIsOpen
    />
  );
};

interface OptionGroup extends GroupBase<ResourceClass> {
  label: string;
  pool: ResourcePool;
  options: readonly ResourceClass[];
}

const makeGroupedOptions = (resourcePools: ResourcePool[]): OptionGroup[] =>
  resourcePools.map((pool) => ({
    label: pool.name,
    pool,
    options: pool.classes,
  }));

const selectClassNames: ClassNamesConfig<ResourceClass, false, OptionGroup> = {
  control: ({ menuIsOpen }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "border",
      "py-2",
      styles.control,
      menuIsOpen && styles.controlIsOpen
    ),
  dropdownIndicator: () => cx("pe-3"),
  groupHeading: () => cx("pt-1", "px-3", "text-uppercase", styles.groupHeading),
  menu: () =>
    cx("rounded-bottom", "border", "border-top-0", "px-0", "py-2", styles.menu),
  menuList: () => cx("d-grid", "gap-2"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-grid",
      "gap-1",
      "px-3",
      "py-1",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () => cx("d-grid", "gap-1", "px-3", styles.singleValue),
};

const selectComponents: SelectComponentsConfig<
  ResourceClass,
  false,
  OptionGroup
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown size="20" />
      </components.DropdownIndicator>
    );
  },
  Option: (props: OptionProps<ResourceClass, false, OptionGroup>) => {
    const { data: sessionClass } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent sessionClass={sessionClass} />
      </components.Option>
    );
  },
  SingleValue: (props: SingleValueProps<ResourceClass, false, OptionGroup>) => {
    const { data: sessionClass } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent sessionClass={sessionClass} />
      </components.SingleValue>
    );
  },
};

interface OptionOrSingleValueContentProps {
  sessionClass: ResourceClass;
}

const OptionOrSingleValueContent = ({
  sessionClass,
}: OptionOrSingleValueContentProps) => {
  const labelClassName = cx(
    "text-wrap",
    "text-break",
    styles.label,
    sessionClass.matches && styles.labelMatches
  );
  const detailValueClassName = cx(styles.detail, styles.detailValue);
  const detailLabelClassName = cx(styles.detail, styles.detailLabel);
  return (
    <>
      <span className={labelClassName}>
        <FontAwesomeIcon
          icon={sessionClass.matches ? faCheckCircle : faExclamationTriangle}
          fixedWidth
        />
        {sessionClass.name}
      </span>{" "}
      <span className={detailValueClassName}>{sessionClass.cpu}</span>{" "}
      <span className={detailLabelClassName}>CPUs</span>{" "}
      <span className={detailValueClassName}>{sessionClass.memory}</span>
      <span className={detailLabelClassName}>
        <span className={styles.detailUnit}>GB</span> RAM
      </span>{" "}
      <span className={detailValueClassName}>{sessionClass.max_storage}</span>
      <span className={detailLabelClassName}>
        <span className={styles.detailUnit}>GB</span> Disk
      </span>{" "}
      <span className={detailValueClassName}>{sessionClass.gpu}</span>{" "}
      <span className={detailLabelClassName}>GPUs</span>{" "}
    </>
  );
};

export const fakeResourcePools: ResourcePool[] = [
  {
    id: 1,
    name: "Public pool",
    quota: {
      cpu: 100,
      memory: 1_000,
      gpu: 0,
      storage: 1_000_000,
    },
    classes: [
      {
        id: 1,
        name: "public class 1",
        cpu: 1,
        memory: 1,
        gpu: 0,
        max_storage: 20,
        default_storage: 5,
        default: false,
      },
      {
        id: 2,
        name: "public class 2",
        cpu: 2,
        memory: 2,
        gpu: 0,
        max_storage: 40,
        default_storage: 5,
        default: true,
        matches: false,
      },
    ],
  },
  {
    id: 2,
    name: "Special pool",
    quota: {
      cpu: 200,
      memory: 8_000,
      gpu: 40,
      storage: 10_000_000,
    },
    classes: [
      {
        id: 3,
        name: "special class 1",
        cpu: 2,
        memory: 4,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 4,
        name: "special class 2",
        cpu: 4,
        memory: 8,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 5,
        name: "special class 3",
        cpu: 8,
        memory: 16,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 6,
        name: "special class 4",
        cpu: 8,
        memory: 32,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
    ],
  },
  {
    id: 3,
    name: "Special GPU pool",
    quota: {
      cpu: 200,
      memory: 8_000,
      gpu: 500,
      storage: 10_000_000,
    },
    classes: [
      {
        id: 7,
        name: "High-GPU class 1",
        cpu: 2,
        memory: 4,
        gpu: 4,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 8,
        name: "High-GPU class 2",
        cpu: 4,
        memory: 8,
        gpu: 4,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 9,
        name: "High-GPU class 3",
        cpu: 8,
        memory: 16,
        gpu: 8,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 10,
        name: "High-GPU class 4",
        cpu: 8,
        memory: 32,
        gpu: 8,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
    ],
  },
  {
    id: 4,
    name: "High memory pool",
    quota: {
      cpu: 200,
      memory: 64_000,
      gpu: 40,
      storage: 10_000_000,
    },
    classes: [
      {
        id: 11,
        name: "high-memory class 1",
        cpu: 2,
        memory: 64,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 12,
        name: "high-memory class 2",
        cpu: 4,
        memory: 64,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 13,
        name: "high-memory class 3",
        cpu: 8,
        memory: 128,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
      {
        id: 14,
        name: "high-memory class 4",
        cpu: 8,
        memory: 256,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        default: false,
        matches: false,
      },
    ],
  },
];

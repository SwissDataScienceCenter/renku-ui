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

import { useCallback, useEffect, useMemo } from "react";
import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ChevronDown } from "react-bootstrap-icons";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import Select, {
  ClassNamesConfig,
  GroupBase,
  OptionProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
  components,
} from "react-select";
import { ErrorAlert, WarnAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import {
  ResourceClass,
  ResourcePool,
} from "../../../dataServices/dataServices";
import { useGetResourcePoolsQuery } from "../../../dataServices/dataServicesApi";
import { ProjectConfig } from "../../../project/Project";
import { useCoreSupport } from "../../../project/useProjectCoreSupport";
import usePatchedProjectConfig from "../../hooks/usePatchedProjectConfig.hook";
import {
  setSessionClass,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";
import styles from "./SessionClassOption.module.scss";

export const SessionClassOption = () => {
  // Project options
  const projectRepositoryUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const commit = useStartSessionOptionsSelector(({ commit }) => commit);
  const { data: projectConfig } = usePatchedProjectConfig({
    commit,
    gitLabProjectId: gitLabProjectId ?? 0,
    projectRepositoryUrl,
    versionUrl,
    skip: !coreSupportComputed || !commit,
  });

  // Resource pools
  const {
    data: resourcePools,
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
    { skip: !projectConfig }
  );

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
  const onChange = useCallback(
    (newValue: SingleValue<ResourceClass>) => {
      if (newValue?.id) {
        dispatch(setSessionClass(newValue?.id));
      }
    },
    [dispatch]
  );

  // Set initial session class
  // Order of preference:
  // 1. Default session class if it satisfies the compute requirements
  // 2. The first session class from the default pool which satisfies
  //    the compute requirements
  // 3. The default session class otherwise
  useEffect(() => {
    if (projectConfig == null || resourcePools == null) {
      return;
    }
    const initialSessionClassId =
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id && c.matching)?.id ??
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.matching)?.id ??
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id)?.id ??
      0;
    dispatch(setSessionClass(initialSessionClassId));
  }, [defaultSessionClass?.id, dispatch, projectConfig, resourcePools]);

  if (isLoading) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Fetching available resource pools...
        </div>
      </div>
    );
  }

  if (!resourcePools || resourcePools.length == 0 || isError) {
    return (
      <div className="field-group">
        <ErrorAlert dismissible={false}>
          <h3 className={cx("fs-6", "fw-bold")}>
            Error on loading available session resource pools
          </h3>
          <p className="mb-0">
            You can still attempt to launch a session, but the operation may not
            be successful.
          </p>
        </ErrorAlert>
      </div>
    );
  }

  return (
    <div className="field-group">
      <div className="form-label">Session class</div>
      <SessionRequirements
        currentSessionClass={currentSessionClass}
        resourcePools={resourcePools}
        projectConfig={projectConfig}
      />
      <SessionClassSelector
        resourcePools={resourcePools}
        currentSessionClass={currentSessionClass}
        defaultSessionClass={defaultSessionClass}
        onChange={onChange}
      />
      <SessionClassWarning currentSessionClass={currentSessionClass} />
    </div>
  );
};

interface SessionRequirementsProps {
  currentSessionClass?: ResourceClass | undefined;
  resourcePools: ResourcePool[];
  projectConfig: ProjectConfig | undefined;
}

function SessionRequirements({
  currentSessionClass,
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

  const currentSessionClassNotMatching =
    currentSessionClass?.matching === false;

  const noMatchingClass = !resourcePools
    .flatMap((pool) => pool.classes)
    .some((c) => c.matching);

  return (
    <>
      <div
        className={cx(
          "d-flex",
          "flex-row",
          "flex-wrap",
          styles.requirements,
          currentSessionClassNotMatching && styles.requirementsNotMet
        )}
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

interface SessionClassWarningProps {
  currentSessionClass?: ResourceClass | undefined;
}

function SessionClassWarning({
  currentSessionClass,
}: SessionClassWarningProps) {
  const currentSessionClassNotMatching =
    currentSessionClass?.matching === false;

  if (!currentSessionClassNotMatching) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.requirements,
        currentSessionClassNotMatching && styles.requirementsNotMet
      )}
    >
      <FontAwesomeIcon icon={faExclamationTriangle} /> This session class does
      not match the compute requirements
    </div>
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
    sessionClass.matching && styles.labelMatches
  );
  const detailValueClassName = cx(styles.detail, styles.detailValue);
  const detailLabelClassName = cx(styles.detail, styles.detailLabel);
  return (
    <>
      <span className={labelClassName}>
        <FontAwesomeIcon
          icon={sessionClass.matching ? faCheckCircle : faExclamationTriangle}
          fixedWidth
        />{" "}
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

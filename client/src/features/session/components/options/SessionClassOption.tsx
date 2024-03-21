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

import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { ChevronDown } from "react-bootstrap-icons";
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
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { User } from "../../../../model/renkuModels.types";
import { ProjectStatistics } from "../../../../notebooks/components/session.types";
import AppContext from "../../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../../utils/context/appParams.constants";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetResourcePoolsQuery } from "../../../dataServices/dataServices.api";
import {
  ResourceClass,
  ResourcePool,
} from "../../../dataServices/dataServices.types";
import { ProjectConfig } from "../../../project/project.types";
import { useGetConfigQuery } from "../../../project/projectCoreApi";
import { useCoreSupport } from "../../../project/useProjectCoreSupport";
import { setSessionClass } from "../../startSessionOptionsSlice";
import { computeStorageSizes } from "../../utils/sessionOptions.utils";

import styles from "./SessionClassOption.module.scss";

export const SessionClassOption = () => {
  // Project options
  const projectRepositoryUrl = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );
  const defaultBranch = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const statistics = useLegacySelector<ProjectStatistics | null | undefined>(
    (state) => state.stateModel.project.statistics?.data
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;
  const {
    branch: currentBranch,
    commit,
    lfsAutoFetch,
  } = useAppSelector(({ startSessionOptions }) => startSessionOptions);
  const { data: projectConfig } = useGetConfigQuery(
    backendAvailable && coreSupportComputed && currentBranch && commit
      ? {
          apiVersion,
          metadataVersion,
          projectRepositoryUrl,
          branch: currentBranch,
          commit,
        }
      : skipToken
  );

  // Get storage sizes based on repository statistics
  const { minimumStorageGb, recommendedStorageGb } =
    computeStorageSizes({ lfsAutoFetch, statistics }) ?? {};

  // Resource pools
  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery(
    projectConfig
      ? {
          cpuRequest: projectConfig.config.sessions?.legacyConfig?.cpuRequest,
          gpuRequest: projectConfig.config.sessions?.legacyConfig?.gpuRequest,
          memoryRequest:
            projectConfig.config.sessions?.legacyConfig?.memoryRequest,
          storageRequest:
            projectConfig.config.sessions?.storage ?? minimumStorageGb,
        }
      : skipToken
  );

  const defaultSessionClass = useMemo(
    () =>
      resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  const { sessionClass: currentSessionClassId } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );
  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == currentSessionClassId),
    [currentSessionClassId, resourcePools]
  );

  const dispatch = useAppDispatch();
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

  if (isLoading || !projectConfig) {
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
        minimumStorageGb={minimumStorageGb}
        recommendedStorageGb={recommendedStorageGb}
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
      <AskForComputeResources />
    </div>
  );
};

interface SessionRequirementsProps {
  currentSessionClass?: ResourceClass | undefined;
  minimumStorageGb: number | undefined;
  projectConfig: ProjectConfig | undefined;
  recommendedStorageGb: number | undefined;
  resourcePools: ResourcePool[];
}

function SessionRequirements({
  currentSessionClass,
  minimumStorageGb,
  projectConfig,
  recommendedStorageGb,
  resourcePools,
}: SessionRequirementsProps) {
  if (!projectConfig) {
    return null;
  }

  const cpuRequest = projectConfig?.config.sessions?.legacyConfig?.cpuRequest;
  const memoryRequest =
    projectConfig?.config.sessions?.legacyConfig?.memoryRequest;
  const storageRequest =
    projectConfig?.config.sessions?.storage ?? minimumStorageGb;
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
            <span className="me-3">
              {storageRequest} GB Disk
              {recommendedStorageGb &&
                recommendedStorageGb > storageRequest && (
                  <>
                    {" ("}
                    {recommendedStorageGb} GB recommended{")"}
                  </>
                )}
            </span>
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
            compute requirements to launch a session.
          </p>
        </WarnAlert>
      )}
      {minimumStorageGb &&
        storageRequest &&
        minimumStorageGb > storageRequest && (
          <WarnAlert className="mb-1">
            <p className="mb-0">
              It seems that the configured storage for this project {"("}
              {storageRequest} GB{")"} does not match the size of the repository{" "}
              {"("}
              {minimumStorageGb} GB{")"}.
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

function AskForComputeResources() {
  const { params } = useContext(AppContext);
  const SESSION_CLASS_EMAIL_US =
    params?.SESSION_CLASS_EMAIL_US ??
    DEFAULT_APP_PARAMS["SESSION_CLASS_EMAIL_US"];

  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!SESSION_CLASS_EMAIL_US.enabled) {
    return null;
  }

  const { email } = SESSION_CLASS_EMAIL_US;

  const url = new URL(`mailto:${email.to}`);
  if (email.subject) {
    url.searchParams.set("subject", email.subject);
  }
  if (email.body) {
    const name = (user?.data as { name: string })?.name || "<signature>";
    const renderedBody = email.body.replace(
      /[{][{]full_name[}][}]/g,
      `${name}`
    );
    url.searchParams.set("body", renderedBody);
  }
  const urlStr = url.toString().replace(/[+]/g, "%20");

  return (
    <div className="small">
      Need more compute resources?{" "}
      <ExternalLink role="link" url={urlStr}>
        Email us!
      </ExternalLink>
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

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

import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useMemo } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import Select, {
  ClassNamesConfig,
  components,
  GroupBase,
  GroupHeadingProps,
  MenuListProps,
  OptionProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
} from "react-select";

import {
  type ResourceClassWithIdFiltered,
  type ResourcePoolWithIdFiltered,
} from "~/features/sessionsV2/api/computeResources.api";
import { useGetNotebooksVersionQuery } from "~/features/versions/versions.api";
import { toHumanDuration } from "~/utils/helpers/DurationUtils";

import styles from "./SessionClassSelector.module.scss";

interface SessionClassThresholdsProps {
  currentSessionClass?: ResourceClassWithIdFiltered;
  defaultHibernation?: number;
  defaultIdle?: number;
  resourcePools: ResourcePoolWithIdFiltered[];
}

function SessionClassThresholds({
  currentSessionClass,
  defaultHibernation,
  defaultIdle,
  resourcePools,
}: SessionClassThresholdsProps) {
  const classesThresholds = useMemo(() => {
    return resourcePools.flatMap((pool) =>
      pool.classes.map((c) => ({
        pollId: pool.id,
        classId: c.id,
        idleThreshold: pool.idle_threshold ?? defaultIdle ?? 0,
        hibernationThreshold:
          pool.hibernation_threshold ?? defaultHibernation ?? 0,
      }))
    );
  }, [defaultHibernation, defaultIdle, resourcePools]);

  const currentClassThresholds = useMemo(
    () => classesThresholds.find((c) => c.classId === currentSessionClass?.id),
    [classesThresholds, currentSessionClass]
  );

  if (
    !currentSessionClass ||
    !defaultHibernation ||
    !defaultIdle ||
    !resourcePools.length
  ) {
    return null;
  }

  return (
    <div className="form-text">
      This session will automatically pause after{" "}
      {toHumanDuration({
        duration: currentClassThresholds?.idleThreshold as number,
      })}{" "}
      of inactivity. If not resumed within{" "}
      {toHumanDuration({
        duration: currentClassThresholds?.hibernationThreshold as number,
      })}
      , the session will be deleted.
    </div>
  );
}

interface SessionClassSelectorProps {
  currentSessionClass?: ResourceClassWithIdFiltered | undefined;
  defaultSessionClass?: ResourceClassWithIdFiltered | undefined;
  disabled?: boolean;
  id?: string;
  onChange?: (newValue: SingleValue<ResourceClassWithIdFiltered>) => void;
  resourcePools: ResourcePoolWithIdFiltered[];
}

interface OptionGroup extends GroupBase<ResourceClassWithIdFiltered> {
  label: string;
  pool: ResourcePoolWithIdFiltered;
  maxIdle: string;
  options: readonly ResourceClassWithIdFiltered[];
}

const makeGroupedOptions = (
  resourcePools: ResourcePoolWithIdFiltered[],
  defaultIdleThreshold?: number
): OptionGroup[] =>
  resourcePools.map((pool) => ({
    label: pool.name,
    maxIdle:
      !pool.idle_threshold && !defaultIdleThreshold
        ? ""
        : toHumanDuration({
            duration: pool.idle_threshold ?? (defaultIdleThreshold as number),
          }),
    pool,
    options: pool.classes,
  }));

const SessionClassSelector = ({
  currentSessionClass,
  defaultSessionClass,
  disabled,
  id,
  onChange,
  resourcePools,
}: SessionClassSelectorProps) => {
  const { data: nbVersion } = useGetNotebooksVersionQuery();
  const options = useMemo(
    () =>
      makeGroupedOptions(
        resourcePools,
        nbVersion?.defaultCullingThresholds?.registered.idle
      ),
    [resourcePools, nbVersion]
  );

  return (
    <div data-cy="session-class-select">
      <Select
        id={id}
        classNames={selectClassNamesV2}
        components={selectComponentsV2}
        defaultValue={defaultSessionClass}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => `${option.id}`}
        isClearable={false}
        isDisabled={disabled}
        isSearchable={false}
        onChange={onChange}
        options={options}
        unstyled
        value={currentSessionClass}
      />
      <SessionClassThresholds
        defaultHibernation={
          nbVersion?.defaultCullingThresholds?.registered?.hibernation
        }
        defaultIdle={nbVersion?.defaultCullingThresholds?.registered?.idle}
        currentSessionClass={currentSessionClass}
        resourcePools={resourcePools}
      />
    </div>
  );
};

const selectComponentsV2: SelectComponentsConfig<
  ResourceClassWithIdFiltered,
  false,
  OptionGroup
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="bi" />
      </components.DropdownIndicator>
    );
  },
  Option: (
    props: OptionProps<ResourceClassWithIdFiltered, false, OptionGroup>
  ) => {
    const { data: sessionClass } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent sessionClass={sessionClass} />
      </components.Option>
    );
  },
  SingleValue: (
    props: SingleValueProps<ResourceClassWithIdFiltered, false, OptionGroup>
  ) => {
    const { data: sessionClass } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent sessionClass={sessionClass} />
      </components.SingleValue>
    );
  },
  GroupHeading: (
    props: GroupHeadingProps<ResourceClassWithIdFiltered, false, OptionGroup>
  ) => {
    return (
      <components.GroupHeading {...props}>
        <span className={cx("text-uppercase", "me-1")}>{props.data.label}</span>
        {props.data.maxIdle && (
          <span> (paused after {props.data.maxIdle} of inactivity)</span>
        )}
      </components.GroupHeading>
    );
  },
  MenuList: (
    props: MenuListProps<ResourceClassWithIdFiltered, false, OptionGroup>
  ) => {
    return (
      <components.MenuList
        {...props}
        innerProps={{
          ...props.innerProps,
          onClick: (e) => {
            e.stopPropagation();
          },
        }}
      />
    );
  },
};

const selectClassNamesV2: ClassNamesConfig<
  ResourceClassWithIdFiltered,
  false,
  OptionGroup
> = {
  control: ({ menuIsOpen }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "bg-white",
      "border",
      "cursor-pointer",
      styles.control2
    ),
  dropdownIndicator: () => cx("pe-2"),
  groupHeading: () => cx("px-2", styles.groupHeading),
  menu: () => cx("bg-white", "rounded-bottom", "border", "border-top-0"),
  menuList: () => cx("d-grid", "gap-2"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-grid",
      "gap-1",
      "p-2",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-2"),
  singleValue: () => cx("d-grid", "gap-1", "px-2", styles.singleValue),
};

interface OptionOrSingleValueContentProps {
  sessionClass: ResourceClassWithIdFiltered;
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
      <span className={detailValueClassName}>
        {sessionClass.default_storage}
      </span>
      <span className={detailLabelClassName}>
        <span className={styles.detailUnit}>GB</span> Disk
      </span>{" "}
      <span className={detailValueClassName}>{sessionClass.gpu}</span>{" "}
      <span className={detailLabelClassName}>GPUs</span>{" "}
    </>
  );
};

export default SessionClassSelector;

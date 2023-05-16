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
import { useDispatch } from "react-redux";
import Select, {
  ClassNamesConfig,
  GroupBase,
  SelectComponentsConfig,
  SingleValue,
  components,
} from "react-select";
import { Col, FormGroup, Label } from "reactstrap";
import { Loader } from "../../components/Loader";
import {
  ResourceClass,
  ResourcePool,
} from "../../features/dataServices/dataServices";
// import { useGetResourcePoolsQuery } from "../../features/dataServices/dataServicesApi";
import {
  setSessionClass,
  useStartSessionOptionsSelector,
} from "../../features/session/startSessionOptionsSlice";
import styles from "./SessionClassSelector.module.scss";

export const SessionClassSelector = () => {
  // const { data: resourcePools, isLoading } = useGetResourcePoolsQuery({});
  const resourcePools = fakeResourcePools;
  const isLoading = false;

  if (isLoading || !resourcePools) {
    return <Loader />;
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Session class</Label>
        <SessionClassSelectorWrapped resourcePools={resourcePools} />
      </FormGroup>
    </Col>
  );
};

interface SessionClassSelectorWrappedProps {
  resourcePools: ResourcePool[];
}

const SessionClassSelectorWrapped = ({
  resourcePools,
}: SessionClassSelectorWrappedProps) => {
  const options = useMemo(
    () => makeGroupedOptions(resourcePools),
    [resourcePools]
  );
  const sessionsClassesFlat = useMemo(
    () => resourcePools.flatMap((pool) => pool.classes),
    [resourcePools]
  );

  const sessionClassId = useStartSessionOptionsSelector(
    (state) => state.sessionClass
  );
  const dispatch = useDispatch();

  // Set initial session class
  useEffect(() => {
    const initialSessionClass =
      sessionsClassesFlat.length == 0
        ? 0
        : sessionsClassesFlat.find((c) => c.default)?.id ?? 0;
    dispatch(setSessionClass(initialSessionClass));
  }, [dispatch, sessionsClassesFlat]);

  const selectedSessionClass = useMemo(
    () =>
      sessionsClassesFlat.find((c) => c.id === sessionClassId) ??
      sessionsClassesFlat.find((c) => c.default) ??
      sessionsClassesFlat[0] ??
      undefined,
    [sessionClassId, sessionsClassesFlat]
  );

  const onChange = useCallback(
    (newValue: SingleValue<ResourceClass>) => {
      if (newValue?.id) {
        dispatch(setSessionClass(newValue?.id));
      }
    },
    [dispatch]
  );

  return (
    <Select
      options={options}
      defaultValue={selectedSessionClass}
      getOptionValue={(option) => `${option.id}`}
      getOptionLabel={(option) => option.name}
      onChange={onChange}
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
  groupHeading: () => cx("px-3", "text-uppercase", styles.groupHeading),
  menu: () =>
    cx("rounded-bottom", "border", "border-top-0", "px-0", "py-2", styles.menu),
  menuList: () => cx("d-grid", "gap-2"),
  option: ({ isSelected }) =>
    cx(
      "d-grid",
      "gap-4",
      "px-3",
      styles.option,
      isSelected && styles.optionIsSelected
    ),
  singleValue: () => cx("d-grid", "gap-4", "px-3", styles.singleValue),
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
  Option: (props) => {
    const { label, data: sessionClass } = props;
    const detailClassName = cx("d-inline-flex", styles.detail);
    const detailLabelClassName = cx("width", "me-auto", styles.detailLabel);
    return (
      <components.Option {...props}>
        <span className={styles.label}>{label}</span>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>CPUs</span>{" "}
          <span>{sessionClass.cpu}</span>
        </span>{" "}
        <div className={detailClassName}>
          <span className={detailLabelClassName}>RAM</span>{" "}
          <span>{sessionClass.memory}</span>
        </div>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>Disk</span>{" "}
          <span>{sessionClass.max_storage}</span>
        </span>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>GPUs</span>{" "}
          <span>{sessionClass.gpu}</span>
        </span>
      </components.Option>
    );
  },
  SingleValue: (props) => {
    const { data: sessionClass } = props;
    const detailClassName = cx("d-inline-flex", styles.detail);
    const detailLabelClassName = cx("width", "me-auto", styles.detailLabel);
    return (
      <components.SingleValue {...props}>
        <span className={styles.label}>{sessionClass.name}</span>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>CPUs</span>{" "}
          <span>{sessionClass.cpu}</span>
        </span>{" "}
        <div className={detailClassName}>
          <span className={detailLabelClassName}>RAM</span>{" "}
          <span>{sessionClass.memory}</span>
        </div>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>Disk</span>{" "}
          <span>{sessionClass.max_storage}</span>
        </span>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>GPUs</span>{" "}
          <span>{sessionClass.gpu}</span>
        </span>
      </components.SingleValue>
    );
  },
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
        public: true,
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
        public: true,
        default: true,
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
        public: false,
        default: false,
      },
      {
        id: 4,
        name: "special class 2",
        cpu: 4,
        memory: 8,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 5,
        name: "special class 3",
        cpu: 8,
        memory: 16,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 6,
        name: "special class 4",
        cpu: 8,
        memory: 32,
        gpu: 1,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
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
        public: false,
        default: false,
      },
      {
        id: 8,
        name: "High-GPU class 2",
        cpu: 4,
        memory: 8,
        gpu: 4,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 9,
        name: "High-GPU class 3",
        cpu: 8,
        memory: 16,
        gpu: 8,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 10,
        name: "High-GPU class 4",
        cpu: 8,
        memory: 32,
        gpu: 8,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
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
        public: false,
        default: false,
      },
      {
        id: 12,
        name: "high-memory class 2",
        cpu: 4,
        memory: 64,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 13,
        name: "high-memory class 3",
        cpu: 8,
        memory: 128,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
      {
        id: 14,
        name: "high-memory class 4",
        cpu: 8,
        memory: 256,
        gpu: 0,
        max_storage: 40,
        default_storage: 10,
        public: false,
        default: false,
      },
    ],
  },
];

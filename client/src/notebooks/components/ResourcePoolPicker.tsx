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
import { useDispatch } from "react-redux";
import Select, {
  ClassNamesConfig,
  GroupBase,
  SelectComponentsConfig,
  SingleValue,
  components,
} from "react-select";
import { FormGroup, Label } from "reactstrap";
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
import styles from "./ResourcePoolPicker.module.scss";

export const ResourcePoolPicker = () => {
  const resourcePools = fakeResourcePools;
  const isLoading = false;

  if (isLoading || !resourcePools) {
    return <Loader />;
  }

  return (
    <FormGroup className="field-group">
      <Label>Session class</Label>
      <SessionClassSelector resourcePools={resourcePools} />
    </FormGroup>
  );
};

interface SessionClassSelectorProps {
  resourcePools: ResourcePool[];
}

const SessionClassSelector = ({ resourcePools }: SessionClassSelectorProps) => {
  const options = useMemo(
    () => makeGroupedOptions(resourcePools),
    [resourcePools]
  );
  const sessionsClassesFlat = useMemo(
    () => resourcePools.flatMap((pool) => pool.classes),
    [resourcePools]
  );

  const { sessionClass: sessionClassId } = useStartSessionOptionsSelector();
  const dispatch = useDispatch();

  // Set initial session class
  useEffect(() => {
    dispatch(
      setSessionClass(
        sessionsClassesFlat.length > 0 ? sessionsClassesFlat[0].id : 0
      )
    );
  }, [dispatch, sessionsClassesFlat]);

  const selectedSessionClass = useMemo(
    () =>
      sessionsClassesFlat.find((c) => c.id === sessionClassId) ??
      sessionsClassesFlat[0] ??
      null,
    [sessionClassId, sessionsClassesFlat]
  );

  useEffect(() => {
    console.log({ selectedSessionClass });
  }, [selectedSessionClass]);

  const onChange = useCallback(
    (newValue: SingleValue<ResourceClass>) => {
      if (newValue?.id) {
        dispatch(setSessionClass(newValue?.id));
      }
    },
    [dispatch]
  );

  return (
    <div /*style={{ width: "200px" }}*/>
      <Select
        options={options}
        defaultValue={selectedSessionClass ? selectedSessionClass : undefined}
        getOptionValue={(option) => `${option.id}`}
        getOptionLabel={(option) => option.name}
        onChange={onChange}
        isClearable={false}
        isSearchable={false}
        unstyled
        classNames={selectClassNames}
        components={selectComponents}
        // Force open
        // menuIsOpen
      />
    </div>
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
      "px-3",
      "py-2",
      styles.control,
      menuIsOpen && styles.controlIsOpen
    ),
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
          <span className={detailLabelClassName}>Memory</span>{" "}
          <span>{sessionClass.memory}</span>
        </div>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>Storage</span>{" "}
          <span>{sessionClass.storage}</span>
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
          <span className={detailLabelClassName}>Memory</span>{" "}
          <span>{sessionClass.memory}</span>
        </div>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>Storage</span>{" "}
          <span>{sessionClass.storage}</span>
        </span>{" "}
        <span className={detailClassName}>
          <span className={detailLabelClassName}>GPUs</span>{" "}
          <span>{sessionClass.gpu}</span>
        </span>
      </components.SingleValue>
    );
  },
};

const fakeResourcePools: ResourcePool[] = [
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
        storage: 20,
      },
      {
        id: 2,
        name: "public class 2",
        cpu: 2,
        memory: 2,
        gpu: 0,
        storage: 40,
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
        storage: 40,
      },
      {
        id: 4,
        name: "special class 2",
        cpu: 4,
        memory: 8,
        gpu: 1,
        storage: 40,
      },
      {
        id: 5,
        name: "special class 3",
        cpu: 8,
        memory: 16,
        gpu: 1,
        storage: 40,
      },
      {
        id: 6,
        name: "special class 4",
        cpu: 8,
        memory: 32,
        gpu: 1,
        storage: 40,
      },
    ],
  },
];

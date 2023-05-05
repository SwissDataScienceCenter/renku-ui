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

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import cx from "classnames";
import Autosuggest, {
  ChangeEvent,
  InputProps,
  RenderInputComponentProps,
  ShouldRenderReasons,
  SuggestionSelectedEventData,
} from "react-autosuggest";
import { RootStateOrAny, useSelector } from "react-redux";
import { Button, FormGroup, Label } from "reactstrap";
import { Loader } from "../../components/Loader";
import {
  ResourceClass,
  ResourcePool,
} from "../../features/dataServices/dataServices";
import { IMigration } from "../../features/project/Project";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { useGetNotebooksQuery } from "../../features/versions/versionsApi";
import styles from "./ResourcePoolPicker.module.scss";

interface ResourcePoolPickerProps {
  projectRepositoryUrl: string;
}

export const ResourcePoolPicker = ({
  projectRepositoryUrl,
}: ResourcePoolPickerProps) => {
  const projectMigrationCore = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.project.migration.core
  );
  const fetchedVersion = !!projectMigrationCore.fetched;
  const versionUrl = projectMigrationCore.versionUrl ?? "";

  const { data: projectConfig, isLoading: projectConfigIsLoading } =
    useGetConfigQuery(
      {
        projectRepositoryUrl,
        versionUrl,
      },
      { skip: !fetchedVersion }
    );

  const { data: sessionsVersion, isLoading: sessionsVersionIsLoading } =
    useGetNotebooksQuery({});

  // const { data: resourcePools, isLoading: resourcePoolsIsLoading } =
  //   useGetResourcePoolsQuery({});
  const resourcePools = fakeResourcePools;
  const resourcePoolsIsLoading = false;

  if (!fetchedVersion) return null;

  const isLoading =
    projectConfigIsLoading ||
    sessionsVersionIsLoading ||
    resourcePoolsIsLoading;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      Resource pool picker
      <FormGroup className="field-group">
        <Label>Session class</Label>
        <SessionClassSelector resourcePools={resourcePools} />
      </FormGroup>
      {/* <div className="py-2">
        <pre>{JSON.stringify(projectMigrationCore, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(projectConfig, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(sessionsVersion, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(resourcePools, null, 2)}</pre>
      </div> */}
    </div>
  );
};

interface SessionClassSelectorProps {
  resourcePools: ResourcePool[];
}

const SessionClassSelector = ({ resourcePools }: SessionClassSelectorProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sessionsClassesFlat = resourcePools.flatMap((pool) => pool.classes);

  const [selectedSessionClass, setSelectedSessionClass] =
    useState<ResourceClass | null>(
      sessionsClassesFlat.length > 0 ? sessionsClassesFlat[0] : null
    );

  useEffect(() => {
    console.log({ showSuggestions, selectedSessionClass });
  }, [showSuggestions, selectedSessionClass]);

  // const onClickSelector = useCallback(() => {
  //   setIsOpen((isOpen) => !isOpen);
  // }, []);

  const onClickButton = useCallback(() => {
    setShowSuggestions((prev) => !prev);
  }, []);

  console.log({ sessionsClassesFlat });

  const getSuggestionValue = useCallback(
    (suggestion: ResourceClass) => `${suggestion.id}`,
    []
  );
  const inputProps: InputProps<ResourceClass> = {
    // placeholder: "Select a session class...",
    // type: "text",
    // className: "",
    role: "button",
    style: { caretColor: "transparent" },
    value: selectedSessionClass ? `${selectedSessionClass.id}` : "",
    onChange: (event: FormEvent<HTMLElement>, params: ChangeEvent) => {
      console.log("onChange", event, params);
    },
  };
  const onSuggestionsClearRequested = useCallback(() => {
    setShowSuggestions(false);
  }, []);
  const onSuggestionSelected = useCallback(
    (_event: FormEvent, data: SuggestionSelectedEventData<ResourceClass>) => {
      setSelectedSessionClass(data.suggestion);
      setShowSuggestions(false);
    },
    []
  );
  const renderInputComponent = useCallback(
    (props: RenderInputComponentProps) => {
      console.log(props);
      const { value, ...rest } = props;
      const selected = sessionsClassesFlat.find((c) => `${c.id}` === value);
      return (
        <>
          <Label for="sdafaadfadfa">
            <div>Hewwo</div>
          </Label>
          <input
            id="sdafaadfadfa"
            name="sdafaadfadfa"
            value={selected ? selected.name : ""}
            {...rest}
          />
        </>
      );
    },
    [onClickButton, sessionsClassesFlat]
  );
  const renderSuggestion = useCallback(
    (suggestion: ResourceClass) => (
      <div>
        <span>{suggestion.name}</span>
        <span>CPUs: {suggestion.cpu}</span>
      </div>
    ),
    []
  );
  const shouldRenderSuggestions = useCallback(
    (_value: string, reason: ShouldRenderReasons) => {
      return reason === "input-focused" || showSuggestions;
    },
    [showSuggestions]
  );

  return (
    <>
      {/* <div className="d-grid">
        <Button
          className={cx(styles.button, "d-block", "rounded")}
          type="button"
          onClick={onClickButton}
        >
          {selectedSessionClass
            ? selectedSessionClass.name
            : "Select a session class..."}
        </Button>
      </div> */}
      <Autosuggest
        id="fooobar"
        multiSection={false}
        suggestions={sessionsClassesFlat}
        getSuggestionValue={getSuggestionValue}
        inputProps={inputProps}
        onSuggestionsFetchRequested={noOp}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        renderInputComponent={renderInputComponent}
        renderSuggestion={renderSuggestion}
        // shouldRenderSuggestions={shouldRenderSuggestions}
        // alwaysRenderSuggestions={showSuggestions}
        focusInputOnSuggestionClick={false}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

const fakeResourcePools: ResourcePool[] = [
  {
    id: 1,
    name: "default pool for tests",
    quota: {
      cpu: 100,
      memory: 2000000000000,
      gpu: 8,
      storage: 9e21,
    },
    classes: [
      {
        id: 1,
        name: "default class for tests",
        cpu: 1,
        memory: 42,
        gpu: 0,
        storage: 120,
      },
    ],
  },
  {
    id: 2,
    name: "another pool for tests",
    quota: {
      cpu: 500,
      memory: 82000000000000,
      gpu: 40,
      storage: 9e21,
    },
    classes: [
      {
        id: 2,
        name: "class c1",
        cpu: 1,
        memory: 64,
        gpu: 0,
        storage: 128,
      },
      {
        id: 3,
        name: "class c2",
        cpu: 2,
        memory: 128,
        gpu: 1,
        storage: 256,
      },
    ],
  },
];
